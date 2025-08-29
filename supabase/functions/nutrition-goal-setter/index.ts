import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  primary_goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
  tracking_experience: 'beginner' | 'intermediate' | 'advanced';
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'female' | 'male';
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water_ml: number;
  health_score: number;
  bmi: number;
  bmr: number;
  tdee: number;
  weight_recommendation: string;
  recommendations: string[];
}

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation
  if (gender === 'female') {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
}

function getActivityMultiplier(activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  return multipliers[activityLevel as keyof typeof multipliers] || 1.375;
}

function calculateBMI(weight: number, height: number): number {
  // BMI = weight(kg) / height(m)^2
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

function calculateHealthScore(bmi: number, activityLevel: string, goal: string): number {
  let score = 5; // Base score out of 10

  // BMI scoring
  if (bmi >= 18.5 && bmi <= 24.9) {
    score += 3; // Normal BMI
  } else if (bmi >= 25 && bmi <= 29.9) {
    score += 1; // Overweight
  } else if (bmi >= 17 && bmi <= 18.4) {
    score += 2; // Slightly underweight
  } // Severely under/over gets 0 additional points

  // Activity level scoring
  if (activityLevel === 'active') score += 2;
  else if (activityLevel === 'moderate') score += 1.5;
  else if (activityLevel === 'light') score += 1;
  // sedentary gets 0 additional points

  return Math.min(Math.round(score), 10);
}

function getWeightRecommendation(bmi: number, goal: string): string {
  if (goal === 'maintain') return 'maintain current weight';

  if (bmi < 18.5) return 'consider gaining weight';
  if (bmi >= 18.5 && bmi <= 24.9) {
    if (goal === 'lose_weight') return 'lose 2-4 kg gradually';
    if (goal === 'gain_muscle') return 'focus on muscle gain';
    return 'maintain current weight';
  }
  if (bmi >= 25 && bmi <= 29.9) return 'lose 5-10 kg gradually';
  return 'consult healthcare provider';
}

function getRecommendations(goal: string, activityLevel: string, bmi: number): string[] {
  const recommendations = [];

  // Female-focused goal-specific recommendations
  switch (goal) {
    case 'lose_weight':
      recommendations.push('Eat protein-rich breakfasts to curb cravings');
      recommendations.push('Stay hydrated - aim for 2-3 liters daily');
      recommendations.push('Plan balanced meals to avoid emotional eating');
      break;
    case 'gain_muscle':
      recommendations.push('Include protein in post-workout snacks');
      recommendations.push("Don't fear carbs - they fuel your workouts");
      recommendations.push('Eat consistently every 3-4 hours');
      break;
    case 'maintain':
      recommendations.push('Listen to your hunger and fullness cues');
      recommendations.push('Include healthy fats for hormone balance');
      break;
    case 'improve_health':
      recommendations.push('Add leafy greens to support energy levels');
      recommendations.push('Include iron-rich foods like spinach and lentils');
      recommendations.push('Consider magnesium for better sleep');
      break;
  }

  // Activity-specific recommendations for women
  if (activityLevel === 'sedentary') {
    recommendations.push('Take short walks after meals to boost metabolism');
  } else if (activityLevel === 'active') {
    recommendations.push('Fuel properly before intense workouts');
    recommendations.push('Prioritize sleep for muscle recovery');
  }

  // Health-specific recommendations
  if (bmi < 18.5) {
    recommendations.push('Add healthy calorie-dense foods like nuts and seeds');
  } else if (bmi > 25) {
    recommendations.push('Fill half your plate with vegetables');
    recommendations.push('Eat mindfully and chew slowly');
  }

  return recommendations;
}

function calculateNutritionGoals(
  data: RequestBody,
  userWeight?: number,
  userHeight?: number,
  userAge?: number
): NutritionGoals {
  // Default values for calculation
  const weight = data.weight || userWeight || 65; // kg
  const height = data.height || userHeight || 165; // cm
  const age = data.age || userAge || 30;
  const gender = data.gender || 'female';

  // Calculate BMR and TDEE
  const bmr = calculateBMR(weight, height, age, gender);
  const activityMultiplier = getActivityMultiplier(data.activity_level);
  let tdee = bmr * activityMultiplier;

  // Adjust calories based on goal
  let calories = tdee;
  switch (data.primary_goal) {
    case 'lose_weight':
      calories = tdee - 500; // 500 calorie deficit for ~1lb/week loss
      break;
    case 'gain_muscle':
      calories = tdee + 300; // 300 calorie surplus for muscle gain
      break;
    case 'maintain':
      calories = tdee;
      break;
    case 'improve_health':
      calories = tdee; // Maintenance calories with focus on nutrient density
      break;
  }

  // Ensure minimum calories (1200 for women, 1500 for men)
  const minCalories = gender === 'female' ? 1200 : 1500;
  calories = Math.max(calories, minCalories);

  // Calculate macros based on goal
  let proteinPercentage = 0.25;
  let carbPercentage = 0.45;
  let fatPercentage = 0.3;

  switch (data.primary_goal) {
    case 'lose_weight':
      proteinPercentage = 0.3;
      carbPercentage = 0.35;
      fatPercentage = 0.35;
      break;
    case 'gain_muscle':
      proteinPercentage = 0.3;
      carbPercentage = 0.45;
      fatPercentage = 0.25;
      break;
    case 'improve_health':
      proteinPercentage = 0.25;
      carbPercentage = 0.45;
      fatPercentage = 0.3;
      break;
  }

  // Calculate macro grams
  const protein = Math.round((calories * proteinPercentage) / 4);
  const carbs = Math.round((calories * carbPercentage) / 4);
  const fat = Math.round((calories * fatPercentage) / 9);

  // Calculate water intake (ml)
  const waterMl = Math.round(weight * 35); // 35ml per kg body weight

  // Calculate additional metrics
  const bmi = calculateBMI(weight, height);
  const healthScore = calculateHealthScore(bmi, data.activity_level, data.primary_goal);
  const weightRecommendation = getWeightRecommendation(bmi, data.primary_goal);
  const recommendations = getRecommendations(data.primary_goal, data.activity_level, bmi);

  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fat,
    water_ml: waterMl,
    health_score: healthScore,
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    weight_recommendation: weightRecommendation,
    recommendations,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonError('Missing authorization header', 401);
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonError('Unauthorized', 401);
    }

    // Parse request body
    const requestData: RequestBody = await req.json();

    if (!requestData.primary_goal || !requestData.activity_level) {
      return jsonError('Primary goal and activity level are required');
    }

    // Try to get user's body measurements and weight history for accurate calculations
    let userWeight, userHeight, userAge;
    try {
      // Get height from body_measurements
      const { data: bodyMeasurements } = await supabaseClient
        .from('body_measurements')
        .select('height, current_weight')
        .eq('user_id', user.id)
        .single();

      if (bodyMeasurements?.height) {
        userHeight = bodyMeasurements.height;
      }

      // Use current_weight from body_measurements if available, otherwise get latest from weight_history
      if (bodyMeasurements?.current_weight) {
        userWeight = bodyMeasurements.current_weight;
      } else {
        // Get the most recent weight from weight_history
        const { data: latestWeight } = await supabaseClient
          .from('weight_history')
          .select('weight')
          .eq('user_id', user.id)
          .order('measured_at', { ascending: false })
          .limit(1)
          .single();

        if (latestWeight?.weight) {
          userWeight = latestWeight.weight;
        }
      }

      // Try to get user age from profile if available
      const { data: profile } = await supabaseClient
        .from('accounts')
        .select('age')
        .eq('user_id', user.id)
        .single();

      if (profile?.age) {
        userAge = profile.age;
      }
    } catch (error) {}

    // Calculate nutrition goals
    const nutritionGoals = calculateNutritionGoals(requestData, userWeight, userHeight, userAge);

    // Use upsert to either update existing goals or create new ones
    // This prevents duplicates by using user_id as the conflict resolution
    const { error: saveError } = await supabaseClient.from('nutrition_goals').upsert(
      {
        user_id: user.id,
        primary_goal: requestData.primary_goal,
        activity_level: requestData.activity_level,
        tracking_experience: requestData.tracking_experience,
        calories: nutritionGoals.calories,
        protein: nutritionGoals.protein,
        carbs: nutritionGoals.carbs,
        fat: nutritionGoals.fat,
        water_ml: nutritionGoals.water_ml,
        health_score: nutritionGoals.health_score,
        bmi: nutritionGoals.bmi,
        bmr: nutritionGoals.bmr,
        tdee: nutritionGoals.tdee,
        weight_recommendation: nutritionGoals.weight_recommendation,
        recommendations: nutritionGoals.recommendations,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      }
    );

    if (saveError) {
      console.error('Error saving nutrition goals:', saveError);
      return jsonError('Failed to save nutrition goals', 500);
    }

    return new Response(
      JSON.stringify({
        success: true,
        nutrition_goals: nutritionGoals,
        message: 'Nutrition goals calculated and saved successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in nutrition goal setter:', error);
    return jsonError('Internal server error', 500);
  }
});
