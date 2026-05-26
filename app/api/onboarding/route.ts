import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface OnboardingSubmission {
  // Basic Info
  fullName: string;
  email: string;
  phone: string;
  cityCountry: string;
  // Business Info
  salonName: string;
  instagram: string;
  website: string;
  // Experience
  yearsInIndustry: string;
  doesHairExtensions: string;
  sewingExperience: string;
  // Education Level
  educationLevel: string;
  // Certificate
  certificateName: string;
  // Payment
  invoiceType: string;
  paymentMethod: string;
  // Shipping
  shippingAddress: string;
  postalCode: string;
  // Masterclass
  masterclassDate: string;
  // Agreements
  termsAccepted: boolean;
  contentConsent: boolean;
}

export async function POST(request: Request) {
  try {
    const body: OnboardingSubmission = await request.json();

    // Validate required fields
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "cityCountry",
      "instagram",
      "educationLevel",
      "certificateName",
      "shippingAddress",
      "postalCode",
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof OnboardingSubmission]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!body.termsAccepted) {
      return NextResponse.json(
        { error: "Terms must be accepted" },
        { status: 400 }
      );
    }

    // Map education level to readable name and price
    const educationLevelMap: Record<
      string,
      { name: string; price: number; priceWithVat: number }
    > = {
      "brendia-pro-artist": {
        name: "Brendia Pro Artist",
        price: 3000,
        priceWithVat: 3750,
      },
      "advanced-brendia-pro-artist": {
        name: "Advanced Brendia Pro Artist",
        price: 4000,
        priceWithVat: 5000,
      },
      "brendia-pro-master": {
        name: "Brendia Pro Master",
        price: 5000,
        priceWithVat: 6250,
      },
    };

    const educationInfo = educationLevelMap[body.educationLevel] || {
      name: body.educationLevel,
      price: 0,
      priceWithVat: 0,
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from("onboarding_submissions")
      .insert([
        {
          // Basic Info
          full_name: body.fullName,
          email: body.email,
          phone: body.phone,
          city_country: body.cityCountry,
          // Business Info
          salon_name: body.salonName || null,
          instagram: body.instagram,
          website: body.website || null,
          // Experience
          years_in_industry: body.yearsInIndustry,
          does_hair_extensions: body.doesHairExtensions,
          sewing_experience: body.sewingExperience,
          // Education Level
          education_level: body.educationLevel,
          education_level_name: educationInfo.name,
          education_price: educationInfo.price,
          education_price_with_vat: educationInfo.priceWithVat,
          // Certificate
          certificate_name: body.certificateName,
          // Payment
          invoice_type: body.invoiceType,
          payment_method: body.paymentMethod,
          // Shipping
          shipping_address: body.shippingAddress,
          postal_code: body.postalCode,
          // Masterclass
          masterclass_date: body.masterclassDate,
          // Agreements
          terms_accepted: body.termsAccepted,
          terms_accepted_at: new Date().toISOString(),
          content_consent: body.contentConsent,
          // Metadata
          status: "pending",
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding submission saved successfully",
      id: data?.id,
    });
  } catch (error) {
    console.error("Onboarding submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
