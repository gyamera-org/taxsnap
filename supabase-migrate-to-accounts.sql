-- ================================================================
-- Migrate from user_profiles to accounts table
-- Consolidate everything into the accounts table
-- ================================================================

-- ================================================================
-- 1. UPDATE ACCOUNTS TABLE STRUCTURE
-- ================================================================

-- Add missing columns to accounts table if they don't exist
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- ================================================================
-- 2. MIGRATE DATA FROM USER_PROFILES TO ACCOUNTS
-- ================================================================

-- Migrate data from user_profiles to accounts (if user_profiles exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Update accounts with data from user_profiles
    UPDATE accounts 
    SET 
      display_name = COALESCE(up.display_name, accounts.name),
      avatar_url = up.avatar_url,
      onboarding_completed = up.onboarding_completed,
      date_of_birth = up.date_of_birth,
      updated_at = NOW()
    FROM user_profiles up
    WHERE accounts.user_id = up.user_id;
    
    RAISE NOTICE 'Migrated data from user_profiles to accounts';
  END IF;
END $$;

-- ================================================================
-- 3. UPDATE FUNCTIONS TO USE ACCOUNTS TABLE
-- ================================================================

-- Update get_account_for_user function
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

  -- Get account data
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

-- Update update_account_profile function
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

  -- Update accounts table
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
      subscription_status,
      subscription_plan
    ) VALUES (
      current_user_id,
      p_name,
      p_name,
      p_avatar,
      COALESCE(p_onboarding_done, false),
      p_date_of_birth::DATE,
      'free',
      'free'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. UPDATE OTHER FUNCTIONS TO USE ACCOUNTS
-- ================================================================

-- Update get_user_complete_settings to use accounts
CREATE OR REPLACE FUNCTION get_user_complete_settings(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  settings_data JSONB;
BEGIN
  -- Ensure we're working with the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only access own settings';
  END IF;

  SELECT jsonb_build_object(
    'user_id', p_user_id,
    'personal', jsonb_build_object(
      'display_name', COALESCE(acc.display_name, acc.name, 'User'),
      'date_of_birth', acc.date_of_birth,
      'avatar_url', acc.avatar_url,
      'onboarding_completed', COALESCE(acc.onboarding_completed, false)
    ),
    'fitness', COALESCE(
      (SELECT jsonb_build_object(
        'goal', fg.primary_goal,
        'frequency', fg.workout_frequency,
        'experience', fg.experience_level
      ) FROM fitness_goals fg WHERE fg.user_id = p_user_id),
      '{}'::jsonb
    ),
    'nutrition', COALESCE(
      (SELECT jsonb_build_object(
        'goal', ng.primary_goal,
        'activity_level', ng.activity_level,
        'experience', ng.tracking_experience
      ) FROM nutrition_goals ng WHERE ng.user_id = p_user_id),
      '{}'::jsonb
    ),
    'body', COALESCE(
      (SELECT jsonb_build_object(
        'height', bm.height,
        'current_weight', bm.current_weight,
        'goal_weight', bm.goal_weight,
        'units', bm.units
      ) FROM body_measurements bm WHERE bm.user_id = p_user_id),
      '{}'::jsonb
    ),
    'cycle', COALESCE(
      (SELECT jsonb_build_object(
        'cycle_length', cs.cycle_length,
        'period_length', cs.period_length,
        'last_period_date', cs.last_period_date
      ) FROM cycle_settings cs WHERE cs.user_id = p_user_id),
      '{}'::jsonb
    ),
    'lifestyle', COALESCE(
      (SELECT jsonb_build_object(
        'sleep_goal', lp.sleep_goal,
        'water_goal', lp.water_goal,
        'notifications_enabled', lp.notifications_enabled
      ) FROM lifestyle_preferences lp WHERE lp.user_id = p_user_id),
      '{}'::jsonb
    )
  ) INTO settings_data
  FROM accounts acc
  WHERE acc.user_id = p_user_id;

  RETURN settings_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update process_onboarding_data to update accounts
CREATE OR REPLACE FUNCTION process_onboarding_data(
  p_user_id UUID,
  p_onboarding_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_fitness_goals_id UUID;
  v_nutrition_goals_id UUID;
  v_body_measurements_id UUID;
  v_cycle_settings_id UUID;
  v_lifestyle_preferences_id UUID;
BEGIN
  -- Ensure we're working with the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only update own data';
  END IF;

  -- 1. Update Account with onboarding data
  UPDATE accounts SET
    display_name = p_onboarding_data->>'name',
    name = p_onboarding_data->>'name',
    date_of_birth = (p_onboarding_data->>'dateOfBirth')::date,
    onboarding_completed = true,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- If no account exists, create one
  IF NOT FOUND THEN
    INSERT INTO accounts (
      user_id,
      name,
      display_name,
      date_of_birth,
      onboarding_completed,
      subscription_status,
      subscription_plan
    ) VALUES (
      p_user_id,
      p_onboarding_data->>'name',
      p_onboarding_data->>'name',
      (p_onboarding_data->>'dateOfBirth')::date,
      true,
      'free',
      'free'
    );
  END IF;

  -- 2. Create/Update Fitness Goals
  INSERT INTO fitness_goals (
    user_id,
    primary_goal,
    workout_frequency,
    experience_level
  ) VALUES (
    p_user_id,
    p_onboarding_data->>'fitnessGoal',
    p_onboarding_data->>'fitnessFrequency',
    p_onboarding_data->>'fitnessExperience'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    primary_goal = EXCLUDED.primary_goal,
    workout_frequency = EXCLUDED.workout_frequency,
    experience_level = EXCLUDED.experience_level,
    updated_at = NOW()
  RETURNING id INTO v_fitness_goals_id;

  -- 3. Create/Update Nutrition Goals
  INSERT INTO nutrition_goals (
    user_id,
    primary_goal,
    activity_level,
    tracking_experience
  ) VALUES (
    p_user_id,
    p_onboarding_data->>'nutritionGoal',
    p_onboarding_data->>'activityLevel',
    p_onboarding_data->>'nutritionExperience'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    primary_goal = EXCLUDED.primary_goal,
    activity_level = EXCLUDED.activity_level,
    tracking_experience = EXCLUDED.tracking_experience,
    updated_at = NOW()
  RETURNING id INTO v_nutrition_goals_id;

  -- 4. Create/Update Body Measurements
  INSERT INTO body_measurements (
    user_id,
    height,
    current_weight,
    goal_weight,
    units
  ) VALUES (
    p_user_id,
    (p_onboarding_data->>'height')::numeric,
    (p_onboarding_data->>'weight')::numeric,
    (p_onboarding_data->>'weightGoal')::numeric,
    p_onboarding_data->>'units'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    height = EXCLUDED.height,
    current_weight = EXCLUDED.current_weight,
    goal_weight = EXCLUDED.goal_weight,
    units = EXCLUDED.units,
    updated_at = NOW()
  RETURNING id INTO v_body_measurements_id;

  -- 5. Create/Update Cycle Settings
  INSERT INTO cycle_settings (
    user_id,
    cycle_length,
    period_length,
    last_period_date
  ) VALUES (
    p_user_id,
    (p_onboarding_data->>'cycleLength')::integer,
    (p_onboarding_data->>'periodLength')::integer,
    CASE 
      WHEN p_onboarding_data->>'lastPeriodDate' = 'start_fresh' THEN NULL
      ELSE (p_onboarding_data->>'lastPeriodDate')::date
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    cycle_length = EXCLUDED.cycle_length,
    period_length = EXCLUDED.period_length,
    last_period_date = EXCLUDED.last_period_date,
    updated_at = NOW()
  RETURNING id INTO v_cycle_settings_id;

  -- 6. Create/Update Lifestyle Preferences
  INSERT INTO lifestyle_preferences (
    user_id,
    sleep_goal,
    water_goal,
    notifications_enabled
  ) VALUES (
    p_user_id,
    (p_onboarding_data->>'sleepGoal')::integer,
    (p_onboarding_data->>'waterGoal')::integer,
    (p_onboarding_data->>'notificationsEnabled')::boolean
  )
  ON CONFLICT (user_id) DO UPDATE SET
    sleep_goal = EXCLUDED.sleep_goal,
    water_goal = EXCLUDED.water_goal,
    notifications_enabled = EXCLUDED.notifications_enabled,
    updated_at = NOW()
  RETURNING id INTO v_lifestyle_preferences_id;

  -- Return success with IDs
  RETURN jsonb_build_object(
    'success', true,
    'fitness_goals_id', v_fitness_goals_id,
    'nutrition_goals_id', v_nutrition_goals_id,
    'body_measurements_id', v_body_measurements_id,
    'cycle_settings_id', v_cycle_settings_id,
    'lifestyle_preferences_id', v_lifestyle_preferences_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. UPDATE update_user_setting FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION update_user_setting(
  p_user_id UUID,
  p_setting_type TEXT,
  p_setting_data JSONB
)
RETURNS JSONB AS $$
BEGIN
  -- Ensure we're working with the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only update own settings';
  END IF;

  CASE p_setting_type
    WHEN 'profile' THEN
      -- Update accounts table for profile data
      UPDATE accounts SET
        display_name = COALESCE(p_setting_data->>'display_name', display_name),
        name = COALESCE(p_setting_data->>'display_name', name),
        avatar_url = COALESCE(p_setting_data->>'avatar_url', avatar_url),
        date_of_birth = COALESCE((p_setting_data->>'date_of_birth')::date, date_of_birth),
        updated_at = NOW()
      WHERE user_id = p_user_id;

    WHEN 'fitness' THEN
      INSERT INTO fitness_goals (user_id, primary_goal, workout_frequency, experience_level)
      VALUES (
        p_user_id,
        p_setting_data->>'primary_goal',
        p_setting_data->>'workout_frequency',
        p_setting_data->>'experience_level'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        primary_goal = COALESCE(EXCLUDED.primary_goal, fitness_goals.primary_goal),
        workout_frequency = COALESCE(EXCLUDED.workout_frequency, fitness_goals.workout_frequency),
        experience_level = COALESCE(EXCLUDED.experience_level, fitness_goals.experience_level),
        updated_at = NOW();

    WHEN 'nutrition' THEN
      INSERT INTO nutrition_goals (user_id, primary_goal, activity_level, tracking_experience)
      VALUES (
        p_user_id,
        p_setting_data->>'primary_goal',
        p_setting_data->>'activity_level',
        p_setting_data->>'tracking_experience'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        primary_goal = COALESCE(EXCLUDED.primary_goal, nutrition_goals.primary_goal),
        activity_level = COALESCE(EXCLUDED.activity_level, nutrition_goals.activity_level),
        tracking_experience = COALESCE(EXCLUDED.tracking_experience, nutrition_goals.tracking_experience),
        updated_at = NOW();

    WHEN 'body' THEN
      INSERT INTO body_measurements (user_id, height, current_weight, goal_weight, units)
      VALUES (
        p_user_id,
        (p_setting_data->>'height')::numeric,
        (p_setting_data->>'current_weight')::numeric,
        (p_setting_data->>'goal_weight')::numeric,
        p_setting_data->>'units'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        height = COALESCE(EXCLUDED.height, body_measurements.height),
        current_weight = COALESCE(EXCLUDED.current_weight, body_measurements.current_weight),
        goal_weight = COALESCE(EXCLUDED.goal_weight, body_measurements.goal_weight),
        units = COALESCE(EXCLUDED.units, body_measurements.units),
        updated_at = NOW();

    WHEN 'cycle' THEN
      INSERT INTO cycle_settings (user_id, cycle_length, period_length, last_period_date)
      VALUES (
        p_user_id,
        (p_setting_data->>'cycle_length')::integer,
        (p_setting_data->>'period_length')::integer,
        (p_setting_data->>'last_period_date')::date
      )
      ON CONFLICT (user_id) DO UPDATE SET
        cycle_length = COALESCE(EXCLUDED.cycle_length, cycle_settings.cycle_length),
        period_length = COALESCE(EXCLUDED.period_length, cycle_settings.period_length),
        last_period_date = COALESCE(EXCLUDED.last_period_date, cycle_settings.last_period_date),
        updated_at = NOW();

    WHEN 'lifestyle' THEN
      INSERT INTO lifestyle_preferences (user_id, sleep_goal, water_goal, notifications_enabled)
      VALUES (
        p_user_id,
        (p_setting_data->>'sleep_goal')::integer,
        (p_setting_data->>'water_goal')::integer,
        (p_setting_data->>'notifications_enabled')::boolean
      )
      ON CONFLICT (user_id) DO UPDATE SET
        sleep_goal = COALESCE(EXCLUDED.sleep_goal, lifestyle_preferences.sleep_goal),
        water_goal = COALESCE(EXCLUDED.water_goal, lifestyle_preferences.water_goal),
        notifications_enabled = COALESCE(EXCLUDED.notifications_enabled, lifestyle_preferences.notifications_enabled),
        updated_at = NOW();

    ELSE
      RAISE EXCEPTION 'Invalid setting type: %', p_setting_type;
  END CASE;

  RETURN jsonb_build_object('success', true);

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 6. GRANT PERMISSIONS
-- ================================================================
GRANT EXECUTE ON FUNCTION get_account_for_user() TO authenticated;
GRANT EXECUTE ON FUNCTION update_account_profile(TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_complete_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_setting(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION process_onboarding_data(UUID, JSONB) TO authenticated;

-- ================================================================
-- 7. OPTIONAL: DROP USER_PROFILES TABLE (AFTER MIGRATION)
-- ================================================================
-- Uncomment these lines ONLY after confirming migration worked
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS ensure_user_profile_exists();
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration to accounts table completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '- Added columns to accounts table';
  RAISE NOTICE '- Migrated data from user_profiles (if existed)';
  RAISE NOTICE '- Updated all functions to use accounts';
  RAISE NOTICE '- Profile data now stored in accounts table';
  RAISE NOTICE '';
  RAISE NOTICE 'Your app will now use accounts table for everything!';
END $$;
