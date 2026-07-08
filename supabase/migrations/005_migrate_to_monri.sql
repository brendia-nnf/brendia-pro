-- Migration from Stripe to Monri payment gateway
-- This migration adds Monri-specific columns while preserving Stripe columns for historical data

-- Add order_number column for Monri integration (format: BP-YYMMDD-XXXX)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number VARCHAR(40) UNIQUE;

-- Add Monri transaction columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS monri_transaction_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS monri_approval_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS monri_response_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS monri_pan_token VARCHAR(100),
  ADD COLUMN IF NOT EXISTS monri_masked_pan VARCHAR(20);

-- Create index for order_number lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Create index for Monri transaction lookups
CREATE INDEX IF NOT EXISTS idx_orders_monri_transaction ON public.orders(monri_transaction_id);

-- Function to generate order number (same format as platform: BP-YYMMDD-XXXX)
CREATE OR REPLACE FUNCTION public.generate_marketing_order_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  random_part TEXT;
  result TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYMMDD');
  random_part := '';

  -- Generate 4 random alphanumeric characters
  FOR i IN 1..4 LOOP
    random_part := random_part || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;

  result := 'BP-' || date_part || '-' || random_part;

  -- Check if already exists and regenerate if needed
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_number = result) LOOP
    random_part := '';
    FOR i IN 1..4 LOOP
      random_part := random_part || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
    result := 'BP-' || date_part || '-' || random_part;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.order_number IS 'Unique order number for Monri integration (format: BP-YYMMDD-XXXX)';
COMMENT ON COLUMN public.orders.monri_transaction_id IS 'Monri transaction ID returned after successful payment';
COMMENT ON COLUMN public.orders.monri_approval_code IS 'Bank approval code from Monri';
COMMENT ON COLUMN public.orders.monri_response_code IS 'Monri response code (0000 = approved)';
COMMENT ON COLUMN public.orders.monri_pan_token IS 'Tokenized card PAN for future payments (optional)';
COMMENT ON COLUMN public.orders.monri_masked_pan IS 'Masked card number (e.g., 411111******1111)';
