import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const resend = new Resend(process.env.RESEND_API_KEY);

function getWelcomeEmailHtml(email: string): string {
  const templatePath = path.join(
    process.cwd(),
    "emails",
    "welcome-onboarding.html"
  );
  const template = fs.readFileSync(templatePath, "utf-8");

  // Derive a display name from the email local part, e.g. "ana.horvat" -> "Ana"
  const firstToken = email.split("@")[0].split(/[._\-+]/)[0];
  const displayName = firstToken
    ? firstToken.charAt(0).toUpperCase() + firstToken.slice(1)
    : "";

  return template.replace(
    /<span style="color: #B8956A;">___<\/span>/g,
    `<span style="color: #B8956A;">${displayName}</span>`
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { data: existingSubscriber } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingSubscriber) {
      return NextResponse.json(
        { message: "Vec si na listi!" },
        { status: 200 }
      );
    }

    const { error } = await supabase.from("subscribers").insert([
      {
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
        source: "coming_soon_page",
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Prijava nije uspjela. Pokusaj ponovo." },
        { status: 500 }
      );
    }

    // Send welcome email (non-fatal: signup already succeeded)
    try {
      const { error: sendError } = await resend.emails.send({
        from: "Brendia Pro® <info@brendiapro.hr>",
        to: email.toLowerCase(),
        subject: "Dobrodošla u Brendia Pro® Education ✨",
        html: getWelcomeEmailHtml(email.toLowerCase()),
      });
      if (sendError) {
        console.error("Failed to send welcome email:", sendError);
      } else {
        console.log(`Welcome email sent to ${email.toLowerCase()}`);
      }
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json(
      { message: "Uspjesno si se prijavila!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
