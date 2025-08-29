-- Minimal onboarding function without reminder settings (to get signup working)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION process_onboarding_data(
  p_user_id UUID,
  p_name TEXT,
  p_date_of_birth DATE,
  p_fitness_goal TEXT,
  p_fitness_frequency TEXT,
  p_fitness_experience TEXT,
  p_nutrition_goal TEXT,
  p_activity_level TEXT,
  p_nutrition_experience TEXT,
  p_height NUMERIC,
  p_weight NUMERIC,
  p_weight_goal NUMERIC,
  p_units TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- 1. Insert or update accounts table
  INSERT INTO accounts (
    user_id,
    name,
    avatar,
    date_of_birth,
    onboarding_completed,
    subscription_status,
    subscription_plan,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_name,
    NULL,
    p_date_of_birth,
    true,
    'inactive',
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    date_of_birth = EXCLUDED.date_of_birth,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW();

  -- 2. Insert/update fitness goals
  INSERT INTO fitness_goals (
    user_id, primary_goal, workout_frequency, experience_level, created_at, updated_at
  ) VALUES (
    p_user_id, p_fitness_goal, p_fitness_frequency, p_fitness_experience, NOW(), NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    primary_goal = EXCLUDED.primary_goal,
    workout_frequency = EXCLUDED.workout_frequency,
    experience_level = EXCLUDED.experience_level,
    updated_at = NOW();

  -- 3. Insert/update nutrition goals  
  INSERT INTO nutrition_goals (
    user_id, primary_goal, activity_level, tracking_experience, created_at, updated_at
  ) VALUES (
    p_user_id, p_nutrition_goal, p_activity_level, p_nutrition_experience, NOW(), NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    primary_goal = EXCLUDED.primary_goal,
    activity_level = EXCLUDED.activity_level,
    tracking_experience = EXCLUDED.tracking_experience,
    updated_at = NOW();

  -- 4. Insert/update body measurements
  INSERT INTO body_measurements (
    user_id, height, current_weight, goal_weight, units, created_at, updated_at
  ) VALUES (
    p_user_id, p_height, p_weight, p_weight_goal, p_units, NOW(), NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    height = EXCLUDED.height,
    current_weight = EXCLUDED.current_weight,
    goal_weight = EXCLUDED.goal_weight,
    units = EXCLUDED.units,
    updated_at = NOW();

  -- 5. Add initial weight entry
  INSERT INTO weight_history (
    user_id, weight, units, note, measured_at, created_at, updated_at
  ) VALUES (
    p_user_id, p_weight, p_units, 'Initial weight from onboarding', NOW(), NOW(), NOW()
  );

  -- NOTE: Removed reminder_settings creation to avoid trigger conflicts
  -- The existing trigger should handle this

  result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'message', 'Onboarding completed successfully'
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Onboarding failed for user %: % %', p_user_id, SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION process_onboarding_data TO authenticated;
