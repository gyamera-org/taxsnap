-- Check the units constraint to see what values are allowed
-- Run this in Supabase SQL Editor

-- 1. Check the exact constraint definition for body_measurements.units
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'body_measurements'::regclass 
  AND conname LIKE '%units%';

-- 2. Check all check constraints on body_measurements table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'body_measurements'::regclass 
  AND contype = 'c';

-- 3. Check the actual column definition
SELECT 
    column_name, 
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'body_measurements' 
  AND column_name = 'units';

-- 4. Test what values work by trying to insert different units
-- (This will help us see what's allowed)
-- Uncomment one at a time to test:
-- INSERT INTO body_measurements (user_id, units) VALUES ('test', 'metric');
-- INSERT INTO body_measurements (user_id, units) VALUES ('test', 'imperial'); 
-- INSERT INTO body_measurements (user_id, units) VALUES ('test', 'kg_cm');
-- INSERT INTO body_measurements (user_id, units) VALUES ('test', 'lbs_ft');
