-- Debug script to check auth trigger issues
-- Run this in Supabase SQL Editor to identify the problem

-- 1. Check if accounts table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'accounts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if the trigger exists
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Check RLS policies on accounts table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'accounts';

-- 4. Temporarily disable the trigger to test signup
-- UNCOMMENT THESE LINES TO DISABLE THE TRIGGER:
-- ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- 5. To re-enable the trigger later:
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- 6. Test the trigger function manually (replace with a real UUID)
-- SELECT public.handle_new_user();

-- 7. Check if there are any constraint violations
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.accounts'::regclass;
