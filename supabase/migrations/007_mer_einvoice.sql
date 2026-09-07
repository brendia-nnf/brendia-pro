-- Migration 007: MER (Moj-eRačun) B2B eRačuni za kupce-tvrtke
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS mer_invoice_number TEXT,   -- fiskalni broj (npr. 3/WEB1/2)
  ADD COLUMN IF NOT EXISTS mer_electronic_id TEXT,    -- MER ElectronicId za praćenje
  ADD COLUMN IF NOT EXISTS mer_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mer_error TEXT;
