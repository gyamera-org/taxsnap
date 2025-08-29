-- ================================================================
-- Health Tracking Tables and Functions
-- Copy and paste into Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. FITNESS GOALS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS fitness_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_steps INTEGER,
  weekly_workouts INTEGER,
  target_weight DECIMAL(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  primary_goal TEXT CHECK (primary_goal IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_fitness')),
  workout_preferences TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================================
-- 2. NUTRITION GOALS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calories INTEGER,
  daily_protein DECIMAL(6,2),
  daily_carbs DECIMAL(6,2),
  daily_fat DECIMAL(6,2),
  daily_fiber DECIMAL(6,2),
  daily_water INTEGER, -- in ml
  meal_frequency INTEGER,
  dietary_restrictions TEXT[],
  health_conditions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================================
-- 3. WEIGHT GOALS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS weight_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_weight DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  goal_date DATE,
  weight_unit TEXT CHECK (weight_unit IN ('kg', 'lbs')) DEFAULT 'kg',
  weekly_goal DECIMAL(4,2), -- weight change per week
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================================
-- 4. WEIGHT ENTRIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  unit TEXT CHECK (unit IN ('kg', 'lbs')) DEFAULT 'kg',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 5. CREATE INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON fitness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_goals_user_id ON weight_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON weight_entries(date);

-- ================================================================
-- 6. ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- Fitness Goals Policies
CREATE POLICY "Users can view their own fitness goals" ON fitness_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fitness goals" ON fitness_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness goals" ON fitness_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fitness goals" ON fitness_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Nutrition Goals Policies
CREATE POLICY "Users can view their own nutrition goals" ON nutrition_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition goals" ON nutrition_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition goals" ON nutrition_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition goals" ON nutrition_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Weight Goals Policies
CREATE POLICY "Users can view their own weight goals" ON weight_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight goals" ON weight_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight goals" ON weight_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight goals" ON weight_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Weight Entries Policies
CREATE POLICY "Users can view their own weight entries" ON weight_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight entries" ON weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight entries" ON weight_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight entries" ON weight_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 7. FITNESS GOALS FUNCTIONS
-- ================================================================

-- Get fitness goals
CREATE OR REPLACE FUNCTION get_fitness_goals()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  goals_data JSON;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT row_to_json(fg.*) INTO goals_data
  FROM fitness_goals fg
  WHERE fg.user_id = current_user_id;

  RETURN goals_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update fitness goals
CREATE OR REPLACE FUNCTION update_fitness_goals(
  p_daily_steps INTEGER DEFAULT NULL,
  p_weekly_workouts INTEGER DEFAULT NULL,
  p_target_weight DECIMAL DEFAULT NULL,
  p_activity_level TEXT DEFAULT NULL,
  p_primary_goal TEXT DEFAULT NULL,
  p_workout_preferences TEXT[] DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO fitness_goals (
    user_id, daily_steps, weekly_workouts, target_weight,
    activity_level, primary_goal, workout_preferences
  ) VALUES (
    current_user_id, p_daily_steps, p_weekly_workouts, p_target_weight,
    p_activity_level, p_primary_goal, p_workout_preferences
  )
  ON CONFLICT (user_id) DO UPDATE SET
    daily_steps = COALESCE(p_daily_steps, fitness_goals.daily_steps),
    weekly_workouts = COALESCE(p_weekly_workouts, fitness_goals.weekly_workouts),
    target_weight = COALESCE(p_target_weight, fitness_goals.target_weight),
    activity_level = COALESCE(p_activity_level, fitness_goals.activity_level),
    primary_goal = COALESCE(p_primary_goal, fitness_goals.primary_goal),
    workout_preferences = COALESCE(p_workout_preferences, fitness_goals.workout_preferences),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete fitness goals
CREATE OR REPLACE FUNCTION delete_fitness_goals()
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  DELETE FROM fitness_goals WHERE user_id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 8. NUTRITION GOALS FUNCTIONS
-- ================================================================

-- Get nutrition goals
CREATE OR REPLACE FUNCTION get_nutrition_goals()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  goals_data JSON;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT row_to_json(ng.*) INTO goals_data
  FROM nutrition_goals ng
  WHERE ng.user_id = current_user_id;

  RETURN goals_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update nutrition goals
CREATE OR REPLACE FUNCTION update_nutrition_goals(
  p_daily_calories INTEGER DEFAULT NULL,
  p_daily_protein DECIMAL DEFAULT NULL,
  p_daily_carbs DECIMAL DEFAULT NULL,
  p_daily_fat DECIMAL DEFAULT NULL,
  p_daily_fiber DECIMAL DEFAULT NULL,
  p_daily_water INTEGER DEFAULT NULL,
  p_meal_frequency INTEGER DEFAULT NULL,
  p_dietary_restrictions TEXT[] DEFAULT NULL,
  p_health_conditions TEXT[] DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO nutrition_goals (
    user_id, daily_calories, daily_protein, daily_carbs, daily_fat,
    daily_fiber, daily_water, meal_frequency, dietary_restrictions, health_conditions
  ) VALUES (
    current_user_id, p_daily_calories, p_daily_protein, p_daily_carbs, p_daily_fat,
    p_daily_fiber, p_daily_water, p_meal_frequency, p_dietary_restrictions, p_health_conditions
  )
  ON CONFLICT (user_id) DO UPDATE SET
    daily_calories = COALESCE(p_daily_calories, nutrition_goals.daily_calories),
    daily_protein = COALESCE(p_daily_protein, nutrition_goals.daily_protein),
    daily_carbs = COALESCE(p_daily_carbs, nutrition_goals.daily_carbs),
    daily_fat = COALESCE(p_daily_fat, nutrition_goals.daily_fat),
    daily_fiber = COALESCE(p_daily_fiber, nutrition_goals.daily_fiber),
    daily_water = COALESCE(p_daily_water, nutrition_goals.daily_water),
    meal_frequency = COALESCE(p_meal_frequency, nutrition_goals.meal_frequency),
    dietary_restrictions = COALESCE(p_dietary_restrictions, nutrition_goals.dietary_restrictions),
    health_conditions = COALESCE(p_health_conditions, nutrition_goals.health_conditions),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete nutrition goals
CREATE OR REPLACE FUNCTION delete_nutrition_goals()
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  DELETE FROM nutrition_goals WHERE user_id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 9. WEIGHT TRACKING FUNCTIONS
-- ================================================================

-- Get weight goals
CREATE OR REPLACE FUNCTION get_weight_goals()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  goals_data JSON;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT row_to_json(wg.*) INTO goals_data
  FROM weight_goals wg
  WHERE wg.user_id = current_user_id;

  RETURN goals_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update weight goals
CREATE OR REPLACE FUNCTION update_weight_goals(
  p_current_weight DECIMAL DEFAULT NULL,
  p_target_weight DECIMAL DEFAULT NULL,
  p_goal_date TEXT DEFAULT NULL,
  p_weight_unit TEXT DEFAULT NULL,
  p_weekly_goal DECIMAL DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO weight_goals (
    user_id, current_weight, target_weight, goal_date, weight_unit, weekly_goal
  ) VALUES (
    current_user_id, p_current_weight, p_target_weight, 
    CASE WHEN p_goal_date IS NOT NULL THEN p_goal_date::DATE ELSE NULL END,
    p_weight_unit, p_weekly_goal
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_weight = COALESCE(p_current_weight, weight_goals.current_weight),
    target_weight = COALESCE(p_target_weight, weight_goals.target_weight),
    goal_date = COALESCE(
      CASE WHEN p_goal_date IS NOT NULL THEN p_goal_date::DATE ELSE NULL END,
      weight_goals.goal_date
    ),
    weight_unit = COALESCE(p_weight_unit, weight_goals.weight_unit),
    weekly_goal = COALESCE(p_weekly_goal, weight_goals.weekly_goal),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get weight entries
CREATE OR REPLACE FUNCTION get_weight_entries(p_limit INTEGER DEFAULT 50)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  entries_data JSON;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT json_agg(row_to_json(we.*) ORDER BY we.date DESC, we.created_at DESC) INTO entries_data
  FROM (
    SELECT * FROM weight_entries 
    WHERE user_id = current_user_id 
    ORDER BY date DESC, created_at DESC 
    LIMIT p_limit
  ) we;

  RETURN COALESCE(entries_data, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add weight entry
CREATE OR REPLACE FUNCTION add_weight_entry(
  p_weight DECIMAL,
  p_unit TEXT,
  p_date TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  new_entry weight_entries%ROWTYPE;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO weight_entries (user_id, weight, unit, date, notes)
  VALUES (
    current_user_id, 
    p_weight, 
    p_unit,
    CASE WHEN p_date IS NOT NULL THEN p_date::DATE ELSE CURRENT_DATE END,
    p_notes
  )
  RETURNING * INTO new_entry;

  RETURN row_to_json(new_entry);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete weight entry
CREATE OR REPLACE FUNCTION delete_weight_entry(p_entry_id UUID)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  DELETE FROM weight_entries 
  WHERE id = p_entry_id AND user_id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 10. GRANT PERMISSIONS
-- ================================================================
GRANT EXECUTE ON FUNCTION get_fitness_goals() TO authenticated;
GRANT EXECUTE ON FUNCTION update_fitness_goals(INTEGER, INTEGER, DECIMAL, TEXT, TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_fitness_goals() TO authenticated;

GRANT EXECUTE ON FUNCTION get_nutrition_goals() TO authenticated;
GRANT EXECUTE ON FUNCTION update_nutrition_goals(INTEGER, DECIMAL, DECIMAL, DECIMAL, DECIMAL, INTEGER, INTEGER, TEXT[], TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_nutrition_goals() TO authenticated;

GRANT EXECUTE ON FUNCTION get_weight_goals() TO authenticated;
GRANT EXECUTE ON FUNCTION update_weight_goals(DECIMAL, DECIMAL, TEXT, TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weight_entries(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_weight_entry(DECIMAL, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_weight_entry(UUID) TO authenticated;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Health Tracking setup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- fitness_goals';
  RAISE NOTICE '- nutrition_goals';
  RAISE NOTICE '- weight_goals';
  RAISE NOTICE '- weight_entries';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions available:';
  RAISE NOTICE '- Fitness Goals: get/update/delete_fitness_goals()';
  RAISE NOTICE '- Nutrition Goals: get/update/delete_nutrition_goals()';
  RAISE NOTICE '- Weight Tracking: get/update_weight_goals(), get/add/delete_weight_entries()';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for health tracking!';
END $$;
