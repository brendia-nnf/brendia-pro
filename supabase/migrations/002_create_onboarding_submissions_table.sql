-- Create onboarding_submissions table for Brendia Pro Education
CREATE TABLE IF NOT EXISTS onboarding_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Basic Info
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city_country TEXT NOT NULL,

    -- Business Info
    salon_name TEXT,
    instagram TEXT NOT NULL,
    website TEXT,

    -- Experience
    years_in_industry TEXT,
    does_hair_extensions TEXT,
    sewing_experience TEXT,

    -- Education Level
    education_level TEXT NOT NULL,
    education_level_name TEXT,
    education_price INTEGER,
    education_price_with_vat INTEGER,

    -- Certificate
    certificate_name TEXT NOT NULL,

    -- Payment
    invoice_type TEXT,
    payment_method TEXT,

    -- Shipping
    shipping_address TEXT NOT NULL,
    postal_code TEXT NOT NULL,

    -- Masterclass
    masterclass_date TEXT,

    -- Agreements
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at TIMESTAMPTZ,
    content_consent BOOLEAN DEFAULT FALSE,

    -- Status & Metadata
    status TEXT DEFAULT 'pending',
    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_email ON onboarding_submissions(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_status ON onboarding_submissions(status);

-- Create index on education level for filtering
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_education_level ON onboarding_submissions(education_level);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_submitted_at ON onboarding_submissions(submitted_at DESC);

-- Enable Row Level Security
ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
CREATE POLICY "Service role has full access to onboarding_submissions"
    ON onboarding_submissions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_onboarding_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_onboarding_submissions_updated_at
    BEFORE UPDATE ON onboarding_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_submissions_updated_at();
