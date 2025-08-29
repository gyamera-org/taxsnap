-- ================================================================
-- Simple Water Tracking Table
-- Run this in Supabase SQL Editor
-- ================================================================

-- Drop the complex water_entries table if it exists
DROP TABLE IF EXISTS water_entries CASCADE;

-- ================================================================
-- SIMPLE DAILY WATER TRACKING TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS daily_water_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_ml INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- ================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_daily_water_user_id ON daily_water_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_water_date ON daily_water_intake(date);
CREATE INDEX IF NOT EXISTS idx_daily_water_user_date ON daily_water_intake(user_id, date);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE daily_water_intake ENABLE ROW LEVEL SECURITY;

-- Water Intake Policies
CREATE POLICY "Users can view their own water intake" ON daily_water_intake
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water intake" ON daily_water_intake
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water intake" ON daily_water_intake
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water intake" ON daily_water_intake
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- UPDATE TRIGGERS
-- ================================================================
CREATE TRIGGER handle_daily_water_updated_at
    BEFORE UPDATE ON daily_water_intake
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
