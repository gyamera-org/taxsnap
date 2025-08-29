import React from 'react';
import { View, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react-native';

interface CustomFoodData {
  name: string;
  brand: string;
  category: string;
  servingSize: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
}

interface CustomFoodModalProps {
  visible: boolean;
  onClose: () => void;
  customFood: CustomFoodData;
  onCustomFoodChange: (field: keyof CustomFoodData, value: string) => void;
  onReset: () => void;
  onAddCustomFood: () => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  visible,
  onClose,
  customFood,
  onCustomFoodChange,
  onReset,
  onAddCustomFood,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[95%]">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Add Custom Food</Text>
            <TouchableOpacity onPress={onReset}>
              <Text className="text-blue-600 font-medium">Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {/* Food Info Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Food Information</Text>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Food Name *</Text>
                <TextInput
                  value={customFood.name}
                  onChangeText={(value) => onCustomFoodChange('name', value)}
                  placeholder="e.g., Homemade Pasta Salad"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Brand (Optional)</Text>
                <TextInput
                  value={customFood.brand}
                  onChangeText={(value) => onCustomFoodChange('brand', value)}
                  placeholder="e.g., Homemade, Kraft, etc."
                  placeholderTextColor="#9CA3AF"
                  className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Serving Size *</Text>
                <TextInput
                  value={customFood.servingSize}
                  onChangeText={(value) => onCustomFoodChange('servingSize', value)}
                  placeholder="e.g., 1 cup, 100g, 1 slice"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
                />
              </View>
            </View>

            {/* Nutrition Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Nutrition per Serving
              </Text>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Calories *</Text>
                  <TextInput
                    value={customFood.calories}
                    onChangeText={(value) => onCustomFoodChange('calories', value)}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Protein (g) *</Text>
                  <TextInput
                    value={customFood.protein}
                    onChangeText={(value) => onCustomFoodChange('protein', value)}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                  />
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Carbs (g) *</Text>
                  <TextInput
                    value={customFood.carbs}
                    onChangeText={(value) => onCustomFoodChange('carbs', value)}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Fat (g) *</Text>
                  <TextInput
                    value={customFood.fat}
                    onChangeText={(value) => onCustomFoodChange('fat', value)}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                  />
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Fiber (g)</Text>
                  <TextInput
                    value={customFood.fiber}
                    onChangeText={(value) => onCustomFoodChange('fiber', value)}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Sugar (g)</Text>
                  <TextInput
                    value={customFood.sugar}
                    onChangeText={(value) => onCustomFoodChange('sugar', value)}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="p-4 border-t border-gray-200">
            <Button
              title="Add Food"
              onPress={onAddCustomFood}
              className="w-full bg-blue-500"
              disabled={
                !customFood.name.trim() || !customFood.servingSize.trim() || !customFood.calories
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
