import { useState, useCallback } from 'react';
import { useUpdateMealNutrition } from '@/lib/hooks/use-meal-editing';
import { useDeleteMealEntry } from '@/lib/hooks/use-meal-tracking';
import { toast } from 'sonner-native';

export function useMealActions() {
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [viewingAnalyzedFood, setViewingAnalyzedFood] = useState<any>(null);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  const updateMealNutrition = useUpdateMealNutrition();
  const deleteMealEntry = useDeleteMealEntry();

  const handleMealEdit = useCallback((meal: any) => {
    const isAIAnalyzed =
      meal.confidence ||
      (meal.notes && meal.notes.includes('AI scan')) ||
      meal.analysis_status === 'completed';

    if (isAIAnalyzed) {
      setViewingAnalyzedFood(meal);
    } else {
      setEditingMeal(meal);
    }
  }, []);

  const handleMealSave = useCallback(
    async (mealId: string, updates: any) => {
      await updateMealNutrition.mutateAsync({
        mealId,
        nutrition: updates,
      });
    },
    [updateMealNutrition]
  );

  const handleMealDelete = useCallback(
    async (mealId: string) => {
      await deleteMealEntry.mutateAsync(mealId);
    },
    [deleteMealEntry]
  );

  const handleSavePendingFood = useCallback(() => {
    setForceUpdateKey((prev) => prev + 1);
  }, []);

  const handleDiscardPendingFood = useCallback(
    async (meal: any) => {
      try {
        await deleteMealEntry.mutateAsync(meal.id);
      } catch (error) {
        console.error('Failed to discard food:', error);
        toast.error('Failed to discard food');
      }
    },
    [deleteMealEntry]
  );

  const forceUpdate = useCallback(() => {
    setForceUpdateKey((prev) => prev + 1);
  }, []);

  return {
    // State
    editingMeal,
    viewingAnalyzedFood,
    forceUpdateKey,
    // Actions
    handleMealEdit,
    handleMealSave,
    handleMealDelete,
    handleSavePendingFood,
    handleDiscardPendingFood,
    forceUpdate,
    // Setters
    setEditingMeal,
    setViewingAnalyzedFood,
  };
}
