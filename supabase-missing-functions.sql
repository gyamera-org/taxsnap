-- ================================================================
-- Missing Supabase Functions for Account Management
-- Run this to fix the 404 errors for missing functions
-- ================================================================

-- ================================================================
-- 1. CREATE get_account_for_user FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION get_account_for_user()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  account_data JSON;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get account data from auth.users and user_profiles
  SELECT json_build_object(
    'id', au.id,
    'name', COALESCE(up.display_name, au.raw_user_meta_data->>'first_name' || ' ' || au.raw_user_meta_data->>'last_name', 'User'),
    'avatar', COALESCE(up.avatar_url, ''),
    'onboarding_completed', COALESCE(up.onboarding_completed, false),
    'subscription_status', COALESCE(au.raw_user_meta_data->>'subscription_status', 'free'),
    'subscription_plan', COALESCE(au.raw_user_meta_data->>'subscription_plan', 'free'),
    'subscription_platform', COALESCE(au.raw_user_meta_data->>'subscription_platform', ''),
    'subscription_expires', au.raw_user_meta_data->>'subscription_expires',
    'subscription_billing_frequency', au.raw_user_meta_data->>'subscription_billing_frequency',
    'subscription_receipt_id', au.raw_user_meta_data->>'subscription_receipt_id',
    'subscription_original_purchase', au.raw_user_meta_data->>'subscription_original_purchase',
    'subscription_product', au.raw_user_meta_data->>'subscription_product',
    'subscription_last_verified_at', au.raw_user_meta_data->>'subscription_last_verified_at',
    'created_at', au.created_at,
    'updated_at', au.updated_at,
    'date_of_birth', COALESCE(up.date_of_birth, au.raw_user_meta_data->>'date_of_birth')
  ) INTO account_data
  FROM auth.users au
  LEFT JOIN user_profiles up ON up.user_id = au.id
  WHERE au.id = current_user_id;

  RETURN account_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_account_for_user() TO authenticated;

-- ================================================================
-- 2. CREATE update_account_profile FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION update_account_profile(
  p_name TEXT DEFAULT NULL,
  p_avatar TEXT DEFAULT NULL,
  p_onboarding_done BOOLEAN DEFAULT NULL,
  p_date_of_birth TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user_profile exists
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = current_user_id) INTO profile_exists;

  -- If profile doesn't exist, create it
  IF NOT profile_exists THEN
    INSERT INTO user_profiles (user_id, display_name, date_of_birth, avatar_url, onboarding_completed)
    VALUES (
      current_user_id,
      p_name,
      p_date_of_birth::DATE,
      p_avatar,
      COALESCE(p_onboarding_done, false)
    );
  ELSE
    -- Update existing profile
    UPDATE user_profiles SET
      display_name = COALESCE(p_name, display_name),
      avatar_url = COALESCE(p_avatar, avatar_url),
      onboarding_completed = COALESCE(p_onboarding_done, onboarding_completed),
      date_of_birth = COALESCE(p_date_of_birth::DATE, date_of_birth),
      updated_at = NOW()
    WHERE user_id = current_user_id;
  END IF;

  -- Also update auth.users metadata if name is provided
  IF p_name IS NOT NULL THEN
    UPDATE auth.users SET
      raw_user_meta_data = raw_user_meta_data || jsonb_build_object('full_name', p_name)
    WHERE id = current_user_id;
  END IF;

  -- Update onboarding status in auth.users if provided
  IF p_onboarding_done IS NOT NULL THEN
    UPDATE auth.users SET
      raw_user_meta_data = raw_user_meta_data || jsonb_build_object('onboarding_completed', p_onboarding_done)
    WHERE id = current_user_id;
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_account_profile(TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;

-- ================================================================
-- 3. CREATE user_profiles TABLE IF NOT EXISTS
-- ================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Missing account functions created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions added:';
  RAISE NOTICE '- get_account_for_user() - Get current user account data';
  RAISE NOTICE '- update_account_profile() - Update user profile';
  RAISE NOTICE '- user_profiles table with RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE 'The 404 errors should now be resolved!';
END $$;
