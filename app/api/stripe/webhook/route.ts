import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { fulfillCourseOrder } from "@/lib/fulfillment";
import { getOrderNotificationsEmail } from "@/lib/predracun";

// Lazy initialization to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function idOf(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

/**
 * The invoice→subscription link moved between Stripe API versions
 * (invoice.subscription vs invoice.parent.subscription_details) — read both.
 */
function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const legacy = (invoice as unknown as { subscription?: string | { id: string } })
    .subscription;
  if (legacy) return idOf(legacy);
  const parent = (
    invoice as unknown as {
      parent?: { subscription_details?: { subscription?: string | { id: string } } };
    }
  ).parent;
  return idOf(parent?.subscription_details?.subscription);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();

  // Signature verification needs the exact raw body — never parse JSON first
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature || "",
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "invoice.marked_uncollectible":
        await handleInstallmentDefault(
          subscriptionIdFromInvoice(event.data.object as Stripe.Invoice),
          "invoice.marked_uncollectible"
        );
        break;

      case "customer.subscription.deleted":
        // Fires on BOTH normal schedule completion (end_behavior: cancel)
        // and on default-cancellation — handleInstallmentDefault only acts
        // when installments are still outstanding.
        await handleInstallmentDefault(
          (event.data.object as Stripe.Subscription).id,
          "customer.subscription.deleted"
        );
        break;

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error(`Stripe webhook handler error for ${event.type}:`, err);
    // 500 → Stripe retries; handlers are idempotent so retries are safe
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderNumber = session.metadata?.order_number;
  if (session.metadata?.type !== "course" || !orderNumber) {
    console.log("checkout.session.completed without course metadata - ignoring");
    return;
  }
  if (session.payment_status !== "paid") {
    console.log(`Session for ${orderNumber} not paid yet - ignoring`);
    return;
  }

  const isInstallments = session.metadata?.payment_plan === "installments";
  const subscriptionId = idOf(session.subscription);

  if (isInstallments && subscriptionId) {
    // Bound the subscription to exactly N charges BEFORE fulfillment: if this
    // handler crashes mid-way, the retry must still get a chance to create
    // the schedule (fulfillment alone would short-circuit as already done).
    await ensureInstallmentSchedule(subscriptionId, orderNumber);
  }

  const stripe = getStripe();
  let installmentsTotal: number | undefined;
  let installmentAmount: number | undefined;
  if (isInstallments && subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    installmentsTotal =
      parseInt(sub.metadata?.installments_total || "", 10) || undefined;
    installmentAmount = sub.items.data[0]?.price?.unit_amount ?? undefined;
  }

  const result = await fulfillCourseOrder(orderNumber, {
    sessionId: session.id,
    paymentIntentId: idOf(session.payment_intent),
    customerId: idOf(session.customer as string | { id: string } | null),
    subscriptionId,
    paymentPlan: isInstallments ? "installments" : "full",
    installmentsTotal,
    installmentAmount,
  });

  if (!result.ok) {
    throw new Error(result.error || "Fulfillment failed");
  }
}

/**
 * Convert the open-ended subscription created by Checkout into a fixed-count
 * schedule: a single phase lasting N months (N monthly charges), then Stripe
 * cancels it automatically. Idempotent — a bounded schedule
 * (end_behavior: cancel) is left alone, but a half-created one (schedule
 * exists, bounding update failed) is finished on retry.
 */
async function ensureInstallmentSchedule(
  subscriptionId: string,
  orderNumber: string
) {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const count = parseInt(subscription.metadata?.installments_total || "", 10);
  if (!count || count < 2) {
    console.error(
      `Subscription ${subscriptionId} missing installments_total metadata`
    );
    return;
  }

  const schedule = subscription.schedule
    ? await stripe.subscriptionSchedules.retrieve(idOf(subscription.schedule)!)
    : await stripe.subscriptionSchedules.create({
        from_subscription: subscriptionId,
      });

  if (schedule.end_behavior === "cancel") {
    console.log(`Subscription ${subscriptionId} already has a bounded schedule`);
    return;
  }

  const phase = schedule.phases[0];
  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "cancel",
    phases: [
      {
        items: phase.items.map((item) => ({
          price: idOf(item.price)!,
          quantity: item.quantity,
        })),
        start_date: phase.start_date,
        duration: { interval: "month", interval_count: count },
      },
    ],
  });

  console.log(
    `Installment schedule created for ${orderNumber}: ${count} monthly charges`
  );
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderNumber = session.metadata?.order_number;
  if (session.metadata?.type !== "course" || !orderNumber) return;

  const supabase = getSupabase();
  await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("order_number", orderNumber)
    .eq("status", "pending");

  console.log(`Order ${orderNumber} cancelled (checkout expired)`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Installment 1 arrives as billing_reason "subscription_create" and is
  // handled by checkout.session.completed — only cycles matter here.
  if (invoice.billing_reason !== "subscription_cycle") return;

  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const supabase = getSupabase();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, installments_total, installment_status")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (!order) {
    console.log(`No order for subscription ${subscriptionId} - ignoring invoice`);
    return;
  }

  // Recompute from Stripe instead of incrementing — idempotent under retries
  const stripe = getStripe();
  const paidInvoices = await stripe.invoices.list({
    subscription: subscriptionId,
    status: "paid",
    limit: 100,
  });
  const installmentsPaid = paidInvoices.data.length;
  const total = order.installments_total || 0;
  const completed = total > 0 && installmentsPaid >= total;

  const now = new Date().toISOString();
  await supabase
    .from("orders")
    .update({
      installments_paid: installmentsPaid,
      ...(completed
        ? { fully_paid_at: now, installment_status: "completed" }
        : {}),
      updated_at: now,
    })
    .eq("id", order.id);

  if (completed) {
    await supabase
      .from("enrollments")
      .update({ fully_paid_at: now })
      .eq("order_number", order.order_number);
  }

  console.log(
    `Installment ${installmentsPaid}/${total} paid for ${order.order_number}${completed ? " - fully paid" : ""}`
  );
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const supabase = getSupabase();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, email, customer_name, installments_paid, installments_total")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (!order) return;

  const now = new Date().toISOString();
  await supabase
    .from("orders")
    .update({ last_installment_failed_at: now, updated_at: now })
    .eq("id", order.id);

  // Stripe Smart Retries + dunning emails handle the customer side;
  // the admin just gets a heads-up.
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Brendia Pro <info@brendiapro.hr>";
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: fromEmail,
        to: getOrderNotificationsEmail(),
        subject: `Neuspjela naplata rate — narudžba ${order.order_number}`,
        html: `<p>Naplata rate nije uspjela za narudžbu <strong>${order.order_number}</strong> (${order.customer_name}, ${order.email}).</p><p>Plaćeno rata: ${order.installments_paid}/${order.installments_total}. Stripe će automatski ponoviti naplatu; status pratite u Stripe dashboardu.</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send installment-failure notification:", emailError);
    }
  }

  console.log(`Installment payment failed for ${order.order_number}`);
}

/**
 * A subscription that dies before all installments are collected means the
 * customer defaulted: mark the order and suspend platform access. The
 * enrollment stays recoverable — admin can reactivate after manual payment.
 */
async function handleInstallmentDefault(
  subscriptionId: string | null,
  source: string
) {
  if (!subscriptionId) return;

  const supabase = getSupabase();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, installments_paid, installments_total, installment_status")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (!order) return;

  const total = order.installments_total || 0;
  const outstanding = total > 0 && (order.installments_paid || 0) < total;

  if (!outstanding || order.installment_status === "completed") {
    console.log(
      `Subscription ${subscriptionId} ended fully paid (${source}) - no action`
    );
    return;
  }

  const now = new Date().toISOString();
  await supabase
    .from("orders")
    .update({ installment_status: "defaulted", updated_at: now })
    .eq("id", order.id);

  await supabase
    .from("enrollments")
    .update({ status: "suspended", suspended_at: now })
    .eq("order_number", order.order_number);

  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Brendia Pro <info@brendiapro.hr>";
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: fromEmail,
        to: getOrderNotificationsEmail(),
        subject: `Rate obustavljene — narudžba ${order.order_number}`,
        html: `<p>Pretplata za rate je otkazana prije potpune naplate (${order.installments_paid}/${order.installments_total}) za narudžbu <strong>${order.order_number}</strong>.</p><p>Pristup platformi je suspendiran. Za ručnu naplatu i reaktivaciju kontaktirajte kupca.</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send default notification:", emailError);
    }
  }

  console.log(
    `Order ${order.order_number} marked defaulted, enrollment suspended (${source})`
  );
}
