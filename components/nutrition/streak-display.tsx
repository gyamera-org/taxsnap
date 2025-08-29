import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Flame, Plus } from 'lucide-react-native';

interface StreakDisplayProps {
  currentStreak: number;
  isLoading?: boolean;
  onAddMealPress?: () => void;
}

export default function StreakDisplay({
  currentStreak,
  isLoading = false,
  onAddMealPress,
}: StreakDisplayProps) {
  if (isLoading) {
    // Show skeleton for streak
    return (
      <View className="flex-row items-center">
        <View className="mr-3 bg-gray-200 rounded-xl px-3 py-2 w-16 h-8" />
        <TouchableOpacity
          onPress={onAddMealPress}
          className="bg-green-500 w-10 h-10 rounded-full items-center justify-center"
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center">
      {/* Streak Display */}
      <View className="mr-3 bg-orange-100 rounded-xl px-3 py-2 flex-row items-center">
        <Flame size={16} color="#F59E0B" />
        <Text className="text-orange-700 font-semibold text-sm ml-1">{currentStreak}</Text>
      </View>

      {/* Add Meal Button */}
      <TouchableOpacity
        onPress={onAddMealPress}
        className="bg-green-500 w-10 h-10 rounded-full items-center justify-center"
      >
        <Plus size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}
