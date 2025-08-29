-- Drop all existing versions of the function
DO $$
BEGIN
    -- Drop function with old signature (if it exists)
    DROP FUNCTION IF EXISTS process_onboarding_data(UUID, JSONB);
    -- Drop function with any other possible signatures
    PERFORM 1 FROM pg_proc WHERE proname = 'process_onboarding_data';
    IF FOUND THEN
        EXECUTE 'DROP FUNCTION process_onboarding_data CASCADE';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if function doesn't exist
    NULL;
END $$;

-- Create function to process onboarding data transactionally
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
  -- Start transaction (implicit in function)
  
  -- 1. Update accounts table with personal info
  UPDATE accounts 
  SET 
    name = p_name,
    date_of_birth = p_date_of_birth,
    onboarding_completed = true,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Check if account was updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found for user_id: %', p_user_id;
  END IF;

  -- 2. Insert/update fitness goals
  INSERT INTO fitness_goals (
    user_id,
    primary_goal,
    workout_frequency,
    experience_level,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_fitness_goal,
    p_fitness_frequency,
    p_fitness_experience,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    primary_goal = EXCLUDED.primary_goal,
    workout_frequency = EXCLUDED.workout_frequency,
    experience_level = EXCLUDED.experience_level,
    updated_at = NOW();

  -- 3. Insert/update nutrition goals  
  INSERT INTO nutrition_goals (
    user_id,
    primary_goal,
    activity_level,
    tracking_experience,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_nutrition_goal,
    p_activity_level,
    p_nutrition_experience,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    primary_goal = EXCLUDED.primary_goal,
    activity_level = EXCLUDED.activity_level,
    tracking_experience = EXCLUDED.tracking_experience,
    updated_at = NOW();

  -- 4. Insert/update body measurements
  INSERT INTO body_measurements (
    user_id,
    height,
    current_weight,
    goal_weight,
    units,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_height,
    p_weight,
    p_weight_goal,
    p_units,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    height = EXCLUDED.height,
    current_weight = EXCLUDED.current_weight,
    goal_weight = EXCLUDED.goal_weight,
    units = EXCLUDED.units,
    updated_at = NOW();

  -- 5. Add initial weight entry to history
  INSERT INTO weight_history (
    user_id,
    weight,
    units,
    note,
    measured_at,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_weight,
    p_units,
    'Initial weight from onboarding',
    NOW(),
    NOW(),
    NOW()
  );

  -- NOTE: Reminder settings are now handled by the auth trigger during signup
  -- Removed step 6 to avoid conflicts with the existing trigger

  -- Return success result
  result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'message', 'Onboarding completed successfully'
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Log error details
  RAISE EXCEPTION 'Onboarding failed for user %: % %', p_user_id, SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION process_complete_onboarding TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION process_complete_onboarding IS 'Processes onboarding data transactionally, updating accounts, fitness_goals, nutrition_goals, body_measurements, weight_history, and reminder_settings tables';
