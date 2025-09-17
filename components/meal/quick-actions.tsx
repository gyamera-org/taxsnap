import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Camera, Search, Plus, Sparkles, Heart } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

interface QuickActionsProps {
  selectedMealType: string;
  onScanFood: () => void;
  onSearch: () => void;
  onAddCustomFood: () => void;
  onAIScan: () => void;
  onSavedFood: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  selectedMealType,
  onScanFood,
  onSearch,
  onAddCustomFood,
  onAIScan,
  onSavedFood,
}) => {
  const { isDark } = useTheme();
  return (
    <View className="px-4 mb-6">
      <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Add Food
      </Text>
      <View className="flex-row gap-3 mb-3">
        <TouchableOpacity
          onPress={onScanFood}
          className={`flex-1 rounded-2xl p-4 items-center border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <Camera size={24} color="#10B981" />
          <Text className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Scan Food
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            AI nutrition analysis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSearch}
          className={`flex-1 rounded-2xl p-4 items-center border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <Search size={24} color="#10B981" />
          <Text className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Search
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Find in database
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-3 mb-3">
        <TouchableOpacity
          onPress={onSavedFood}
          className={`flex-1 rounded-2xl p-4 items-center border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <Heart size={24} color="#EC4899" />
          <Text className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Saved Food
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your saved meals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAddCustomFood}
          className={`flex-1 rounded-2xl p-4 items-center border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <Plus size={24} color="#3B82F6" />
          <Text className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Custom Food
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Create your own
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Scan Button */}
      {/* <TouchableOpacity
        onPress={onAIScan}
        className="mt-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 flex-row items-center justify-center"
      >
        <Sparkles size={20} color="white" />
        <Text className="text-white font-semibold ml-2">Or try AI Food Scanner</Text>
      </TouchableOpacity> */}
    </View>
  );
};
