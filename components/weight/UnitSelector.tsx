import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Settings, Edit3 } from 'lucide-react-native';
import { type BodyMeasurements } from '@/lib/hooks/use-weight-tracking';

interface UnitSelectorProps {
  bodyMeasurements: BodyMeasurements | null;
  onShowUnitPicker: () => void;
}

export function UnitSelector({ bodyMeasurements, onShowUnitPicker }: UnitSelectorProps) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-3">
        <View className="bg-gray-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
          <Settings size={20} color="#374151" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">Weight Units</Text>
          <Text className="text-xs text-gray-500">Choose your preferred unit</Text>
        </View>
        <Pressable onPress={onShowUnitPicker} className="p-1">
          <Edit3 size={16} color="#6b7280" />
        </Pressable>
      </View>

      <Text className="text-2xl font-bold text-gray-900">{bodyMeasurements?.units || 'kg'}</Text>
    </View>
  );
}
