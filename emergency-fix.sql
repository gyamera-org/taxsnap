-- Emergency fix: Temporarily remove reminder_settings to get signup working
-- Run this if the trigger removal doesn't work

-- 1. Drop any triggers that reference reminder_settings
DROP TRIGGER IF EXISTS on_auth_user_created_initialize_reminders ON auth.users;
DROP FUNCTION IF EXISTS initialize_reminder_settings_for_new_user() CASCADE;

-- 2. If still failing, temporarily drop the table (you can recreate it later)
-- UNCOMMENT ONLY IF NEEDED:
-- DROP TABLE IF EXISTS reminder_settings CASCADE;

-- Note: After signup works, you can recreate the reminder_settings table
-- and add reminder creation to your RPC function instead
