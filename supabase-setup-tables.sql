-- ================================================================
-- Supabase Tables Setup for Aurae App
-- Settings, Onboarding, and User Preferences
-- ================================================================

-- Enable RLS (Row Level Security) for all tables
-- This ensures users can only access their own data

-- ================================================================
-- 1. FITNESS GOALS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS fitness_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Primary fitness goal
  primary_goal TEXT CHECK (primary_goal IN ('lose_weight', 'build_muscle', 'improve_endurance', 'general_fitness')) NOT NULL,
  
  -- Workout frequency per week
  workout_frequency TEXT CHECK (workout_frequency IN ('1-2', '3-4', '5-6', '7+')) NOT NULL,
  
  -- Experience level
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own fitness goals" 
  ON fitness_goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fitness goals" 
  ON fitness_goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness goals" 
  ON fitness_goals FOR UPDATE 
  USING (auth.uid() = user_id);

-- ================================================================
-- 2. NUTRITION GOALS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Primary nutrition goal
  primary_goal TEXT CHECK (primary_goal IN ('lose_weight', 'gain_muscle', 'maintain', 'improve_health')) NOT NULL,
  
  -- Activity level for calorie calculations
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active')) NOT NULL,
  
  -- Nutrition tracking experience
  tracking_experience TEXT CHECK (tracking_experience IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own nutrition goals" 
  ON nutrition_goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition goals" 
  ON nutrition_goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition goals" 
  ON nutrition_goals FOR UPDATE 
  USING (auth.uid() = user_id);

-- ================================================================
-- 3. BODY MEASUREMENTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Current measurements
  height DECIMAL(5,2) NOT NULL CHECK (height > 0),
  current_weight DECIMAL(5,2) NOT NULL CHECK (current_weight > 0),
  goal_weight DECIMAL(5,2) NOT NULL CHECK (goal_weight > 0),
  
  -- Measurement units preference
  units TEXT CHECK (units IN ('metric', 'imperial')) DEFAULT 'metric' NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own body measurements" 
  ON body_measurements FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body measurements" 
  ON body_measurements FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body measurements" 
  ON body_measurements FOR UPDATE 
  USING (auth.uid() = user_id);

-- ================================================================
-- 4. CYCLE SETTINGS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS cycle_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Cycle information
  cycle_length INTEGER DEFAULT 28 CHECK (cycle_length BETWEEN 21 AND 45) NOT NULL,
  period_length INTEGER DEFAULT 5 CHECK (period_length BETWEEN 2 AND 10) NOT NULL,
  last_period_date DATE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE cycle_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own cycle settings" 
  ON cycle_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle settings" 
  ON cycle_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle settings" 
  ON cycle_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- ================================================================
-- 5. LIFESTYLE PREFERENCES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS lifestyle_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Daily goals
  sleep_goal INTEGER DEFAULT 8 CHECK (sleep_goal BETWEEN 4 AND 12) NOT NULL,
  water_goal INTEGER DEFAULT 8 CHECK (water_goal BETWEEN 4 AND 20) NOT NULL,
  
  -- Notification preferences
  notifications_enabled BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE lifestyle_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own lifestyle preferences" 
  ON lifestyle_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lifestyle preferences" 
  ON lifestyle_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lifestyle preferences" 
  ON lifestyle_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- ================================================================
-- 6. USER PROFILES TABLE (Extended user information)
-- ================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal information
  display_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT false NOT NULL,
  onboarding_completed_at TIMESTAMPTZ,
  
  -- Avatar/profile image
  avatar_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- ================================================================
-- 7. WEIGHT HISTORY TABLE (For tracking weight changes over time)
-- ================================================================
CREATE TABLE IF NOT EXISTS weight_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Weight entry
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  units TEXT CHECK (units IN ('metric', 'imperial')) DEFAULT 'metric' NOT NULL,
  
  -- Optional note
  note TEXT,
  
  -- Date of measurement
  measured_at DATE DEFAULT CURRENT_DATE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own weight history" 
  ON weight_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight history" 
  ON weight_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight history" 
  ON weight_history FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight history" 
  ON weight_history FOR DELETE 
  USING (auth.uid() = user_id);

-- ================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ================================================================

-- User-based indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON fitness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_cycle_settings_user_id ON cycle_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_lifestyle_preferences_user_id ON lifestyle_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_history_user_id ON weight_history(user_id);

-- Date-based indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_weight_history_measured_at ON weight_history(user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_settings_last_period ON cycle_settings(user_id, last_period_date DESC);

-- ================================================================
-- 9. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_fitness_goals_updated_at BEFORE UPDATE ON fitness_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON nutrition_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_body_measurements_updated_at BEFORE UPDATE ON body_measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cycle_settings_updated_at BEFORE UPDATE ON cycle_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lifestyle_preferences_updated_at BEFORE UPDATE ON lifestyle_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weight_history_updated_at BEFORE UPDATE ON weight_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 10. HELPFUL VIEWS FOR COMMON QUERIES
-- ================================================================

-- Complete user settings view
CREATE OR REPLACE VIEW user_complete_settings AS
SELECT 
  up.user_id,
  up.display_name,
  up.date_of_birth,
  up.onboarding_completed,
  up.avatar_url,
  fg.primary_goal as fitness_goal,
  fg.workout_frequency,
  fg.experience_level as fitness_experience,
  ng.primary_goal as nutrition_goal,
  ng.activity_level,
  ng.tracking_experience as nutrition_experience,
  bm.height,
  bm.current_weight,
  bm.goal_weight,
  bm.units,
  cs.cycle_length,
  cs.period_length,
  cs.last_period_date,
  lp.sleep_goal,
  lp.water_goal,
  lp.notifications_enabled
FROM user_profiles up
LEFT JOIN fitness_goals fg ON up.user_id = fg.user_id
LEFT JOIN nutrition_goals ng ON up.user_id = ng.user_id
LEFT JOIN body_measurements bm ON up.user_id = bm.user_id
LEFT JOIN cycle_settings cs ON up.user_id = cs.user_id
LEFT JOIN lifestyle_preferences lp ON up.user_id = lp.user_id;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Aurae database tables created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- fitness_goals';
  RAISE NOTICE '- nutrition_goals'; 
  RAISE NOTICE '- body_measurements';
  RAISE NOTICE '- cycle_settings';
  RAISE NOTICE '- lifestyle_preferences';
  RAISE NOTICE '- user_profiles';
  RAISE NOTICE '- weight_history';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '- Row Level Security (RLS) on all tables';
  RAISE NOTICE '- Automatic updated_at timestamps';
  RAISE NOTICE '- Performance indexes';
  RAISE NOTICE '- Data validation constraints';
  RAISE NOTICE '- Complete settings view';
END $$;
