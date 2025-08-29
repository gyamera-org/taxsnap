import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Check, X, Sparkles, Timer, Edit3, Save } from 'lucide-react-native';
import { usePendingFoods } from '@/context/pending-foods-provider';
import { useCreateMealEntry } from '@/lib/hooks/use-meal-tracking';
import { toast } from 'sonner-native';

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

interface PendingFoodsSectionProps {
  dateString: string;
}

export default function PendingFoodsSection({ dateString }: PendingFoodsSectionProps) {
  const { pendingFoods, removePendingFood, updatePendingFood } = usePendingFoods();
  const createMealEntry = useCreateMealEntry();
  const [editingFood, setEditingFood] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // Filter pending foods for today (optional - could show all)
  const todaysPendingFoods = pendingFoods.filter((food) => {
    const foodDate = new Date(food.scannedAt).toISOString().split('T')[0];
    return foodDate === dateString;
  });

  if (todaysPendingFoods.length === 0) {
    return null;
  }

  const handleSaveFood = async (food: any) => {
    try {
      await createMealEntry.mutateAsync({
        meal_type: food.mealType,
        food_items: [{ food: food.food, quantity: food.quantity }],
      });

      removePendingFood(food.id);
    } catch (error) {
      console.error('Error saving food:', error);
      toast.error('Failed to save food');
    }
  };

  const handleDiscardFood = (food: any) => {
    Alert.alert('Discard Food', `Are you sure you want to discard "${food.food.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          removePendingFood(food.id);
        },
      },
    ]);
  };

  const startEditing = (food: any) => {
    setEditingFood(food.id);
    setEditValues({
      calories: food.food.nutrition.calories,
      protein: food.food.nutrition.protein,
      carbs: food.food.nutrition.carbs,
      fat: food.food.nutrition.fat,
    });
  };

  const saveEditing = (food: any) => {
    // Update the pending food with new nutrition values
    updatePendingFood(food.id, {
      food: {
        ...food.food,
        nutrition: {
          ...food.food.nutrition,
          calories: editValues.calories,
          protein: editValues.protein,
          carbs: editValues.carbs,
          fat: editValues.fat,
        },
      },
    });

    setEditingFood(null);
  };

  const cancelEditing = () => {
    setEditingFood(null);
  };

  return (
    <View className="mx-4 mb-6">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
          <Sparkles size={16} color="#3B82F6" />
        </View>
        <Text className="text-lg font-bold text-gray-900">AI Analyzed Foods</Text>
        <View className="ml-2 bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-blue-800 text-xs font-semibold">{todaysPendingFoods.length}</Text>
        </View>
      </View>

      <View className="space-y-3">
        {todaysPendingFoods.map((food) => (
          <View key={food.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            {/* Food Info */}
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                    {food.food.name}
                  </Text>
                  {food.isAnalyzing && (
                    <View className="ml-2 animate-spin">
                      <Timer size={16} color="#3B82F6" />
                    </View>
                  )}
                </View>
                <View className="flex-row items-center mt-1">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getMealTypeColor(food.mealType) }}
                  />
                  <Text
                    className="text-sm font-medium capitalize"
                    style={{ color: getMealTypeColor(food.mealType) }}
                  >
                    {food.mealType}
                  </Text>
                  {!food.isAnalyzing && (
                    <Text className="text-gray-500 text-sm ml-2">
                      • {food.confidence}% confidence
                    </Text>
                  )}
                  {food.isAnalyzing && (
                    <Text className="text-blue-600 text-sm ml-2">• AI analyzing...</Text>
                  )}
                </View>
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-gray-900">
                  {food.isAnalyzing
                    ? '...'
                    : `${Math.round(food.food.nutrition.calories * food.quantity)} cal`}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {food.isAnalyzing
                    ? 'Processing...'
                    : `${food.quantity}x ${food.food.servingSize}`}
                </Text>
              </View>
            </View>

            {/* Nutrition Summary - Editable */}
            <TouchableOpacity
              onPress={() => !food.isAnalyzing && editingFood !== food.id && startEditing(food)}
              className="mb-4 bg-gray-50 rounded-xl p-3"
              disabled={food.isAnalyzing || editingFood === food.id}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-700 font-medium text-sm">Nutrition Values</Text>
                {editingFood === food.id ? (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={cancelEditing}
                      className="bg-gray-300 px-3 py-1 rounded-lg"
                    >
                      <Text className="text-gray-700 text-xs font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => saveEditing(food)}
                      className="bg-blue-500 px-3 py-1 rounded-lg"
                    >
                      <Text className="text-white text-xs font-medium">Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : food.isAnalyzing ? (
                  <View className="flex-row items-center">
                    <Timer size={14} color="#3B82F6" />
                    <Text className="text-blue-600 text-xs ml-1">Processing...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Edit3 size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-xs ml-1">Tap to edit</Text>
                  </View>
                )}
              </View>

              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  {editingFood === food.id ? (
                    <TextInput
                      value={editValues.calories.toString()}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, calories: parseInt(text) || 0 }))
                      }
                      className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-center font-medium min-w-[50px]"
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  ) : (
                    <Text className="text-gray-700 font-medium">
                      {food.isAnalyzing
                        ? '...'
                        : Math.round(food.food.nutrition.calories * food.quantity)}
                    </Text>
                  )}
                  <Text className="text-gray-500 text-xs">Calories</Text>
                </View>

                <View className="items-center flex-1">
                  {editingFood === food.id ? (
                    <TextInput
                      value={editValues.protein.toString()}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, protein: parseInt(text) || 0 }))
                      }
                      className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-center font-medium min-w-[40px]"
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  ) : (
                    <Text className="text-gray-700 font-medium">
                      {food.isAnalyzing
                        ? '...'
                        : `${Math.round(food.food.nutrition.protein * food.quantity)}g`}
                    </Text>
                  )}
                  <Text className="text-gray-500 text-xs">Protein</Text>
                </View>

                <View className="items-center flex-1">
                  {editingFood === food.id ? (
                    <TextInput
                      value={editValues.carbs.toString()}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, carbs: parseInt(text) || 0 }))
                      }
                      className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-center font-medium min-w-[40px]"
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  ) : (
                    <Text className="text-gray-700 font-medium">
                      {food.isAnalyzing
                        ? '...'
                        : `${Math.round(food.food.nutrition.carbs * food.quantity)}g`}
                    </Text>
                  )}
                  <Text className="text-gray-500 text-xs">Carbs</Text>
                </View>

                <View className="items-center flex-1">
                  {editingFood === food.id ? (
                    <TextInput
                      value={editValues.fat.toString()}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, fat: parseInt(text) || 0 }))
                      }
                      className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-center font-medium min-w-[40px]"
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  ) : (
                    <Text className="text-gray-700 font-medium">
                      {food.isAnalyzing
                        ? '...'
                        : `${Math.round(food.food.nutrition.fat * food.quantity)}g`}
                    </Text>
                  )}
                  <Text className="text-gray-500 text-xs">Fat</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            {food.isAnalyzing ? (
              <View className="bg-blue-50 py-3 rounded-xl flex-row items-center justify-center">
                <Timer size={16} color="#3B82F6" />
                <Text className="text-blue-600 font-medium ml-2">AI analyzing food...</Text>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleDiscardFood(food)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                >
                  <X size={16} color="#6B7280" />
                  <Text className="text-gray-700 font-medium ml-2">Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSaveFood(food)}
                  disabled={createMealEntry.isPending}
                  className="flex-1 bg-green-500 py-3 rounded-xl flex-row items-center justify-center"
                  style={{
                    backgroundColor: createMealEntry.isPending ? '#9CA3AF' : '#10B981',
                  }}
                >
                  {createMealEntry.isPending ? (
                    <Timer size={16} color="white" />
                  ) : (
                    <Check size={16} color="white" />
                  )}
                  <Text className="text-white font-medium ml-2">
                    {createMealEntry.isPending ? 'Saving...' : 'Save to Meals'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
