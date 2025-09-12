import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';

import { MealCard } from './meal-card';
import { EmptyMealsState } from './empty-meals-state';

interface MealData {
  id: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  image_url?: string;
  analysis_status?: 'analyzing' | 'completed' | 'failed';
  analysis_progress?: number;
  analysis_stage?: 'uploading' | 'analyzing' | 'processing' | 'finalizing';
  confidence?: number;
  isPending?: boolean;
  isAnalyzing?: boolean;
}

interface MealsSectionProps {
  meals: MealData[];
  onAddMealPress?: () => void;
  onMealPress?: (meal: MealData) => void;
  // Pending food actions
  onSavePendingFood?: (meal: MealData) => void;
  onDiscardPendingFood?: (meal: MealData) => void;
}

export default function MealsSection({
  meals,
  onAddMealPress,
  onMealPress,
  onSavePendingFood,
  onDiscardPendingFood,
}: MealsSectionProps) {
  const themed = useThemedStyles();
  const sortedMeals = meals.sort((a, b) => {
    const aAnalyzing = a.analysis_status === 'analyzing' || a.isAnalyzing;
    const bAnalyzing = b.analysis_status === 'analyzing' || b.isAnalyzing;
    const aFailed = a.analysis_status === 'failed';
    const bFailed = b.analysis_status === 'failed';
    const aPending = (a.analysis_status === 'completed' && a.isPending) || a.isPending;
    const bPending = (b.analysis_status === 'completed' && b.isPending) || b.isPending;

    if (aAnalyzing && !bAnalyzing) return -1;
    if (!aAnalyzing && bAnalyzing) return 1;
    if (aFailed && !bFailed) return -1;
    if (!aFailed && bFailed) return 1;
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    return 0;
  });

  return (
    <View className="px-4 mb-6 mt-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className={themed("text-xl font-bold text-gray-900", "text-xl font-bold text-white")}>Today's Meals</Text>
        <TouchableOpacity onPress={onAddMealPress}>
          <Text className="text-green-600 font-medium">Add Meal</Text>
        </TouchableOpacity>
      </View>

      {sortedMeals.length > 0 ? (
        sortedMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onPress={onMealPress}
            onDiscardPending={onDiscardPendingFood}
          />
        ))
      ) : (
        <EmptyMealsState onAddMealPress={onAddMealPress} />
      )}
    </View>
  );
}
