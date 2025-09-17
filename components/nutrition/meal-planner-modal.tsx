import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { X, ChefHat } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { useFavoriteFoods } from '@/lib/hooks/use-favorite-foods';
import { useGenerateMealPlan } from '@/lib/hooks/use-meal-plans';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner-native';
import CuisineSelection from './meal-planner/cuisine-selection';
import PlanDurationSection from './meal-planner/plan-duration-section';
import BudgetInputSection from './meal-planner/budget-input-section';
import FoodGroupSelection from './meal-planner/food-group-selection';
import FavoriteFoodsSelection from './meal-planner/favorite-foods-selection';
import ExistingIngredientsSection from './meal-planner/existing-ingredients-section';

interface MealPlannerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMealPlanGenerated: (plan: any) => void;
  userContext?: {
    cyclePhase?: string;
    cycleDay?: number;
    symptoms?: string[];
    nutritionGoals?: any;
  };
}

export default function MealPlannerModal({
  isVisible,
  onClose,
  onMealPlanGenerated,
  userContext,
}: MealPlannerModalProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();
  const { data: favoriteFoods = [] } = useFavoriteFoods();
  const generateMealPlan = useGenerateMealPlan();

  // Form state
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [customCuisine, setCustomCuisine] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  const [selectedFoodGroups, setSelectedFoodGroups] = useState<string[]>([]);
  const [selectedFavoriteFoods, setSelectedFavoriteFoods] = useState<string[]>([]);
  const [existingIngredients, setExistingIngredients] = useState<string[]>([]);
  const [planDuration, setPlanDuration] = useState<'3_days' | '7_days' | '14_days'>('7_days');

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };

  const addCustomCuisine = () => {
    if (customCuisine.trim() && !selectedCuisines.includes(customCuisine.trim())) {
      setSelectedCuisines((prev) => [...prev, customCuisine.trim()]);
      setCustomCuisine('');
    }
  };

  const toggleFoodGroup = (groupId: string) => {
    setSelectedFoodGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const toggleFavoriteFood = (foodId: string) => {
    setSelectedFavoriteFoods((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
  };

  const handleGenerateMealPlan = () => {
    const favoriteFoodNames = selectedFavoriteFoods
      .map((id) => favoriteFoods.find((food) => food.id === id)?.food_name || '')
      .filter(Boolean);

    const planParams = {
      cuisines: selectedCuisines,
      customBudget,
      foodGroups: selectedFoodGroups,
      selectedFavoriteFoods,
      favoriteFoodNames,
      duration: planDuration,
      existingIngredients,
      userContext,
    };

    // Show immediate toast notification
    toast.success('🍽️ Creating your meal plan!', {
      description: 'We\'re generating your personalized meal plan and grocery list. You can continue using the app - we\'ll notify you when it\'s ready.',
      duration: 10000, // Show for 10 seconds
    });

    // Close modal immediately - user can continue using app
    onClose();

    // Start the generation process (non-blocking)
    generateMealPlan.mutate(planParams, {
      onSuccess: (result) => {
        // Automatically open result modal when generation completes
        if (result?.plan) {
          onMealPlanGenerated(result.plan);
        }
      },
      onError: (error) => {
        console.error('Failed to generate meal plan:', error);
        // Error toast is handled by the mutation
      },
    });
  };

  const canGenerate = selectedCuisines.length > 0 || selectedFoodGroups.length > 0;

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <View className={themed('flex-1 bg-gray-50', 'flex-1 bg-gray-950')}>
        {/* Header */}
        <View className={themed('py-4 px-4', 'py-4 px-4')}>
          <View className="flex-row items-center justify-between">
            <Text
              className={themed('text-xl font-bold text-gray-900', 'text-xl font-bold text-white')}
            >
              Create Meal Plan
            </Text>

            <TouchableOpacity onPress={onClose}>
              <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          <PlanDurationSection planDuration={planDuration} setPlanDuration={setPlanDuration} />

          <CuisineSelection
            selectedCuisines={selectedCuisines}
            customCuisine={customCuisine}
            setCustomCuisine={setCustomCuisine}
            toggleCuisine={toggleCuisine}
            addCustomCuisine={addCustomCuisine}
          />

          <BudgetInputSection customBudget={customBudget} setCustomBudget={setCustomBudget} />

          <FoodGroupSelection
            selectedFoodGroups={selectedFoodGroups}
            toggleFoodGroup={toggleFoodGroup}
          />

          <FavoriteFoodsSelection
            favoriteFoods={favoriteFoods}
            selectedFavoriteFoods={selectedFavoriteFoods}
            toggleFavoriteFood={toggleFavoriteFood}
            isLoading={false}
          />

          <ExistingIngredientsSection
            existingIngredients={existingIngredients}
            setExistingIngredients={setExistingIngredients}
          />
        </ScrollView>

        {/* Generate Button */}
        <View className={themed('p-4', 'p-4 ')}>
          <Button
            title={
              generateMealPlan.isPending
                ? 'Generating Your Plan...'
                : 'Generate Meal Plan & Grocery List'
            }
            onPress={handleGenerateMealPlan}
            disabled={!canGenerate || generateMealPlan.isPending}
            className="w-full bg-green-500"
            style={{
              backgroundColor: canGenerate && !generateMealPlan.isPending ? '#EC4899' : '#9CA3AF',
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
