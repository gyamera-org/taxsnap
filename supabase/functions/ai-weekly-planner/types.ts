// AI Weekly Planner Types
// Simplified interfaces for the AI system (no beauty products)

export interface UserDataSnapshot {
  user_id: string;
  cycle_data: CycleDataSnapshot;
  exercise_data: ExerciseDataSnapshot;
  nutrition_data: NutritionDataSnapshot;
  user_preferences: UserPreferences;
}

export interface CycleDataSnapshot {
  current_phase: {
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
    day_in_cycle: number;
    energy_level: 'low' | 'building' | 'high' | 'declining';
    days_remaining_in_phase: number;
  };
  cycle_settings: {
    cycle_length: number;
    period_length: number;
    last_period_date: string | null;
  };
  recent_logs: Array<{
    date: string;
    mood?: 'happy' | 'normal' | 'sad' | 'irritable' | 'anxious';
    flow_intensity?: 'light' | 'moderate' | 'heavy';
    symptoms?: string[];
    energy_reported?: 'low' | 'moderate' | 'high';
  }>;
  cycle_patterns: {
    typical_energy_by_phase: Record<string, 'low' | 'moderate' | 'high'>;
    common_symptoms_by_phase: Record<string, string[]>;
    cycle_consistency: 'regular' | 'irregular' | 'unknown';
  };
}

export interface ExerciseDataSnapshot {
  current_fitness_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_workout_types: string[];
  recent_workouts: Array<{
    date: string;
    exercise_name: string;
    exercise_type: string;
    duration_minutes: number;
    intensity: 'low' | 'moderate' | 'high';
    calories_burned: number;
    completed: boolean;
  }>;
  workout_patterns: {
    most_active_days: string[]; // ['Monday', 'Wednesday', 'Friday']
    preferred_duration: number; // average minutes
    completion_rate: number; // 0-1
    performance_by_cycle_phase: Record<
      string,
      {
        completion_rate: number;
        avg_intensity: 'low' | 'moderate' | 'high';
        preferred_exercises: string[];
      }
    >;
  };
  fitness_goals: {
    primary_goal: 'lose_weight' | 'build_muscle' | 'improve_endurance' | 'general_fitness';
    weekly_workout_target: number;
    activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  };
}

export interface NutritionDataSnapshot {
  nutrition_goals: {
    daily_calories: number;
    daily_protein: number;
    daily_carbs: number;
    daily_fat: number;
    daily_water: number; // ml
  };
  recent_meals: Array<{
    date: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    logged_time: string;
  }>;
  eating_patterns: {
    meal_frequency: number; // meals per day
    hydration_consistency: number; // 0-1
    macro_balance_consistency: number; // 0-1
    meal_timing_patterns: Record<string, string>; // {'breakfast': '07:30', 'lunch': '12:30'}
    nutrition_by_cycle_phase: Record<
      string,
      {
        avg_calories: number;
        cravings: string[];
        hydration_level: 'low' | 'moderate' | 'high';
      }
    >;
  };
  dietary_preferences: {
    restrictions: string[];
    health_conditions: string[];
    meal_preferences: string[];
  };
}

export interface UserPreferences {
  timezone: string;
  preferred_workout_time: 'morning' | 'afternoon' | 'evening' | 'flexible';
  notification_preferences: {
    workout_reminders: boolean;
    meal_reminders: boolean;
    cycle_insights: boolean;
  };
  ai_coaching_style: 'supportive' | 'motivational' | 'scientific' | 'casual';
  focus_areas: string[]; // ['energy_management', 'symptom_relief', 'fitness_goals']
}

// AI Generated Plans
export interface AIWeeklyPlan {
  plan_id: string;
  user_id: string;
  week_start_date: string;
  generation_context: {
    cycle_phase_at_generation: string;
    predicted_phases: Array<{
      date: string;
      phase: string;
      energy_level: string;
    }>;
    user_goals_considered: string[];
    ai_model_used: string;
    generation_timestamp: string;
  };
  exercise_plan: AIExercisePlan;
  nutrition_plan: AINutritionPlan;
  daily_insights: AIDailyInsight[];
  adaptation_triggers: AIAdaptationTrigger[];
  success_metrics: {
    target_workout_completion: number;
    target_nutrition_adherence: number;
    predicted_energy_correlation: number;
  };
}

export interface AIExercisePlan {
  weekly_overview: {
    total_workouts: number;
    total_minutes: number;
    focus_areas: string[];
    cycle_adaptations: string[];
  };
  daily_workouts: Array<{
    date: string;
    is_rest_day: boolean;
    workout_type: string;
    duration_minutes: number;
    intensity: 'low' | 'moderate' | 'high';
    cycle_optimization: string;
    exercises: Array<{
      name: string;
      category: string;
      duration_minutes: number;
      sets?: number;
      reps?: string;
      instructions: string;
      cycle_benefit: string;
    }>;
    alternative_options: string[];
  }>;
}

export interface AINutritionPlan {
  weekly_overview: {
    calorie_distribution: Record<string, number>; // by day
    macro_focus_by_phase: Record<string, string[]>;
    hydration_goals: Record<string, number>;
    cycle_nutrition_priorities: string[];
  };
  daily_nutrition: Array<{
    date: string;
    calorie_target: number;
    macro_targets: {
      protein: number;
      carbs: number;
      fat: number;
    };
    hydration_goal: number;
    cycle_specific_nutrients: string[];
    meal_timing_suggestions: Record<string, string>;
    energy_support_foods: string[];
    foods_to_emphasize: string[];
    foods_to_minimize: string[];
  }>;
}

export interface AIDailyInsight {
  date: string;
  cycle_day: number;
  predicted_energy: 'low' | 'moderate' | 'high';
  key_insights: string[];
  workout_recommendations: string[];
  nutrition_focus: string[];
  energy_management_tips: string[];
  symptom_prevention: string[];
  motivation_message: string;
}

export interface AIAdaptationTrigger {
  trigger_type: 'symptom_report' | 'energy_change' | 'workout_skip' | 'cycle_phase_change';
  condition: string;
  adaptation_instructions: string;
  priority: 'low' | 'medium' | 'high';
}

// API Response Types
export interface AIWeeklyPlanResponse {
  success: boolean;
  plan: AIWeeklyPlan;
  cost_estimate: number;
  generation_time_ms: number;
  cached: boolean;
}

export interface AIInsightResponse {
  success: boolean;
  insights: AIDailyInsight;
  cost_estimate: number;
  generation_time_ms: number;
  cached: boolean;
}

export interface AIAdaptationResponse {
  success: boolean;
  adapted_plan: Partial<AIWeeklyPlan>;
  adaptation_reason: string;
  changes_made: string[];
  cost_estimate: number;
}
