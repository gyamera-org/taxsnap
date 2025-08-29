-- Final fix: Handle existing constraint and data properly
-- Run this in Supabase SQL Editor

-- 1. Drop the existing constraint first
ALTER TABLE body_measurements DROP CONSTRAINT IF EXISTS body_measurements_units_check;

-- 2. Check what units values currently exist
SELECT DISTINCT units, COUNT(*) as count
FROM body_measurements 
GROUP BY units 
ORDER BY count DESC;

-- 3. Update any existing rows to use valid units
UPDATE body_measurements 
SET units = CASE 
    WHEN units = 'metric' THEN 'metric'
    WHEN units = 'imperial' THEN 'imperial'
    ELSE 'metric'  -- Default any other values to metric
END;

-- 4. Add the constraint with proper values
ALTER TABLE body_measurements 
ADD CONSTRAINT body_measurements_units_check 
CHECK (units IN ('metric', 'imperial'));

-- 5. Test the function now
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

-- 6. Verify the constraint is working
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'body_measurements'::regclass 
  AND conname = 'body_measurements_units_check';
