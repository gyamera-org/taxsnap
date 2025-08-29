import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface NutritionSummaryProps {
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({ totalNutrition }) => {
  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">Nutrition Summary</Text>
      <View className="bg-green-50 rounded-xl p-4 border border-green-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-green-800 font-semibold text-lg">Total Calories</Text>
          <Text className="text-green-800 font-bold text-2xl">
            {Math.round(totalNutrition.calories)}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-green-700 font-medium">
              {Math.round(totalNutrition.protein)}g
            </Text>
            <Text className="text-green-600 text-xs">Protein</Text>
          </View>
          <View className="items-center">
            <Text className="text-green-700 font-medium">{Math.round(totalNutrition.carbs)}g</Text>
            <Text className="text-green-600 text-xs">Carbs</Text>
          </View>
          <View className="items-center">
            <Text className="text-green-700 font-medium">{Math.round(totalNutrition.fat)}g</Text>
            <Text className="text-green-600 text-xs">Fat</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
