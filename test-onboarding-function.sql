-- Test the onboarding RPC function to see what's failing
-- Run this in Supabase SQL Editor

-- 1. Check if the function exists and its signature
SELECT 
    proname as function_name,
    pronargs as num_args,
    proargtypes::regtype[] as arg_types
FROM pg_proc 
WHERE proname = 'process_onboarding_data';

-- 2. Test the function with sample data (replace the user_id with the real one)
SELECT process_onboarding_data(
    '343dc951-d8d0-400c-8b8d-dc783b93a5b1'::uuid,  -- p_user_id (replace with actual)
    'Test User',                                     -- p_name
    '1990-01-01'::date,                             -- p_date_of_birth
    'lose_weight',                                   -- p_fitness_goal
    '3-4',                                          -- p_fitness_frequency
    'beginner',                                     -- p_fitness_experience
    'lose_weight',                                   -- p_nutrition_goal
    'moderate',                                     -- p_activity_level
    'beginner',                                     -- p_nutrition_experience
    170.0,                                          -- p_height
    65.0,                                           -- p_weight
    60.0,                                           -- p_weight_goal
    'metric'                                        -- p_units
);

-- 3. Check what tables exist to see if they match function expectations
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('accounts', 'fitness_goals', 'nutrition_goals', 'body_measurements', 'weight_history')
ORDER BY table_name;
