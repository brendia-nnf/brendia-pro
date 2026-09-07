-- Migration 006: Monri → Stripe + installment payments
-- orders already has stripe_session_id, stripe_payment_intent,
-- stripe_customer_id (from 001/000_master) — only the installment
-- tracking columns are new.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_plan TEXT NOT NULL DEFAULT 'full',       -- 'full' | 'installments'
  ADD COLUMN IF NOT EXISTS installments_total INTEGER,
  ADD COLUMN IF NOT EXISTS installments_paid INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS installment_amount INTEGER,                      -- cents per installment
  ADD COLUMN IF NOT EXISTS fully_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_installment_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS installment_status TEXT;                         -- null | 'active' | 'completed' | 'defaulted'

CREATE INDEX IF NOT EXISTS idx_orders_stripe_subscription
  ON public.orders(stripe_subscription_id);

-- Guard against two orders claiming the same Checkout Session
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session_unique
  ON public.orders(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
