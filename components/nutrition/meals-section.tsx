import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  Utensils,
  Coffee,
  Sandwich,
  Cookie,
  ChevronRight,
  Timer,
  Sparkles,
  Check,
  X,
} from 'lucide-react-native';
import { toast } from 'sonner-native';

interface MealData {
  id: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  // Pending food properties
  isPending?: boolean;
  isAnalyzing?: boolean;
  confidence?: number;
}

interface MealsSectionProps {
  meals: MealData[];
  onAddMealPress?: () => void;
  onMealPress?: (meal: MealData) => void;
  // Pending food actions
  onSavePendingFood?: (meal: MealData) => void;
  onDiscardPendingFood?: (meal: MealData) => void;
}

const getMealIcon = (type: string) => {
  switch (type) {
    case 'breakfast':
      return Coffee;
    case 'lunch':
      return Utensils;
    case 'dinner':
      return Sandwich;
    case 'snack':
      return Cookie;
    default:
      return Utensils;
  }
};

const getMealTypeColor = (type: string) => {
  switch (type) {
    case 'breakfast':
      return '#F59E0B';
    case 'lunch':
      return '#10B981';
    case 'dinner':
      return '#8B5CF6';
    case 'snack':
      return '#EC4899';
    default:
      return '#6B7280';
  }
};

const MealCard = ({
  meal,
  onPress,
  onSavePending,
  onDiscardPending,
}: {
  meal: MealData;
  onPress?: (meal: MealData) => void;
  onSavePending?: (meal: MealData) => void;
  onDiscardPending?: (meal: MealData) => void;
}) => {
  const IconComponent = getMealIcon(meal.type);
  const color = getMealTypeColor(meal.type);

  const handleDiscardPending = () => {
    Alert.alert('Discard Food', `Are you sure you want to discard "${meal.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          onDiscardPending?.(meal);
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-50"
      onPress={() => !meal.isPending && onPress?.(meal)}
      disabled={meal.isAnalyzing}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View
            style={{ backgroundColor: `${color}20` }}
            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          >
            {meal.isPending && meal.isAnalyzing ? (
              <View className="animate-spin">
                <Timer size={20} color={color} />
              </View>
            ) : meal.isPending ? (
              <Sparkles size={20} color={color} />
            ) : (
              <IconComponent size={20} color={color} />
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-medium text-gray-500 capitalize">{meal.type}</Text>
              <Text className="text-xs text-gray-400">{meal.time}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-base font-semibold text-gray-900 mb-1">{meal.name}</Text>
              {meal.isAnalyzing && (
                <View className="ml-2 animate-spin">
                  <Timer size={14} color="#3B82F6" />
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                {meal.isAnalyzing ? '...' : `${meal.calories} cal`}
              </Text>
              {meal.isPending && !meal.isAnalyzing && meal.confidence && (
                <Text className="text-xs text-blue-600 ml-2">• {meal.confidence}% confidence</Text>
              )}
              {meal.isAnalyzing && (
                <Text className="text-xs text-blue-600 ml-2">• AI analyzing...</Text>
              )}
            </View>
          </View>
        </View>

        {!meal.isPending && <ChevronRight size={16} color="#D1D5DB" />}
      </View>

      {/* Nutrition breakdown or pending actions */}
      {meal.isPending && meal.isAnalyzing ? (
        <View className="mt-3 pt-3 border-t border-gray-50">
          <View className="bg-blue-50 rounded-xl p-3 mb-3">
            <View className="flex-row items-center justify-center mb-2">
              <Timer size={16} color="#3B82F6" />
              <Text className="text-blue-600 font-medium ml-2">AI analyzing food...</Text>
            </View>
          </View>

          {/* Cancel option for stuck analysis */}
          <TouchableOpacity
            onPress={() => onDiscardPending?.(meal)}
            className="bg-gray-100 py-2 rounded-xl flex-row items-center justify-center"
          >
            <X size={14} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-1 text-sm">Cancel Analysis</Text>
          </TouchableOpacity>
        </View>
      ) : meal.isPending ? (
        <View className="mt-3 pt-3 border-t border-gray-50">
          <View className="flex-row justify-between mb-3">
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-400">Protein</Text>
              <Text className="text-sm font-medium text-gray-700">{meal.protein}g</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-400">Carbs</Text>
              <Text className="text-sm font-medium text-gray-700">{meal.carbs}g</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-400">Fat</Text>
              <Text className="text-sm font-medium text-gray-700">{meal.fat}g</Text>
            </View>
          </View>

          {/* Pending Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleDiscardPending}
              className="flex-1 bg-gray-100 py-2 rounded-xl flex-row items-center justify-center"
            >
              <X size={14} color="#6B7280" />
              <Text className="text-gray-700 font-medium ml-1 text-sm">Discard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSavePending?.(meal)}
              className="flex-1 bg-green-500 py-2 rounded-xl flex-row items-center justify-center"
            >
              <Check size={14} color="white" />
              <Text className="text-white font-medium ml-1 text-sm">Save to Meals</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-50">
          <View className="items-center">
            <Text className="text-xs text-gray-400">Protein</Text>
            <Text className="text-sm font-medium text-gray-700">{meal.protein}g</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400">Carbs</Text>
            <Text className="text-sm font-medium text-gray-700">{meal.carbs}g</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400">Fat</Text>
            <Text className="text-sm font-medium text-gray-700">{meal.fat}g</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const EmptyMealsState = ({ onAddMealPress }: { onAddMealPress?: () => void }) => (
  <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-50">
    <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
      <Utensils size={24} color="#9CA3AF" />
    </View>
    <Text className="text-gray-500 text-center mb-2">No meals logged today</Text>
    <TouchableOpacity onPress={onAddMealPress} className="bg-green-500 px-4 py-2 rounded-xl">
      <Text className="text-white font-medium">Log Your First Meal</Text>
    </TouchableOpacity>
  </View>
);

export default function MealsSection({
  meals,
  onAddMealPress,
  onMealPress,
  onSavePendingFood,
  onDiscardPendingFood,
}: MealsSectionProps) {
  // Sort meals - analyzing first, then pending, then saved
  const sortedMeals = meals.sort((a, b) => {
    if (a.isAnalyzing && !b.isAnalyzing) return -1;
    if (!a.isAnalyzing && b.isAnalyzing) return 1;
    if (a.isPending && !b.isPending) return -1;
    if (!a.isPending && b.isPending) return 1;
    return 0;
  });

  return (
    <View className="px-4 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900">Today's Meals</Text>
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
            onSavePending={onSavePendingFood}
            onDiscardPending={onDiscardPendingFood}
          />
        ))
      ) : (
        <EmptyMealsState onAddMealPress={onAddMealPress} />
      )}
    </View>
  );
}
