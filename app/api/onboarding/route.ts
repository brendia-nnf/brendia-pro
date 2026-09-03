import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Email template
const getSuccessEmailHtml = (
  name: string,
  educationLevel: string,
  certificateName: string,
  masterclassDate: string
) => `<!DOCTYPE html>
<html lang="hr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Prijava zaprimljena - Brendia Pro® Education</title>
    <style type="text/css">
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: #FDF8F3;
        }
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
        }
        u + #body a {
            color: inherit;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .mobile-padding {
                padding-left: 24px !important;
                padding-right: 24px !important;
            }
        }
    </style>
</head>
<body id="body" style="margin: 0; padding: 0; background-color: #FDF8F3;">

    <div style="display: none; font-size: 1px; color: #FDF8F3; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Tvoja prijava je uspješno zaprimljena - uskoro te očekuju daljnje informacije
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FDF8F3;">
        <tr>
            <td align="center" style="padding: 40px 20px;">

                <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff;">

                    <!-- Header with logo -->
                    <tr>
                        <td align="center" style="background-color: #FDF8F3; padding: 40px 40px 30px 40px;">
                            <img src="https://www.brendiapro.hr/images/logo.png" alt="Brendia Pro" width="140" style="display: block; width: 140px; max-width: 140px;">
                        </td>
                    </tr>

                    <!-- Decorative gold line -->
                    <tr>
                        <td align="center" style="background-color: #FDF8F3; padding: 0 40px 30px 40px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="width: 60px; height: 1px; background-color: #B8956A;"></td>
                                    <td style="padding: 0 15px; color: #B8956A; font-size: 14px;">✦</td>
                                    <td style="width: 60px; height: 1px; background-color: #B8956A;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Success checkmark -->
                    <tr>
                        <td align="center" style="padding: 20px 40px 30px 40px;">
                            <div style="width: 70px; height: 70px; background-color: #B8956A; border-radius: 50%; display: inline-block; text-align: center; line-height: 70px;">
                                <span style="color: #ffffff; font-size: 32px;">✓</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Main content -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 50px 40px 50px;">

                            <h1 style="margin: 0 0 25px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; line-height: 1.3; color: #1A1A1A; text-align: center;">
                                Prijava uspješno zaprimljena!
                            </h1>

                            <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #4a4a4a; text-align: center;">
                                Draga <span style="color: #B8956A; font-weight: 600;">${name}</span>,
                            </p>

                            <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                                Hvala ti što si ispunila onboarding obrazac! Tvoja prijava za <strong style="color: #1A1A1A;">${educationLevel}</strong> je uspješno zaprimljena.
                            </p>

                            <!-- Divider -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 10px 0 25px 0;">
                                        <div style="height: 1px; background-color: #1A1A1A; opacity: 0.1;"></div>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                                <strong style="color: #1A1A1A;">Što slijedi?</strong>
                            </p>

                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                                        <span style="color: #B8956A; font-weight: bold; margin-right: 10px;">1.</span> Pregledat ću tvoju prijavu i javiti ti se u roku 24-48 sati
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                                        <span style="color: #B8956A; font-weight: bold; margin-right: 10px;">2.</span> Dobit ćeš informacije o plaćanju i sljedećim koracima
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                                        <span style="color: #B8956A; font-weight: bold; margin-right: 10px;">3.</span> Nakon uplate, dobit ćeš pristup platformi i welcome box
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 10px 0 25px 0;">
                                        <div style="height: 1px; background-color: #1A1A1A; opacity: 0.1;"></div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Summary box -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FDF8F3; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <p style="margin: 0 0 15px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; color: #1A1A1A; font-weight: 600;">
                                            Tvoji podaci:
                                        </p>
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 5px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #4a4a4a;">
                                                    <strong>Edukacija:</strong> ${educationLevel}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #4a4a4a;">
                                                    <strong>Ime na certifikatu:</strong> ${certificateName}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #4a4a4a;">
                                                    <strong>Masterclass:</strong> ${masterclassDate}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 25px 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #4a4a4a;">
                                Ako imaš bilo kakvih pitanja u međuvremenu, slobodno mi se javi na ovaj email.
                            </p>

                            <p style="margin: 0 0 30px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; line-height: 1.5; color: #1A1A1A; font-style: italic;">
                                Vidimo se uskoro! 💎
                            </p>

                            <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; line-height: 1.5; color: #1A1A1A;">
                                Nikolina Kljaić
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1A1A1A; padding: 30px 40px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 15px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; color: rgba(255,255,255,0.6); font-style: italic;">
                                            Elevate your art.
                                        </p>
                                        <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.4); text-transform: uppercase;">
                                            <span style="color: #B8956A;">✦</span>&nbsp;&nbsp;Brendia Pro® Education&nbsp;&nbsp;<span style="color: #B8956A;">✦</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>

                <!-- Bottom spacing and legal -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">
                    <tr>
                        <td align="center" style="padding: 30px 20px;">
                            <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.6; color: #999999;">
                                © 2025 Brendia Pro®. All rights reserved.<br>
                                <a href="https://www.brendiapro.hr" style="color: #B8956A; text-decoration: none;">brendiapro.hr</a>
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>`;

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
        name: "Brendia Pro® Artist",
        price: 3000,
        priceWithVat: 3750,
      },
      "advanced-brendia-pro-artist": {
        name: "Advanced Brendia Pro® Artist",
        price: 4000,
        priceWithVat: 5000,
      },
      "brendia-pro-artist-1v1": {
        name: "Brendia Pro® Artist 1v1",
        price: 2000,
        priceWithVat: 2500,
      },
      "brendia-pro-master-1v1": {
        name: "Advanced Brendia Pro® Artist 1v1",
        price: 5000,
        priceWithVat: 6250,
      },
    };

    const educationInfo = educationLevelMap[body.educationLevel] || {
      name: body.educationLevel,
      price: 0,
      priceWithVat: 0,
    };

    // Map masterclass date to readable format
    const masterclassDateMap: Record<string, string> = {
      "27-06": "27. lipnja 2025. - Zagreb",
      "ne-mogu-doci": "Ne mogu doći",
    };
    const masterclassDateDisplay =
      masterclassDateMap[body.masterclassDate] || body.masterclassDate || "Nije odabrano";

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

    // Send confirmation email
    try {
      const firstName = body.fullName.split(" ")[0];
      const emailHtml = getSuccessEmailHtml(
        firstName,
        educationInfo.name,
        body.certificateName,
        masterclassDateDisplay
      );

      await resend.emails.send({
        from: "Brendia Pro® <info@brendiapro.hr>",
        to: body.email,
        subject: "Prijava zaprimljena - Brendia Pro® Education ✓",
        html: emailHtml,
      });

      console.log(`Confirmation email sent to ${body.email}`);
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Failed to send confirmation email:", emailError);
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
