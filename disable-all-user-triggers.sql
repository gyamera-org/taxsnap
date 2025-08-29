-- Temporarily disable ALL triggers on auth.users to get signup working
-- Run this in Supabase SQL Editor

-- Disable all triggers on auth.users table
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Note: This will disable ALL triggers including the reminder settings one
-- After this, signup should work, but reminder settings won't be auto-created

-- To re-enable specific triggers later, use:
-- ALTER TABLE auth.users ENABLE TRIGGER trigger_name;

-- To re-enable all triggers later, use:
-- ALTER TABLE auth.users ENABLE TRIGGER ALL;
