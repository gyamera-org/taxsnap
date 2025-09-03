import { useState, useCallback } from 'react';
import { useUpdateMealNutrition } from '@/lib/hooks/use-meal-editing';
import { useDeleteMealEntry } from '@/lib/hooks/use-meal-tracking';
import { toast } from 'sonner-native';

export function useMealActions() {
  const [viewingMealDetails, setViewingMealDetails] = useState<any>(null); // Unified modal state
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  const updateMealNutrition = useUpdateMealNutrition();
  const deleteMealEntry = useDeleteMealEntry();

  const handleMealEdit = useCallback((meal: any) => {
    // Always show the same unified modal regardless of meal type
    setViewingMealDetails(meal);
  }, []);

  const handleMealSave = useCallback(
    async (mealId: string, updates: any) => {
      try {
        await updateMealNutrition.mutateAsync({
          mealId,
          nutrition: updates,
        });

        // Close the modal first
        setViewingMealDetails(null);

        // Force update the UI immediately since we're doing immediate invalidation in the mutation
        const newKey = forceUpdateKey + 1;

        setForceUpdateKey(newKey);
      } catch (error) {
        console.error('🔴 handleMealSave: Failed to update meal:', error);
        toast.error('Failed to update meal');
      }
    },
    [updateMealNutrition, forceUpdateKey]
  );

  const handleMealDelete = useCallback(
    async (mealId: string) => {
      try {
        await deleteMealEntry.mutateAsync(mealId);

        // Force update the UI to reflect changes immediately
        setForceUpdateKey((prev) => prev + 1);

        // Close the modal after successful delete
        setViewingMealDetails(null);
      } catch (error) {
        console.error('Failed to delete meal:', error);
        toast.error('Failed to delete meal');
      }
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

  const handleMealDone = useCallback(() => {
    // Trigger force update when user presses Done (for cases without changes)
    setForceUpdateKey((prev) => prev + 1);
  }, []);

  const handleRetryAnalysis = useCallback(
    async (meal: any) => {
      try {
        // Delete the failed meal entry
        await deleteMealEntry.mutateAsync(meal.id);

        // Force update to refresh the UI
        setForceUpdateKey((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to retry analysis:', error);
        toast.error('Failed to delete failed meal');
      }
    },
    [deleteMealEntry]
  );

  return {
    // State
    viewingMealDetails,
    forceUpdateKey,
    // Actions
    handleMealEdit,
    handleMealSave,
    handleMealDelete,
    handleMealDone,
    handleSavePendingFood,
    handleDiscardPendingFood,
    handleRetryAnalysis,
    forceUpdate,
    // Setters
    setViewingMealDetails,
    // Legacy compatibility (for gradual migration)
    editingMeal: null,
    viewingAnalyzedFood: null,
    setEditingMeal: () => {},
    setViewingAnalyzedFood: () => {},
  };
}
