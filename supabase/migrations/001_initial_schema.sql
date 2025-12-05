-- PCOS Food Scanner Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    date_of_birth DATE,
    onboarding_preferences JSONB DEFAULT '{}'::jsonb,
    -- Subscription fields
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_plan VARCHAR(100),
    subscription_platform VARCHAR(50),
    subscription_expires_at TIMESTAMPTZ,
    subscription_billing VARCHAR(50),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);

-- ============================================
-- 2. SCANS TABLE (Food Scans)
-- ============================================
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('safe', 'caution', 'avoid', 'pending')),
    summary TEXT,
    ingredients TEXT[],
    analysis JSONB DEFAULT '{}'::jsonb,
    -- Macros
    calories INTEGER,
    protein NUMERIC(10, 2),
    carbs NUMERIC(10, 2),
    fat NUMERIC(10, 2),
    fiber NUMERIC(10, 2),
    -- Flags
    is_favorite BOOLEAN DEFAULT FALSE,
    progress INTEGER CHECK (progress >= 0 AND progress <= 100),
    -- Timestamps
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for scans
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_is_favorite ON scans(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(user_id, scanned_at DESC);

-- ============================================
-- 3. FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_account_id ON feedback(account_id);

-- ============================================
-- 4. ACCOUNT DELETION FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS account_deletion_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    deletion_reason VARCHAR(255) NOT NULL,
    additional_comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ONBOARDING PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
    -- Health goal
    primary_goal VARCHAR(50),
    -- PCOS symptoms (array)
    symptoms TEXT[] DEFAULT '{}',
    -- Daily struggles with food (array)
    daily_struggles TEXT[] DEFAULT '{}',
    -- Relationship with food
    food_relationship VARCHAR(50),
    -- Foods that make them feel good (array)
    feel_good_foods TEXT[] DEFAULT '{}',
    -- Foods they want to enjoy without guilt (array)
    guilt_foods TEXT[] DEFAULT '{}',
    -- Activity level
    activity_level VARCHAR(50),
    -- How they found the app
    referral_source VARCHAR(100),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_user_id ON onboarding_profiles(user_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scans_updated_at
    BEFORE UPDATE ON scans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_profiles_updated_at
    BEFORE UPDATE ON onboarding_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_profiles ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS policies
CREATE POLICY "Users can view own account"
    ON accounts FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own account"
    ON accounts FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own account"
    ON accounts FOR INSERT
    WITH CHECK (auth.uid() = id);

-- SCANS policies
CREATE POLICY "Users can view own scans"
    ON scans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
    ON scans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
    ON scans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
    ON scans FOR DELETE
    USING (auth.uid() = user_id);

-- FEEDBACK policies
CREATE POLICY "Users can view own feedback"
    ON feedback FOR SELECT
    USING (auth.uid() = account_id);

CREATE POLICY "Users can insert own feedback"
    ON feedback FOR INSERT
    WITH CHECK (auth.uid() = account_id);

-- ACCOUNT DELETION FEEDBACK policies
CREATE POLICY "Users can insert deletion feedback"
    ON account_deletion_feedback FOR INSERT
    WITH CHECK (auth.uid() = account_id);

-- ONBOARDING PROFILES policies
CREATE POLICY "Users can view own onboarding profile"
    ON onboarding_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding profile"
    ON onboarding_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding profile"
    ON onboarding_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- AVATARS bucket policies (public bucket)
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- SCANS bucket policies (private bucket)
CREATE POLICY "Users can view own scan images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own scan images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own scan images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'scans' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- HELPER FUNCTION: Create account on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.accounts (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create account on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
