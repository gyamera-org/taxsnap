import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';

interface NutritionSummaryProps {
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({ totalNutrition }) => {
  const themed = useThemedStyles();
  
  return (
    <View className="px-4 mb-6">
      <Text className={themed("text-lg font-semibold text-gray-900 mb-3", "text-lg font-semibold text-white mb-3")}>Nutrition Summary</Text>
      <View className={themed("bg-green-50 rounded-xl p-4 border border-green-100", "bg-green-900/20 rounded-xl p-4 border border-green-800")}>
        <View className="flex-row justify-between items-center mb-3">
          <Text className={themed("text-green-800 font-semibold text-lg", "text-green-200 font-semibold text-lg")}>Total Calories</Text>
          <Text className={themed("text-green-800 font-bold text-2xl", "text-green-200 font-bold text-2xl")}>
            {Math.round(totalNutrition.calories)}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className={themed("text-green-700 font-medium", "text-green-300 font-medium")}>
              {Math.round(totalNutrition.protein)}g
            </Text>
            <Text className={themed("text-green-600 text-xs", "text-green-400 text-xs")}>Protein</Text>
          </View>
          <View className="items-center">
            <Text className={themed("text-green-700 font-medium", "text-green-300 font-medium")}>{Math.round(totalNutrition.carbs)}g</Text>
            <Text className={themed("text-green-600 text-xs", "text-green-400 text-xs")}>Carbs</Text>
          </View>
          <View className="items-center">
            <Text className={themed("text-green-700 font-medium", "text-green-300 font-medium")}>{Math.round(totalNutrition.fat)}g</Text>
            <Text className={themed("text-green-600 text-xs", "text-green-400 text-xs")}>Fat</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
