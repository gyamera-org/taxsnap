-- Create community food database tables
-- Run this in Supabase SQL Editor

-- 1. Create food_database table for community food items
CREATE TABLE IF NOT EXISTS food_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  barcode TEXT UNIQUE, -- For barcode lookups
  
  -- Nutrition per serving
  calories DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber DECIMAL(8,2) DEFAULT 0,
  sugar DECIMAL(8,2) DEFAULT 0,
  sodium_mg DECIMAL(8,2) DEFAULT 0,
  
  -- Metadata
  source TEXT DEFAULT 'user_contribution', -- 'user_contribution', 'json_migration', 'openfoodfacts'
  contributor_id UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT FALSE,
  verification_count INTEGER DEFAULT 0,
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(name, '') || ' ' || 
      COALESCE(brand, '') || ' ' || 
      COALESCE(category, '')
    )
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_database_category ON food_database(category);
CREATE INDEX IF NOT EXISTS idx_food_database_barcode ON food_database(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_food_database_search ON food_database USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_food_database_verified ON food_database(verified);
CREATE INDEX IF NOT EXISTS idx_food_database_source ON food_database(source);

-- 3. Create user_food_contributions table to track user submissions
CREATE TABLE IF NOT EXISTS user_food_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  food_id UUID REFERENCES food_database(id) NOT NULL,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('new_food', 'verification', 'edit_suggestion')),
  
  -- For edit suggestions
  suggested_changes JSONB,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for user contributions
CREATE INDEX IF NOT EXISTS idx_user_contributions_user ON user_food_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_food ON user_food_contributions(food_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_status ON user_food_contributions(status);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for updated_at
CREATE TRIGGER update_food_database_updated_at 
  BEFORE UPDATE ON food_database 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_contributions ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies

-- Food database: Everyone can read, only authenticated users can contribute
CREATE POLICY "Anyone can read food database" 
  ON food_database FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert foods" 
  ON food_database FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Contributors can update their own foods" 
  ON food_database FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = contributor_id)
  WITH CHECK (auth.uid() = contributor_id);

-- User contributions: Users can only see/manage their own contributions
CREATE POLICY "Users can view their own contributions" 
  ON user_food_contributions FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create contributions" 
  ON user_food_contributions FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- 9. Create search function for food database
CREATE OR REPLACE FUNCTION search_foods(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  brand TEXT,
  category TEXT,
  serving_size TEXT,
  barcode TEXT,
  calories DECIMAL,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  fiber DECIMAL,
  sugar DECIMAL,
  sodium_mg DECIMAL,
  source TEXT,
  verified BOOLEAN,
  rank REAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.brand,
    f.category,
    f.serving_size,
    f.barcode,
    f.calories,
    f.protein,
    f.carbs,
    f.fat,
    f.fiber,
    f.sugar,
    f.sodium_mg,
    f.source,
    f.verified,
    ts_rank(f.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM food_database f
  WHERE 
    f.search_vector @@ plainto_tsquery('english', search_query)
    AND (category_filter IS NULL OR f.category = category_filter)
  ORDER BY 
    f.verified DESC,  -- Verified items first
    rank DESC,        -- Then by search relevance
    f.verification_count DESC,  -- Then by verification count
    f.created_at DESC -- Finally by recency
  LIMIT limit_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_foods TO authenticated;

COMMENT ON TABLE food_database IS 'Community-maintained food database with nutrition information';
COMMENT ON TABLE user_food_contributions IS 'Tracks user contributions to the food database';
COMMENT ON FUNCTION search_foods IS 'Full-text search function for food database with ranking';
