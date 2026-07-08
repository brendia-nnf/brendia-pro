-- ============================================
-- BRENDIA PRO - MASTER MIGRATION
-- Combined database schema for shared database
-- ============================================

-- ============================================
-- PART 1: CORE FUNCTIONS
-- ============================================

-- Update timestamp function (used by multiple tables)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 2: USER PROFILES (extends Supabase Auth)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- Personal Information
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,

  -- Role & Access
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PART 3: ORDERS TABLE (Marketing Site Purchases)
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Order Number for Monri
  order_number VARCHAR(40) UNIQUE,

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
  subtotal INTEGER NOT NULL,
  vat_amount INTEGER NOT NULL,
  vat_rate DECIMAL(4,2) NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',

  -- Monri Payment
  monri_transaction_id VARCHAR(50),
  monri_approval_code VARCHAR(20),
  monri_response_code VARCHAR(10),
  monri_pan_token VARCHAR(100),
  monri_masked_pan VARCHAR(20),

  -- Legacy Stripe (for historical data)
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  stripe_customer_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),

  -- Terms & Marketing
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  marketing_accepted BOOLEAN DEFAULT false,

  -- Magic Link Enrollment
  enrollment_token VARCHAR(64) UNIQUE,
  enrollment_token_expires_at TIMESTAMPTZ,
  enrollment_completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_monri_transaction ON public.orders(monri_transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_course_id ON public.orders(course_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_enrollment_token ON public.orders(enrollment_token);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage orders" ON public.orders
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate enrollment token
CREATE OR REPLACE FUNCTION public.generate_enrollment_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..64 LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 4: ENROLLMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User Reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Order Reference (links to marketing site purchase)
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,

  -- Course/Package Details
  course_id TEXT NOT NULL,
  package TEXT NOT NULL CHECK (package IN ('basic', 'advanced')),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'refunded', 'pending')),

  -- Pricing (stored in cents)
  amount_paid INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',

  -- Order Number for Monri
  order_number VARCHAR(40) UNIQUE,

  -- Monri Payment
  monri_transaction_id VARCHAR(50),
  monri_approval_code VARCHAR(20),
  monri_response_code VARCHAR(10),
  monri_pan_token VARCHAR(100),
  monri_masked_pan VARCHAR(20),

  -- Legacy Stripe References
  stripe_payment_intent TEXT,
  stripe_customer_id TEXT,
  stripe_session_id TEXT,

  -- Validity
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for lifetime access

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_stripe_session ON public.enrollments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_order_number ON public.enrollments(order_number);
CREATE INDEX IF NOT EXISTS idx_enrollments_purchased_at ON public.enrollments(purchased_at DESC);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own enrollments" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage enrollments" ON public.enrollments
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all enrollments" ON public.enrollments
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user has active enrollment for a course
CREATE OR REPLACE FUNCTION public.has_active_enrollment(p_user_id UUID, p_course_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = p_user_id
      AND course_id = p_course_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 5: COURSE CONTENT TABLES
-- ============================================

-- Levels table
CREATE TABLE IF NOT EXISTS public.levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER NOT NULL CHECK (level_number IN (1, 2, 3)),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  required_package TEXT CHECK (required_package IN ('basic', 'advanced')),
  required_level INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level_number)
);

-- Chapters table
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  video_duration INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  video_thumbnail_url TEXT,
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_levels_level_number ON public.levels(level_number);
CREATE INDEX IF NOT EXISTS idx_levels_is_published ON public.levels(is_published);
CREATE INDEX IF NOT EXISTS idx_chapters_level_id ON public.chapters(level_id);
CREATE INDEX IF NOT EXISTS idx_chapters_is_published ON public.chapters(is_published);
CREATE INDEX IF NOT EXISTS idx_chapters_sort_order ON public.chapters(level_id, sort_order);

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view published levels" ON public.levels
    FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage levels" ON public.levels
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view published chapters" ON public.chapters
    FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage chapters" ON public.chapters
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_levels_updated_at ON public.levels;
CREATE TRIGGER update_levels_updated_at
  BEFORE UPDATE ON public.levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON public.chapters;
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default course structure (only if levels is empty)
INSERT INTO public.levels (level_number, title, title_en, description, description_en, required_package, required_level, is_published, sort_order)
SELECT * FROM (VALUES
  (1, 'Osnove', 'Basics', 'Naučite temelje weft ekstenzija i osnovne tehnike aplikacije.', 'Learn the fundamentals of weft extensions and basic application techniques.', 'basic', 0, true, 1),
  (2, 'Napredne tehnike', 'Advanced Techniques', 'Savladajte napredne metode i složenije stilove.', 'Master advanced methods and more complex styles.', 'basic', 1, true, 2),
  (3, 'Majstorstvo', 'Mastery', 'Postanite certificirani Brendia Pro majstor.', 'Become a certified Brendia Pro master.', 'advanced', 2, true, 3)
) AS v(level_number, title, title_en, description, description_en, required_package, required_level, is_published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.levels LIMIT 1);

-- ============================================
-- PART 6: PROGRESS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  watch_percentage INTEGER DEFAULT 0 CHECK (watch_percentage >= 0 AND watch_percentage <= 100),
  watch_time INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_position INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_chapter_id ON public.progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON public.progress(user_id, completed);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own progress" ON public.progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own progress" ON public.progress
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage progress" ON public.progress
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_progress_updated_at ON public.progress;
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-complete chapter when 95% watched
CREATE OR REPLACE FUNCTION public.check_chapter_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.watch_percentage >= 95 AND NOT OLD.completed THEN
    NEW.completed := true;
    NEW.completed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_progress_completion ON public.progress;
CREATE TRIGGER check_progress_completion
  BEFORE UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION public.check_chapter_completion();

-- ============================================
-- PART 7: CERTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status TEXT DEFAULT 'not_eligible' CHECK (status IN (
    'not_eligible', 'eligible', 'applied', 'under_review', 'approved', 'rejected'
  )),
  applied_at TIMESTAMPTZ,
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  certificate_number TEXT UNIQUE,
  certificate_url TEXT,
  level1_completed_at TIMESTAMPTZ,
  level2_completed_at TIMESTAMPTZ,
  level3_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON public.certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON public.certifications(status);
CREATE INDEX IF NOT EXISTS idx_certifications_certificate_number ON public.certifications(certificate_number);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own certification" ON public.certifications
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage certifications" ON public.certifications
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_certifications_updated_at ON public.certifications;
CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PART 8: DEVICES (Session Management)
-- ============================================

CREATE TABLE IF NOT EXISTS public.devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  browser TEXT,
  os TEXT,
  session_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  is_current BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_active ON public.devices(user_id, last_active DESC);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own devices" ON public.devices
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own devices" ON public.devices
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage devices" ON public.devices
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- PART 9: WEBSHOP TABLES
-- ============================================

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_en TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  currency TEXT DEFAULT 'eur',
  category TEXT NOT NULL CHECK (category IN ('extensions', 'tools', 'care')),
  images TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  specifications JSONB DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webshop Orders
CREATE TABLE IF NOT EXISTS public.webshop_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_full_name TEXT NOT NULL,
  shipping_street TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  coupon_code TEXT,
  coupon_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  -- Monri Payment
  monri_transaction_id VARCHAR(50),
  monri_approval_code VARCHAR(20),
  monri_response_code VARCHAR(10),
  monri_pan_token VARCHAR(100),
  monri_masked_pan VARCHAR(20),
  -- Legacy Stripe
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  stripe_customer_id TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  minimum_order INTEGER,
  maximum_discount INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  one_per_customer BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_webshop_orders_user_id ON public.webshop_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_webshop_orders_order_number ON public.webshop_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_webshop_orders_status ON public.webshop_orders(status);
CREATE INDEX IF NOT EXISTS idx_webshop_orders_customer_email ON public.webshop_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webshop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view published products" ON public.products
    FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage products" ON public.products
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage webshop_orders" ON public.webshop_orders
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage coupons" ON public.coupons
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_webshop_orders_updated_at ON public.webshop_orders;
CREATE TRIGGER update_webshop_orders_updated_at
  BEFORE UPDATE ON public.webshop_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate webshop order number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  seq_part TEXT;
  result TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYMMDD');
  SELECT LPAD((COALESCE(MAX(
    NULLIF(REGEXP_REPLACE(order_number, '^BP-' || date_part || '-', ''), '')::INTEGER
  ), 0) + 1)::TEXT, 4, '0')
  INTO seq_part
  FROM public.webshop_orders
  WHERE order_number LIKE 'BP-' || date_part || '-%';

  result := 'BP-' || date_part || '-' || seq_part;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Validate coupon function
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_order_subtotal INTEGER,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  valid BOOLEAN,
  error_message TEXT,
  discount_amount INTEGER,
  coupon_id UUID
) AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage INTEGER;
  v_discount INTEGER;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons
  WHERE code = UPPER(p_code) AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Coupon not found'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'Coupon has expired'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  IF v_coupon.starts_at > NOW() THEN
    RETURN QUERY SELECT false, 'Coupon is not yet valid'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT false, 'Coupon usage limit reached'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  IF v_coupon.minimum_order IS NOT NULL AND p_order_subtotal < v_coupon.minimum_order THEN
    RETURN QUERY SELECT false, ('Minimum order of ' || (v_coupon.minimum_order / 100.0)::TEXT || ' EUR required')::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  IF v_coupon.one_per_customer AND p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage FROM public.webshop_orders
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
    IF v_user_usage > 0 THEN
      RETURN QUERY SELECT false, 'Coupon already used'::TEXT, 0, NULL::UUID;
      RETURN;
    END IF;
  END IF;

  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := (p_order_subtotal * v_coupon.discount_value / 100);
    IF v_coupon.maximum_discount IS NOT NULL AND v_discount > v_coupon.maximum_discount THEN
      v_discount := v_coupon.maximum_discount;
    END IF;
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;

  IF v_discount > p_order_subtotal THEN
    v_discount := p_order_subtotal;
  END IF;

  RETURN QUERY SELECT true, NULL::TEXT, v_discount, v_coupon.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 10: MARKETING SITE TABLES
-- ============================================

-- Subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage subscribers" ON public.subscribers
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Onboarding Submissions
CREATE TABLE IF NOT EXISTS public.onboarding_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  experience_level TEXT,
  business_type TEXT,
  goals TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage onboarding" ON public.onboarding_submissions
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Contact Submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'spam', 'archived')),
  replied_at TIMESTAMPTZ,
  replied_by TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage contact_submissions" ON public.contact_submissions
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE!
-- ============================================
