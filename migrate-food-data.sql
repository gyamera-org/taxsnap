-- Migration script to move food data from JSON to database
-- Run this in Supabase SQL Editor AFTER creating the tables

-- First, let's create a temporary function to migrate JSON data
-- You'll need to copy the JSON data and paste it in the VALUES section below

-- Example migration - Replace the VALUES with your actual JSON data
-- This is a template showing how to insert the data

INSERT INTO food_database (
  name,
  brand,
  category,
  serving_size,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium_mg,
  source,
  verified
) VALUES 
  ('Avocado Toast', 'Homemade', 'breakfast', '1 slice', 320, 8, 28, 22, 10, 2, 0, 'json_migration', true),
  ('Greek Yogurt', 'Chobani', 'dairy', '1 cup', 100, 17, 6, 0, 0, 4, 60, 'json_migration', true),
  ('Banana', NULL, 'fruit', '1 medium', 105, 1, 27, 0, 3, 14, 1, 'json_migration', true),
  ('Chicken Breast', NULL, 'protein', '100g', 165, 31, 0, 3.6, 0, 0, 74, 'json_migration', true),
  ('Brown Rice', NULL, 'grain', '1 cup cooked', 216, 5, 45, 1.8, 4, 0, 10, 'json_migration', true);
  
-- Continue adding more foods from your JSON file...
-- Format: (name, brand, category, serving_size, calories, protein, carbs, fat, fiber, sugar, sodium_mg, source, verified)

-- For easier migration, you can also use this approach:
-- Create a temporary table and use a stored procedure

CREATE TEMP TABLE temp_food_migration AS
SELECT 
  jsonb_array_elements($$[
    {
      "id": "1",
      "name": "Avocado Toast",
      "brand": "Homemade",
      "category": "Breakfast",
      "servingSize": "1 slice",
      "nutrition": {
        "calories": 320,
        "protein": 8,
        "carbs": 28,
        "fat": 22,
        "fiber": 10,
        "sugar": 2
      }
    },
    {
      "id": "2",
      "name": "Greek Yogurt",
      "brand": "Chobani",
      "category": "Dairy",
      "servingSize": "1 cup",
      "nutrition": {
        "calories": 100,
        "protein": 17,
        "carbs": 6,
        "fat": 0,
        "fiber": 0,
        "sugar": 4
      }
    }
  ]$$::jsonb) AS food_item;

-- Insert from temporary table
INSERT INTO food_database (
  name,
  brand,
  category,
  serving_size,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium_mg,
  source,
  verified
)
SELECT 
  food_item->>'name' as name,
  NULLIF(food_item->>'brand', '') as brand,
  LOWER(food_item->>'category') as category,
  food_item->>'servingSize' as serving_size,
  COALESCE((food_item->'nutrition'->>'calories')::decimal, 0) as calories,
  COALESCE((food_item->'nutrition'->>'protein')::decimal, 0) as protein,
  COALESCE((food_item->'nutrition'->>'carbs')::decimal, 0) as carbs,
  COALESCE((food_item->'nutrition'->>'fat')::decimal, 0) as fat,
  COALESCE((food_item->'nutrition'->>'fiber')::decimal, 0) as fiber,
  COALESCE((food_item->'nutrition'->>'sugar')::decimal, 0) as sugar,
  0 as sodium_mg, -- Default sodium since not in original JSON
  'json_migration' as source,
  true as verified -- Mark migrated data as verified
FROM temp_food_migration;

-- Drop temporary table
DROP TABLE temp_food_migration;

-- Verify migration
SELECT 
  source,
  COUNT(*) as count,
  AVG(calories) as avg_calories
FROM food_database 
GROUP BY source;

COMMENT ON COLUMN food_database.source IS 'Track where food data came from: json_migration, user_contribution, openfoodfacts';
