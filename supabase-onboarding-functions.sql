-- ================================================================
-- Supabase Functions for Onboarding Data Processing
-- Functions to handle onboarding data insertion and updates
-- ================================================================

-- ================================================================
-- 1. FUNCTION TO PROCESS COMPLETE ONBOARDING DATA
-- ================================================================
CREATE OR REPLACE FUNCTION process_onboarding_data(
  p_user_id UUID,
  p_onboarding_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB := '{"success": true, "message": "Onboarding data processed successfully"}'::jsonb;
  v_user_profile_id UUID;
  v_fitness_goals_id UUID;
  v_nutrition_goals_id UUID;
  v_body_measurements_id UUID;
  v_cycle_settings_id UUID;
  v_lifestyle_preferences_id UUID;
BEGIN
  -- Start transaction
  BEGIN
    -- 1. Create/Update User Profile
    INSERT INTO user_profiles (
      user_id,
      display_name,
      date_of_birth,
      onboarding_completed,
      onboarding_completed_at
    ) VALUES (
      p_user_id,
      p_onboarding_data->>'name',
      (p_onboarding_data->>'dateOfBirth')::date,
      true,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      date_of_birth = EXCLUDED.date_of_birth,
      onboarding_completed = true,
      onboarding_completed_at = NOW(),
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
      (p_onboarding_data->>'height')::decimal,
      (p_onboarding_data->>'weight')::decimal,
      (p_onboarding_data->>'weightGoal')::decimal,
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

    -- 7. Create initial weight history entry
    INSERT INTO weight_history (
      user_id,
      weight,
      units,
      note,
      measured_at
    ) VALUES (
      p_user_id,
      (p_onboarding_data->>'weight')::decimal,
      p_onboarding_data->>'units',
      'Initial weight from onboarding',
      CURRENT_DATE
    )
    ON CONFLICT DO NOTHING; -- Don't overwrite if already exists

    -- Add details to result
    result := result || jsonb_build_object(
      'data', jsonb_build_object(
        'user_profile_id', v_user_profile_id,
        'fitness_goals_id', v_fitness_goals_id,
        'nutrition_goals_id', v_nutrition_goals_id,
        'body_measurements_id', v_body_measurements_id,
        'cycle_settings_id', v_cycle_settings_id,
        'lifestyle_preferences_id', v_lifestyle_preferences_id
      )
    );

  EXCEPTION WHEN OTHERS THEN
    -- Handle errors
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
  END;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 2. FUNCTION TO GET COMPLETE USER SETTINGS
-- ================================================================
CREATE OR REPLACE FUNCTION get_user_complete_settings(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', user_id,
    'personal', jsonb_build_object(
      'display_name', display_name,
      'date_of_birth', date_of_birth,
      'avatar_url', avatar_url,
      'onboarding_completed', onboarding_completed
    ),
    'fitness', jsonb_build_object(
      'goal', fitness_goal,
      'frequency', workout_frequency,
      'experience', fitness_experience
    ),
    'nutrition', jsonb_build_object(
      'goal', nutrition_goal,
      'activity_level', activity_level,
      'experience', nutrition_experience
    ),
    'body', jsonb_build_object(
      'height', height,
      'current_weight', current_weight,
      'goal_weight', goal_weight,
      'units', units
    ),
    'cycle', jsonb_build_object(
      'cycle_length', cycle_length,
      'period_length', period_length,
      'last_period_date', last_period_date
    ),
    'lifestyle', jsonb_build_object(
      'sleep_goal', sleep_goal,
      'water_goal', water_goal,
      'notifications_enabled', notifications_enabled
    )
  ) INTO result
  FROM user_complete_settings
  WHERE user_id = p_user_id;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 3. FUNCTION TO UPDATE INDIVIDUAL SETTINGS
-- ================================================================
CREATE OR REPLACE FUNCTION update_user_setting(
  p_user_id UUID,
  p_setting_type TEXT,
  p_setting_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB := '{"success": true}'::jsonb;
BEGIN
  CASE p_setting_type
    WHEN 'fitness' THEN
      UPDATE fitness_goals SET
        primary_goal = COALESCE(p_setting_data->>'primary_goal', primary_goal),
        workout_frequency = COALESCE(p_setting_data->>'workout_frequency', workout_frequency),
        experience_level = COALESCE(p_setting_data->>'experience_level', experience_level),
        updated_at = NOW()
      WHERE user_id = p_user_id;

    WHEN 'nutrition' THEN
      UPDATE nutrition_goals SET
        primary_goal = COALESCE(p_setting_data->>'primary_goal', primary_goal),
        activity_level = COALESCE(p_setting_data->>'activity_level', activity_level),
        tracking_experience = COALESCE(p_setting_data->>'tracking_experience', tracking_experience),
        updated_at = NOW()
      WHERE user_id = p_user_id;

    WHEN 'body' THEN
      UPDATE body_measurements SET
        height = COALESCE((p_setting_data->>'height')::decimal, height),
        current_weight = COALESCE((p_setting_data->>'current_weight')::decimal, current_weight),
        goal_weight = COALESCE((p_setting_data->>'goal_weight')::decimal, goal_weight),
        units = COALESCE(p_setting_data->>'units', units),
        updated_at = NOW()
      WHERE user_id = p_user_id;

    WHEN 'cycle' THEN
      UPDATE cycle_settings SET
        cycle_length = COALESCE((p_setting_data->>'cycle_length')::integer, cycle_length),
        period_length = COALESCE((p_setting_data->>'period_length')::integer, period_length),
        last_period_date = COALESCE((p_setting_data->>'last_period_date')::date, last_period_date),
        updated_at = NOW()
      WHERE user_id = p_user_id;

    WHEN 'lifestyle' THEN
      UPDATE lifestyle_preferences SET
        sleep_goal = COALESCE((p_setting_data->>'sleep_goal')::integer, sleep_goal),
        water_goal = COALESCE((p_setting_data->>'water_goal')::integer, water_goal),
        notifications_enabled = COALESCE((p_setting_data->>'notifications_enabled')::boolean, notifications_enabled),
        updated_at = NOW()
      WHERE user_id = p_user_id;

    WHEN 'profile' THEN
      UPDATE user_profiles SET
        display_name = COALESCE(p_setting_data->>'display_name', display_name),
        avatar_url = COALESCE(p_setting_data->>'avatar_url', avatar_url),
        updated_at = NOW()
      WHERE user_id = p_user_id;

    ELSE
      result := '{"success": false, "error": "Invalid setting type"}'::jsonb;
  END CASE;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. FUNCTION TO ADD WEIGHT ENTRY
-- ================================================================
CREATE OR REPLACE FUNCTION add_weight_entry(
  p_user_id UUID,
  p_weight DECIMAL,
  p_units TEXT DEFAULT 'metric',
  p_note TEXT DEFAULT NULL,
  p_measured_at DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
  v_entry_id UUID;
  result JSONB;
BEGIN
  INSERT INTO weight_history (
    user_id,
    weight,
    units,
    note,
    measured_at
  ) VALUES (
    p_user_id,
    p_weight,
    p_units,
    p_note,
    p_measured_at
  ) RETURNING id INTO v_entry_id;

  -- Also update current weight in body_measurements
  UPDATE body_measurements SET
    current_weight = p_weight,
    units = p_units,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  result := jsonb_build_object(
    'success', true,
    'entry_id', v_entry_id,
    'message', 'Weight entry added successfully'
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 5. FUNCTION TO GET WEIGHT HISTORY
-- ================================================================
CREATE OR REPLACE FUNCTION get_weight_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'weight', weight,
      'units', units,
      'note', note,
      'measured_at', measured_at,
      'created_at', created_at
    ) ORDER BY measured_at DESC
  ) INTO result
  FROM weight_history
  WHERE user_id = p_user_id
  ORDER BY measured_at DESC
  LIMIT p_limit;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 6. RLS POLICIES FOR FUNCTIONS
-- ================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION process_onboarding_data(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_complete_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_setting(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION add_weight_entry(UUID, DECIMAL, TEXT, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weight_history(UUID, INTEGER) TO authenticated;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Onboarding functions created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions available:';
  RAISE NOTICE '- process_onboarding_data(user_id, onboarding_data)';
  RAISE NOTICE '- get_user_complete_settings(user_id)';
  RAISE NOTICE '- update_user_setting(user_id, setting_type, data)';
  RAISE NOTICE '- add_weight_entry(user_id, weight, units, note, date)';
  RAISE NOTICE '- get_weight_history(user_id, limit)';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready to process onboarding data from your app!';
END $$;
