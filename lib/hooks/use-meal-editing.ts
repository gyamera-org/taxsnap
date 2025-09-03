import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner-native';

export interface UpdateMealNutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Hook to update meal nutrition values directly
 * This is useful for quick edits without modifying food_items
 */
export function useUpdateMealNutrition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mealId,
      nutrition,
    }: {
      mealId: string;
      nutrition: UpdateMealNutritionData;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('meal_entries')
        .update({
          total_calories: nutrition.calories,
          total_protein: nutrition.protein,
          total_carbs: nutrition.carbs,
          total_fat: nutrition.fat,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mealId)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      // Immediately invalidate the core queries to ensure instant UI update
      try {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.mealEntries],
        });

        // Also force refetch to bypass any caching issues
        queryClient.refetchQueries({
          queryKey: [...queryKeys.logs.mealEntries],
        });

        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.dailyNutrition],
        });

        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.nutritionProgress],
        });

        queryClient.invalidateQueries({
          queryKey: [...queryKeys.settings.nutritionGoals],
        });

        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.nutritionStreak],
        });

        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.loggedDates],
        });
      } catch (error) {
        console.error('🔴 useUpdateMealNutrition: Error during query invalidation:', error);
      }
    },
    onError: (error) => {
      console.error('Failed to update meal nutrition:', error);
      toast.error('Failed to update meal');
    },
  });
}
