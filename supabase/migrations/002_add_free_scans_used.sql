-- Add free_scans_used column to track free scan usage for non-subscribers
-- This prevents users from bypassing limits by reinstalling the app

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS free_scans_used INTEGER DEFAULT 0;

-- Add a comment for documentation
COMMENT ON COLUMN accounts.free_scans_used IS 'Number of free scans used by non-subscribed users. Max is 3.';

-- Create a function to atomically increment free_scans_used
-- This prevents race conditions when multiple scans happen quickly
CREATE OR REPLACE FUNCTION increment_free_scans(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE accounts
  SET free_scans_used = COALESCE(free_scans_used, 0) + 1
  WHERE id = user_id
  RETURNING free_scans_used INTO new_count;

  RETURN new_count;
END;
$$;
