import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Plus, Minus, Edit3, Check } from 'lucide-react-native';
import { FoodItemWithQuantity } from '@/lib/types/nutrition-tracking';

interface SelectedFoodsListProps {
  selectedFoods: FoodItemWithQuantity[];
  editingItemId: string | null;
  editingValues: {
    quantity: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onUpdateQuantity: (foodId: string, change: number) => void;
  onStartEditing: (item: FoodItemWithQuantity) => void;
  onSaveEditing: () => void;
  onEditingValueChange: (field: string, value: number) => void;
}

export const SelectedFoodsList: React.FC<SelectedFoodsListProps> = ({
  selectedFoods,
  editingItemId,
  editingValues,
  onUpdateQuantity,
  onStartEditing,
  onSaveEditing,
  onEditingValueChange,
}) => {
  if (selectedFoods.length === 0) return null;

  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">Selected Foods</Text>
      {selectedFoods.map((item) => {
        const isEditing = editingItemId === item.food.id;
        return (
          <View key={item.food.id} className="bg-white rounded-xl p-4 mb-2 border border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{item.food.name}</Text>
                <Text className="text-sm text-gray-500">
                  {item.food.brand} • {item.food.servingSize}
                </Text>
              </View>

              <View className="flex-row items-center">
                {!isEditing ? (
                  <>
                    <TouchableOpacity
                      onPress={() => onUpdateQuantity(item.food.id, -1)}
                      className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                    >
                      <Minus size={16} color="#6B7280" />
                    </TouchableOpacity>

                    <Text className="mx-3 font-semibold text-gray-900">{item.quantity}</Text>

                    <TouchableOpacity
                      onPress={() => onUpdateQuantity(item.food.id, 1)}
                      className="w-8 h-8 bg-green-100 rounded-full items-center justify-center"
                    >
                      <Plus size={16} color="#10B981" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onStartEditing(item)}
                      className="ml-2 w-8 h-8 bg-blue-100 rounded-full items-center justify-center"
                    >
                      <Edit3 size={16} color="#3B82F6" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={onSaveEditing}
                    className="w-8 h-8 bg-green-100 rounded-full items-center justify-center"
                  >
                    <Check size={16} color="#10B981" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {isEditing ? (
              <View className="flex flex-col gap-2">
                {/* Quantity Input */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-gray-700">Quantity:</Text>
                  <TextInput
                    value={editingValues.quantity.toString()}
                    onChangeText={(value) => {
                      const num = parseFloat(value);
                      if (!isNaN(num) && num > 0) {
                        onEditingValueChange('quantity', num);
                      }
                    }}
                    keyboardType="numeric"
                    className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 min-w-20 text-center"
                  />
                </View>

                {/* Nutrition Inputs */}
                <View className="flex-row justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs font-medium text-gray-600 mb-1">Calories</Text>
                    <TextInput
                      value={editingValues.calories.toString()}
                      onChangeText={(value) => {
                        const num = parseFloat(value);
                        if (!isNaN(num) && num >= 0) {
                          onEditingValueChange('calories', num);
                        }
                      }}
                      keyboardType="numeric"
                      className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-900 text-center"
                    />
                  </View>

                  <View className="flex-1 mx-1">
                    <Text className="text-xs font-medium text-gray-600 mb-1">Protein (g)</Text>
                    <TextInput
                      value={editingValues.protein.toString()}
                      onChangeText={(value) => {
                        const num = parseFloat(value);
                        if (!isNaN(num) && num >= 0) {
                          onEditingValueChange('protein', num);
                        }
                      }}
                      keyboardType="numeric"
                      className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-900 text-center"
                    />
                  </View>

                  <View className="flex-1 mx-1">
                    <Text className="text-xs font-medium text-gray-600 mb-1">Carbs (g)</Text>
                    <TextInput
                      value={editingValues.carbs.toString()}
                      onChangeText={(value) => {
                        const num = parseFloat(value);
                        if (!isNaN(num) && num >= 0) {
                          onEditingValueChange('carbs', num);
                        }
                      }}
                      keyboardType="numeric"
                      className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-900 text-center"
                    />
                  </View>

                  <View className="flex-1 ml-2">
                    <Text className="text-xs font-medium text-gray-600 mb-1">Fat (g)</Text>
                    <TextInput
                      value={editingValues.fat.toString()}
                      onChangeText={(value) => {
                        const num = parseFloat(value);
                        if (!isNaN(num) && num >= 0) {
                          onEditingValueChange('fat', num);
                        }
                      }}
                      keyboardType="numeric"
                      className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-900 text-center"
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View className="flex-row justify-between pt-2 border-t border-gray-50">
                <Text className="text-xs text-gray-500">
                  {item.food.nutrition.calories * item.quantity} cal
                </Text>
                <Text className="text-xs text-gray-500">
                  P: {item.food.nutrition.protein * item.quantity}g
                </Text>
                <Text className="text-xs text-gray-500">
                  C: {item.food.nutrition.carbs * item.quantity}g
                </Text>
                <Text className="text-xs text-gray-500">
                  F: {item.food.nutrition.fat * item.quantity}g
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
