-- Check what triggers are currently running on auth.users
-- Run this in Supabase SQL Editor to see what's causing the issue

-- 1. Check all triggers on auth.users table
SELECT 
    tgname as trigger_name, 
    tgenabled as enabled,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
ORDER BY tgname;

-- 2. Check all functions that might be called by triggers
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname LIKE '%user%' OR proname LIKE '%reminder%'
ORDER BY proname;

-- 3. Check if there are any RLS policies blocking the reminder_settings insert
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'reminder_settings';

-- 4. Test if we can manually insert into reminder_settings (replace with a real user ID)
-- SELECT * FROM auth.users LIMIT 1; -- Get a user ID first
-- INSERT INTO reminder_settings (user_id, reminder_type, is_enabled, reminder_time) 
-- VALUES ('your-user-id-here', 'water_intake', false, '09:00:00'::time);
