import React from 'react';
import { View, Text, Modal, SafeAreaView, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { type BodyMeasurements } from '@/lib/hooks/use-weight-tracking';

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
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <SafeAreaView className="bg-white rounded-t-3xl">
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Weight Units</Text>
              <Pressable onPress={onClose}>
                <Text className="text-gray-500 font-medium">Cancel</Text>
              </Pressable>
            </View>

            <Text className="text-gray-600 mb-4">
              Choose your preferred unit for weight measurements
            </Text>

            <View className="gap-3">
              <Pressable
                onPress={() => onUnitChange('kg')}
                className={`p-4 rounded-xl border-2 ${
                  bodyMeasurements?.units === 'kg'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-semibold text-gray-900">Kilograms (kg)</Text>
                    <Text className="text-sm text-gray-500">Metric system</Text>
                  </View>
                  {bodyMeasurements?.units === 'kg' && <Check size={24} color="#ec4899" />}
                </View>
              </Pressable>

              <Pressable
                onPress={() => onUnitChange('lbs')}
                className={`p-4 rounded-xl border-2 ${
                  bodyMeasurements?.units === 'lbs'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-semibold text-gray-900">Pounds (lbs)</Text>
                    <Text className="text-sm text-gray-500">Imperial system</Text>
                  </View>
                  {bodyMeasurements?.units === 'lbs' && <Check size={24} color="#ec4899" />}
                </View>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
