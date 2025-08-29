-- Simple fix that doesn't require auth.users table ownership
-- Run this in Supabase SQL Editor

-- 1. Just update the reminder_settings INSERT policy to be more permissive
DROP POLICY IF EXISTS "Users can insert their own reminder settings" ON reminder_settings;

CREATE POLICY "Users can insert their own reminder settings" ON reminder_settings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR  -- Regular user inserts
    auth.uid() IS NULL  -- Allow inserts when no session (triggers/functions)
  );

-- 2. Grant necessary permissions for authenticated role
GRANT INSERT ON reminder_settings TO authenticated;

-- Note: This should allow the trigger to work properly
-- If it still fails, we'll need to contact Supabase support to disable the trigger
