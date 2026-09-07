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
- Stripe payment gateway integration (hosted Stripe Checkout; migrated from Monri 2026-09)
- Installment payments via Stripe subscription schedules (feature-flagged, hidden by default)
- Checkout page with full data collection (personal, billing, company, marketing)
- Pricing breakdown with VAT (25% Croatian VAT)
- Magic link enrollment system (email sent after purchase)
- Supabase shared database schema

### Pending
- Run migration `006_migrate_to_stripe.sql` in Supabase SQL Editor
- Configure Stripe credentials in `.env.local` / Vercel (client must open a Stripe account)
- Register webhook endpoint in Stripe Dashboard: `https://brendiapro.hr/api/stripe/webhook`
- Switch `NEXT_PUBLIC_PAYMENT_MODE` from `predracun` to `card` at go-live

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** GSAP + ScrollTrigger
- **Smooth Scrolling:** Lenis
- **Database/Auth:** Supabase (shared with platform)
- **Payments:** Stripe (hosted Checkout + subscription schedules for installments)
- **Email:** Resend
- **Hosting:** Vercel

## User Flow: Purchase to Platform Access

```
Marketing Site                              Platform
─────────────────                           ────────

1. User fills checkout form
2. Pays via Stripe Checkout (hosted redirect)
3. Stripe webhook (checkout.session.completed) received:
   - Order marked as "paid"
   - Enrollment token generated (64 chars)
   - Token expires in 7 days
   - Magic link email sent via Resend
   - (installment plans: subscription converted to a
      fixed-count schedule, access granted after 1st rata)

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

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Payment mode: "predracun" (bank transfer) or "card" (Stripe)
NEXT_PUBLIC_PAYMENT_MODE=card

# Installments — hidden until the client approves
NEXT_PUBLIC_INSTALLMENTS_ENABLED=false

# Email (Resend) - for sending activation emails
RESEND_API_KEY=re_...

# Site URLs
NEXT_PUBLIC_SITE_URL=https://brendiapro.hr
NEXT_PUBLIC_PLATFORM_URL=https://app.brendiapro.hr
```

## Stripe Integration Details

### Flow
- `/api/checkout` creates the order (pending) + contract PDF, then a hosted
  Checkout Session (`lib/stripe.ts`); the client redirects to `session.url`.
- `/api/stripe/webhook` (signature-verified) handles fulfillment via
  `lib/fulfillment.ts` — idempotent (`status = pending` guard), safe under
  Stripe webhook retries.
- Predračun mode (`NEXT_PUBLIC_PAYMENT_MODE=predracun`) bypasses Stripe
  entirely; `/api/admin/confirm-payment` confirms bank transfers manually.

### Installments (feature-flagged)
- Config per course in `lib/constants/courses.ts` (`installments: { enabled, count }`),
  globally gated by `NEXT_PUBLIC_INSTALLMENTS_ENABLED`.
- Checkout runs in subscription mode; the webhook converts the subscription
  into a schedule with `iterations: count`, `end_behavior: "cancel"`.
- `invoice.paid` recomputes `installments_paid`; final rata sets `fully_paid_at`.
- `customer.subscription.deleted` before full payment ⇒ order `defaulted`,
  enrollment `suspended` (course routes only allow `status = 'active'`).
- Certification apply is blocked until `fully_paid_at` is set (installment plans only).

### Order Number Format
`BP-YYMMDD-XXXX` (e.g., `BP-260708-A1B2`)

### Test Cards (Stripe test mode)
| Card | Type |
|------|------|
| 4242 4242 4242 4242 | Success |
| 4000 0025 0000 3155 | Requires 3DS |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0002 | Declined |

CVV: Any 3 digits, Expiry: Any future date
Local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

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
│       ├── checkout/route.ts        # Creates order, returns Stripe Checkout URL
│       ├── stripe/webhook/route.ts  # Handles Stripe events (fulfillment, installments)
│       └── contact/route.ts
├── lib/
│   ├── stripe.ts                 # Stripe client + Checkout Session helpers
│   ├── fulfillment.ts            # Post-payment flow (invoice, enrollment, emails)
│   ├── constants/courses.ts      # Course definitions (incl. installment config)
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

## Next Steps (Stripe go-live)

1. Client opens a Stripe account; get test + live API keys
2. **Run `006_migrate_to_stripe.sql` in Supabase SQL Editor** (+ `020` in the platform repo)
3. Add Stripe credentials to `.env.local` / Vercel
4. Register webhook in Stripe Dashboard: `https://brendiapro.hr/api/stripe/webhook`
   (events: checkout.session.completed/expired, invoice.paid,
   invoice.payment_failed, invoice.marked_uncollectible, customer.subscription.deleted)
5. Enable Smart Retries + dunning emails (Billing → Revenue recovery)
6. Test payment flow with Stripe test cards + `stripe listen`
7. Set `NEXT_PUBLIC_PAYMENT_MODE=card`, deploy to BOTH remotes (brendia_ui = live)
8. Optionally set `NEXT_PUBLIC_INSTALLMENTS_ENABLED=true` once the client approves rate
