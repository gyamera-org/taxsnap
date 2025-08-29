import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { queryKeys } from './query-keys';

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

interface FoodAnalysis {
  food_name: string;
  brand?: string;
  category: string;
  serving_size: string;
  nutrition: NutritionInfo;
  confidence: number;
  description: string;
}

interface ScanFoodRequest {
  image_base64?: string;
  barcode?: string;
  context?: string;
  meal_type?: string;
  auto_save?: boolean;
}

interface ScanFoodResponse {
  success: boolean;
  analysis: FoodAnalysis;
  meal_entry_id?: string;
  auto_saved?: boolean;
}

export function useScanFood() {
  const queryClient = useQueryClient();

  return useMutation<ScanFoodResponse, Error, ScanFoodRequest>({
    mutationFn: async ({ image_base64, barcode, context, meal_type, auto_save }) => {
      // Get current user for auto-save functionality
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke('ai-food-scanner', {
        body: {
          image_base64,
          barcode,
          context,
          meal_type,
          user_id: user?.id,
          auto_save,
        },
      });

      if (error) {
        console.error('❌ Food scanner error:', error);
        throw new Error(error.message || 'Failed to scan food');
      }

      const response = data as ScanFoodResponse;

      if (!response.success || !response.analysis) {
        throw new Error('Invalid response from food scanner');
      }

      return response;
    },
    onSuccess: (response) => {
      // If meal was auto-saved, invalidate nutrition queries so the UI updates
      if (response.auto_saved) {
        console.log('🔄 Invalidating nutrition queries after auto-save');
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.mealEntries],
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.dailyNutrition],
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.nutritionProgress],
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.nutritionStreak],
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.loggedDates],
        });
      }
    },
    // Remove automatic toasts - let component handle them for better control
  });
}
