-- Temporary fix to test signup without the problematic trigger
-- Run this in Supabase SQL Editor

-- Disable the trigger temporarily
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Note: After running this, signup should work, but you'll need to manually create account records
-- You can test signup and then re-enable the trigger after we fix the issue

-- To re-enable later (DO NOT RUN NOW):
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
