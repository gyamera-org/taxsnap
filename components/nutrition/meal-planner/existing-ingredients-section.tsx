import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

interface ExistingIngredientsProps {
  existingIngredients: string[];
  setExistingIngredients: (ingredients: string[]) => void;
}

const commonIngredients = [
  'Eggs', 'Milk', 'Bread', 'Rice', 'Pasta', 'Chicken', 'Ground Beef', 'Fish',
  'Onions', 'Garlic', 'Tomatoes', 'Potatoes', 'Carrots', 'Bell Peppers',
  'Spinach', 'Lettuce', 'Cheese', 'Butter', 'Olive Oil', 'Salt', 'Pepper',
  'Flour', 'Sugar', 'Beans', 'Lentils', 'Yogurt', 'Bananas', 'Apples'
];

export default function ExistingIngredientsSection({
  existingIngredients,
  setExistingIngredients,
}: ExistingIngredientsProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();
  const [newIngredient, setNewIngredient] = useState('');
  const [showAllCommon, setShowAllCommon] = useState(false);

  // Show only first 12 common ingredients when collapsed
  const displayedCommonIngredients = showAllCommon 
    ? commonIngredients 
    : commonIngredients.slice(0, 12);

  const addIngredient = () => {
    if (newIngredient.trim() && !existingIngredients.includes(newIngredient.trim())) {
      setExistingIngredients([...existingIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setExistingIngredients(existingIngredients.filter(item => item !== ingredient));
  };

  const toggleIngredient = (ingredient: string) => {
    if (existingIngredients.includes(ingredient)) {
      removeIngredient(ingredient);
    } else {
      setExistingIngredients([...existingIngredients, ingredient]);
    }
  };

  return (
    <View className="mb-6">
      <Text className={themed("text-lg font-semibold text-gray-900 mb-3", "text-lg font-semibold text-white mb-3")}>
        Ingredients You Have
      </Text>
      
      {/* Add custom ingredient */}
      <View className="flex-row gap-2 mb-4">
        <TextInput
          value={newIngredient}
          onChangeText={setNewIngredient}
          placeholder="Add ingredient"
          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
          className={themed("flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900", "flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white")}
          onSubmitEditing={addIngredient}
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          keyboardType="default"
          spellCheck={false}
          enablesReturnKeyAutomatically={false}
        />
        <TouchableOpacity
          onPress={addIngredient}
          className="w-10 h-10 bg-green-500 rounded-lg items-center justify-center"
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Common ingredients */}
      <Text className={themed("text-sm text-gray-600 mb-2", "text-sm text-gray-400 mb-2")}>
        Common ingredients:
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-2">
        {displayedCommonIngredients.map((ingredient) => (
          <TouchableOpacity
            key={ingredient}
            onPress={() => toggleIngredient(ingredient)}
            className={`px-3 py-1 rounded-full border ${
              existingIngredients.includes(ingredient)
                ? themed('bg-green-50 border-green-200', 'bg-green-900/20 border-green-600')
                : themed('bg-white border-gray-200', 'bg-gray-800 border-gray-600')
            }`}
          >
            <Text className={`text-sm font-medium ${
              existingIngredients.includes(ingredient)
                ? themed('text-green-700', 'text-green-300')
                : themed('text-gray-700', 'text-gray-300')
            }`}>
              {ingredient}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show more/less button for common ingredients */}
      {commonIngredients.length > 12 && (
        <TouchableOpacity
          onPress={() => setShowAllCommon(!showAllCommon)}
          className={`flex-row items-center justify-center py-2 mb-4 rounded-lg ${themed('bg-gray-100', 'bg-gray-800')}`}
        >
          {showAllCommon ? (
            <>
              <ChevronUp size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className={themed("ml-1 text-sm text-gray-600", "ml-1 text-sm text-gray-400")}>
                Show less
              </Text>
            </>
          ) : (
            <>
              <ChevronDown size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className={themed("ml-1 text-sm text-gray-600", "ml-1 text-sm text-gray-400")}>
                Show {commonIngredients.length - 12} more
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Selected ingredients */}
      {existingIngredients.length > 0 && (
        <View>
          <Text className={themed("text-sm font-medium text-gray-700 mb-2", "text-sm font-medium text-gray-300 mb-2")}>
            Your ingredients ({existingIngredients.length}):
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {existingIngredients.map((ingredient) => (
              <View
                key={ingredient}
                className={themed("flex-row items-center bg-green-100 rounded-full px-3 py-1", "flex-row items-center bg-green-900/30 rounded-full px-3 py-1")}
              >
                <Text className={themed("text-sm text-green-700 mr-2", "text-sm text-green-300 mr-2")}>
                  {ingredient}
                </Text>
                <TouchableOpacity onPress={() => removeIngredient(ingredient)}>
                  <X size={14} color={isDark ? "#10B981" : "#059669"} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text className={themed("text-xs text-gray-500 mt-2", "text-xs text-gray-400 mt-2")}>
        We'll prioritize recipes that use ingredients you already have
      </Text>
    </View>
  );
}