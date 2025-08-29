-- ================================================================
-- Meal Tracking Tables
-- Run this in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. MEAL ENTRIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS meal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  food_items JSONB NOT NULL, -- Array of food items with quantities
  total_calories DECIMAL(8,2) NOT NULL,
  total_protein DECIMAL(8,2) NOT NULL,
  total_carbs DECIMAL(8,2) NOT NULL,
  total_fat DECIMAL(8,2) NOT NULL,
  total_fiber DECIMAL(8,2) DEFAULT 0,
  total_sugar DECIMAL(8,2) DEFAULT 0,
  notes TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_time TIME WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- 2. SIMPLE DAILY WATER TRACKING TABLE
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
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_id ON meal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_entries_date ON meal_entries(logged_date);
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_date ON meal_entries(user_id, logged_date);

CREATE INDEX IF NOT EXISTS idx_daily_water_user_id ON daily_water_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_water_date ON daily_water_intake(date);
CREATE INDEX IF NOT EXISTS idx_daily_water_user_date ON daily_water_intake(user_id, date);

-- ================================================================
-- 4. ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_water_intake ENABLE ROW LEVEL SECURITY;

-- Meal Entries Policies
CREATE POLICY "Users can view their own meal entries" ON meal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal entries" ON meal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal entries" ON meal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal entries" ON meal_entries
  FOR DELETE USING (auth.uid() = user_id);

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
-- 5. UPDATE TRIGGERS
-- ================================================================
CREATE TRIGGER handle_meal_entries_updated_at
    BEFORE UPDATE ON meal_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_daily_water_updated_at
    BEFORE UPDATE ON daily_water_intake
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
