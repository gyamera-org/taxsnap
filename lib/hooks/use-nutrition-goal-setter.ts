import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export interface NutritionGoalRequest {
  primary_goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
  tracking_experience: 'beginner' | 'intermediate' | 'advanced';
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'female' | 'male';
}

export interface NutritionGoalResponse {
  success: boolean;
  nutrition_goals: {
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
  };
  message: string;
}

/**
 * Hook to calculate and set nutrition goals using Edge function
 */
export function useNutritionGoalSetter() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (goalData: NutritionGoalRequest) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('nutrition-goal-setter', {
        body: goalData,
      });

      if (error) throw error;
      return data as NutritionGoalResponse;
    },
    onSuccess: () => {
      // Invalidate nutrition goals query to refetch updated data
      qc.invalidateQueries({ queryKey: queryKeys.settings.nutritionGoals() });
    },
    onError: (err: any) => handleError(err, 'Failed to calculate nutrition goals'),
  });
}
