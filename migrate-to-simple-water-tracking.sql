-- ================================================================
-- Migrate to Simple Water Tracking
-- Run this in Supabase SQL Editor to clean up and use simple approach
-- ================================================================

-- Remove complex water entries table
DROP TABLE IF EXISTS water_entries CASCADE;

-- Update meal-water tracking table to remove water columns
-- (Keep meal entries table but remove water dependency)
ALTER TABLE meal_entries DROP COLUMN IF EXISTS total_water_ml CASCADE;

-- Ensure simple daily water tracking table exists with correct structure
CREATE TABLE IF NOT EXISTS daily_water_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_ml INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_water_user_id ON daily_water_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_water_date ON daily_water_intake(date);
CREATE INDEX IF NOT EXISTS idx_daily_water_user_date ON daily_water_intake(user_id, date);

-- Enable RLS
ALTER TABLE daily_water_intake ENABLE ROW LEVEL SECURITY;

-- Water Intake Policies
DROP POLICY IF EXISTS "Users can view their own water intake" ON daily_water_intake;
DROP POLICY IF EXISTS "Users can insert their own water intake" ON daily_water_intake;
DROP POLICY IF EXISTS "Users can update their own water intake" ON daily_water_intake;
DROP POLICY IF EXISTS "Users can delete their own water intake" ON daily_water_intake;

CREATE POLICY "Users can view their own water intake" ON daily_water_intake
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water intake" ON daily_water_intake
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water intake" ON daily_water_intake
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water intake" ON daily_water_intake
  FOR DELETE USING (auth.uid() = user_id);

-- Update trigger
DROP TRIGGER IF EXISTS handle_daily_water_updated_at ON daily_water_intake;
CREATE TRIGGER handle_daily_water_updated_at
    BEFORE UPDATE ON daily_water_intake
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
