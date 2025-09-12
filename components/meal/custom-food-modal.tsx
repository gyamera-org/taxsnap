import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X, Check, Globe } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

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
  onAddCustomFood: (shareWithCommunity?: boolean) => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  visible,
  onClose,
  customFood,
  onCustomFoodChange,
  onReset,
  onAddCustomFood,
}) => {
  const { isDark } = useTheme();
  const [shareWithCommunity, setShareWithCommunity] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          className={`rounded-t-3xl h-[95%] ${isDark ? 'bg-gray-900' : 'bg-white'}`}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View className="flex-row items-center justify-between p-6">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Custom Food</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Food Name *</Text>
              <TextInput
                value={customFood.name}
                onChangeText={(value) => onCustomFoodChange('name', value)}
                placeholder="e.g., Homemade Pasta Salad"
                placeholderTextColor="#9CA3AF"
                className={`border rounded-2xl px-4 py-4 text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
              />
            </View>

            <View className="mb-6">
              <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Brand (Optional)</Text>
              <TextInput
                value={customFood.brand}
                onChangeText={(value) => onCustomFoodChange('brand', value)}
                placeholder="e.g., Homemade, Kraft, etc."
                placeholderTextColor="#9CA3AF"
                className={`border rounded-2xl px-4 py-4 text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
              />
            </View>

            <View className="mb-6">
              <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Serving Size *</Text>
              <TextInput
                value={customFood.servingSize}
                onChangeText={(value) => onCustomFoodChange('servingSize', value)}
                placeholder="e.g., 1 cup, 100g, 1 slice"
                placeholderTextColor="#9CA3AF"
                className={`border rounded-2xl px-4 py-4 text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
              />
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Calories *</Text>
                <TextInput
                  value={customFood.calories}
                  onChangeText={(value) => onCustomFoodChange('calories', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={`border rounded-2xl px-4 py-4 text-center text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Protein (g) *</Text>
                <TextInput
                  value={customFood.protein}
                  onChangeText={(value) => onCustomFoodChange('protein', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={`border rounded-2xl px-4 py-4 text-center text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Carbs (g) *</Text>
                <TextInput
                  value={customFood.carbs}
                  onChangeText={(value) => onCustomFoodChange('carbs', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={`border rounded-2xl px-4 py-4 text-center text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fat (g) *</Text>
                <TextInput
                  value={customFood.fat}
                  onChangeText={(value) => onCustomFoodChange('fat', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={`border rounded-2xl px-4 py-4 text-center text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fiber (g)</Text>
                <TextInput
                  value={customFood.fiber}
                  onChangeText={(value) => onCustomFoodChange('fiber', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={`border rounded-2xl px-4 py-4 text-center text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sugar (g)</Text>
                <TextInput
                  value={customFood.sugar}
                  onChangeText={(value) => onCustomFoodChange('sugar', value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={`border rounded-2xl px-4 py-4 text-center text-base ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </View>
            </View>

            {/* Community Sharing - Clean Style like Exercise Modal */}
            <View className={`pt-4 border-t mb-6 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <TouchableOpacity
                onPress={() => setShareWithCommunity(!shareWithCommunity)}
                className="flex-row items-center"
                activeOpacity={0.8}
              >
                <View
                  className={`w-6 h-6 rounded-full border mr-4 items-center justify-center ${
                    shareWithCommunity 
                      ? 'bg-pink-500 border-pink-500' 
                      : isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  {shareWithCommunity && <Check size={14} color="white" />}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Globe size={20} color="#EC4899" />
                    <Text className={`text-base font-medium ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Share with Community
                    </Text>
                  </View>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Contribute this food to our community database for everyone to use
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
            <Button
              title="Add Food"
              onPress={() => onAddCustomFood(shareWithCommunity)}
              variant="primary"
              size="large"
              disabled={
                !customFood.name.trim() || !customFood.servingSize.trim() || !customFood.calories
              }
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
