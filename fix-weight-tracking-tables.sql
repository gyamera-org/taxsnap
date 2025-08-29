-- ================================================================
-- Weight Tracking Tables Setup
-- Run this in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. DROP EXISTING TABLES (if they exist) TO START FRESH
-- ================================================================
DROP TABLE IF EXISTS weight_history CASCADE;
DROP TABLE IF EXISTS body_measurements CASCADE;

-- ================================================================
-- 2. CREATE BODY_MEASUREMENTS TABLE
-- ================================================================
CREATE TABLE body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  height NUMERIC(5,2), -- Height in cm (e.g., 170.50)
  current_weight NUMERIC(6,2), -- Current weight (e.g., 65.50)
  goal_weight NUMERIC(6,2), -- Goal weight (e.g., 60.00)
  units TEXT CHECK (units IN ('kg', 'lbs')) DEFAULT 'kg',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- ================================================================
-- 3. CREATE WEIGHT_HISTORY TABLE
-- ================================================================
CREATE TABLE weight_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC(6,2) NOT NULL, -- Weight value (e.g., 65.50)
  units TEXT CHECK (units IN ('kg', 'lbs')) DEFAULT 'kg',
  note TEXT, -- Optional note for the entry
  measured_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- When the weight was measured
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX idx_weight_history_user_id ON weight_history(user_id);
CREATE INDEX idx_weight_history_measured_at ON weight_history(measured_at DESC);
CREATE INDEX idx_weight_history_user_measured ON weight_history(user_id, measured_at DESC);

-- ================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 6. CREATE RLS POLICIES FOR BODY_MEASUREMENTS
-- ================================================================
CREATE POLICY "Users can view their own body measurements" ON body_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body measurements" ON body_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body measurements" ON body_measurements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body measurements" ON body_measurements
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 7. CREATE RLS POLICIES FOR WEIGHT_HISTORY
-- ================================================================
CREATE POLICY "Users can view their own weight history" ON weight_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight history" ON weight_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight history" ON weight_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight history" ON weight_history
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- 8. CREATE TRIGGER TO UPDATE updated_at AUTOMATICALLY
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_body_measurements_updated_at 
  BEFORE UPDATE ON body_measurements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_history_updated_at 
  BEFORE UPDATE ON weight_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 9. GRANT PERMISSIONS
-- ================================================================
GRANT ALL ON body_measurements TO authenticated;
GRANT ALL ON weight_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ================================================================
-- 10. SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Weight Tracking Tables Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- body_measurements (height, current_weight, goal_weight, units)';
  RAISE NOTICE '- weight_history (weight, units, note, measured_at)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '- ✅ Row Level Security enabled';
  RAISE NOTICE '- ✅ Auto-updating timestamps';
  RAISE NOTICE '- ✅ Unique constraint on user_id for body_measurements';
  RAISE NOTICE '- ✅ Performance indexes';
  RAISE NOTICE '- ✅ Unit conversion support (kg/lbs)';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for weight tracking! 🎯';
END $$;
