# Production Checklist: Brendia Pro

A unified checklist of everything needed before going live.

---

## Critical Path (Must Complete Before Launch)

### 1. Supabase Setup

- [ ] **Create Supabase project** at [supabase.com](https://supabase.com)
- [ ] **Run orders table migration**
  ```bash
  # In Supabase SQL Editor, run:
  supabase/migrations/001_create_orders_table.sql
  ```
- [ ] **Copy credentials to `.env.local`**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Stripe Setup

- [ ] **Create Stripe account** (or use existing) at [stripe.com](https://stripe.com)
- [ ] **Create products in Stripe Dashboard**:
  - Foundation Certification: €3,750 (incl. 25% VAT)
  - Master Certification: €5,000 (incl. 25% VAT)
- [ ] **Copy Price IDs to `.env.local`**:
  - `STRIPE_PRICE_FOUNDATION=price_xxx`
  - `STRIPE_PRICE_MASTER=price_xxx`
- [ ] **Copy API keys to `.env.local`**:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`
  - `STRIPE_SECRET_KEY=sk_live_xxx`
- [ ] **Configure webhook endpoint** (after Vercel deployment):
  - URL: `https://brendiapro.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `checkout.session.expired`
  - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Vercel Deployment

- [ ] **Connect GitHub repo** to Vercel
- [ ] **Add all environment variables** in Vercel dashboard:
  ```
  NEXT_PUBLIC_SITE_URL=https://brendiapro.com
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PRICE_FOUNDATION=price_...
  STRIPE_PRICE_MASTER=price_...
  ```
- [ ] **Deploy** and verify build succeeds
- [ ] **Configure custom domain**: `brendiapro.com`
- [ ] **Enable HTTPS** (automatic with Vercel)

---

## Code TODOs

### Contact Form (`app/api/contact/route.ts`)

Currently has two TODOs (lines 25-26):
```typescript
// TODO: Integrate with Supabase to store contact submissions
// TODO: Send email notification
```

**Options:**
1. **Supabase storage** - Create `contact_submissions` table
2. **Email notification** - Use Resend, SendGrid, or similar
3. **Both** - Store in DB and send notification email

**Recommended implementation:**
- Create `supabase/migrations/002_create_contact_submissions.sql`
- Integrate Resend for email notifications to `hello@brendiapro.com`

---

## Video Files

**Location:** `public/videos/`

| File | Status | Usage |
|------|--------|-------|
| `video-web-brendia.mp4` | Present (75MB) | Homepage video |
| `nikolina-welcome.mp4` | Missing | Homepage welcome video |
| `courses-intro.mp4` | Missing | Courses page intro |

**Action needed:** Either add the missing videos or update components to only use `video-web-brendia.mp4`

---

## Pre-Launch Testing

### Checkout Flow
- [ ] Test with Stripe test mode first
- [ ] Complete a test purchase (Foundation course)
- [ ] Complete a test purchase (Master course)
- [ ] Verify order appears in Supabase `orders` table
- [ ] Test webhook updates order status to "paid"
- [ ] Verify success page displays correctly
- [ ] Verify cancel page displays correctly

### Forms
- [ ] Test contact form submission
- [ ] Verify form validation works
- [ ] Test with invalid email, empty fields

### Internationalization
- [ ] Navigate all pages with `/en/` prefix
- [ ] Navigate all pages with `/hr/` prefix
- [ ] Test language switcher on every page
- [ ] Verify no hardcoded English text remains

### Responsive Design
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1440px)

### Performance
- [ ] Run Lighthouse audit (target: 90+ all categories)
- [ ] Verify Core Web Vitals pass

---

## Post-Launch

- [ ] Set up Google Analytics / Plausible
- [ ] Configure error monitoring (Sentry)
- [ ] Set up uptime monitoring
- [ ] Test live Stripe checkout with real card
- [ ] Verify webhook receives events in production

---

## Environment Files Reference

**`.env.example`** - Template for required vars
**`.env.local`** - Local development (not committed)
**Vercel Dashboard** - Production environment variables

---

## Quick Commands

```bash
# Local development
npm run dev

# Production build test
npm run build && npm run start

# Test Stripe webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Supabase migration (local)
supabase db push
```

---

## Summary

| Category | Items | Status |
|----------|-------|--------|
| Supabase | 3 items | Pending |
| Stripe | 5 items | Pending |
| Vercel | 4 items | Pending |
| Code TODOs | 2 items | Pending |
| Video Files | 2 missing | Pending |
| Testing | 12 items | Pending |
| Post-Launch | 5 items | Pending |

**Total: 33 items before production-ready**
