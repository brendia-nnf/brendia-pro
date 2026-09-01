import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { formatPrice } from "@/lib/constants/courses";
import {
  generateEnrollmentToken,
  COURSE_NAMES,
  generateUpgradeEmailHtml,
  generateActivationEmailHtml,
} from "@/lib/enrollment";

// Marks a predračun (bank-transfer) order as paid once the payment shows up
// on the bank account, then triggers the same enrollment flow the Monri
// callback runs for card payments: activation email for new customers, or a
// direct unlock for existing users buying the Advanced course.
//
// Protected by the ADMIN_API_SECRET env var:
//   curl -X POST https://brendiapro.hr/api/admin/confirm-payment \
//     -H "Content-Type: application/json" \
//     -H "x-admin-secret: $ADMIN_API_SECRET" \
//     -d '{"orderNumber": "BP-260901-XXXX"}'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || request.headers.get("x-admin-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderNumber } = await request.json();
    if (!orderNumber) {
      return NextResponse.json(
        { error: "orderNumber is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: order, error: findError } = await supabase
      .from("orders")
      .select(
        "id, status, email, first_name, last_name, course_id, course_name, amount, currency"
      )
      .eq("order_number", orderNumber)
      .single();

    if (findError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json(
        { error: `Order ${orderNumber} is already paid` },
        { status: 409 }
      );
    }
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: `Order ${orderNumber} has status "${order.status}"` },
        { status: 409 }
      );
    }

    const enrollmentToken = generateEnrollmentToken();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7);

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        enrollment_token: enrollmentToken,
        enrollment_token_expires_at: tokenExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to mark order paid:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Brendia Pro <info@brendiapro.hr>";
    const platformUrl =
      process.env.NEXT_PUBLIC_PLATFORM_URL || "https://app.brendiapro.hr";
    const customerName = `${order.first_name} ${order.last_name}`;

    // Advanced course buyers are existing certified students — unlock
    // their account directly instead of sending an activation link.
    if (order.course_id === "master-certification") {
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
            purchased_at: new Date().toISOString(),
            expires_at: null,
          });

        if (enrollmentError) {
          console.error("Failed to create advanced enrollment:", enrollmentError);
          return NextResponse.json(
            { error: "Order marked paid but enrollment failed — check logs" },
            { status: 500 }
          );
        }

        await supabase
          .from("orders")
          .update({
            enrollment_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        await resend.emails.send({
          from: fromEmail,
          to: order.email,
          subject: "Advanced Brendia Pro® Artist je otkljucan - Brendia Pro",
          html: generateUpgradeEmailHtml(
            customerName,
            orderNumber,
            formatPrice(order.amount),
            `${platformUrl}/dashboard`
          ),
        });

        return NextResponse.json({
          success: true,
          orderNumber,
          action: "advanced-unlocked",
          email: order.email,
        });
      }
      // Unknown email — fall through to the activation-link flow
    }

    const courseName = COURSE_NAMES[order.course_id] || order.course_name;
    const activationUrl = `${platformUrl}/auth/activate/${enrollmentToken}`;

    await resend.emails.send({
      from: fromEmail,
      to: order.email,
      subject: `Aktivirajte pristup: ${courseName} - Brendia Pro`,
      html: generateActivationEmailHtml(
        customerName,
        courseName,
        activationUrl,
        orderNumber,
        formatPrice(order.amount)
      ),
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      action: "activation-email-sent",
      email: order.email,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
