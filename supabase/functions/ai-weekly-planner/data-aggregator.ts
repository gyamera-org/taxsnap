// Data Aggregation Layer
// Fetches and processes all user data for AI analysis

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import {
  UserDataSnapshot,
  CycleDataSnapshot,
  ExerciseDataSnapshot,
  NutritionDataSnapshot,
  UserPreferences,
} from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

export async function aggregateUserData(userId: string): Promise<UserDataSnapshot> {
  const [cycleData, exerciseData, nutritionData, userPreferences] = await Promise.all([
    aggregateCycleData(userId),
    aggregateExerciseData(userId),
    aggregateNutritionData(userId),
    aggregateUserPreferences(userId),
  ]);

  return {
    user_id: userId,
    cycle_data: cycleData,
    exercise_data: exerciseData,
    nutrition_data: nutritionData,
    user_preferences: userPreferences,
  };
}

async function aggregateCycleData(userId: string): Promise<CycleDataSnapshot> {
  // Get cycle settings
  const { data: cycleSettings } = await supabase
    .from('cycle_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get recent period logs (last 60 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const { data: periodLogs } = await supabase
    .from('period_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // Calculate current cycle phase
  const currentPhase = calculateCurrentCyclePhase(cycleSettings, periodLogs || []);

  // Analyze patterns
  const patterns = analyzeCyclePatterns(periodLogs || [], cycleSettings);

  return {
    current_phase: currentPhase,
    cycle_settings: {
      cycle_length: cycleSettings?.cycle_length || 28,
      period_length: cycleSettings?.period_length || 5,
      last_period_date: cycleSettings?.last_period_date || null,
    },
    recent_logs: (periodLogs || []).slice(0, 14).map((log) => ({
      date: log.date,
      mood: log.mood,
      flow_intensity: log.flow_intensity,
      symptoms: log.symptoms || [],
      energy_reported: log.energy_level, // Assuming this field exists
    })),
    cycle_patterns: patterns,
  };
}

async function aggregateExerciseData(userId: string): Promise<ExerciseDataSnapshot> {
  // Get fitness goals
  const { data: fitnessGoals } = await supabase
    .from('fitness_goals')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get recent exercise entries (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: exerciseEntries } = await supabase
    .from('exercise_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('logged_date', { ascending: false });

  // Get current weekly plan if exists
  const { data: currentPlan } = await supabase
    .from('weekly_exercise_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  // Analyze exercise patterns
  const patterns = analyzeExercisePatterns(exerciseEntries || [], currentPlan);

  return {
    current_fitness_level: fitnessGoals?.experience_level || 'beginner',
    preferred_workout_types: fitnessGoals?.workout_preferences || [],
    recent_workouts: (exerciseEntries || []).map((entry) => ({
      date: entry.logged_date,
      exercise_name: entry.exercise_name,
      exercise_type: entry.exercise_type,
      duration_minutes: entry.duration_minutes,
      intensity: entry.intensity,
      calories_burned: entry.calories_burned,
      completed: true, // All logged entries are completed
    })),
    workout_patterns: patterns,
    fitness_goals: {
      primary_goal: fitnessGoals?.primary_goal || 'general_fitness',
      weekly_workout_target: fitnessGoals?.weekly_workouts || 3,
      activity_level: fitnessGoals?.activity_level || 'moderately_active',
    },
  };
}

async function aggregateNutritionData(userId: string): Promise<NutritionDataSnapshot> {
  // Get nutrition goals
  const { data: nutritionGoals } = await supabase
    .from('nutrition_goals')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get recent meal entries (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: mealEntries } = await supabase
    .from('meal_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('logged_date', { ascending: false });

  // Get water intake data
  const { data: waterEntries } = await supabase
    .from('daily_water_intake')
    .select('*')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // Analyze nutrition patterns
  const patterns = analyzeNutritionPatterns(mealEntries || [], waterEntries || []);

  return {
    nutrition_goals: {
      daily_calories: nutritionGoals?.daily_calories || 2000,
      daily_protein: nutritionGoals?.daily_protein || 120,
      daily_carbs: nutritionGoals?.daily_carbs || 200,
      daily_fat: nutritionGoals?.daily_fat || 65,
      daily_water: nutritionGoals?.daily_water || 2000,
    },
    recent_meals: (mealEntries || []).slice(0, 21).map((meal) => ({
      date: meal.logged_date,
      meal_type: meal.meal_type,
      total_calories: meal.total_calories,
      total_protein: meal.total_protein,
      total_carbs: meal.total_carbs,
      total_fat: meal.total_fat,
      logged_time: meal.logged_time,
    })),
    eating_patterns: patterns.eating_patterns,
    dietary_preferences: {
      restrictions: nutritionGoals?.dietary_restrictions || [],
      health_conditions: nutritionGoals?.health_conditions || [],
      meal_preferences: [], // Could be derived from meal frequency
    },
  };
}

async function aggregateUserPreferences(userId: string): Promise<UserPreferences> {
  // Get user account info
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get AI preferences if they exist
  const { data: aiPrefs } = await supabase
    .from('user_ai_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    timezone: 'UTC', // Default, could be improved
    preferred_workout_time: 'flexible', // Could be derived from exercise logs
    notification_preferences: {
      workout_reminders: true,
      meal_reminders: true,
      cycle_insights: true,
    },
    ai_coaching_style: aiPrefs?.coaching_style || 'supportive',
    focus_areas: ['energy_management', 'fitness_goals'], // Default priorities
  };
}

// Helper functions for pattern analysis
function calculateCurrentCyclePhase(cycleSettings: any, periodLogs: any[]) {
  if (!cycleSettings?.last_period_date) {
    return {
      phase: 'unknown' as const,
      day_in_cycle: 0,
      energy_level: 'moderate' as const,
      days_remaining_in_phase: 0,
    };
  }

  const today = new Date();
  const lastPeriod = new Date(cycleSettings.last_period_date);
  const daysSinceLastPeriod = Math.floor(
    (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
  );

  const cycleLength = cycleSettings.cycle_length || 28;
  const periodLength = cycleSettings.period_length || 5;
  const dayInCycle = (daysSinceLastPeriod % cycleLength) + 1;

  let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  let energy_level: 'low' | 'building' | 'high' | 'declining';
  let days_remaining: number;

  if (dayInCycle <= periodLength) {
    phase = 'menstrual';
    energy_level = 'low';
    days_remaining = periodLength - dayInCycle + 1;
  } else if (dayInCycle <= 13) {
    phase = 'follicular';
    energy_level = 'building';
    days_remaining = 13 - dayInCycle + 1;
  } else if (dayInCycle <= 16) {
    phase = 'ovulatory';
    energy_level = 'high';
    days_remaining = 16 - dayInCycle + 1;
  } else {
    phase = 'luteal';
    energy_level = 'declining';
    days_remaining = cycleLength - dayInCycle + 1;
  }

  return {
    phase,
    day_in_cycle: dayInCycle,
    energy_level,
    days_remaining_in_phase: days_remaining,
  };
}

function analyzeCyclePatterns(periodLogs: any[], cycleSettings: any) {
  // Simplified pattern analysis
  return {
    typical_energy_by_phase: {
      menstrual: 'low' as const,
      follicular: 'building' as const,
      ovulatory: 'high' as const,
      luteal: 'declining' as const,
    },
    common_symptoms_by_phase: {
      menstrual: ['cramps', 'fatigue'],
      follicular: ['increased energy'],
      ovulatory: ['mood boost'],
      luteal: ['bloating', 'mood changes'],
    },
    cycle_consistency: periodLogs.length > 6 ? ('regular' as const) : ('unknown' as const),
  };
}

function analyzeExercisePatterns(exerciseEntries: any[], currentPlan: any) {
  const totalWorkouts = exerciseEntries.length;
  const completionRate = totalWorkouts > 0 ? 1.0 : 0; // All logged entries are completed

  return {
    most_active_days: ['Monday', 'Wednesday', 'Friday'], // Default
    preferred_duration:
      exerciseEntries.length > 0
        ? Math.round(
            exerciseEntries.reduce((sum: number, entry: any) => sum + entry.duration_minutes, 0) /
              totalWorkouts
          )
        : 30,
    completion_rate: completionRate,
    performance_by_cycle_phase: {
      menstrual: {
        completion_rate: 0.7,
        avg_intensity: 'low' as const,
        preferred_exercises: ['yoga', 'walking'],
      },
      follicular: {
        completion_rate: 0.9,
        avg_intensity: 'moderate' as const,
        preferred_exercises: ['cardio', 'strength'],
      },
      ovulatory: {
        completion_rate: 0.95,
        avg_intensity: 'high' as const,
        preferred_exercises: ['HIIT', 'running'],
      },
      luteal: {
        completion_rate: 0.8,
        avg_intensity: 'moderate' as const,
        preferred_exercises: ['strength', 'yoga'],
      },
    },
  };
}

function analyzeNutritionPatterns(mealEntries: any[], waterEntries: any[]) {
  const avgMealsPerDay = mealEntries.length > 0 ? mealEntries.length / 7 : 3; // Estimate based on week

  return {
    eating_patterns: {
      meal_frequency: Math.round(avgMealsPerDay),
      hydration_consistency: waterEntries.length > 7 ? 0.8 : 0.5,
      macro_balance_consistency: 0.7, // Default
      meal_timing_patterns: {
        breakfast: '07:30',
        lunch: '12:30',
        dinner: '18:30',
      },
      nutrition_by_cycle_phase: {
        menstrual: {
          avg_calories: 1800,
          cravings: ['chocolate', 'comfort foods'],
          hydration_level: 'moderate' as const,
        },
        follicular: {
          avg_calories: 1900,
          cravings: ['fresh foods'],
          hydration_level: 'high' as const,
        },
        ovulatory: { avg_calories: 2000, cravings: ['protein'], hydration_level: 'high' as const },
        luteal: {
          avg_calories: 2100,
          cravings: ['carbs', 'sweets'],
          hydration_level: 'moderate' as const,
        },
      },
    },
  };
}
