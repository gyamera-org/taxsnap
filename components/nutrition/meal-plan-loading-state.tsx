import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';
import { Timer, Bug } from 'lucide-react-native';

interface MealPlanLoadingStateProps {
  generationStage?: string;
  generationProgress?: number;
  onClear?: () => void;
}

export default function MealPlanLoadingState({
  generationStage,
  generationProgress = 0,
  onClear,
}: MealPlanLoadingStateProps) {
  const themed = useThemedStyles();

  const getStageMessage = () => {
    switch (generationStage) {
      case 'planning':
        return 'Planning your personalized meals...';
      case 'generating':
        return 'AI is creating your meal plan...';
      case 'processing':
        return 'Processing nutrition data...';
      case 'finalizing':
        return 'Finalizing your meal plan...';
      default:
        return "We're generating your personalized meal plan and grocery list.";
    }
  };

  return (
    <View className="mx-4 mb-6">
      <View
        className={themed(
          'bg-green-500/30 rounded-2xl p-6 shadow-lg',
          'bg-green-600/30 rounded-2xl p-6 shadow-lg'
        )}
        style={{
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View>
          <View className="flex-row items-center mb-2">
            <Timer size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-3">Creating Your Meal Plan...</Text>
          </View>
          <Text className="text-white/90 text-sm">{getStageMessage()}</Text>

          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white/80 text-xs">Progress</Text>
              <Text className="text-white/80 text-xs">{generationProgress}%</Text>
            </View>
            <View className="bg-white/20 rounded-full h-2">
              <View
                className="bg-white rounded-full h-2"
                style={{
                  width: `${Math.max(5, generationProgress)}%`,
                }}
              />
            </View>
          </View>

          <TouchableOpacity onPress={onClear} className="mt-4 bg-red-500 rounded-lg py-2 px-4">
            <View className="flex-row items-center justify-center">
              <Bug size={16} color="white" />
              <Text className="text-white text-sm font-medium ml-2">Clear Stuck Plan (Debug)</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
