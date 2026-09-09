import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";
import {
  verifyCallbackDigest,
  isSuccessfulPayment,
  getResponseMessage,
} from "@/lib/monri";
import { formatPrice } from "@/lib/constants/courses";
import { createFakturkoInvoice, isFakturkoConfigured } from "@/lib/fakturko";
import {
  generateEnrollmentToken,
  COURSE_NAMES,
  generateUpgradeEmailHtml,
  generateActivationEmailHtml,
} from "@/lib/enrollment";

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

// Monri sends callback data as JSON POST
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body (Monri sends callbacks as JSON)
    const body = await request.json();

    // Extract callback parameters
    const orderNumber = body.order_number as string;
    const responseCode = body.response_code as string;
    const amount = String(body.amount);
    const currency = (body.currency as string) || "EUR";
    const digest = body.digest as string;
    const transactionId = body.id ? String(body.id) : null;
    const approvalCode = body.approval_code as string;
    const panToken = body.pan_token as string;
    const maskedPan = body.masked_pan as string;

    console.log(`Monri callback received for order: ${orderNumber}`);
    console.log(`Response code: ${responseCode} - ${getResponseMessage(responseCode)}`);
    console.log("Full callback body:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!orderNumber || !responseCode || !amount) {
      console.error("Missing required callback fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Note: Monri callbacks don't include digest, only success URL redirects do

    const supabase = getSupabase();

    // Find the order by order_number
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select(
        "id, status, email, first_name, last_name, phone, course_id, course_name, amount, currency, subtotal, vat_amount, vat_rate, street, city, postal_code, country, company_name, vat_number"
      )
      .eq("order_number", orderNumber)
      .single();

    if (findError || !order) {
      // Not a course order - Monri's dashboard only allows ONE callback URL
      // (this one), so platform webshop callbacks (BW-...) land here too.
      // Forward them to the platform, signed with the shared merchant key.
      console.log(`Order ${orderNumber} not found in orders - forwarding to platform callback`);

      const platformUrl =
        process.env.NEXT_PUBLIC_PLATFORM_URL || "https://app.brendiapro.hr";
      const rawBody = JSON.stringify(body);
      const forwardDigest = crypto
        .createHash("sha512")
        .update((process.env.MONRI_MERCHANT_KEY || "") + rawBody)
        .digest("hex");

      try {
        const forwardResponse = await fetch(`${platformUrl}/api/monri/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forward-digest": forwardDigest,
          },
          body: rawBody,
        });

        const forwardResult = await forwardResponse.json().catch(() => ({}));
        console.log(
          `Platform callback responded ${forwardResponse.status} for ${orderNumber}`
        );

        return NextResponse.json(forwardResult, {
          status: forwardResponse.status,
        });
      } catch (forwardError) {
        console.error("Failed to forward callback to platform:", forwardError);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
    }

    // Determine new status based on response code
    const isSuccess = isSuccessfulPayment(responseCode);
    const newStatus = isSuccess ? "paid" : "cancelled";

    // Update the order with Monri response data
    const updateData: Record<string, unknown> = {
      status: newStatus,
      monri_transaction_id: transactionId || null,
      monri_approval_code: approvalCode || null,
      monri_response_code: responseCode,
      monri_pan_token: panToken || null,
      monri_masked_pan: maskedPan || null,
      updated_at: new Date().toISOString(),
    };

    // If successful payment, generate enrollment token and set expiry
    if (isSuccess) {
      updateData.paid_at = new Date().toISOString();

      // Generate enrollment token (expires in 7 days)
      const enrollmentToken = generateEnrollmentToken();
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7);

      updateData.enrollment_token = enrollmentToken;
      updateData.enrollment_token_expires_at = tokenExpiresAt.toISOString();
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update order:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    console.log(`Order ${orderNumber} updated to status: ${newStatus}`);

    // Create a fiscalized invoice via Fakturko (privatna → fiskalizacija,
    // pravna/company → eRačun). Failures are stored on the order and never
    // block the payment flow.
    let invoicePdfLink: string | null = null;

    if (isSuccess && isFakturkoConfigured()) {
      try {
        const isCompany = !!(order.company_name || order.vat_number);
        // client_oib expects the bare OIB — strip an "HR" VAT-ID prefix
        const companyOib = (order.vat_number || "")
          .replace(/^HR/i, "")
          .trim();

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
          note: `Narudžba ${orderNumber} — plaćeno karticom putem Monri`,
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

    if (isSuccess && order.course_id === "master-certification") {
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
              monri_transaction_id: transactionId,
              monri_approval_code: approvalCode || null,
              monri_response_code: responseCode,
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

    // Send magic link email if payment was successful
    if (isSuccess && !upgradedExistingUser && process.env.RESEND_API_KEY) {
      try {
        const customerName = `${order.first_name} ${order.last_name}`;
        const courseName = COURSE_NAMES[order.course_id] || order.course_name;
        const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://app.brendiapro.hr";
        const activationUrl = `${platformUrl}/auth/activate/${updateData.enrollment_token}`;

        // Use verified domain (falls back to verified sender, NOT Resend's test domain
        // which can only deliver to the account owner's own email)
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Brendia Pro <info@brendiapro.hr>";

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
        });

        console.log(`Activation email sent to ${order.email}`);
      } catch (emailError) {
        console.error("Failed to send activation email:", emailError);
        // Don't fail the callback if email fails
      }
    }

    // Monri expects a 200 response to confirm callback receipt
    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      status: newStatus,
    });
  } catch (error) {
    console.error("Monri callback error:", error);
    return NextResponse.json(
      { error: "Callback processing failed" },
      { status: 500 }
    );
  }
}

// Also support GET for success/cancel redirects that include params
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderNumber = searchParams.get("order_number");
  const responseCode = searchParams.get("response_code");

  // This is just for logging/debugging, actual order update happens via POST callback
  console.log(`Monri redirect received: order=${orderNumber}, response=${responseCode}`);

  // Redirect to appropriate page
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (responseCode && isSuccessfulPayment(responseCode)) {
    return NextResponse.redirect(`${baseUrl}/checkout/success?order_number=${orderNumber}`);
  } else {
    return NextResponse.redirect(`${baseUrl}/checkout/cancel?order_number=${orderNumber}`);
  }
}
