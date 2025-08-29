import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Apple, Coffee, Utensils, Sandwich, Cookie } from 'lucide-react-native';
import { DailyNutritionSummary } from '@/lib/types/nutrition-tracking';
import { CaloriesSummaryCardSkeleton } from './nutrition-skeleton';

interface CaloriesSummaryCardProps {
  macroData: {
    calories: { consumed: number; target: number };
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fat: { consumed: number; target: number };
  };
  dailySummary?: DailyNutritionSummary | null;
  isLoading?: boolean;
}

export default function CaloriesSummaryCard({
  macroData,
  dailySummary,
  isLoading = false,
}: CaloriesSummaryCardProps) {
  const calculateProgress = (consumed: number, target: number) => {
    if (target === 0) return 0;
    return (consumed / target) * 100;
  };

  const caloriesConsumed = isLoading ? 0 : macroData.calories.consumed;
  const caloriesLeft = isLoading ? 0 : macroData.calories.target - macroData.calories.consumed;
  const isOverTarget = !isLoading && macroData.calories.target > 0 && caloriesLeft < 0;
  const hasValidTarget = !isLoading && macroData.calories.target > 0;
  const caloriesProgress =
    isLoading || !hasValidTarget
      ? 0
      : calculateProgress(macroData.calories.consumed, macroData.calories.target);

  // Calculate calories by meal type
  const getMealCalories = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (isLoading || !dailySummary?.meals_by_type) return null;
    return dailySummary.meals_by_type[mealType].reduce(
      (total, meal) => total + meal.total_calories,
      0
    );
  };

  const mealBreakdown = [
    { type: 'breakfast', icon: Coffee, color: '#F59E0B', calories: getMealCalories('breakfast') },
    { type: 'lunch', icon: Utensils, color: '#10B981', calories: getMealCalories('lunch') },
    { type: 'dinner', icon: Sandwich, color: '#8B5CF6', calories: getMealCalories('dinner') },
    { type: 'snack', icon: Cookie, color: '#EC4899', calories: getMealCalories('snack') },
  ];

  // Show skeleton when loading or no valid data
  if (isLoading || !hasValidTarget) {
    return <CaloriesSummaryCardSkeleton />;
  }

  return (
    <View className="px-4 mb-6">
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          {/* Left side - Large number and text */}
          <View className="flex-1">
            <Text className="text-6xl font-bold text-gray-900 mb-1">
              {isOverTarget ? `-${Math.round(Math.abs(caloriesLeft))}` : Math.round(caloriesLeft)}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-gray-600 text-lg font-medium">
                {isOverTarget ? 'Calories over' : 'Calories left'}
              </Text>
              <View className="flex-row items-center ml-3">
                <View
                  className={`w-4 h-4 rounded-full mr-1 ${
                    isOverTarget ? 'bg-red-500' : 'bg-green-500'
                  }`}
                />
                <Text className="text-gray-500 text-sm">
                  {`${Math.round(caloriesConsumed)} consumed`}
                </Text>
              </View>
            </View>
          </View>

          {/* Right side - Circular progress */}
          <View className="relative w-20 h-20">
            {/* Background circle */}
            <View
              className="absolute inset-0 rounded-full border-8"
              style={{ borderColor: '#F3F4F6' }}
            />

            {/* Progress circle */}
            <View
              className="absolute inset-0 rounded-full border-8"
              style={{
                borderColor: 'transparent',
                borderTopColor:
                  caloriesProgress > 12.5 ? (isOverTarget ? '#EF4444' : '#10B981') : 'transparent',
                borderRightColor:
                  caloriesProgress > 37.5 ? (isOverTarget ? '#EF4444' : '#10B981') : 'transparent',
                borderBottomColor:
                  caloriesProgress > 62.5 ? (isOverTarget ? '#EF4444' : '#10B981') : 'transparent',
                borderLeftColor:
                  caloriesProgress > 87.5 ? (isOverTarget ? '#EF4444' : '#10B981') : 'transparent',
                transform: [{ rotate: `${-90 + Math.min(caloriesProgress, 100) * 3.6}deg` }],
              }}
            />

            {/* Overconsumption indicator - second lap */}
            {caloriesProgress > 100 && (
              <View
                className="absolute inset-0 rounded-full border-8"
                style={{
                  borderColor: 'transparent',
                  borderTopColor: caloriesProgress - 100 > 12.5 ? '#EF4444' : 'transparent',
                  borderRightColor: caloriesProgress - 100 > 37.5 ? '#EF4444' : 'transparent',
                  borderBottomColor: caloriesProgress - 100 > 62.5 ? '#EF4444' : 'transparent',
                  borderLeftColor: caloriesProgress - 100 > 87.5 ? '#EF4444' : 'transparent',
                  transform: [
                    { rotate: `${-90 + Math.min(caloriesProgress - 100, 100) * 3.6}deg` },
                  ],
                  opacity: 0.7,
                }}
              />
            )}

            {/* Center icon */}
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                <Apple size={16} color="#F59E0B" />
              </View>
            </View>
          </View>
        </View>

        {/* Meal Breakdown */}
        <View className="border-t border-gray-100 pt-4">
          <View className="flex-row justify-between">
            {mealBreakdown.map((meal) => {
              return (
                <View key={meal.type} className="items-center">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mb-1"
                    style={{ backgroundColor: `${meal.color}20` }}
                  >
                    <meal.icon size={14} color={meal.color} />
                  </View>
                  <Text className="text-xs font-medium text-gray-900">{meal.calories || '--'}</Text>
                  <Text className="text-xs text-gray-500 capitalize">{meal.type}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
