-- ================================================================
-- Exercise Tracking Tables
-- Run this in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. EXERCISE ENTRIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS exercise_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL, -- Can be any exercise type from the exercises database
  duration_minutes INTEGER NOT NULL, -- Duration in minutes
  calories_burned INTEGER DEFAULT 0, -- Estimated calories burned
  intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high')) DEFAULT 'moderate',
  notes TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_time TIME WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_id ON exercise_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_date ON exercise_entries(logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_date ON exercise_entries(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_type ON exercise_entries(exercise_type);

-- ================================================================
-- 3. ENABLE RLS (Row Level Security)
-- ================================================================
ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 4. CREATE RLS POLICIES
-- ================================================================
CREATE POLICY "Users can view their own exercise entries" ON exercise_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise entries" ON exercise_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise entries" ON exercise_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise entries" ON exercise_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 5. CREATE UPDATED_AT TRIGGER
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercise_entries_updated_at 
  BEFORE UPDATE ON exercise_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
