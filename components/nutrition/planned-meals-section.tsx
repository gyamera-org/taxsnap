import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';
import { ChefHat, Sparkles, Timer } from 'lucide-react-native';
import { format } from 'date-fns';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { useRouter } from 'expo-router';
import { useCreateMealEntry, useMealEntries } from '@/lib/hooks/use-meal-tracking';
import { useCurrentMealPlan, useMealPlans } from '@/lib/hooks/use-meal-plans';
import { useMealPlanGenerationRealtime } from '@/lib/hooks/use-meal-plan-generation-realtime';
import {
  useAddFavoriteFood,
  useRemoveFavoriteFood,
  useFavoriteFoods,
} from '@/lib/hooks/use-favorite-foods';
import { toast } from 'sonner-native';
import { supabase } from '@/lib/supabase/client';
import PlannedMealCard from './planned-meal-card';
import SimpleMealModal from './simple-meal-modal';
import MealPlanErrorState from './meal-plan-error-state';
import MealPlanLoadingState from './meal-plan-loading-state';

interface PlannedMealsSectionProps {
  onShowMealPlan?: (plan: any) => void;
  onShowMealDetails?: (meal: any, mealType: string) => void;
  onGeneratePlan?: () => void;
  isGeneratingPlan?: boolean;
  title?: string;
  dayData?: any;
  selectedDate?: string; // Add selectedDate prop to know which date we're viewing
  showHeader?: boolean;
  showViewAllButton?: boolean;
}

export default function PlannedMealsSection({
  onShowMealPlan,
  onShowMealDetails,
  onGeneratePlan,
  isGeneratingPlan = false,
  title = 'Planned Meals',
  dayData,
  selectedDate,
  showHeader = true,
  showViewAllButton = true,
}: PlannedMealsSectionProps) {
  const themed = useThemedStyles();
  const { requiresSubscriptionForFeature } = useRevenueCat();
  const router = useRouter();
  const createMealEntry = useCreateMealEntry();
  const { data: currentMealPlan } = useCurrentMealPlan();
  const { data: allMealPlans } = useMealPlans();

  useMealPlanGenerationRealtime({
    onGenerationComplete: () => {},
    onGenerationFailed: () => {},
    onGenerationProgress: () => {},
  });
  const addFavoriteFood = useAddFavoriteFood();
  const removeFavoriteFood = useRemoveFavoriteFood();
  const { data: favoriteFoods } = useFavoriteFoods();

  // Use selectedDate if provided, otherwise use today
  const currentDate = selectedDate || format(new Date(), 'yyyy-MM-dd');
  const isViewingToday = currentDate === format(new Date(), 'yyyy-MM-dd');
  const { data: loggedMealEntries } = useMealEntries(currentDate);

  const [loggedMeals, setLoggedMeals] = useState<Set<string>>(new Set());
  const [savedMeals, setSavedMeals] = useState<Set<string>>(new Set());
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [showMealModal, setShowMealModal] = useState(false);

  // Initialize savedMeals from favorite foods data
  React.useEffect(() => {
    if (favoriteFoods) {
      const savedMealKeys = new Set<string>();
      favoriteFoods.forEach((food) => {
        if ((food.category === 'Planned Meal' || food.category === 'meal') && food.is_active) {
          // Try to match with any meal type since we don't store meal type in favorites
          ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
            const mealKey = `${mealType}-${food.food_name}`;
            savedMealKeys.add(mealKey);
          });
        }
      });
      setSavedMeals(savedMealKeys);
    }
  }, [favoriteFoods]);

  React.useEffect(() => {
    if (loggedMealEntries) {
      const loggedMealKeys = new Set<string>();

      loggedMealEntries.forEach((entry) => {
        entry.food_items?.forEach((foodItem) => {
          if (foodItem.food?.brand === 'Meal Plan' || foodItem.food?.category === 'Planned Meal') {
            const mealKey = `${entry.meal_type}-${foodItem.food.name}`;
            loggedMealKeys.add(mealKey);
          }
        });
      });

      setLoggedMeals(loggedMealKeys);
    }
  }, [loggedMealEntries]);

  const getPlannedMealsForDate = () => {
    if (!allMealPlans || allMealPlans.length === 0) {
      return null;
    }

    for (const mealPlan of allMealPlans) {
      if (mealPlan.meals_data?.days) {
        const dayData = mealPlan.meals_data.days.find((day: any) => day.date === currentDate);
        if (dayData) {
          return dayData;
        }
      }
    }

    return null;
  };

  const getTodaysDay = () => {
    if (dayData) return dayData;

    return getPlannedMealsForDate();
  };

  const todaysDay = getTodaysDay();

  const generatingMealPlan = allMealPlans?.find(
    (plan) => plan.generation_status === 'generating' || plan.generation_status === 'pending'
  );

  const isActuallyGenerating = isGeneratingPlan || !!generatingMealPlan;

  const handleGeneratePlan = () => {
    if (requiresSubscriptionForFeature('meal-plan-generation')) {
      try {
        router.push('/paywall');
      } catch (error) {
        console.error('Navigation error:', error);
        toast.error('Please upgrade to premium to generate meal plans');
      }
      return;
    }

    // Proceed with generation if user has access
    onGeneratePlan?.();
  };

  const toggleFavoriteMeal = (meal: any, mealType: string) => {
    const mealKey = `${mealType}-${meal.name}`;
    const isSaved = savedMeals.has(mealKey);

    const foodData = {
      food_name: meal.name,
      category: 'Planned Meal',
      serving_size: '1 serving',
      nutrition_data: {
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        fiber: 0,
        sugar: 0,
      },
    };

    if (isSaved) {
      // Remove from favorites
      const favoriteFood = favoriteFoods?.find(
        (food: any) =>
          food.food_name === meal.name &&
          (food.category === 'Planned Meal' || food.category === 'meal')
      );
      if (favoriteFood) {
        removeFavoriteFood.mutate(favoriteFood.id, {
          onSuccess: () => {
            setSavedMeals((prev: Set<string>) => {
              const newSet = new Set(prev);
              newSet.delete(mealKey);
              return newSet;
            });
          },
          onError: () => {
            toast.error('Failed to remove from favorites');
          },
        });
      }
    } else {
      // Add to favorites
      addFavoriteFood.mutate(foodData, {
        onSuccess: () => {
          setSavedMeals((prev: Set<string>) => new Set(prev).add(mealKey));
        },
        onError: () => {
          toast.error('Failed to add to favorites');
        },
      });
    }
  };

  const handleAddMealToLog = (meal: any, mealType: string) => {
    const now = new Date().toTimeString().split(' ')[0];

    const mealEntryData = {
      meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      food_items: [
        {
          food: {
            id: `planned-meal-${Date.now()}`, // Generate unique ID for planned meal
            name: meal.name,
            brand: 'Meal Plan',
            category: 'Planned Meal',
            servingSize: '1 serving',
            nutrition: {
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs || 0,
              fat: meal.fat || 0,
              fiber: 0,
              sugar: 0,
            },
          },
          quantity: 1,
        },
      ],
      logged_date: currentDate,
      logged_time: now,
      notes: `Added from meal plan: ${meal.name}`,
    };

    createMealEntry.mutate(mealEntryData, {
      onSuccess: () => {
        // No need to manually update loggedMeals - the useEffect will handle it
        // when loggedMealEntries updates due to the mutation
        // toast.success(`${meal.name} added to today's log!`);
      },
      onError: () => {
        toast.error('Failed to add meal to log');
      },
    });
  };

  const isMealSaved = (meal: any, mealType: string) => {
    const mealKey = `${mealType}-${meal.name}`;
    const isSavedInState = savedMeals.has(mealKey);

    const isSavedInDB = favoriteFoods?.some(
      (food) =>
        food.food_name === meal.name &&
        (food.category === 'Planned Meal' || food.category === 'meal') &&
        food.is_active
    );

    return isSavedInState || isSavedInDB;
  };

  const renderPlannedMeal = (meal: any, mealType: string) => {
    if (!meal) return null;

    const mealKey = `${mealType}-${meal.name}`;
    const isLogged = loggedMeals.has(mealKey);
    const isSaved = isMealSaved(meal, mealType);

    return (
      <PlannedMealCard
        key={mealKey}
        meal={meal}
        mealType={mealType}
        isLogged={isLogged}
        isSaved={isSaved}
        onView={(meal, mealType) => {
          if (onShowMealDetails) {
            onShowMealDetails(meal, mealType);
          } else {
            setSelectedMeal(meal);
            setSelectedMealType(mealType);
            setShowMealModal(true);
          }
        }}
        onToggleFavorite={toggleFavoriteMeal}
        onAddToLog={handleAddMealToLog}
        isAddingToLog={createMealEntry.isPending}
      />
    );
  };

  if (generatingMealPlan && onGeneratePlan) {
    const hasError =
      generatingMealPlan.generation_status === 'failed' ||
      (generatingMealPlan.generation_status === 'generating' &&
        generatingMealPlan.updated_at &&
        new Date().getTime() - new Date(generatingMealPlan.updated_at).getTime() > 5 * 60 * 1000);

    if (hasError) {
      return (
        <MealPlanErrorState
          onRetry={() => {
            if (generatingMealPlan?.id) {
              const clearPlan = async () => {
                try {
                  const { error } = await supabase
                    .from('meal_plans')
                    .delete()
                    .eq('id', generatingMealPlan.id);

                  if (error) {
                    console.error('Error clearing stuck meal plan:', error);
                  }

                  setTimeout(() => {
                    handleGeneratePlan();
                  }, 500);
                } catch (error) {
                  console.error('Exception clearing stuck meal plan:', error);
                  handleGeneratePlan();
                }
              };

              clearPlan();
            } else {
              handleGeneratePlan();
            }
          }}
        />
      );
    }

    return (
      <MealPlanLoadingState
        generationStage={generatingMealPlan.generation_stage}
        generationProgress={generatingMealPlan.generation_progress || 0}
      />
    );
  }

  // Only show generate button when viewing today and no meals exist
  if (!todaysDay && onGeneratePlan && isViewingToday) {
    return (
      <View className="mx-4 mb-6">
        <TouchableOpacity
          onPress={handleGeneratePlan}
          disabled={isActuallyGenerating}
          className={themed(
            isActuallyGenerating
              ? 'bg-gray-400 rounded-2xl p-6 shadow-lg'
              : 'bg-green-500 rounded-2xl p-6 shadow-lg',
            isActuallyGenerating
              ? 'bg-gray-500 rounded-2xl p-6 shadow-lg'
              : 'bg-green-600 rounded-2xl p-6 shadow-lg'
          )}
          style={{
            shadowColor: isActuallyGenerating ? '#9CA3AF' : '#10B981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={isActuallyGenerating ? 1 : 0.8}
        >
          <View>
            <View className="flex-row items-center mb-2">
              {isActuallyGenerating ? (
                <Timer size={24} color="white" />
              ) : (
                <Sparkles size={24} color="white" />
              )}
              <Text className="text-white text-xl font-bold ml-3">
                {isActuallyGenerating ? 'Generating Your Meal Plan' : 'Generate Meal Plan'}
              </Text>
            </View>

            <Text className="text-white text-sm opacity-90 leading-5">
              {isActuallyGenerating
                ? 'We are creating your personalized meal plan and grocery list...'
                : 'Get personalized meal plans with cycle-synced nutrition and auto-generated grocery lists'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // If no meals for the current date and not viewing today, show empty state
  if (!todaysDay) {
    if (!isViewingToday) {
      return (
        <View className="mx-4 mb-6">
          <View className="flex-row items-center mb-4">
            <View
              className={themed(
                'w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3',
                'w-8 h-8 bg-green-900 rounded-full items-center justify-center mr-3'
              )}
            >
              <ChefHat size={16} color="#10B981" />
            </View>
            <Text
              className={themed('text-xl font-bold text-gray-900', 'text-xl font-bold text-white')}
            >
              {title}
            </Text>
          </View>

          {/* Empty state card matching the app's design */}
          <View
            className={themed(
              'bg-white rounded-2xl p-6 shadow-sm border border-gray-100',
              'bg-gray-900 rounded-2xl p-6 border border-gray-700'
            )}
          >
            <View className="items-center py-8">
              <View
                className={themed(
                  'w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4',
                  'w-16 h-16 bg-gray-700/50 rounded-full items-center justify-center mb-4'
                )}
              >
                <ChefHat size={24} color="#9CA3AF" />
              </View>
              <Text
                className={themed(
                  'text-center text-gray-900 text-lg font-semibold mb-2',
                  'text-center text-white text-lg font-semibold mb-2'
                )}
              >
                No meals planned
              </Text>
              <Text
                className={themed(
                  'text-center text-gray-500 text-sm',
                  'text-center text-gray-400 text-sm'
                )}
              >
                No meals were planned for {currentDate}
              </Text>
            </View>
          </View>
        </View>
      );
    }
    return null;
  }

  return (
    <View className="mx-4 mb-6">
      {showHeader && (
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View
              className={themed(
                'w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3',
                'w-8 h-8 bg-green-900 rounded-full items-center justify-center mr-3'
              )}
            >
              <ChefHat size={16} color="#10B981" />
            </View>
            <Text
              className={themed('text-xl font-bold text-gray-900', 'text-xl font-bold text-white')}
            >
              {title}
            </Text>
          </View>
          {showViewAllButton && currentMealPlan && (
            <TouchableOpacity
              onPress={() => onShowMealPlan?.(currentMealPlan)}
              className={themed(
                'px-3 py-1 bg-green-50 rounded-full',
                'px-3 py-1 bg-green-900/20 rounded-full'
              )}
              activeOpacity={0.8}
            >
              <Text
                className={themed(
                  'text-xs font-medium text-green-700',
                  'text-xs font-medium text-green-300'
                )}
              >
                View All Plans
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View>
        {todaysDay.meals?.breakfast && renderPlannedMeal(todaysDay.meals.breakfast, 'breakfast')}
        {todaysDay.meals?.lunch && renderPlannedMeal(todaysDay.meals.lunch, 'lunch')}
        {todaysDay.meals?.dinner && renderPlannedMeal(todaysDay.meals.dinner, 'dinner')}
        {todaysDay.meals?.snacks?.map((snack: any) => renderPlannedMeal(snack, 'snack'))}
      </View>

      <SimpleMealModal
        isVisible={showMealModal}
        onClose={() => setShowMealModal(false)}
        meal={selectedMeal}
        mealType={selectedMealType}
      />
    </View>
  );
}
