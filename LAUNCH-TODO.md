# Brendia Pro® Education - Launch Checklist

## Before Sending Emails

- [ ] Update masterclass dates in `/onboarding` page (currently: 16.6. / 23.6.)
- [ ] Update masterclass dates in API route (`app/api/onboarding/route.ts`)
- [ ] Run Supabase migration for `onboarding_submissions` table
- [ ] Add `RESEND_API_KEY` to Vercel environment variables
- [ ] Test form submission on live site (brendiapro.hr/onboarding)

## Send Welcome Emails

- [ ] Send welcome emails to 33 subscribers
  ```bash
  SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/send-onboarding-emails.ts --dry-run  # Preview first
  SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/send-onboarding-emails.ts            # Send to all
  ```

## After Launch

- [ ] Monitor form submissions in Supabase
- [ ] Check confirmation emails are being sent
- [ ] Respond to submissions within 24-48 hours

---

## Quick Links

- **Onboarding form:** https://www.brendiapro.hr/onboarding
- **Supabase dashboard:** https://supabase.com/dashboard
- **Resend dashboard:** https://resend.com/emails
- **Vercel dashboard:** https://vercel.com

## Files to Update for Masterclass Dates

1. `app/onboarding/page.tsx` - Line ~540 (radio options)
2. `app/api/onboarding/route.ts` - Line ~340 (masterclassDateMap)
