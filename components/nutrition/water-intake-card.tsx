import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { GlassWater } from 'lucide-react-native';

interface WaterIntakeCardProps {
  waterData: {
    consumed: number;
    goal: number;
    glasses: number;
    totalGlasses: number;
  };
  onAddWaterPress?: () => void;
}

export default function WaterIntakeCard({ waterData, onAddWaterPress }: WaterIntakeCardProps) {
  return (
    <View className="px-4 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900">Water Intake</Text>
        <TouchableOpacity onPress={onAddWaterPress}>
          <Text className="text-blue-600 font-medium">Add Water</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View
              style={{ backgroundColor: '#DBEAFE' }}
              className="w-8 h-8 rounded-full items-center justify-center mr-2"
            >
              <GlassWater size={16} color="#3B82F6" />
            </View>
            <Text className="text-sm font-medium text-gray-600">Water</Text>
          </View>
          <Text className="text-xs text-gray-400">
            {waterData.goal - waterData.consumed}ml left
          </Text>
        </View>

        <View className="mb-2">
          <Text className="text-2xl font-bold text-gray-900">{waterData.consumed}ml</Text>
          <Text className="text-xs text-gray-500">of {waterData.goal}ml</Text>
        </View>

        <View className="bg-gray-100 rounded-full h-2">
          <View
            style={{
              width: `${Math.min((waterData.consumed / waterData.goal) * 100, 100)}%`,
              backgroundColor: '#3B82F6',
            }}
            className="h-2 rounded-full"
          />
        </View>
      </View>
    </View>
  );
}
