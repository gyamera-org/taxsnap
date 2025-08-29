-- Add calculated nutrition fields to nutrition_goals table
ALTER TABLE nutrition_goals 
ADD COLUMN IF NOT EXISTS calories INTEGER,
ADD COLUMN IF NOT EXISTS protein INTEGER,
ADD COLUMN IF NOT EXISTS carbs INTEGER,
ADD COLUMN IF NOT EXISTS fat INTEGER,
ADD COLUMN IF NOT EXISTS water_ml INTEGER,
ADD COLUMN IF NOT EXISTS health_score DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS bmi DECIMAL(4,1),
ADD COLUMN IF NOT EXISTS bmr INTEGER,
ADD COLUMN IF NOT EXISTS tdee INTEGER,
ADD COLUMN IF NOT EXISTS weight_recommendation TEXT,
ADD COLUMN IF NOT EXISTS recommendations JSONB;

-- Ensure user_id has a unique constraint for proper upsert behavior
ALTER TABLE nutrition_goals 
ADD CONSTRAINT IF NOT EXISTS nutrition_goals_user_id_unique UNIQUE (user_id);

-- Update the nutrition_goals table to include the new calculated fields
COMMENT ON COLUMN nutrition_goals.calories IS 'Daily calorie target';
COMMENT ON COLUMN nutrition_goals.protein IS 'Daily protein target in grams';
COMMENT ON COLUMN nutrition_goals.carbs IS 'Daily carbohydrate target in grams';
COMMENT ON COLUMN nutrition_goals.fat IS 'Daily fat target in grams';
COMMENT ON COLUMN nutrition_goals.water_ml IS 'Daily water target in milliliters';
COMMENT ON COLUMN nutrition_goals.health_score IS 'Health score out of 10';
COMMENT ON COLUMN nutrition_goals.bmi IS 'Body Mass Index';
COMMENT ON COLUMN nutrition_goals.bmr IS 'Basal Metabolic Rate';
COMMENT ON COLUMN nutrition_goals.tdee IS 'Total Daily Energy Expenditure';
COMMENT ON COLUMN nutrition_goals.weight_recommendation IS 'Weight recommendation text';
COMMENT ON COLUMN nutrition_goals.recommendations IS 'Array of personalized recommendations';
