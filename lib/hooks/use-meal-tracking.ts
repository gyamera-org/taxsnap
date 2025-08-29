import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner-native';
import {
  MealEntry,
  CreateMealEntryData,
  DailyNutritionSummary,
  FoodItemWithQuantity,
} from '@/lib/types/nutrition-tracking';

/**
 * Get optimal cache time based on date
 */
function getStaleTimeForDate(date: string): number {
  const today = new Date().toISOString().split('T')[0];
  const targetDate = new Date(date + 'T00:00:00').getTime();
  const todayTime = new Date(today + 'T00:00:00').getTime();

  if (targetDate < todayTime) {
    // Historical data - cache for 24 hours (rarely changes)
    return 24 * 60 * 60 * 1000;
  } else if (targetDate === todayTime) {
    // Today's data - cache for 10 minutes (might change)
    return 10 * 60 * 1000;
  } else {
    // Future data - cache for 1 hour (shouldn't exist)
    return 60 * 60 * 1000;
  }
}

/**
 * Hook to get meal entries for a specific date
 */
export function useMealEntries(date: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.mealEntries, date],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('logged_date', date)
        .order('logged_time', { ascending: false });

      if (error) throw error;
      return data as MealEntry[];
    },
    staleTime: getStaleTimeForDate(date),
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
}

/**
 * Hook to get meal entries for a date range
 */
export function useMealEntriesRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.mealEntries, 'range', startDate, endDate],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('logged_date', startDate)
        .lte('logged_date', endDate)
        .order('logged_date', { ascending: false })
        .order('logged_time', { ascending: false });

      if (error) throw error;
      return data as MealEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new meal entry
 */
export function useCreateMealEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMealEntryData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Calculate nutrition totals
      const totals = calculateNutritionTotals(data.food_items);

      const { data: result, error } = await supabase
        .from('meal_entries')
        .insert({
          user_id: user.user.id,
          meal_type: data.meal_type,
          food_items: data.food_items,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fat: totals.fat,
          total_fiber: totals.fiber,
          total_sugar: totals.sugar,
          notes: data.notes,
          logged_date: data.logged_date || new Date().toISOString().split('T')[0],
          logged_time: data.logged_time || new Date().toTimeString().split(' ')[0],
        })
        .select()
        .single();

      if (error) throw error;

      // Handle community contribution if requested
      if (data.share_with_community) {
        try {
          // Submit foods for community review
          await supabase.functions.invoke('ai-food-moderator', {
            body: {
              meal_entry_id: result.id,
              food_items: data.food_items,
              user_id: user.user.id,
            },
          });
        } catch (moderationError) {
          console.error('Failed to submit for community review:', moderationError);
          // Don't fail the meal creation if moderation fails
        }
      }

      return result as MealEntry;
    },
    onSuccess: (data) => {
      // Invalidate all nutrition-related queries to ensure fresh data
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
    },
    onError: (error) => {
      console.error('Failed to create meal entry:', error);
      toast.error('Failed to log meal');
    },
  });
}

/**
 * Hook to update a meal entry
 */
export function useUpdateMealEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateMealEntryData> }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const updateData: any = {};

      if (data.food_items) {
        const totals = calculateNutritionTotals(data.food_items);
        updateData.food_items = data.food_items;
        updateData.total_calories = totals.calories;
        updateData.total_protein = totals.protein;
        updateData.total_carbs = totals.carbs;
        updateData.total_fat = totals.fat;
        updateData.total_fiber = totals.fiber;
        updateData.total_sugar = totals.sugar;
      }

      if (data.meal_type) updateData.meal_type = data.meal_type;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.logged_date) updateData.logged_date = data.logged_date;
      if (data.logged_time) updateData.logged_time = data.logged_time;

      const { data: result, error } = await supabase
        .from('meal_entries')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return result as MealEntry;
    },
    onSuccess: () => {
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
    },
    onError: (error) => {
      console.error('Failed to update meal entry:', error);
      toast.error('Failed to update meal');
    },
  });
}

/**
 * Hook to delete a meal entry
 */
export function useDeleteMealEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('meal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
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
    },
    onError: (error) => {
      console.error('Failed to delete meal entry:', error);
      toast.error('Failed to delete meal');
    },
  });
}

/**
 * Helper function to calculate nutrition totals
 */
function calculateNutritionTotals(foodItems: FoodItemWithQuantity[]) {
  return foodItems.reduce(
    (totals, item) => ({
      calories: totals.calories + item.food.nutrition.calories * item.quantity,
      protein: totals.protein + item.food.nutrition.protein * item.quantity,
      carbs: totals.carbs + item.food.nutrition.carbs * item.quantity,
      fat: totals.fat + item.food.nutrition.fat * item.quantity,
      fiber: totals.fiber + (item.food.nutrition.fiber || 0) * item.quantity,
      sugar: totals.sugar + (item.food.nutrition.sugar || 0) * item.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );
}

/**
 * Hook to subscribe to real-time meal entry updates
 */
export function useMealEntriesRealtime(onMealEntryChange?: () => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const channelName = `meal_entries_user_${user.id}`;

      const subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'meal_entries',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            queryClient.invalidateQueries({
              queryKey: [...queryKeys.logs.mealEntries],
            });
            queryClient.invalidateQueries({
              queryKey: [...queryKeys.logs.dailyNutrition],
            });
            queryClient.invalidateQueries({
              queryKey: [...queryKeys.logs.nutritionProgress],
            });

            // Trigger force update callback immediately
            if (onMealEntryChange) {
              onMealEntryChange();
            }
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('🔴 ❌ Subscription error:', err);
          }

          switch (status) {
            case 'SUBSCRIBED':
              break;
            case 'CHANNEL_ERROR':
              // console.error('🔴 ❌ Channel error detected');
              break;
            case 'TIMED_OUT':
              // console.error('🔴 ⏰ Subscription timed out');
              break;
            case 'CLOSED':
              break;
            default:
          }
        });

      return () => {
        subscription.unsubscribe();
      };
    };

    setupRealtimeSubscription();
  }, [queryClient]);
}
