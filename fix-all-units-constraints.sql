-- Fix units constraints for both body_measurements and weight_history
-- Run this in Supabase SQL Editor

-- 1. Drop existing constraints on both tables
ALTER TABLE body_measurements DROP CONSTRAINT IF EXISTS body_measurements_units_check;
ALTER TABLE weight_history DROP CONSTRAINT IF EXISTS weight_history_units_check;

-- 2. Check existing data in both tables
SELECT 'body_measurements' as table_name, units, COUNT(*) as count
FROM body_measurements 
GROUP BY units
UNION ALL
SELECT 'weight_history' as table_name, units, COUNT(*) as count
FROM weight_history 
GROUP BY units
ORDER BY table_name, count DESC;

-- 3. Update existing data in body_measurements
UPDATE body_measurements 
SET units = CASE 
    WHEN units IN ('metric', 'imperial') THEN units
    ELSE 'metric'  -- Default any other values to metric
END;

-- 4. Update existing data in weight_history
UPDATE weight_history 
SET units = CASE 
    WHEN units IN ('metric', 'imperial') THEN units
    ELSE 'metric'  -- Default any other values to metric
END;

-- 5. Add proper constraints to both tables
ALTER TABLE body_measurements 
ADD CONSTRAINT body_measurements_units_check 
CHECK (units IN ('metric', 'imperial'));

ALTER TABLE weight_history 
ADD CONSTRAINT weight_history_units_check 
CHECK (units IN ('metric', 'imperial'));

-- 6. Test the function now
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

-- 7. Verify both constraints are working
SELECT 
    conrelid::regclass as table_name,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname IN ('body_measurements_units_check', 'weight_history_units_check')
ORDER BY table_name;
