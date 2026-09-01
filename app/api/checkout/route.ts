import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getCourse, calculatePricing } from "@/lib/constants/courses";
import {
  MONRI_CONFIG,
  generateOrderNumber,
  buildMonriFormData,
} from "@/lib/monri";
import {
  isPredracunMode,
  getOrderNotificationsEmail,
  generatePredracunEmailHtml,
  generateOrderNotificationEmailHtml,
} from "@/lib/predracun";

// Use service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CheckoutRequest {
  courseId: string;
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Billing address
  street: string;
  city: string;
  postalCode: string;
  country: string;
  // Company details (optional)
  companyName?: string;
  vatNumber?: string;
  // Marketing
  hearAboutUs?: string;
  // Terms
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();

    const {
      courseId,
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      postalCode,
      country,
      companyName,
      vatNumber,
      hearAboutUs,
      acceptTerms,
      acceptMarketing,
    } = body;

    // Validate required fields
    if (
      !courseId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !street ||
      !city ||
      !postalCode ||
      !country
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: "You must accept the terms and conditions" },
        { status: 400 }
      );
    }

    // Get course data
    const course = getCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // The Advanced course can only be bought by students whose
    // Brendia Pro Artist certification has been APPROVED. The buyer
    // must use the email of their existing platform account.
    if (course.id === "master-certification") {
      const { data: usersList } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });
      const existingUser = usersList?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      let certApproved = false;
      if (existingUser) {
        const { data: certification } = await supabase
          .from("certifications")
          .select("status")
          .eq("user_id", existingUser.id)
          .maybeSingle() as { data: { status: string } | null };
        certApproved = certification?.status === "approved";
      }

      if (!certApproved) {
        return NextResponse.json(
          {
            error:
              "Advanced Brendia Pro® Artist tečaj dostupan je nakon uspješno završene certifikacije Brendia Pro® Artist tečaja. Molimo koristite email adresu s kojom ste registrirani na platformi.",
          },
          { status: 403 }
        );
      }
    }

    const pricing = calculatePricing(course.price);
    const customerName = `${firstName} ${lastName}`;

    // Generate unique order number
    let orderNumber = generateOrderNumber();

    // Ensure order number is unique (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .single();

      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    // Save order to Supabase with pending status
    const { error: dbError } = await supabase.from("orders").insert({
      // Order number for Monri
      order_number: orderNumber,
      // Personal info
      customer_name: customerName,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      // Billing address
      street,
      city,
      postal_code: postalCode,
      country,
      // Company details
      company_name: companyName || null,
      vat_number: vatNumber || null,
      // Marketing
      hear_about_us: hearAboutUs || null,
      // Course details
      course_id: course.id,
      course_name: course.name,
      // Pricing
      subtotal: pricing.subtotal,
      vat_amount: pricing.vat,
      vat_rate: pricing.vatRate,
      amount: pricing.total,
      currency: course.currency,
      // Status
      status: "pending",
      // Terms
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      marketing_accepted: acceptMarketing,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Predračun mode: card payments are paused (Monri production pending) —
    // email the customer a predračun with bank-transfer details and notify
    // the admin. The order stays "pending" until the payment is confirmed
    // via /api/admin/confirm-payment.
    if (isPredracunMode()) {
      const predracunOrder = {
        orderNumber,
        customerName,
        email,
        phone,
        street,
        city,
        postalCode,
        country,
        companyName: companyName || null,
        vatNumber: vatNumber || null,
        courseName: course.name,
        subtotal: pricing.subtotal,
        vat: pricing.vat,
        total: pricing.total,
      };

      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail =
          process.env.RESEND_FROM_EMAIL || "Brendia Pro <info@brendiapro.hr>";

        try {
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Predračun za narudžbu ${orderNumber} - Brendia Pro`,
            html: generatePredracunEmailHtml(predracunOrder),
          });
        } catch (emailError) {
          console.error("Failed to send predračun email:", emailError);
          return NextResponse.json(
            { error: "Failed to send predračun email" },
            { status: 500 }
          );
        }

        try {
          await resend.emails.send({
            from: fromEmail,
            to: getOrderNotificationsEmail(),
            subject: `Nova narudžba ${orderNumber} — ${course.name} (predračun)`,
            html: generateOrderNotificationEmailHtml(predracunOrder),
          });
        } catch (emailError) {
          // Customer already got their predračun — log and continue
          console.error("Failed to send order notification:", emailError);
        }
      }

      return NextResponse.json({ predracun: true, orderNumber });
    }

    // Build Monri form data
    const monriFormData = buildMonriFormData({
      orderNumber,
      amount: pricing.total, // Total with VAT in cents
      currency: course.currency.toUpperCase(),
      customerName,
      email,
      phone,
      address: street,
      city,
      postalCode,
      country,
      orderInfo: `${course.name} - Brendia Pro`,
      customData: JSON.stringify({
        courseId: course.id,
        companyName: companyName || null,
        vatNumber: vatNumber || null,
      }),
      language: "hr", // Croatian as default
    });

    return NextResponse.json({
      formUrl: MONRI_CONFIG.formUrl,
      formData: monriFormData,
      orderNumber,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
