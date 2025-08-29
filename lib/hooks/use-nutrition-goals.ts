import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export interface NutritionGoals {
  id: string;
  user_id: string;
  primary_goal: string;
  activity_level: string;
  tracking_experience: string;
  // Calculated nutrition values
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  water_ml?: number;
  health_score?: number;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  weight_recommendation?: string;
  recommendations?: string | string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateNutritionGoalsData {
  primary_goal?: string;
  activity_level?: string;
  tracking_experience?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  water_ml?: number;
  health_score?: number;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  weight_recommendation?: string;
  recommendations?: string | string[];
}

/**
 * Hook to get user's nutrition goals
 */
export function useNutritionGoals() {
  return useQuery({
    queryKey: queryKeys.settings.nutritionGoals(),
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as NutritionGoals | null;
    },
  });
}

/**
 * Hook to update nutrition goals
 */
export function useUpdateNutritionGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (goalsData: UpdateNutritionGoalsData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // First check if user already has nutrition goals
      const { data: existingGoals } = await supabase
        .from('nutrition_goals')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      let data, error;

      if (existingGoals) {
        // Update existing goals
        const result = await supabase
          .from('nutrition_goals')
          .update({
            primary_goal: goalsData.primary_goal,
            activity_level: goalsData.activity_level,
            tracking_experience: goalsData.tracking_experience,
            calories: goalsData.calories,
            protein: goalsData.protein,
            carbs: goalsData.carbs,
            fat: goalsData.fat,
            water_ml: goalsData.water_ml,
            health_score: goalsData.health_score,
            bmi: goalsData.bmi,
            bmr: goalsData.bmr,
            tdee: goalsData.tdee,
            weight_recommendation: goalsData.weight_recommendation,
            recommendations: goalsData.recommendations,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.user.id)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Create new goals
        const result = await supabase
          .from('nutrition_goals')
          .insert({
            user_id: user.user.id,
            primary_goal: goalsData.primary_goal,
            activity_level: goalsData.activity_level,
            tracking_experience: goalsData.tracking_experience,
            calories: goalsData.calories,
            protein: goalsData.protein,
            carbs: goalsData.carbs,
            fat: goalsData.fat,
            water_ml: goalsData.water_ml,
            health_score: goalsData.health_score,
            bmi: goalsData.bmi,
            bmr: goalsData.bmr,
            tdee: goalsData.tdee,
            weight_recommendation: goalsData.weight_recommendation,
            recommendations: goalsData.recommendations,
          })
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.nutritionGoals() });
    },
    onError: (err: any) => handleError(err, 'Failed to update nutrition goals'),
  });
}

/**
 * Hook to delete nutrition goals
 */
export function useDeleteNutritionGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('delete_nutrition_goals');
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.nutritionGoals() });
    },
    onError: (err: any) => handleError(err, 'Failed to delete nutrition goals'),
  });
}
