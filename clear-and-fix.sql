-- Quick fix: Clear existing data and add proper constraint
-- Run this if you want to start fresh

-- 1. Clear all existing body_measurements data
DELETE FROM body_measurements;

-- 2. Add the proper constraint
ALTER TABLE body_measurements 
ADD CONSTRAINT body_measurements_units_check 
CHECK (units IN ('metric', 'imperial'));

-- 3. Test the function
SELECT process_onboarding_data(
    '343dc951-d8d0-400c-8b8d-dc783b93a5b1'::uuid,
    'Test User',
    '1990-01-01'::date,
    'lose_weight',
    '3-4',
    'beginner',
    'lose_weight',
    'moderate',
    'beginner',
    170.0,
    65.0,
    60.0,
    'metric'
);
