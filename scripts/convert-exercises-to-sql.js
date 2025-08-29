const fs = require('fs');
const path = require('path');

// Read the exercises data file
const exercisesDataPath = path.join(__dirname, '..', 'data', 'exercisesData.ts');
const outputPath = path.join(__dirname, '..', 'exercise-migration-generated.sql');

// Simple parser for the exercises data
function parseExercisesData() {
  const content = fs.readFileSync(exercisesDataPath, 'utf8');

  // Extract the exercises array content
  const start = content.indexOf('export const exercisesData: Exercise[] = [');
  const end = content.lastIndexOf('];');

  if (start === -1 || end === -1) {
    throw new Error('Could not find exercises data array');
  }

  const arrayStart = start + 'export const exercisesData: Exercise[] = '.length;
  const arrayContent = content.substring(arrayStart, end + 1);

  // Use eval to parse the JavaScript (in a controlled environment)
  const exercisesData = eval(arrayContent);

  return exercisesData;
}

try {
  console.log('Parsing exercises data...');
  const exercisesData = parseExercisesData();

  console.log(`Converting ${exercisesData.length} exercises to SQL...`);

  // Helper function to categorize exercises
  function categorizeExercise(category) {
    const categoryMap = {
      Cardio: 'cardio',
      Strength: 'strength',
      Flexibility: 'flexibility',
      Sports: 'sports',
      Balance: 'balance',
    };
    return categoryMap[category] || 'other';
  }

  // Helper function to extract muscle groups from exercise name and category
  function getMuscleGroups(exercise) {
    const name = exercise.name.toLowerCase();
    const category = exercise.category.toLowerCase();

    const muscleGroups = [];

    // Common muscle group keywords
    if (name.includes('chest') || name.includes('push')) muscleGroups.push('chest');
    if (name.includes('back') || name.includes('pull') || name.includes('row'))
      muscleGroups.push('back');
    if (name.includes('shoulder') || name.includes('press')) muscleGroups.push('shoulders');
    if (name.includes('arm') || name.includes('bicep') || name.includes('tricep'))
      muscleGroups.push('arms');
    if (name.includes('leg') || name.includes('squat') || name.includes('lunge'))
      muscleGroups.push('legs');
    if (name.includes('core') || name.includes('ab') || name.includes('plank'))
      muscleGroups.push('core');
    if (name.includes('glute') || name.includes('hip')) muscleGroups.push('glutes');

    // Category-based muscle groups
    if (category === 'cardio') muscleGroups.push('cardiovascular');
    if (category === 'flexibility') muscleGroups.push('flexibility');

    // Default to full body if no specific groups identified
    if (muscleGroups.length === 0) {
      muscleGroups.push('full_body');
    }

    return muscleGroups;
  }

  // Helper function to determine equipment
  function getEquipment(exercise) {
    const name = exercise.name.toLowerCase();

    if (name.includes('dumbbell')) return 'dumbbells';
    if (name.includes('barbell')) return 'barbell';
    if (name.includes('machine')) return 'machine';
    if (name.includes('cable')) return 'cable';
    if (name.includes('kettlebell')) return 'kettlebell';
    if (name.includes('resistance band')) return 'resistance_band';
    if (name.includes('treadmill') || name.includes('bike') || name.includes('elliptical'))
      return 'cardio_machine';

    return 'bodyweight';
  }

  // Helper function to estimate calories per minute
  function getCaloriesPerMinute(exercise) {
    const category = exercise.category.toLowerCase();
    const name = exercise.name.toLowerCase();

    // Cardio exercises typically burn more calories
    if (category === 'cardio') {
      if (name.includes('running') || name.includes('sprint')) return 12.0;
      if (name.includes('cycling') || name.includes('bike')) return 8.0;
      if (name.includes('swimming')) return 10.0;
      if (name.includes('jumping') || name.includes('burpee')) return 11.0;
      if (name.includes('walking')) return 4.0;
      return 7.0; // default cardio
    }

    // Strength exercises
    if (category === 'strength') {
      if (name.includes('squat') || name.includes('deadlift')) return 6.0;
      if (name.includes('press') || name.includes('pull')) return 5.0;
      return 4.5; // default strength
    }

    // Other categories
    if (category === 'flexibility') return 2.5;
    if (category === 'balance') return 3.0;
    if (category === 'sports') return 8.0;

    return 5.0; // default
  }

  // Generate SQL insert statements
  const sqlInserts = exercisesData
    .map((exercise) => {
      const name = exercise.name.replace(/'/g, "''");
      const category = categorizeExercise(exercise.category);
      const muscleGroups = getMuscleGroups(exercise);
      const equipment = getEquipment(exercise);
      const instructions = exercise.description?.replace(/'/g, "''") || '';
      const caloriesPerMinute = getCaloriesPerMinute(exercise);
      const difficulty = 'beginner'; // Default difficulty

      return `  ('${name}', '${category}', '{${muscleGroups.join(',')}}', '${equipment}', '${difficulty}', '${instructions}', ${caloriesPerMinute}, 'data_migration', true)`;
    })
    .join(',\n');

  const fullSQL = `-- Auto-generated exercise migration script
-- Run this in Supabase SQL Editor after creating the community exercise database

INSERT INTO exercise_database (
  name,
  category,
  muscle_groups,
  equipment,
  difficulty,
  instructions,
  calories_per_minute,
  source,
  verified
) VALUES
${sqlInserts}
ON CONFLICT (name) DO NOTHING;

-- Update statistics
SELECT 'Exercise migration completed!' as message,
       COUNT(*) as total_exercises,
       COUNT(CASE WHEN category = 'cardio' THEN 1 END) as cardio_exercises,
       COUNT(CASE WHEN category = 'strength' THEN 1 END) as strength_exercises,
       COUNT(CASE WHEN category = 'flexibility' THEN 1 END) as flexibility_exercises,
       COUNT(CASE WHEN category = 'sports' THEN 1 END) as sports_exercises
FROM exercise_database
WHERE source = 'data_migration';`;

  // Write to file
  fs.writeFileSync(outputPath, fullSQL, 'utf8');

  console.log(`✅ SQL migration file generated: ${outputPath}`);
  console.log(`📊 Total exercises: ${exercisesData.length}`);
  console.log(`📁 Categories: ${[...new Set(exercisesData.map((e) => e.category))].length}`);
  console.log('\n🚀 Next steps:');
  console.log('1. Run create-community-exercise-database.sql in Supabase SQL Editor');
  console.log('2. Run exercise-migration-generated.sql in Supabase SQL Editor');
  console.log('3. Verify the data was imported correctly');
} catch (error) {
  console.error('❌ Error converting exercises to SQL:', error.message);
  process.exit(1);
}
