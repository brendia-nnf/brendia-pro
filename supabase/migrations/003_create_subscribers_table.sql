-- Create subscribers table for newsletter
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Subscriber Data
  email TEXT UNIQUE NOT NULL,
  name TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,

  -- Source
  source TEXT DEFAULT 'website', -- website, checkout, manual

  -- Marketing Consent
  marketing_consent BOOLEAN DEFAULT true,
  marketing_consent_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at DESC);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role can manage subscribers" ON public.subscribers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update timestamp trigger (reuse function if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscribers_updated_at') THEN
    CREATE TRIGGER update_subscribers_updated_at
      BEFORE UPDATE ON public.subscribers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
