-- ================================================================
-- Fix Row Level Security Policies
-- Run this to resolve RLS policy violations
-- ================================================================

-- ================================================================
-- 1. FIX USER_PROFILES RLS POLICIES
-- ================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 2. FIX OTHER TABLES RLS POLICIES
-- ================================================================

-- FITNESS_GOALS
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own fitness goals" ON fitness_goals;
CREATE POLICY "Users can manage own fitness goals" ON fitness_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- NUTRITION_GOALS
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own nutrition goals" ON nutrition_goals;
CREATE POLICY "Users can manage own nutrition goals" ON nutrition_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BODY_MEASUREMENTS
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own body measurements" ON body_measurements;
CREATE POLICY "Users can manage own body measurements" ON body_measurements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CYCLE_SETTINGS
ALTER TABLE cycle_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cycle settings" ON cycle_settings;
CREATE POLICY "Users can manage own cycle settings" ON cycle_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- LIFESTYLE_PREFERENCES
ALTER TABLE lifestyle_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own lifestyle preferences" ON lifestyle_preferences;
CREATE POLICY "Users can manage own lifestyle preferences" ON lifestyle_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- WEIGHT_HISTORY
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own weight history" ON weight_history;
CREATE POLICY "Users can manage own weight history" ON weight_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 3. CREATE FUNCTION TO ENSURE USER PROFILE EXISTS
-- ================================================================
CREATE OR REPLACE FUNCTION ensure_user_profile_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile when user signs up
  INSERT INTO user_profiles (user_id, display_name, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', 'User'),
    false
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ensure_user_profile_exists();

-- ================================================================
-- 4. UPDATE EXISTING FUNCTIONS TO USE PROPER RLS
-- ================================================================

-- Update process_onboarding_data to handle RLS properly
CREATE OR REPLACE FUNCTION process_onboarding_data(
  p_user_id UUID,
  p_onboarding_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_user_profile_id UUID;
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

  -- 1. Create/Update User Profile
  INSERT INTO user_profiles (
    user_id,
    display_name,
    date_of_birth,
    onboarding_completed
  ) VALUES (
    p_user_id,
    p_onboarding_data->>'name',
    (p_onboarding_data->>'dateOfBirth')::date,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    date_of_birth = EXCLUDED.date_of_birth,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW()
  RETURNING id INTO v_user_profile_id;

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
    'user_profile_id', v_user_profile_id,
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION process_onboarding_data(UUID, JSONB) TO authenticated;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '- All table RLS policies updated';
  RAISE NOTICE '- Auto user profile creation on signup';
  RAISE NOTICE '- Proper permission checks in functions';
  RAISE NOTICE '- INSERT/UPDATE/DELETE policies for all tables';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS errors should now be resolved!';
END $$;
