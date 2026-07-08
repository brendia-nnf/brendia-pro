/**
 * Script to send onboarding emails to subscribers
 *
 * Usage: npx tsx scripts/send-onboarding-emails.ts [options] [emails...]
 *
 * Options:
 *   --dry-run    Preview what would be sent without actually sending
 *   --test       Send only to test email (first subscriber)
 *
 * Examples:
 *   npx tsx scripts/send-onboarding-emails.ts                     # Send to all subscribers
 *   npx tsx scripts/send-onboarding-emails.ts email1@x.com email2@x.com  # Send to specific emails
 *   npx tsx scripts/send-onboarding-emails.ts --dry-run email@x.com      # Dry run for specific email
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";

// Configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_Gk6ZT8Yi_8E7AWUG83NMBzqjCYeDuZhiN";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://thvbamsmxolxndyspnia.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const FROM_EMAIL = "Brendia Pro® <info@brendiapro.hr>";
const SUBJECT = "Dobrodošla u Brendia Pro® Education ✨";

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isTestMode = args.includes("--test");
const specificEmails = args.filter(arg => !arg.startsWith("--") && arg.includes("@"));

async function main() {
  console.log("\n🚀 Brendia Pro® Onboarding Email Sender\n");
  console.log("=====================================\n");

  if (isDryRun) {
    console.log("📋 DRY RUN MODE - No emails will be sent\n");
  }
  if (isTestMode) {
    console.log("🧪 TEST MODE - Only first subscriber will receive email\n");
  }
  if (specificEmails.length > 0) {
    console.log(`🎯 SPECIFIC EMAILS MODE - Sending to ${specificEmails.length} specified email(s)\n`);
  }

  // Check for service key
  if (!SUPABASE_SERVICE_KEY && !isDryRun) {
    console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required");
    console.log("\nRun with: SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/send-onboarding-emails.ts");
    process.exit(1);
  }

  // Initialize clients
  const resend = new Resend(RESEND_API_KEY);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || "dummy-key-for-dry-run");

  // Load email template
  const templatePath = path.join(process.cwd(), "emails", "welcome-onboarding.html");

  if (!fs.existsSync(templatePath)) {
    console.error("❌ Error: Email template not found at", templatePath);
    process.exit(1);
  }

  const emailTemplate = fs.readFileSync(templatePath, "utf-8");
  console.log("✅ Email template loaded\n");

  // Fetch subscribers
  console.log("📥 Fetching subscribers from database...\n");

  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("id, email, subscribed_at")
    .order("subscribed_at", { ascending: true });

  if (error) {
    console.error("❌ Error fetching subscribers:", error.message);
    process.exit(1);
  }

  if (!subscribers || subscribers.length === 0) {
    console.log("📭 No subscribers found in database");
    process.exit(0);
  }

  console.log(`📧 Found ${subscribers.length} subscriber(s) in database\n`);

  // Determine target subscribers based on mode
  let targetSubscribers = subscribers;

  if (specificEmails.length > 0) {
    // Filter to only specific emails (case-insensitive)
    const emailsLower = specificEmails.map(e => e.toLowerCase());
    targetSubscribers = subscribers.filter(s => emailsLower.includes(s.email.toLowerCase()));

    // Also include emails not in database (send directly)
    const foundEmails = targetSubscribers.map(s => s.email.toLowerCase());
    const notInDb = specificEmails.filter(e => !foundEmails.includes(e.toLowerCase()));

    if (notInDb.length > 0) {
      console.log(`⚠️  ${notInDb.length} email(s) not found in database, will send anyway:\n`);
      notInDb.forEach(e => console.log(`   - ${e}`));
      console.log("");
      // Add them as pseudo-subscribers
      notInDb.forEach(email => {
        targetSubscribers.push({ id: null, email, subscribed_at: null });
      });
    }

    console.log(`🎯 Targeting ${targetSubscribers.length} email(s)\n`);
  } else if (isTestMode) {
    targetSubscribers = [subscribers[0]];
  }

  // Send emails
  let successCount = 0;
  let failCount = 0;

  for (const subscriber of targetSubscribers) {
    const email = subscriber.email;

    // Personalize the template (replace ___ with email or name if available)
    // For now, we'll use a generic greeting since we only have email
    const personalizedHtml = emailTemplate.replace(
      /<span style="color: #B8956A;">___<\/span>/g,
      `<span style="color: #B8956A;">${email.split("@")[0]}</span>`
    );

    console.log(`📤 Sending to: ${email}`);

    if (isDryRun) {
      console.log(`   ✅ [DRY RUN] Would send email\n`);
      successCount++;
      continue;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: SUBJECT,
        html: personalizedHtml,
      });

      if (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
        failCount++;
      } else {
        console.log(`   ✅ Sent! (ID: ${data?.id})\n`);
        successCount++;
      }

      // Rate limiting - wait 100ms between emails
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.log(`   ❌ Error: ${err instanceof Error ? err.message : "Unknown error"}\n`);
      failCount++;
    }
  }

  // Summary
  console.log("\n=====================================");
  console.log("📊 SUMMARY\n");
  console.log(`   Total subscribers: ${subscribers.length}`);
  console.log(`   Emails sent: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log("\n=====================================\n");

  if (isDryRun) {
    console.log("💡 To actually send emails, run without --dry-run flag\n");
  }
}

main().catch(console.error);
