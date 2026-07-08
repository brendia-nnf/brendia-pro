# Brendia Pro - Project Context

## Overview

Brendia Pro is a premium hair extension education platform owned by Nikolina Kljaić. The website serves as a luxury marketing platform to sell two certification courses (€3,000 and €4,000), with a student portal and mobile app.

**Architecture:** Shared Supabase database between marketing site and platform.

## Current Status

### Completed
- Full marketing website with all pages
- GSAP + Lenis animation infrastructure
- SEO (sitemap, robots.txt, JSON-LD structured data)
- Optimized images from photoshoot
- Contact form with API route
- Responsive design
- Monri payment gateway integration (Form Redirect method)
- Checkout page with full data collection (personal, billing, company, marketing)
- Pricing breakdown with VAT (25% Croatian VAT)
- Magic link enrollment system (email sent after purchase)
- Supabase shared database schema

### Pending
- Video files (filmed, awaiting edit): `public/videos/nikolina-welcome.mp4`, `public/videos/courses-intro.mp4`
- Run master migration (`000_master_migration.sql`)
- Configure Monri + Resend credentials in `.env.local`
- Deploy to Vercel
- Configure Monri callback URL in merchant portal

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** GSAP + ScrollTrigger
- **Smooth Scrolling:** Lenis
- **Database/Auth:** Supabase (shared with platform)
- **Payments:** Monri (Croatian payment gateway)
- **Email:** Resend
- **Hosting:** Vercel

## User Flow: Purchase to Platform Access

```
Marketing Site                              Platform
─────────────────                           ────────

1. User fills checkout form
2. Pays via Monri
3. Monri callback received:
   - Order marked as "paid"
   - Enrollment token generated (64 chars)
   - Token expires in 7 days
   - Magic link email sent via Resend

4. User receives email:
   "Aktivirajte pristup: [Course Name]"
   with link to platform

                                            5. User clicks activation link
                                            6. /auth/activate/[token] validates token
                                            7. User sets password
                                            8. Supabase Auth user created
                                            9. Enrollment record created
                                            10. Order marked as enrollment_completed
                                            11. User redirected to login
                                            12. User accesses course content
```

## Database Schema (Shared)

The `000_master_migration.sql` creates all tables for both marketing site and platform:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends Supabase Auth) |
| `orders` | Marketing site course purchases |
| `enrollments` | User course access records |
| `levels` | Course levels (1, 2, 3) |
| `chapters` | Video lessons within levels |
| `progress` | User progress tracking |
| `certifications` | User certification status |
| `devices` | Device/session management |
| `products` | Webshop products |
| `webshop_orders` | Webshop purchases |
| `coupons` | Discount codes |
| `subscribers` | Newsletter subscribers |
| `onboarding_submissions` | Onboarding quiz responses |
| `contact_submissions` | Contact form messages |

### Key Order Columns for Enrollment

```sql
-- Magic Link Enrollment
enrollment_token VARCHAR(64) UNIQUE,
enrollment_token_expires_at TIMESTAMPTZ,  -- 7 days from payment
enrollment_completed_at TIMESTAMPTZ       -- When user activated account
```

## Environment Variables

Create `.env.local` from `.env.example`:

```env
# Supabase (shared database)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Monri Payment Gateway
MONRI_MERCHANT_KEY=your_merchant_key
MONRI_AUTHENTICITY_TOKEN=your_40_char_authenticity_token
MONRI_ENVIRONMENT=test  # "test" or "production"

# Email (Resend) - for sending activation emails
RESEND_API_KEY=re_...

# Site URLs
NEXT_PUBLIC_SITE_URL=https://brendiapro.hr
NEXT_PUBLIC_PLATFORM_URL=https://app.brendiapro.hr
```

## Monri Integration Details

### Form Redirect Method
- Test URL: `https://ipgtest.monri.com/v2/form`
- Production URL: `https://ipg.monri.com/v2/form`

### Digest Calculation
```typescript
// Form submission digest
SHA512(merchant_key + order_number + amount + currency)

// Callback verification digest
SHA512(merchant_key + order_number + response_code + amount + currency)
```

### Order Number Format
`BP-YYMMDD-XXXX` (e.g., `BP-260708-A1B2`)

### Response Codes
- `0000` = Approved
- `0001` = Approved with identification
- `4000` = Cancelled by user
- Other = Declined/Failed

### Test Cards
| Card | Type |
|------|------|
| 4341792000000044 | Visa 3DS |
| 4058400000000005 | Visa |
| 5464000000000008 | Mastercard |
| 6769064219992611 | Maestro 3DS |

CVV: Any 3 digits, Expiry: Any future date

## Courses & Pricing

### Foundation Course
- **Price:** €3,000 excl. VAT → €3,750 incl. VAT (25%)
- **Package:** basic
- **Course ID:** `foundation-certification`

### Master Course
- **Price:** €4,000 excl. VAT → €5,000 incl. VAT (25%)
- **Package:** advanced
- **Course ID:** `master-certification`

### 1v1 Courses
- **Artist 1v1:** €2,000 → €2,500 incl. VAT (basic package)
- **Master 1v1:** €5,000 → €6,250 incl. VAT (advanced package)

## Project Structure

```
brendia-pro/
├── app/
│   ├── [locale]/(marketing)/     # Marketing pages with i18n
│   │   ├── checkout/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── CheckoutFormFull.tsx
│   │   │   ├── success/page.tsx
│   │   │   └── cancel/page.tsx
│   │   └── ...
│   └── api/
│       ├── checkout/route.ts        # Creates order, returns Monri form data
│       ├── monri/callback/route.ts  # Handles payment callback, sends activation email
│       └── contact/route.ts
├── lib/
│   ├── monri.ts                  # Monri SDK helpers
│   ├── constants/courses.ts      # Course definitions
│   └── ...
└── supabase/
    └── migrations/
        └── 000_master_migration.sql  # Combined schema for shared DB
```

## Important Guidelines

### Terminology
- **DO NOT** use "IBE", "ibe", or "invisible bead extensions" anywhere
- **USE** "weft extensions" as the technique terminology
- The brand name is "Brendia Pro" (capital B, capital P)

## Next Steps

1. Add edited video files to `public/videos/`
2. **Run master migration in Supabase SQL Editor:**
   - Copy contents of `supabase/migrations/000_master_migration.sql`
   - Paste and run in Supabase Dashboard → SQL Editor
3. Get Monri merchant credentials from Monri portal
4. Get Resend API key from resend.com
5. Add all credentials to `.env.local`
6. Configure callback URL in Monri portal: `https://brendiapro.hr/api/monri/callback`
7. Test payment flow with test cards
8. Deploy to Vercel
9. Switch `MONRI_ENVIRONMENT` to `production` for go-live
