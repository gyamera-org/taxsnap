-- Add missing unique constraints for ON CONFLICT to work
-- Run this in Supabase SQL Editor

-- 1. Add unique constraint on fitness_goals.user_id
ALTER TABLE fitness_goals 
ADD CONSTRAINT fitness_goals_user_id_unique UNIQUE (user_id);

-- 2. Add unique constraint on nutrition_goals.user_id  
ALTER TABLE nutrition_goals 
ADD CONSTRAINT nutrition_goals_user_id_unique UNIQUE (user_id);

-- 3. Add unique constraint on body_measurements.user_id
ALTER TABLE body_measurements 
ADD CONSTRAINT body_measurements_user_id_unique UNIQUE (user_id);

-- 4. Add unique constraint on accounts.user_id (if not already exists)
ALTER TABLE accounts 
ADD CONSTRAINT accounts_user_id_unique UNIQUE (user_id);

-- 5. Verify the constraints were added
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conname LIKE '%user_id_unique%'
ORDER BY table_name;

-- Note: weight_history doesn't need a unique constraint as users can have multiple weight entries
