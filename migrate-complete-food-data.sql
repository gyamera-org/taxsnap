-- Complete migration script for all food data
-- Run this in Supabase SQL Editor AFTER creating the tables

-- Step 1: Create a function to migrate JSON data
CREATE OR REPLACE FUNCTION migrate_food_database_from_json()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  json_data TEXT;
  food_count INTEGER := 0;
BEGIN
  -- The complete JSON data from foodDatabase.json
  -- Replace this with your actual JSON content
  json_data := '[
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
    },
    {
      "id": "3",
      "name": "Banana",
      "brand": null,
      "category": "Fruit",
      "servingSize": "1 medium",
      "nutrition": {
        "calories": 105,
        "protein": 1,
        "carbs": 27,
        "fat": 0,
        "fiber": 3,
        "sugar": 14
      }
    },
    {
      "id": "4",
      "name": "Chicken Breast",
      "brand": null,
      "category": "Protein",
      "servingSize": "100g",
      "nutrition": {
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "fiber": 0,
        "sugar": 0
      }
    },
    {
      "id": "5",
      "name": "Brown Rice",
      "brand": null,
      "category": "Grain",
      "servingSize": "1 cup cooked",
      "nutrition": {
        "calories": 216,
        "protein": 5,
        "carbs": 45,
        "fat": 1.8,
        "fiber": 4,
        "sugar": 0
      }
    }
  ]';

  -- Insert the data
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
    0 as sodium_mg,
    'json_migration' as source,
    true as verified
  FROM jsonb_array_elements(json_data::jsonb) AS food_item;

  GET DIAGNOSTICS food_count = ROW_COUNT;
  
  RAISE NOTICE 'Migrated % food items from JSON', food_count;
  RETURN food_count;
END;
$$;

-- Step 2: Run the migration
SELECT migrate_food_database_from_json();

-- Step 3: Clean up
DROP FUNCTION migrate_food_database_from_json();

-- Step 4: Verify the migration
SELECT 
  source,
  COUNT(*) as total_foods,
  COUNT(DISTINCT category) as categories,
  AVG(calories) as avg_calories,
  MIN(calories) as min_calories,
  MAX(calories) as max_calories
FROM food_database 
WHERE source = 'json_migration'
GROUP BY source;

-- Step 5: Show sample of migrated data
SELECT 
  name,
  brand,
  category,
  serving_size,
  calories,
  protein,
  carbs,
  fat
FROM food_database 
WHERE source = 'json_migration'
ORDER BY name
LIMIT 10;

-- Step 6: Create some useful views for the app
CREATE OR REPLACE VIEW popular_foods AS
SELECT 
  id,
  name,
  brand,
  category,
  serving_size,
  calories,
  protein,
  carbs,
  fat,
  verified,
  verification_count
FROM food_database
WHERE verified = true
ORDER BY verification_count DESC, calories ASC
LIMIT 100;

CREATE OR REPLACE VIEW foods_by_category AS
SELECT 
  category,
  COUNT(*) as food_count,
  AVG(calories) as avg_calories,
  ARRAY_AGG(name ORDER BY calories LIMIT 5) as sample_foods
FROM food_database
WHERE verified = true
GROUP BY category
ORDER BY food_count DESC;

-- Grant access to views
GRANT SELECT ON popular_foods TO authenticated, anon;
GRANT SELECT ON foods_by_category TO authenticated, anon;
