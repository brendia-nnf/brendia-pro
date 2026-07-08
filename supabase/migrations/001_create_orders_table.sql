-- Create orders table for Stripe checkout
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Personal Information
  customer_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Billing Address
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,

  -- Company Details (optional)
  company_name TEXT,
  vat_number TEXT,

  -- Marketing
  hear_about_us TEXT,

  -- Course Details
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,

  -- Pricing (all amounts in cents)
  subtotal INTEGER NOT NULL,        -- Price without VAT
  vat_amount INTEGER NOT NULL,      -- VAT amount
  vat_rate DECIMAL(4,2) NOT NULL,   -- VAT rate (e.g., 0.25 for 25%)
  amount INTEGER NOT NULL,          -- Total price with VAT
  currency TEXT DEFAULT 'eur',

  -- Stripe
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  stripe_customer_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending',

  -- Terms & Marketing
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  marketing_accepted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Create indexes for common queries
CREATE INDEX idx_orders_email ON public.orders(email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX idx_orders_course_id ON public.orders(course_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage orders
CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
