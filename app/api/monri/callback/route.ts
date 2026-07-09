import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  verifyCallbackDigest,
  isSuccessfulPayment,
  getResponseMessage,
} from "@/lib/monri";
import { getCourse, formatPrice } from "@/lib/constants/courses";

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

// Generate a secure enrollment token
function generateEnrollmentToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Course ID mapping for display names
const COURSE_NAMES: Record<string, string> = {
  "foundation-certification": "Foundation Certification",
  "master-certification": "Master Certification",
  "brendia-pro-artist-1v1": "Brendia Pro Artist 1v1",
  "brendia-pro-master-1v1": "Brendia Pro Master 1v1",
};

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
      .select("id, status, email, first_name, last_name, course_id, course_name, amount")
      .eq("order_number", orderNumber)
      .single();

    if (findError || !order) {
      console.error("Order not found:", orderNumber, findError);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
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

    // Send magic link email if payment was successful
    if (isSuccess && process.env.RESEND_API_KEY) {
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
            formatPrice(order.amount)
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

// Generate activation email HTML
function generateActivationEmailHtml(
  name: string,
  courseName: string,
  activationUrl: string,
  orderNumber: string,
  price: string
): string {
  return `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brendia Pro</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1A1A1A;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1A1A1A;
      padding: 30px 40px;
      text-align: center;
    }
    .header img {
      height: 40px;
    }
    .content {
      padding: 40px;
    }
    .footer {
      background-color: #FDF8F3;
      padding: 30px 40px;
      text-align: center;
      font-size: 14px;
      color: #666666;
    }
    h1 {
      color: #1A1A1A;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 20px;
    }
    p {
      margin: 0 0 16px;
      color: #333333;
    }
    .button {
      display: inline-block;
      background-color: #B8956A;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .highlight {
      background-color: #FDF8F3;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://brendiapro.hr/images/logo-white.png" alt="Brendia Pro" />
    </div>
    <div class="content">
      <h1>Hvala na kupnji!</h1>
      <p>Draga ${name},</p>
      <p>Vasa uplata za <strong>${courseName}</strong> je uspjesno zaprimljena.</p>
      <div class="highlight">
        <p><strong>Detalji narudzbe:</strong></p>
        <p>Broj narudzbe: ${orderNumber}</p>
        <p>Program: ${courseName}</p>
        <p>Iznos: ${price}</p>
      </div>
      <p>Da biste pristupili svom tecaju, potrebno je aktivirati svoj racun. Kliknite na gumb ispod kako biste postavili lozinku i zapoceli s ucenjem.</p>
      <p style="text-align: center;">
        <a href="${activationUrl}" class="button">Aktiviraj racun</a>
      </p>
      <div class="divider"></div>
      <p><strong>Sto ce se dogoditi:</strong></p>
      <ul>
        <li>Postavit cete svoju lozinku</li>
        <li>Automatski cete dobiti pristup svom tecaju</li>
        <li>Mozete odmah poceti s ucenjem</li>
      </ul>
      <p style="font-size: 12px; color: #666;">Link za aktivaciju istjece za 7 dana. Ako link istekne, kontaktirajte nas za novi.</p>
      <div class="divider"></div>
      <p>Srdacan pozdrav,<br>Nikolina i Brendia Pro tim</p>
    </div>
    <div class="footer">
      <p><strong>Brendia Pro</strong></p>
      <p>Premium Hair Extension Education</p>
      <p style="font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} Brendia Pro. Sva prava pridrzana.
      </p>
    </div>
  </div>
</body>
</html>
`;
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
