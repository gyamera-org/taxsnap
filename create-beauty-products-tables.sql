-- ================================================================
-- Beauty Products Management Tables
-- Simple structure to track user's beauty products for cycle recommendations
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- USER BEAUTY PRODUCTS TABLE (User's product collection)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_beauty_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('skincare', 'haircare')),
  safety_score INTEGER DEFAULT 8 CHECK (safety_score >= 1 AND safety_score <= 10),
  ingredients JSONB DEFAULT '[]'::jsonb, -- Array of ingredient names
  key_ingredients JSONB DEFAULT '[]'::jsonb, -- Array of key ingredients with type/description
  usage_frequency TEXT DEFAULT 'daily' CHECK (usage_frequency IN ('daily', 'weekly', '2-3x/week', 'as_needed')),
  cycle_phase_preference TEXT CHECK (cycle_phase_preference IN ('menstrual', 'follicular', 'ovulatory', 'luteal', 'any')),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  scanned_product_id TEXT REFERENCES public.scanned_products(id) ON DELETE SET NULL, -- Link to original scan if available
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, brand) -- Prevent duplicate products
);

-- ================================================================
-- BEAUTY PRODUCT USAGE LOGS TABLE (Track when products are used)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.beauty_product_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.user_beauty_products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  used BOOLEAN DEFAULT true,
  cycle_phase TEXT CHECK (cycle_phase IN ('menstrual', 'follicular', 'ovulatory', 'luteal')),
  skin_reaction TEXT CHECK (skin_reaction IN ('positive', 'neutral', 'negative')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, date)
);

-- ================================================================
-- INDEXES for better performance
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_user_beauty_products_user_id ON public.user_beauty_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_beauty_products_type ON public.user_beauty_products(product_type);
CREATE INDEX IF NOT EXISTS idx_user_beauty_products_category ON public.user_beauty_products(category);
CREATE INDEX IF NOT EXISTS idx_beauty_product_logs_user_date ON public.beauty_product_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_beauty_product_logs_product ON public.beauty_product_logs(product_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on tables
ALTER TABLE public.user_beauty_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beauty_product_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_beauty_products
CREATE POLICY "Users can view their own beauty products" ON public.user_beauty_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own beauty products" ON public.user_beauty_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beauty products" ON public.user_beauty_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beauty products" ON public.user_beauty_products
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for beauty_product_logs
CREATE POLICY "Users can view their own product logs" ON public.beauty_product_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product logs" ON public.beauty_product_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product logs" ON public.beauty_product_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product logs" ON public.beauty_product_logs
    FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- TRIGGERS for updated_at timestamps
-- ================================================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_user_beauty_products_updated_at
    BEFORE UPDATE ON public.user_beauty_products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_beauty_product_logs_updated_at
    BEFORE UPDATE ON public.beauty_product_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- GRANTS (for authenticated users)
-- ================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_beauty_products TO authenticated;
GRANT ALL ON public.beauty_product_logs TO authenticated;
