-- Fix existing data that violates the units constraint
-- Run this in Supabase SQL Editor

-- 1. First, let's see what units values currently exist in the table
SELECT DISTINCT units, COUNT(*) as count
FROM body_measurements 
GROUP BY units 
ORDER BY count DESC;

-- 2. See all the data in body_measurements to understand what we're dealing with
SELECT user_id, units, current_weight, height, created_at
FROM body_measurements 
ORDER BY created_at DESC;

-- 3. Update any existing invalid units to 'metric' (or delete the rows if preferred)
-- Option A: Update existing rows to use 'metric'
UPDATE body_measurements 
SET units = 'metric' 
WHERE units NOT IN ('metric', 'imperial');

-- Option B: If you prefer to delete the existing rows (uncomment if needed)
-- DELETE FROM body_measurements WHERE units NOT IN ('metric', 'imperial');

-- 4. Now try to add the constraint again
ALTER TABLE body_measurements 
ADD CONSTRAINT body_measurements_units_check 
CHECK (units IN ('metric', 'imperial'));

-- 5. Test the function again
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
