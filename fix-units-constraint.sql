-- Fix the units constraint issue - likely needs different values
-- Run this in Supabase SQL Editor

-- Option 1: Drop the check constraint temporarily to see what the issue is
ALTER TABLE body_measurements DROP CONSTRAINT IF EXISTS body_measurements_units_check;

-- Option 2: Add a new constraint with the correct values
-- (Try this after dropping the old one)
ALTER TABLE body_measurements 
ADD CONSTRAINT body_measurements_units_check 
CHECK (units IN ('metric', 'imperial'));

-- Option 3: If the constraint expects different values, try these common alternatives:
-- ALTER TABLE body_measurements 
-- ADD CONSTRAINT body_measurements_units_check 
-- CHECK (units IN ('kg_cm', 'lbs_ft'));

-- Test the function again after running this
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
