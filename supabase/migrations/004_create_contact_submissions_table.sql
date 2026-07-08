-- Create contact_submissions table for contact form
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Message
  subject TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'spam', 'archived')),
  replied_at TIMESTAMPTZ,
  replied_by TEXT,

  -- Admin Notes
  notes TEXT,

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role can manage contact_submissions" ON public.contact_submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update timestamp trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contact_submissions_updated_at') THEN
    CREATE TRIGGER update_contact_submissions_updated_at
      BEFORE UPDATE ON public.contact_submissions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
