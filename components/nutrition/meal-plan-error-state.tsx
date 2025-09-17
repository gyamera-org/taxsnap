import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';
import { AlertTriangle, RotateCcw, Bug } from 'lucide-react-native';

interface MealPlanErrorStateProps {
  onRetry: () => void;
  onClear?: () => void;
  errorMessage?: string;
}

export default function MealPlanErrorState({
  onRetry,
  onClear,
  errorMessage,
}: MealPlanErrorStateProps) {
  const themed = useThemedStyles();

  return (
    <View className="mx-4 mb-6">
      <View
        className={themed(
          'bg-red-500/30 rounded-2xl p-6 shadow-lg',
          'bg-red-600/30 rounded-2xl p-6 shadow-lg'
        )}
        style={{
          shadowColor: '#EF4444',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View>
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={24} color="#EF4444" />
            <Text className="text-white text-lg font-bold ml-3">Meal Plan Generation Failed</Text>
          </View>
          <Text className="text-white/90 text-sm mb-4">
            {errorMessage ||
              'We encountered an issue while generating your meal plan. This can happen due to AI parsing errors or network issues.'}
          </Text>

          <TouchableOpacity onPress={onRetry} className="bg-green-500 rounded-lg py-3 px-4 mb-3">
            <View className="flex-row items-center justify-center">
              <RotateCcw size={16} color="white" />
              <Text className="text-white text-sm font-semibold ml-2">Try Again</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClear} className="bg-red-500 rounded-lg py-2 px-4">
            <View className="flex-row items-center justify-center">
              <Bug size={16} color="white" />
              <Text className="text-white text-sm font-medium ml-2">Clear Failed Plan (Debug)</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
