import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { formatPrice } from "@/lib/constants/courses";
import { createFakturkoInvoice, isFakturkoConfigured } from "@/lib/fakturko";
import {
  generateEnrollmentToken,
  COURSE_NAMES,
  generateUpgradeEmailHtml,
  generateActivationEmailHtml,
} from "@/lib/enrollment";
import type { PaymentPlan } from "@/lib/stripe";

// Lazy initialization to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface StripePaymentRefs {
  sessionId: string;
  paymentIntentId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  paymentPlan: PaymentPlan;
  installmentsTotal?: number;
  installmentAmount?: number;
}

export interface FulfillResult {
  ok: boolean;
  alreadyProcessed?: boolean;
  error?: string;
}

/**
 * Mark a course order as paid and run the full post-payment flow:
 * Fakturko invoice, master-upgrade unlock or activation email.
 *
 * Stripe retries webhooks, so this must be idempotent: the order is only
 * transitioned from "pending" (guarded both by the early return and the
 * conditional update), and every retry after a successful run is a no-op.
 */
export async function fulfillCourseOrder(
  orderNumber: string,
  refs: StripePaymentRefs
): Promise<FulfillResult> {
  const supabase = getSupabase();

  const { data: order, error: findError } = await supabase
    .from("orders")
    .select(
      "id, status, email, first_name, last_name, phone, course_id, course_name, amount, currency, subtotal, vat_amount, vat_rate, street, city, postal_code, country, company_name, vat_number"
    )
    .eq("order_number", orderNumber)
    .single();

  if (findError || !order) {
    console.error(`Order ${orderNumber} not found`);
    return { ok: false, error: "Order not found" };
  }

  if (order.status !== "pending") {
    console.log(
      `Order ${orderNumber} already processed (status: ${order.status}) - skipping`
    );
    return { ok: true, alreadyProcessed: true };
  }

  const now = new Date().toISOString();
  const isInstallments = refs.paymentPlan === "installments";

  // Generate enrollment token (expires in 7 days)
  const enrollmentToken = generateEnrollmentToken();
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7);

  const updateData: Record<string, unknown> = {
    status: "paid",
    paid_at: now,
    stripe_session_id: refs.sessionId,
    stripe_payment_intent: refs.paymentIntentId || null,
    stripe_customer_id: refs.customerId || null,
    enrollment_token: enrollmentToken,
    enrollment_token_expires_at: tokenExpiresAt.toISOString(),
    payment_plan: refs.paymentPlan,
    updated_at: now,
  };

  if (isInstallments) {
    updateData.stripe_subscription_id = refs.subscriptionId || null;
    updateData.installments_total = refs.installmentsTotal || null;
    updateData.installments_paid = 1;
    updateData.installment_amount = refs.installmentAmount || null;
    updateData.installment_status = "active";
  } else {
    // Single payment = fully paid immediately, so "fully paid" is one
    // uniform check regardless of payment plan.
    updateData.fully_paid_at = now;
  }

  // Conditional update: only the webhook delivery that wins the transition
  // from "pending" continues with emails/invoicing.
  const { data: updatedRows, error: updateError } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", order.id)
    .eq("status", "pending")
    .select("id");

  if (updateError) {
    console.error("Failed to update order:", updateError);
    return { ok: false, error: "Failed to update order" };
  }

  if (!updatedRows || updatedRows.length === 0) {
    console.log(`Order ${orderNumber} was processed concurrently - skipping`);
    return { ok: true, alreadyProcessed: true };
  }

  console.log(`Order ${orderNumber} updated to status: paid`);

  // The signed contract was archived at checkout — attach it to the
  // confirmation email so card customers get it too (predračun customers
  // already receive it with the predračun email). Missing PDF never blocks.
  let contractAttachment: { filename: string; content: string } | null = null;
  try {
    const { data: contractFile } = await supabase.storage
      .from("contracts")
      .download(`${orderNumber}.pdf`);
    if (contractFile) {
      const buf = Buffer.from(await contractFile.arrayBuffer());
      contractAttachment = {
        filename: `Ugovor-${orderNumber}.pdf`,
        content: buf.toString("base64"),
      };
    }
  } catch (contractError) {
    console.error(`Contract download failed for ${orderNumber}:`, contractError);
  }

  // Create a fiscalized invoice via Fakturko (privatna → fiskalizacija,
  // pravna/company → eRačun). Failures are stored on the order and never
  // block the payment flow.
  let invoicePdfLink: string | null = null;

  if (isFakturkoConfigured()) {
    try {
      const isCompany = !!(order.company_name || order.vat_number);
      // client_oib expects the bare OIB — strip an "HR" VAT-ID prefix
      const companyOib = (order.vat_number || "").replace(/^HR/i, "").trim();

      const netTotal = order.subtotal / 100;
      const grossTotal = order.amount / 100;
      const vatPercentage = Math.round(Number(order.vat_rate) * 100) || 25;

      const invoiceResult = await createFakturkoInvoice({
        client: isCompany
          ? {
              type: "pravna",
              name: order.company_name || `${order.first_name} ${order.last_name}`,
              oib: companyOib || undefined,
              country: order.country || "Hrvatska",
              city: order.city || undefined,
              address: order.street || undefined,
              zip: order.postal_code || undefined,
              email: order.email,
              phone: order.phone || undefined,
            }
          : {
              type: "privatna",
              name: order.first_name,
              surname: order.last_name,
              country: order.country || "Hrvatska",
              city: order.city || undefined,
              address: order.street || undefined,
              zip: order.postal_code || undefined,
              email: order.email,
              phone: order.phone || undefined,
            },
        lines: [
          {
            name: order.course_name,
            kpdCode: process.env.FAKTURKO_KPD_CODE || "85.59.19",
            quantity: 1,
            unitPriceWithoutVat: netTotal,
            priceWithoutVat: netTotal,
            vatPercentage,
            priceWithVat: grossTotal,
          },
        ],
        totalWithoutVat: netTotal,
        totalWithVat: grossTotal,
        extRef: orderNumber,
        note: `Narudžba ${orderNumber} — plaćeno karticom putem Stripe`,
      });

      if (invoiceResult.ok) {
        invoicePdfLink = invoiceResult.pdfLink || null;
        await supabase
          .from("orders")
          .update({
            fakturko_invoice_id: invoiceResult.invoiceId || null,
            fakturko_pdf_url: invoiceResult.pdfLink || null,
            invoiced_at: new Date().toISOString(),
            fakturko_error: null,
          })
          .eq("id", order.id);
        console.log(
          `Fakturko invoice ${invoiceResult.invoiceId} created for ${orderNumber}`
        );
      } else {
        await supabase
          .from("orders")
          .update({ fakturko_error: invoiceResult.error || "unknown" })
          .eq("id", order.id);
        console.error(
          `Fakturko invoice failed for ${orderNumber}:`,
          invoiceResult.error
        );
      }
    } catch (invoiceError) {
      console.error("Fakturko invoicing error:", invoiceError);
    }
  }

  // For the Advanced course the buyer is by definition an existing,
  // certified student (enforced at checkout) - unlock their account
  // directly instead of sending an activation link.
  let upgradedExistingUser = false;

  if (order.course_id === "master-certification") {
    try {
      const { data: usersList } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });
      const existingUser = usersList?.users?.find(
        (u) => u.email?.toLowerCase() === order.email.toLowerCase()
      );

      if (existingUser) {
        const { error: enrollmentError } = await supabase
          .from("enrollments")
          .insert({
            user_id: existingUser.id,
            order_id: order.id,
            course_id: order.course_id,
            package: "advanced",
            status: "active",
            amount_paid: order.amount,
            currency: order.currency || "eur",
            order_number: orderNumber,
            stripe_session_id: refs.sessionId,
            stripe_payment_intent: refs.paymentIntentId || null,
            stripe_subscription_id: isInstallments
              ? refs.subscriptionId || null
              : null,
            payment_plan: refs.paymentPlan,
            fully_paid_at: isInstallments ? null : now,
            purchased_at: new Date().toISOString(),
            expires_at: null, // Lifetime access
          });

        if (!enrollmentError) {
          upgradedExistingUser = true;
          await supabase
            .from("orders")
            .update({
              enrollment_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          if (process.env.RESEND_API_KEY) {
            const fromEmail =
              process.env.RESEND_FROM_EMAIL || "Brendia Pro <info@brendiapro.hr>";
            const platformUrl =
              process.env.NEXT_PUBLIC_PLATFORM_URL || "https://app.brendiapro.hr";

            await getResend().emails.send({
              from: fromEmail,
              to: order.email,
              subject:
                "Advanced Brendia Pro® Artist je otkljucan - Brendia Pro",
              html: generateUpgradeEmailHtml(
                `${order.first_name} ${order.last_name}`,
                orderNumber,
                formatPrice(order.amount),
                `${platformUrl}/dashboard`,
                invoicePdfLink
              ),
              ...(contractAttachment
                ? { attachments: [contractAttachment] }
                : {}),
            });
          }

          console.log(
            `Advanced access unlocked for existing user ${order.email}`
          );
        } else {
          console.error(
            "Failed to create advanced enrollment:",
            enrollmentError
          );
        }
      } else {
        console.error(
          `Advanced purchase by unknown email ${order.email} - falling back to activation flow`
        );
      }
    } catch (upgradeError) {
      console.error("Advanced upgrade error:", upgradeError);
    }
  }

  // Send magic link email if the buyer isn't an upgraded existing user
  if (!upgradedExistingUser && process.env.RESEND_API_KEY) {
    try {
      const customerName = `${order.first_name} ${order.last_name}`;
      const courseName = COURSE_NAMES[order.course_id] || order.course_name;
      const platformUrl =
        process.env.NEXT_PUBLIC_PLATFORM_URL || "https://app.brendiapro.hr";
      const activationUrl = `${platformUrl}/auth/activate/${enrollmentToken}`;

      // Use verified domain (falls back to verified sender, NOT Resend's test domain
      // which can only deliver to the account owner's own email)
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Brendia Pro <info@brendiapro.hr>";

      await getResend().emails.send({
        from: fromEmail,
        to: order.email,
        subject: `Aktivirajte pristup: ${courseName} - Brendia Pro`,
        html: generateActivationEmailHtml(
          customerName,
          courseName,
          activationUrl,
          orderNumber,
          formatPrice(order.amount),
          invoicePdfLink
        ),
        ...(contractAttachment ? { attachments: [contractAttachment] } : {}),
      });

      console.log(`Activation email sent to ${order.email}`);
    } catch (emailError) {
      console.error("Failed to send activation email:", emailError);
      // Don't fail the fulfillment if email fails
    }
  }

  return { ok: true };
}
