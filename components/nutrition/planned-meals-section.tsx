import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';
import { ChefHat, Sparkles, Timer } from 'lucide-react-native';
import { useCreateMealEntry, useMealEntries } from '@/lib/hooks/use-meal-tracking';
import { useCurrentMealPlan } from '@/lib/hooks/use-meal-plans';
import {
  useAddFavoriteFood,
  useRemoveFavoriteFood,
  useFavoriteFoods,
} from '@/lib/hooks/use-favorite-foods';
import { toast } from 'sonner-native';
import PlannedMealCard from './planned-meal-card';
import SimpleMealModal from './simple-meal-modal';

interface PlannedMealsSectionProps {
  onShowMealPlan?: (plan: any) => void;
  onShowMealDetails?: (meal: any, mealType: string) => void;
  onGeneratePlan?: () => void;
  isGeneratingPlan?: boolean;
  // Optional props to override default behavior
  title?: string;
  dayData?: any; // If provided, use this instead of current meal plan
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
  showHeader = true,
  showViewAllButton = true,
}: PlannedMealsSectionProps) {
  const themed = useThemedStyles();
  const createMealEntry = useCreateMealEntry();
  const { data: currentMealPlan } = useCurrentMealPlan();
  const addFavoriteFood = useAddFavoriteFood();
  const removeFavoriteFood = useRemoveFavoriteFood();
  const { data: favoriteFoods } = useFavoriteFoods();

  // Get today's logged meals
  const today = new Date().toISOString().split('T')[0];
  const { data: loggedMealEntries } = useMealEntries(today);

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

  // Update logged meals based on actual logged entries
  React.useEffect(() => {
    if (loggedMealEntries) {
      const loggedMealKeys = new Set<string>();

      loggedMealEntries.forEach((entry) => {
        entry.food_items?.forEach((foodItem) => {
          // Check if this food item is from a meal plan (has 'Meal Plan' brand or 'Planned Meal' category)
          if (foodItem.food?.brand === 'Meal Plan' || foodItem.food?.category === 'Planned Meal') {
            // Create key to match planned meals: mealType-mealName
            const mealKey = `${entry.meal_type}-${foodItem.food.name}`;
            loggedMealKeys.add(mealKey);
          }
        });
      });

      setLoggedMeals(loggedMealKeys);
    }
  }, [loggedMealEntries]);

  // Find today's meals from the current meal plan
  const getTodaysPlannedMeals = () => {
    if (!currentMealPlan?.meals_data?.days) {
      return null;
    }

    // First try to match by exact date
    let todaysDay = currentMealPlan.meals_data.days.find((day: any) => day.date === today);

    if (todaysDay) {
      return todaysDay;
    }

    // If no exact match, try to match by day of week
    const selectedDayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[selectedDayOfWeek];

    todaysDay = currentMealPlan.meals_data.days.find((day: any) => {
      const matches =
        day.day_name?.toLowerCase() === todayName.toLowerCase() ||
        day.day?.toLowerCase().includes(todayName.toLowerCase());

      return matches;
    });

    // If still no match, try to get the first day of the week or just the first day
    if (!todaysDay && currentMealPlan.meals_data.days.length > 0) {
      todaysDay = currentMealPlan.meals_data.days[0];
    }

    return todaysDay;
  };

  const todaysDay = dayData || getTodaysPlannedMeals();

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
    const mealKey = `${mealType}-${meal.name}`;
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
      logged_date: today,
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

  // Check if a meal is saved in favorites
  const isMealSaved = (meal: any, mealType: string) => {
    const mealKey = `${mealType}-${meal.name}`;
    const isSavedInState = savedMeals.has(mealKey);

    // Also check in actual favorite foods data
    // Check for both old format ("meal") and new format ("Planned Meal")
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
            // Use built-in modal if no external handler provided
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

  // Show generate button if no meals data and onGeneratePlan is provided
  if (!todaysDay && onGeneratePlan) {
    return (
      <View className="mx-4 mb-6">
        <TouchableOpacity 
          onPress={onGeneratePlan} 
          disabled={isGeneratingPlan}
          className={themed(
            isGeneratingPlan ? 'bg-gray-400 rounded-2xl p-6 shadow-lg' : 'bg-green-500 rounded-2xl p-6 shadow-lg',
            isGeneratingPlan ? 'bg-gray-500 rounded-2xl p-6 shadow-lg' : 'bg-green-600 rounded-2xl p-6 shadow-lg'
          )}
          style={{
            shadowColor: isGeneratingPlan ? '#9CA3AF' : '#10B981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={isGeneratingPlan ? 1 : 0.8}
        >
          <View>
            <View className="flex-row items-center mb-2">
              {isGeneratingPlan ? (
                <Timer size={24} color="white" />
              ) : (
                <Sparkles size={24} color="white" />
              )}
              <Text className="text-white text-xl font-bold ml-3">
                {isGeneratingPlan ? 'Generating Your Meal Plan' : 'Generate Meal Plan'}
              </Text>
            </View>
            
            <Text className="text-white text-sm opacity-90 leading-5">
              {isGeneratingPlan 
                ? 'We are creating your personalized meal plan and grocery list...'
                : 'Get personalized meal plans with cycle-synced nutrition and auto-generated grocery lists'
              }
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Don't show section if no meals data and no generate function
  if (!todaysDay) {
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
                'w-8 h-8 bg-green-900/30 rounded-full items-center justify-center mr-3'
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

      {/* Simple Meal Modal */}
      <SimpleMealModal
        isVisible={showMealModal}
        onClose={() => setShowMealModal(false)}
        meal={selectedMeal}
        mealType={selectedMealType}
      />
    </View>
  );
}
