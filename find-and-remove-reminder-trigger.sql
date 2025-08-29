-- Find and remove the problematic reminder settings trigger
-- Run this in Supabase SQL Editor

-- 1. First, let's see what triggers exist on auth.users
SELECT 
    tgname as trigger_name, 
    tgenabled as enabled,
    tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
ORDER BY tgname;

-- 2. Look for functions that reference reminder_settings
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE prosrc LIKE '%reminder_settings%'
ORDER BY proname;

-- 3. Drop the specific trigger that's causing issues
-- (Based on the table name, it's likely called something like this)
DROP TRIGGER IF EXISTS on_auth_user_created_initialize_reminders ON auth.users;
DROP TRIGGER IF EXISTS initialize_reminder_settings_trigger ON auth.users;
DROP TRIGGER IF EXISTS reminder_settings_trigger ON auth.users;

-- 4. Drop the function that creates reminder settings
DROP FUNCTION IF EXISTS initialize_reminder_settings_for_new_user();

-- 5. Verify no triggers remain
SELECT 
    tgname as trigger_name, 
    tgenabled as enabled
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- After running this, signup should work without the reminder settings trigger interference
