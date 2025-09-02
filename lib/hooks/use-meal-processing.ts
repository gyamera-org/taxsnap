import { useMemo } from 'react';

export function useMealProcessing(dailySummary: any) {
  const processedMeals = useMemo(() => {
    if (!dailySummary) return [];

    return Object.values(dailySummary.meals_by_type)
      .flat()
      .map((meal: any) => {
        // Debug logging for meal analysis status
        if (
          meal.analysis_status ||
          meal.food_items.some((item: any) => item.food.name.includes('analyzing'))
        ) {
          if (
            meal.analysis_status === 'completed' &&
            meal.food_items.some((item: any) => item.food.name.includes('analyzing')) &&
            meal.total_calories === 0
          ) {
            console.warn(
              '🚨 Found broken completed meal:',
              meal.id,
              '- should be cleaned up manually'
            );
          }
        }

        const isAnalyzingMeal =
          meal.analysis_status === 'analyzing' ||
          meal.food_items.some(
            (item: any) =>
              item.food.name === 'AI analyzing your food...' ||
              item.food.name === 'Analyzing food...' ||
              item.food.brand === 'AI Scanning' ||
              item.food.category === 'scanning'
          );

        const isPendingMeal = meal.notes?.includes('AI scan') && !meal.confirmed;

        // Get confidence from AI scanned items
        const confidenceItem = meal.food_items.find(
          (item: any) => item.food.confidence && item.food.confidence > 0
        );
        const confidence = confidenceItem ? confidenceItem.food.confidence : undefined;

        return {
          // Meal summary data for the list view
          id: meal.id,
          type: meal.meal_type,
          name:
            meal.food_items.length > 1
              ? `${meal.food_items[0].food.name} + ${meal.food_items.length - 1} more`
              : meal.food_items[0]?.food.name || 'Mixed meal',
          calories: Math.round(meal.total_calories),
          protein: Math.round(meal.total_protein),
          carbs: Math.round(meal.total_carbs),
          fat: Math.round(meal.total_fat),
          time: meal.logged_time.slice(0, 5), // HH:mm format
          fullTime: meal.logged_time, // Keep full time for sorting
          image_url: meal.image_url || meal.food_items[0]?.food?.image_url,
          // Legacy properties for backwards compatibility
          isAnalyzing: isAnalyzingMeal,
          isPending: isPendingMeal,
          confidence: confidence,
          // New analysis status properties
          analysis_status: meal.analysis_status,
          analysis_progress: meal.analysis_progress,
          analysis_stage: meal.analysis_stage,
          // Full meal data for modals
          food_items: meal.food_items,
          notes: meal.notes,
          meal_type: meal.meal_type,
          logged_date: meal.logged_date,
          logged_time: meal.logged_time,
        };
      })
      .sort((a, b) => b.fullTime.localeCompare(a.fullTime));
  }, [dailySummary]);

  return processedMeals;
}
