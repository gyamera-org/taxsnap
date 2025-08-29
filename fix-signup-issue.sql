-- Complete fix for the signup issue
-- Run this in Supabase SQL Editor

-- 1. Disable ALL triggers on auth.users (they're causing the issue)
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- 2. Update the INSERT policy for reminder_settings to be more permissive for functions
DROP POLICY IF EXISTS "Users can insert their own reminder settings" ON reminder_settings;

CREATE POLICY "Users can insert their own reminder settings" ON reminder_settings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR  -- Regular user inserts
    auth.role() = 'service_role' OR  -- Service role (functions)
    current_setting('role') = 'postgres'  -- Admin role
  );

-- 3. Grant necessary permissions for functions to insert reminder settings
GRANT INSERT ON reminder_settings TO postgres, service_role;

-- Note: Your RPC function will now handle creating accounts AND reminder settings
-- This is cleaner and more reliable than triggers
