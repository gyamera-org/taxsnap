import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Check, Heart, Flame, Wheat, Droplets } from 'lucide-react-native';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water_ml: number;
  health_score: number;
  bmi: number;
  bmr: number;
  tdee: number;
  weight_recommendation: string;
  recommendations: string[];
}

interface NutritionResultsProps {
  nutritionGoals: NutritionGoals;
  onEditGoals: () => void;
  onContinue: () => void;
}

const MacroCircle = ({
  value,
  unit,
  color,
  icon: Icon,
  label,
}: {
  value: number;
  unit: string;
  color: string;
  icon: React.ElementType;
  label: string;
}) => (
  <View className="items-center">
    <View className="relative mb-3">
      <View
        className="w-20 h-20 rounded-full border-4 items-center justify-center"
        style={{ borderColor: color }}
      >
        <Icon size={20} color={color} />
      </View>
      <View className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-1 shadow-sm">
        <Text className="text-xs font-bold text-gray-700">
          {value}
          {unit}
        </Text>
      </View>
    </View>
    <Text className="text-sm font-medium text-gray-600">{label}</Text>
  </View>
);

const HealthScoreBar = ({ score }: { score: number }) => (
  <View className="mb-6">
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-row items-center">
        <Heart size={20} color="#ec4899" className="mr-2" />
        <Text className="text-lg font-semibold text-gray-900">Health Score</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900">{score}/10</Text>
    </View>
    <View className="bg-gray-200 rounded-full h-3">
      <View className="bg-green-500 rounded-full h-3" style={{ width: `${(score / 10) * 100}%` }} />
    </View>
  </View>
);

const RecommendationItem = ({ text, index }: { text: string; index: number }) => {
  const icons = [Heart, Flame, Wheat, Droplets];
  const colors = ['#ec4899', '#f59e0b', '#8b5cf6', '#3b82f6'];
  const Icon = icons[index % icons.length];
  const color = colors[index % colors.length];

  return (
    <View className="flex-row items-start mb-4">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-1"
        style={{ backgroundColor: color + '20' }}
      >
        <Icon size={16} color={color} />
      </View>
      <Text className="flex-1 text-gray-700 leading-6">{text}</Text>
    </View>
  );
};

export const NutritionResults: React.FC<NutritionResultsProps> = ({
  nutritionGoals,
  onEditGoals,
  onContinue,
}) => {
  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Success Header */}
      <View className="bg-white px-6 py-8 items-center">
        <View className="w-16 h-16 bg-green-500 rounded-full items-center justify-center mb-4">
          <Check size={32} color="white" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">Congratulations</Text>
        <Text className="text-xl text-gray-900 text-center mb-4">your custom plan is ready!</Text>
        <Text className="text-lg text-gray-600 mb-2">You should maintain:</Text>
        <View className="bg-black rounded-full px-6 py-3">
          <Text className="text-white font-bold text-lg">
            {nutritionGoals.weight_recommendation}
          </Text>
        </View>
      </View>

      {/* Daily Recommendation */}
      <View className="bg-white mx-4 rounded-2xl p-6 mt-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Daily recommendation</Text>
        <Text className="text-gray-500 mb-6">You can edit this anytime</Text>

        {/* Macro Circles */}
        <View className="flex-row justify-between mb-6">
          <MacroCircle
            value={nutritionGoals.calories}
            unit=""
            color="#000"
            icon={Flame}
            label="Calories"
          />
          <MacroCircle
            value={nutritionGoals.carbs}
            unit="g"
            color="#f59e0b"
            icon={Wheat}
            label="Carbs"
          />
          <MacroCircle
            value={nutritionGoals.protein}
            unit="g"
            color="#ef4444"
            icon={Heart}
            label="Protein"
          />
          <MacroCircle
            value={nutritionGoals.fat}
            unit="g"
            color="#3b82f6"
            icon={Droplets}
            label="Fats"
          />
        </View>

        {/* Health Score */}
        <HealthScoreBar score={nutritionGoals.health_score} />

        {/* Auto Generate Button */}
        <Button
          title="✨ Auto Generate Goals"
          variant="secondary"
          className="w-full mb-4"
          onPress={onEditGoals}
        />
      </View>

      {/* How to reach your goals */}
      <View className="bg-white mx-4 rounded-2xl p-6 mt-4 shadow-sm">
        <Text className="text-xl font-bold text-gray-900 mb-6">How to reach your goals:</Text>

        {nutritionGoals.recommendations.map((recommendation, index) => (
          <RecommendationItem key={index} text={recommendation} index={index} />
        ))}
      </View>

      {/* Scientific Sources */}
      <View className="mx-4 mt-4 mb-6">
        <Text className="text-sm text-gray-600 mb-3">
          Plan based on the following sources, among other peer-reviewed medical studies:
        </Text>
        <Text className="text-sm text-gray-600 leading-5">
          • Basal metabolic rate{'\n'}• Calorie counting - Harvard{'\n'}• International Society of
          Sports Nutrition{'\n'}• National Institutes of Health
        </Text>
      </View>

      {/* Continue Button */}
      <View className="px-4 pb-8">
        <Button title="Continue" className="w-full" onPress={onContinue} />
      </View>
    </ScrollView>
  );
};
