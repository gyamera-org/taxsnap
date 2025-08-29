import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useMealEntries } from './use-meal-tracking';
import { useWaterEntries } from './use-water-tracking';
import { useNutritionGoals } from './use-nutrition-goals';
import {
  DailyNutritionSummary,
  NutritionProgress,
  MealEntry,
  WaterEntry,
} from '@/lib/types/nutrition-tracking';

/**
 * Get optimal cache time for summary data
 */
function getStaleTimeForSummary(date: string): number {
  const today = new Date().toISOString().split('T')[0];
  const targetDate = new Date(date + 'T00:00:00').getTime();
  const todayTime = new Date(today + 'T00:00:00').getTime();

  if (targetDate < todayTime) {
    // Historical summary - cache for 24 hours (data won't change)
    return 24 * 60 * 60 * 1000;
  } else if (targetDate === todayTime) {
    // Today's summary - cache for 15 minutes (derived from meal/water data)
    return 15 * 60 * 1000;
  } else {
    // Future summary - cache for 2 hours (no data expected)
    return 2 * 60 * 60 * 1000;
  }
}

/**
 * Hook to get comprehensive daily nutrition summary
 */
export function useDailyNutritionSummary(date: string) {
  const { data: mealEntries = [], isLoading: mealsLoading } = useMealEntries(date);
  const { data: waterEntries = [], isLoading: waterLoading } = useWaterEntries(date);
  const { data: nutritionGoals, isLoading: goalsLoading } = useNutritionGoals();

  return useQuery({
    queryKey: [...queryKeys.logs.dailyNutrition, date, mealEntries?.length, waterEntries?.length],
    queryFn: () => {
      if (mealsLoading || waterLoading || goalsLoading) {
        return null;
      }

      // Group meals by type
      const mealsByType = {
        breakfast: mealEntries.filter((meal) => meal.meal_type === 'breakfast'),
        lunch: mealEntries.filter((meal) => meal.meal_type === 'lunch'),
        dinner: mealEntries.filter((meal) => meal.meal_type === 'dinner'),
        snack: mealEntries.filter((meal) => meal.meal_type === 'snack'),
      };

      // Calculate daily totals
      const dailyTotals = mealEntries.reduce(
        (totals, meal) => ({
          calories: totals.calories + meal.total_calories,
          protein: totals.protein + meal.total_protein,
          carbs: totals.carbs + meal.total_carbs,
          fat: totals.fat + meal.total_fat,
          fiber: totals.fiber + meal.total_fiber,
          sugar: totals.sugar + meal.total_sugar,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
      );

      // Calculate total water intake
      const totalWaterMl = waterEntries.reduce((total, entry) => total + entry.amount_ml, 0);

      const summary: DailyNutritionSummary = {
        date,
        total_calories: dailyTotals.calories,
        total_protein: dailyTotals.protein,
        total_carbs: dailyTotals.carbs,
        total_fat: dailyTotals.fat,
        total_fiber: dailyTotals.fiber,
        total_sugar: dailyTotals.sugar,
        total_water_ml: totalWaterMl,
        meal_count: mealEntries.length,
        water_entries_count: waterEntries.length,
        meals_by_type: mealsByType,
        water_entries: waterEntries,
      };

      return summary;
    },
    enabled: !mealsLoading && !waterLoading && !goalsLoading,
    staleTime: getStaleTimeForSummary(date),
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
}

/**
 * Hook to get nutrition progress vs goals
 */
export function useNutritionProgress(date: string) {
  const { data: dailySummary } = useDailyNutritionSummary(date);
  const { data: nutritionGoals } = useNutritionGoals();

  return useQuery({
    queryKey: [
      ...queryKeys.logs.nutritionProgress,
      date,
      dailySummary?.total_calories,
      nutritionGoals?.calories,
    ],
    queryFn: (): NutritionProgress | null => {
      if (!dailySummary || !nutritionGoals) return null;

      const progress: NutritionProgress = {
        calories: {
          consumed: dailySummary.total_calories,
          goal: nutritionGoals.calories || 2000,
          remaining: Math.max(0, (nutritionGoals.calories || 2000) - dailySummary.total_calories),
          percentage: Math.min(
            100,
            (dailySummary.total_calories / (nutritionGoals.calories || 2000)) * 100
          ),
        },
        protein: {
          consumed: dailySummary.total_protein,
          goal: nutritionGoals.protein || 150,
          remaining: Math.max(0, (nutritionGoals.protein || 150) - dailySummary.total_protein),
          percentage: Math.min(
            100,
            (dailySummary.total_protein / (nutritionGoals.protein || 150)) * 100
          ),
        },
        carbs: {
          consumed: dailySummary.total_carbs,
          goal: nutritionGoals.carbs || 250,
          remaining: Math.max(0, (nutritionGoals.carbs || 250) - dailySummary.total_carbs),
          percentage: Math.min(
            100,
            (dailySummary.total_carbs / (nutritionGoals.carbs || 250)) * 100
          ),
        },
        fat: {
          consumed: dailySummary.total_fat,
          goal: nutritionGoals.fat || 67,
          remaining: Math.max(0, (nutritionGoals.fat || 67) - dailySummary.total_fat),
          percentage: Math.min(100, (dailySummary.total_fat / (nutritionGoals.fat || 67)) * 100),
        },
        water: {
          consumed: dailySummary.total_water_ml,
          goal: nutritionGoals.water_ml || 2000,
          remaining: Math.max(0, (nutritionGoals.water_ml || 2000) - dailySummary.total_water_ml),
          percentage: Math.min(
            100,
            (dailySummary.total_water_ml / (nutritionGoals.water_ml || 2000)) * 100
          ),
        },
      };

      return progress;
    },
    enabled: !!dailySummary && !!nutritionGoals,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get weekly nutrition summary
 */
export function useWeeklyNutritionSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.weeklyNutrition, startDate, endDate],
    queryFn: async () => {
      // This would require fetching multiple days of data
      // For now, we'll return a placeholder structure
      const weekSummary = {
        averageCalories: 0,
        averageProtein: 0,
        averageCarbs: 0,
        averageFat: 0,
        averageWater: 0,
        totalMeals: 0,
        daysWithGoalsReached: 0,
        dailySummaries: [] as DailyNutritionSummary[],
      };

      return weekSummary;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Helper function to group entries by date
 */
export function groupEntriesByDate<T extends { logged_date: string }>(entries: T[]) {
  return entries.reduce(
    (groups, entry) => {
      const date = entry.logged_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Helper function to format nutrition values for display
 */
export function formatNutritionValue(value: number, unit: string, decimals: number = 1): string {
  if (unit === 'ml' || unit === 'g') {
    return `${Math.round(value)}${unit}`;
  }
  if (unit === 'cal') {
    return `${Math.round(value)} ${unit}`;
  }
  return `${value.toFixed(decimals)}${unit}`;
}

/**
 * Helper function to get nutrition goal status
 */
export function getNutritionGoalStatus(consumed: number, goal: number): 'low' | 'good' | 'over' {
  const percentage = (consumed / goal) * 100;
  if (percentage < 80) return 'low';
  if (percentage <= 110) return 'good';
  return 'over';
}
