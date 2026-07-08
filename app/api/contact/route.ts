import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting map (simple in-memory, use Redis in production)
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // 3 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, phone } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitize = (str: string) =>
      str.replace(/<[^>]*>/g, "").trim().slice(0, 1000);

    const sanitizedData = {
      name: sanitize(name),
      email: email.toLowerCase().trim(),
      phone: phone ? sanitize(phone) : null,
      subject: sanitize(subject),
      message: message.trim().slice(0, 5000),
      ip_address: ip,
      user_agent: request.headers.get("user-agent") || null,
    };

    // Store in database
    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert(sanitizedData)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: "Brendia Pro <info@brendiapro.hr>",
        to: sanitizedData.email,
        subject: "Primili smo vasu poruku - Brendia Pro",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { background: #1A1A1A; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #fff; }
    .footer { padding: 20px; text-align: center; font-size: 14px; color: #666; background: #FDF8F3; }
    h1 { color: #1A1A1A; margin: 0 0 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://brendiapro.hr/images/logo-white.png" alt="Brendia Pro" height="40" />
    </div>
    <div class="content">
      <h1>Hvala na poruci!</h1>
      <p>Postovani/a ${sanitizedData.name},</p>
      <p>Primili smo vasu poruku i odgovorit cemo vam u najkracemu mogucemu roku.</p>
      <p>Obicno odgovaramo unutar 24-48 sati radnim danima.</p>
      <p>Srdacan pozdrav,<br>Brendia Pro tim</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Brendia Pro. Sva prava pridrzana.</p>
    </div>
  </div>
</body>
</html>
        `,
      });
    } catch (emailError) {
      console.error("Confirmation email error:", emailError);
      // Don't fail the request if email fails
    }

    // Send notification to admin
    try {
      await resend.emails.send({
        from: "Brendia Pro <info@brendiapro.hr>",
        to: process.env.ADMIN_EMAIL || "info@brendiapro.hr",
        replyTo: sanitizedData.email,
        subject: `[Kontakt forma] ${sanitizedData.subject}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .highlight { background: #FDF8F3; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .message { background: #f5f5f5; padding: 15px; border-radius: 6px; white-space: pre-wrap; }
    .button { display: inline-block; background: #B8956A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Nova poruka s kontakt forme</h1>
    <div class="highlight">
      <p><strong>Od:</strong> ${sanitizedData.name}</p>
      <p><strong>Email:</strong> ${sanitizedData.email}</p>
      ${sanitizedData.phone ? `<p><strong>Telefon:</strong> ${sanitizedData.phone}</p>` : ""}
      <p><strong>Predmet:</strong> ${sanitizedData.subject}</p>
    </div>
    <p><strong>Poruka:</strong></p>
    <div class="message">${sanitizedData.message}</div>
    <p style="margin-top: 20px;">
      <a href="mailto:${sanitizedData.email}?subject=Re: ${sanitizedData.subject}" class="button">
        Odgovori
      </a>
    </p>
    <p style="font-size: 12px; color: #666; margin-top: 20px;">
      ID: ${submission.id}<br>
      IP: ${ip}<br>
      Vrijeme: ${new Date().toLocaleString("hr-HR")}
    </p>
  </div>
</body>
</html>
        `,
      });
    } catch (emailError) {
      console.error("Admin notification email error:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Hvala na poruci! Odgovorit cemo vam u najkracemu mogucemu roku.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
