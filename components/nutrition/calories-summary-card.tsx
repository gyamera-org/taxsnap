import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Coffee, Utensils, Sandwich, Cookie, Flame } from 'lucide-react-native';
import { DailyNutritionSummary } from '@/lib/types/nutrition-tracking';
import { CaloriesSummaryCardSkeleton } from './nutrition-skeleton';
import { getAccurateCircularProgressStyles } from '@/lib/utils/progress-circle';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

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
  const themed = useThemedStyles();
  const colors = useThemedColors();
  
  const caloriesLeft = isLoading ? 0 : macroData.calories.target - macroData.calories.consumed;
  const isOverTarget = !isLoading && macroData.calories.target > 0 && caloriesLeft < 0;
  const hasValidTarget = !isLoading && macroData.calories.target > 0;

  // Get progress styles using utility function
  const progressStyles = hasValidTarget
    ? getAccurateCircularProgressStyles(
        macroData.calories.consumed,
        macroData.calories.target,
        isOverTarget ? '#EF4444' : '#10B981'
      )
    : getAccurateCircularProgressStyles(0, 2000, '#10B981');

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

  // Show skeleton only when loading
  if (isLoading) {
    return <CaloriesSummaryCardSkeleton />;
  }

  // Use default values when no valid target is set
  const displayCaloriesTarget = hasValidTarget ? macroData.calories.target : 2000;
  const displayCaloriesConsumed = hasValidTarget ? macroData.calories.consumed : 0;
  const displayCaloriesLeft = displayCaloriesTarget - displayCaloriesConsumed;
  const displayIsOverTarget = hasValidTarget && caloriesLeft < 0;

  return (
    <View className="px-4 mb-6">
      <View className={themed("bg-white rounded-3xl p-6 shadow-sm border border-gray-100", "bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-700")}>
        <View className="flex-row items-center justify-between mb-4">
          {/* Left side - Large number and text */}
          <View className="flex-1">
            <Text className={themed("text-6xl font-bold text-gray-900 mb-1", "text-6xl font-bold text-white mb-1")}>
              {displayIsOverTarget
                ? `-${Math.round(Math.abs(displayCaloriesLeft))}`
                : Math.round(displayCaloriesLeft)}
            </Text>
            <View className="flex-row items-center">
              <Text className={themed("text-gray-600 text-lg font-medium", "text-gray-300 text-lg font-medium")}>
                {displayIsOverTarget ? 'Calories over' : 'Calories left'}
              </Text>
              <View className="flex-row items-center ml-3">
                <View
                  className={`w-4 h-4 rounded-full mr-1 ${
                    displayIsOverTarget ? 'bg-red-500' : 'bg-green-500'
                  }`}
                />
                <Text className={themed("text-gray-500 text-sm", "text-gray-400 text-sm")}>
                  {`${Math.round(displayCaloriesConsumed)} consumed`}
                </Text>
              </View>
            </View>
          </View>

          {/* Right side - Circular progress */}
          <View className="relative w-20 h-20 items-center justify-center">
            {/* Background circle - always visible */}
            <View className="absolute rounded-full" style={progressStyles.backgroundCircle} />

            {/* Progress circle - partial progress */}
            {progressStyles.progressCircle && (
              <View className="absolute rounded-full" style={progressStyles.progressCircle} />
            )}

            {/* Complete circle when 100% or more */}
            {progressStyles.fullCircle && (
              <View className="absolute rounded-full" style={progressStyles.fullCircle} />
            )}

            {/* Center icon - smaller and positioned in the center */}
            <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
              <Flame size={20} color="#F59E0B" />
            </View>
          </View>
        </View>

        {/* Meal Breakdown */}
        <View className={themed("border-t border-gray-100 pt-4", "border-t border-gray-700 pt-4")}>
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
                  <Text className={themed("text-xs font-medium text-gray-900", "text-xs font-medium text-white")}>{meal.calories || '--'}</Text>
                  <Text className={themed("text-xs text-gray-500 capitalize", "text-xs text-gray-400 capitalize")}>{meal.type}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
