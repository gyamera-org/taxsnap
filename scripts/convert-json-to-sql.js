const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = path.join(__dirname, '../data/foodDatabase.json');
const foodData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Converting ${foodData.length} food items to SQL...`);

// Generate SQL insert statements
const sqlInserts = foodData
  .map((food) => {
    const name = food.name?.replace(/'/g, "''") || 'Unknown';
    const brand = food.brand ? `'${food.brand.replace(/'/g, "''")}'` : 'NULL';
    const category = food.category?.toLowerCase().replace(/'/g, "''") || 'other';
    const servingSize = food.servingSize?.replace(/'/g, "''") || '1 serving';

    const nutrition = food.nutrition || {};
    const calories = nutrition.calories || 0;
    const protein = nutrition.protein || 0;
    const carbs = nutrition.carbs || 0;
    const fat = nutrition.fat || 0;
    const fiber = nutrition.fiber || 0;
    const sugar = nutrition.sugar || 0;

    return `  ('${name}', ${brand}, '${category}', '${servingSize}', ${calories}, ${protein}, ${carbs}, ${fat}, ${fiber}, ${sugar}, 0, 'json_migration', true)`;
  })
  .join(',\n');

const fullSQL = `-- Auto-generated migration script
-- Run this in Supabase SQL Editor

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
${sqlInserts};

-- Verification query
SELECT 
  'Migration completed' as status,
  COUNT(*) as total_foods,
  COUNT(DISTINCT category) as categories
FROM food_database 
WHERE source = 'json_migration';
`;

// Write to file
const outputPath = path.join(__dirname, '../food-migration-generated.sql');
fs.writeFileSync(outputPath, fullSQL);

console.log(`✅ SQL migration file generated: ${outputPath}`);
console.log(`📊 Total foods: ${foodData.length}`);
console.log(
  `📁 Categories: ${[...new Set(foodData.map((f) => f.category?.toLowerCase()))].length}`
);
console.log('\n🚀 Next steps:');
console.log('1. Run create-community-food-database.sql in Supabase SQL Editor');
console.log('2. Run food-migration-generated.sql in Supabase SQL Editor');
console.log('3. Verify the data was imported correctly');
