import Stripe from "stripe";
import type { Course } from "@/lib/constants/courses";

// Lazy initialization to avoid build-time errors
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

/**
 * Generate order number in format: BP-YYMMDD-XXXX
 * Example: BP-260708-A1B2
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const datePart = `${year}${month}${day}`;

  // Generate 4 random alphanumeric characters (excluding confusing chars)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `BP-${datePart}-${randomPart}`;
}

export type PaymentPlan = "full" | "installments";

/**
 * Installments are hidden until the client approves the option: both the
 * global flag AND the per-course config must be on.
 */
export function installmentsEnabled(course: Course): boolean {
  return (
    process.env.NEXT_PUBLIC_INSTALLMENTS_ENABLED === "true" &&
    course.installments?.enabled === true &&
    (course.installments?.counts?.length ?? 0) > 0
  );
}

/** Installment counts the customer may pick for a course. */
export function allowedInstallmentCounts(course: Course): number[] {
  return installmentsEnabled(course) ? course.installments!.counts : [];
}

/** Amount of a single installment in cents (equal monthly charges). */
export function installmentAmount(totalCents: number, count: number): number {
  return Math.round(totalCents / count);
}

export interface CourseCheckoutParams {
  orderNumber: string;
  course: Course;
  totalCents: number; // gross total incl. VAT
  customerName: string;
  email: string;
  paymentPlan: PaymentPlan;
  installmentCount?: number; // required when paymentPlan is "installments"
}

/**
 * Create a hosted Stripe Checkout Session for a course purchase.
 *
 * Prices are VAT-inclusive — a single gross line item, no Stripe Tax
 * (fiscalized invoices come from MER/Fakturko, not Stripe).
 *
 * For installments the session runs in subscription mode: the customer pays
 * installment 1 in Checkout; the webhook then converts the subscription into
 * a fixed-count schedule (see /api/stripe/webhook).
 */
export async function createCourseCheckoutSession(
  params: CourseCheckoutParams
): Promise<Stripe.Checkout.Session> {
  const {
    orderNumber,
    course,
    totalCents,
    customerName,
    email,
    paymentPlan,
    installmentCount,
  } = params;

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const common: Stripe.Checkout.SessionCreateParams = {
    locale: "hr",
    customer_email: email,
    client_reference_id: orderNumber,
    metadata: {
      order_number: orderNumber,
      type: "course",
      course_id: course.id,
      payment_plan: paymentPlan,
    },
    success_url: `${baseUrl}/checkout/success?order_number=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel?order_number=${orderNumber}`,
  };

  if (paymentPlan === "installments") {
    const count = installmentCount!;
    const perInstallment = installmentAmount(totalCents, count);

    return stripe.checkout.sessions.create({
      ...common,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: perInstallment,
            recurring: { interval: "month" },
            product_data: {
              name: `${course.name} — ${count} mjesečne rate`,
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          order_number: orderNumber,
          installments_total: String(count),
        },
      },
    });
  }

  return stripe.checkout.sessions.create({
    ...common,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: totalCents,
          product_data: { name: `${course.name} - Brendia Pro®` },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: { order_number: orderNumber },
    },
  });
}
