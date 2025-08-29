import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Coffee, Utensils, Sandwich, Cookie } from 'lucide-react-native';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: '#F59E0B' },
  { id: 'lunch', label: 'Lunch', icon: Utensils, color: '#10B981' },
  { id: 'dinner', label: 'Dinner', icon: Sandwich, color: '#8B5CF6' },
  { id: 'snack', label: 'Snack', icon: Cookie, color: '#EC4899' },
];

interface MealTypeSelectorProps {
  selectedMealType: string;
  onMealTypeChange: (mealType: string) => void;
}

export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selectedMealType,
  onMealTypeChange,
}) => {
  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">Meal Type</Text>
      <View className="flex-row flex-wrap gap-2">
        {mealTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = selectedMealType === type.id;

          return (
            <TouchableOpacity
              key={type.id}
              onPress={() => onMealTypeChange(type.id)}
              className={`flex-row items-center px-4 py-3 rounded-xl border ${
                isSelected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <IconComponent size={18} color={isSelected ? '#10B981' : type.color} />
              <Text
                className={`ml-2 font-medium ${isSelected ? 'text-green-700' : 'text-gray-700'}`}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
