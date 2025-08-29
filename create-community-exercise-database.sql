-- Community Exercise Database Schema
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE IF EXISTS exercise_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_exercise_contributions ENABLE ROW LEVEL SECURITY;

-- Create exercise_database table
CREATE TABLE IF NOT EXISTS exercise_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  muscle_groups TEXT[] DEFAULT '{}',
  equipment TEXT DEFAULT 'bodyweight',
  difficulty TEXT DEFAULT 'beginner',
  instructions TEXT,
  calories_per_minute DECIMAL(4,1) DEFAULT 5.0,
  source TEXT DEFAULT 'user_contribution',
  contributor_id UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_exercise_contributions table
CREATE TABLE IF NOT EXISTS user_exercise_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  exercise_id UUID NOT NULL REFERENCES exercise_database(id),
  contribution_type TEXT NOT NULL DEFAULT 'new_exercise',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_database_name ON exercise_database(name);
CREATE INDEX IF NOT EXISTS idx_exercise_database_category ON exercise_database(category);
CREATE INDEX IF NOT EXISTS idx_exercise_database_muscle_groups ON exercise_database USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercise_database_verified ON exercise_database(verified);
CREATE INDEX IF NOT EXISTS idx_exercise_database_source ON exercise_database(source);
CREATE INDEX IF NOT EXISTS idx_user_exercise_contributions_user_id ON user_exercise_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_contributions_status ON user_exercise_contributions(status);

-- RLS Policies for exercise_database
CREATE POLICY "Anyone can read verified exercises" ON exercise_database
  FOR SELECT USING (verified = true);

CREATE POLICY "Users can read their own contributions" ON exercise_database
  FOR SELECT USING (contributor_id = auth.uid());

CREATE POLICY "Users can insert exercises" ON exercise_database
  FOR INSERT WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "Users can update their own unverified exercises" ON exercise_database
  FOR UPDATE USING (contributor_id = auth.uid() AND verified = false);

-- RLS Policies for user_exercise_contributions
CREATE POLICY "Users can read their own contributions" ON user_exercise_contributions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own contributions" ON user_exercise_contributions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create search function for exercises
CREATE OR REPLACE FUNCTION search_exercises(search_query TEXT, limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  muscle_groups TEXT[],
  equipment TEXT,
  difficulty TEXT,
  instructions TEXT,
  calories_per_minute DECIMAL(4,1),
  source TEXT,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.category,
    e.muscle_groups,
    e.equipment,
    e.difficulty,
    e.instructions,
    e.calories_per_minute,
    e.source,
    e.verified,
    e.created_at,
    e.updated_at
  FROM exercise_database e
  WHERE 
    e.verified = true
    AND (
      search_query = '' 
      OR e.name ILIKE '%' || search_query || '%'
      OR e.category ILIKE '%' || search_query || '%'
      OR search_query = ANY(e.muscle_groups)
      OR e.equipment ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN e.name ILIKE search_query || '%' THEN 1
      WHEN e.name ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    e.name
  LIMIT limit_count;
END;
$$;

-- Create function to get exercises by category
CREATE OR REPLACE FUNCTION get_exercises_by_category(exercise_category TEXT, limit_count INTEGER DEFAULT 30)
RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  muscle_groups TEXT[],
  equipment TEXT,
  difficulty TEXT,
  instructions TEXT,
  calories_per_minute DECIMAL(4,1),
  source TEXT,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.category,
    e.muscle_groups,
    e.equipment,
    e.difficulty,
    e.instructions,
    e.calories_per_minute,
    e.source,
    e.verified,
    e.created_at,
    e.updated_at
  FROM exercise_database e
  WHERE 
    e.verified = true
    AND e.category = exercise_category
  ORDER BY e.name
  LIMIT limit_count;
END;
$$;

-- Create function to get popular exercises
CREATE OR REPLACE FUNCTION get_popular_exercises(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  muscle_groups TEXT[],
  equipment TEXT,
  difficulty TEXT,
  instructions TEXT,
  calories_per_minute DECIMAL(4,1),
  source TEXT,
  verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.category,
    e.muscle_groups,
    e.equipment,
    e.difficulty,
    e.instructions,
    e.calories_per_minute,
    e.source,
    e.verified,
    e.created_at,
    e.updated_at
  FROM exercise_database e
  WHERE 
    e.verified = true
    AND e.category IN ('strength', 'cardio', 'flexibility', 'sports')
  ORDER BY e.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Create analytics view for exercise contributions
CREATE OR REPLACE VIEW exercise_contribution_stats AS
SELECT 
  COUNT(*) as total_exercises,
  COUNT(CASE WHEN verified = true THEN 1 END) as verified_exercises,
  COUNT(CASE WHEN verified = false THEN 1 END) as pending_exercises,
  COUNT(DISTINCT contributor_id) as total_contributors,
  COUNT(DISTINCT category) as total_categories
FROM exercise_database;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercise_database_updated_at 
  BEFORE UPDATE ON exercise_database 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_exercise_contributions_updated_at 
  BEFORE UPDATE ON user_exercise_contributions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON exercise_database TO anon, authenticated;
GRANT INSERT, UPDATE ON exercise_database TO authenticated;
GRANT SELECT, INSERT ON user_exercise_contributions TO authenticated;
GRANT EXECUTE ON FUNCTION search_exercises TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_exercises_by_category TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_popular_exercises TO anon, authenticated;
