import React from 'react';
import { View, Text, Modal, SafeAreaView, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { type BodyMeasurements } from '@/lib/hooks/use-weight-tracking';
import { useTheme } from '@/context/theme-provider';

interface UnitPickerModalProps {
  visible: boolean;
  bodyMeasurements: BodyMeasurements | null;
  onClose: () => void;
  onUnitChange: (unit: 'kg' | 'lbs') => void;
}

export function UnitPickerModal({
  visible,
  bodyMeasurements,
  onClose,
  onUnitChange,
}: UnitPickerModalProps) {
  const { isDark } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <SafeAreaView className={`rounded-t-3xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Weight Units</Text>
              <Pressable onPress={onClose}>
                <Text className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cancel</Text>
              </Pressable>
            </View>

            <Text className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose your preferred unit for weight measurements
            </Text>

            <View className="gap-3">
              <Pressable
                onPress={() => onUnitChange('kg')}
                className={`p-4 rounded-xl border-2 ${
                  bodyMeasurements?.units === 'kg' || bodyMeasurements?.units === 'metric'
                    ? 'border-pink-500 bg-pink-50'
                    : isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kilograms (kg)</Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Metric system</Text>
                  </View>
                  {(bodyMeasurements?.units === 'kg' || bodyMeasurements?.units === 'metric') && <Check size={24} color="#ec4899" />}
                </View>
              </Pressable>

              <Pressable
                onPress={() => onUnitChange('lbs')}
                className={`p-4 rounded-xl border-2 ${
                  bodyMeasurements?.units === 'lbs' || bodyMeasurements?.units === 'imperial'
                    ? 'border-pink-500 bg-pink-50'
                    : isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pounds (lbs)</Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Imperial system</Text>
                  </View>
                  {(bodyMeasurements?.units === 'lbs' || bodyMeasurements?.units === 'imperial') && <Check size={24} color="#ec4899" />}
                </View>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
