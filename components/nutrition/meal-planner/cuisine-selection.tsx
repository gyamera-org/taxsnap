import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';

interface CuisineSelectionProps {
  selectedCuisines: string[];
  customCuisine: string;
  setCustomCuisine: (value: string) => void;
  toggleCuisine: (cuisine: string) => void;
  addCustomCuisine: () => void;
}

const suggestedCuisines = [
  'Mediterranean', 'Asian', 'Italian', 'Mexican', 'Indian', 'American', 
  'Middle Eastern', 'Japanese', 'African', 'Caribbean', 'French', 
  'Thai', 'Greek', 'Chinese', 'Korean', 'Vietnamese', 'Lebanese'
];

export default function CuisineSelection({
  selectedCuisines,
  customCuisine,
  setCustomCuisine,
  toggleCuisine,
  addCustomCuisine,
}: CuisineSelectionProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  // Show only first 8 cuisines when collapsed
  const displayedCuisines = showAllCuisines 
    ? suggestedCuisines 
    : suggestedCuisines.slice(0, 8);

  return (
    <View className="mb-6">
      <Text className={themed("text-lg font-semibold text-gray-900 mb-3", "text-lg font-semibold text-white mb-3")}>
        Cuisines
      </Text>
      
      {/* Custom cuisine input */}
      <View className="flex-row gap-2 mb-3">
        <TextInput
          value={customCuisine}
          onChangeText={setCustomCuisine}
          placeholder="Add cuisine (e.g., Ethiopian, Filipino)"
          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
          className={themed("flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900", "flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white")}
          onSubmitEditing={addCustomCuisine}
        />
        <TouchableOpacity
          onPress={addCustomCuisine}
          className="w-10 h-10 bg-green-500 rounded-lg items-center justify-center"
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Suggested cuisines */}
      <View className="flex-row flex-wrap gap-2 mb-2">
        {displayedCuisines.map((cuisine) => (
          <TouchableOpacity
            key={cuisine}
            onPress={() => toggleCuisine(cuisine)}
            className={`px-3 py-1 rounded-full border ${
              selectedCuisines.includes(cuisine)
                ? themed('bg-green-50 border-green-200', 'bg-green-900/20 border-green-600')
                : themed('bg-white border-gray-200', 'bg-gray-800 border-gray-600')
            }`}
          >
            <Text className={`text-sm font-medium ${
              selectedCuisines.includes(cuisine)
                ? themed('text-green-700', 'text-green-300')
                : themed('text-gray-700', 'text-gray-300')
            }`}>
              {cuisine}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show more/less button for cuisines */}
      {suggestedCuisines.length > 8 && (
        <TouchableOpacity
          onPress={() => setShowAllCuisines(!showAllCuisines)}
          className={`flex-row items-center justify-center py-2 mb-3 rounded-lg ${themed('bg-gray-100', 'bg-gray-800')}`}
        >
          {showAllCuisines ? (
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
                Show {suggestedCuisines.length - 8} more
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Selected cuisines */}
      {selectedCuisines.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {selectedCuisines.map((cuisine) => (
            <View
              key={cuisine}
              className={themed("flex-row items-center bg-green-100 rounded-full px-3 py-1", "flex-row items-center bg-green-900/30 rounded-full px-3 py-1")}
            >
              <Text className={themed("text-sm text-green-700 mr-2", "text-sm text-green-300 mr-2")}>
                {cuisine}
              </Text>
              <TouchableOpacity onPress={() => toggleCuisine(cuisine)}>
                <X size={14} color={isDark ? "#10B981" : "#059669"} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}