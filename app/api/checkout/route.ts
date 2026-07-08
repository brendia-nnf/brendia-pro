import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCourse, calculatePricing } from "@/lib/constants/courses";
import {
  MONRI_CONFIG,
  generateOrderNumber,
  buildMonriFormData,
} from "@/lib/monri";

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
