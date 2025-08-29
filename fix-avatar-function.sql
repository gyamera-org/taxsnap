-- ================================================================
-- Fix Avatar Function - Ensure get_account_for_user uses accounts table
-- ================================================================

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS get_account_for_user();

-- Create the correct function that reads from accounts table
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

  -- Get account data from accounts table (NOT user_profiles)
  SELECT json_build_object(
    'id', acc.id,
    'user_id', acc.user_id,
    'name', COALESCE(acc.display_name, acc.name, 'User'),
    'avatar', COALESCE(acc.avatar_url, ''),
    'onboarding_completed', COALESCE(acc.onboarding_completed, false),
    'subscription_status', COALESCE(acc.subscription_status, 'free'),
    'subscription_plan', COALESCE(acc.subscription_plan, 'free'),
    'subscription_platform', COALESCE(acc.subscription_platform, ''),
    'subscription_expires', acc.subscription_expires,
    'subscription_billing_frequency', acc.subscription_billing_frequency,
    'subscription_receipt_id', acc.subscription_receipt_id,
    'subscription_original_purchase', acc.subscription_original_purchase,
    'subscription_product', acc.subscription_product,
    'subscription_last_verified_at', acc.subscription_last_verified_at,
    'created_at', acc.created_at,
    'updated_at', acc.updated_at,
    'date_of_birth', acc.date_of_birth
  ) INTO account_data
  FROM accounts acc
  WHERE acc.user_id = current_user_id;

  RETURN account_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_account_for_user() TO authenticated;

-- ================================================================
-- Also ensure update_account_profile function is correct
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
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Update accounts table (avatar goes to avatar_url column)
  UPDATE accounts SET
    display_name = COALESCE(p_name, display_name),
    name = COALESCE(p_name, name), -- Also update name for consistency
    avatar_url = COALESCE(p_avatar, avatar_url),
    onboarding_completed = COALESCE(p_onboarding_done, onboarding_completed),
    date_of_birth = COALESCE(p_date_of_birth::DATE, date_of_birth),
    updated_at = NOW()
  WHERE user_id = current_user_id;

  -- If no account exists, create one
  IF NOT FOUND THEN
    INSERT INTO accounts (
      user_id,
      name,
      display_name,
      avatar_url,
      onboarding_completed,
      date_of_birth,
      created_at,
      updated_at
    ) VALUES (
      current_user_id,
      COALESCE(p_name, 'User'),
      p_name,
      p_avatar,
      COALESCE(p_onboarding_done, false),
      p_date_of_birth::DATE,
      NOW(),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_account_profile(TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;

-- ================================================================
-- Success message
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Avatar function fixed!';
  RAISE NOTICE '- get_account_for_user() now reads from accounts table';
  RAISE NOTICE '- Returns avatar from avatar_url column as "avatar" field';
  RAISE NOTICE '- update_account_profile() saves to avatar_url column';
  RAISE NOTICE '';
  RAISE NOTICE 'Your avatar upload should now work and display correctly!';
END $$;
