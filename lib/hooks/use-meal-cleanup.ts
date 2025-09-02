import { useCallback } from 'react';
import { useDeleteMealEntry } from '@/lib/hooks/use-meal-tracking';
import { toast } from 'sonner-native';

export function useMealCleanup() {
  const deleteMealEntry = useDeleteMealEntry();

  const cleanupStuckAnalyzingMeals = useCallback(
    async (dailySummary: any) => {
      if (!dailySummary) return;

      console.log('🧹 Checking for stuck analyzing meals...');
      const allMeals = Object.values(dailySummary.meals_by_type).flat();
      const stuckAnalyzingMeals = allMeals.filter((meal: any) => {
        const isAnalyzing = meal.food_items.some(
          (item: any) =>
            item.food.name === 'AI analyzing your food...' ||
            item.food.name === 'Analyzing food...' ||
            item.food.brand === 'AI Scanning' ||
            item.food.category === 'scanning'
        );

        // Consider a meal "stuck" if it's been analyzing for more than 5 minutes
        const createdAt = new Date(meal.created_at);
        const now = new Date();
        const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        return isAnalyzing && minutesElapsed > 5;
      });

      if (stuckAnalyzingMeals.length > 0) {
        console.log(
          `🚨 Found ${stuckAnalyzingMeals.length} stuck analyzing meals:`,
          stuckAnalyzingMeals.map((m: any) => m.id)
        );

        for (const meal of stuckAnalyzingMeals) {
          try {
            console.log(`🗑️ Deleting stuck analyzing meal: ${meal.id}`);
            await deleteMealEntry.mutateAsync(meal.id);
            console.log(`✅ Deleted stuck meal: ${meal.id}`);
          } catch (error) {
            console.error(`❌ Failed to delete stuck meal ${meal.id}:`, error);
          }
        }

        toast.success(
          `Cleaned up ${stuckAnalyzingMeals.length} stuck analyzing meal${stuckAnalyzingMeals.length > 1 ? 's' : ''}`
        );
      } else {
        console.log('✅ No stuck analyzing meals found');
      }
    },
    [deleteMealEntry]
  );

  return {
    cleanupStuckAnalyzingMeals,
  };
}
