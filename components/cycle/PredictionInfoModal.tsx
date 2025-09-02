import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Info, X } from 'lucide-react-native';

interface PredictionInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PredictionInfoModal({ visible, onClose }: PredictionInfoModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-white rounded-3xl p-6 max-w-sm w-full">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Info size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Period Prediction</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-700 text-sm leading-6 mb-4">
            Your cycle predictions automatically improve as you track more periods. We use your last
            3-5 cycles to calculate the most accurate prediction possible.
          </Text>

          <View className="bg-purple-50 rounded-2xl p-4 mb-4">
            <Text className="text-purple-900 font-semibold text-sm mb-2">How it works:</Text>
            <Text className="text-purple-800 text-xs leading-5">
              • Uses your most recent 3-5 cycles{'\n'}• Calculates your personal average{'\n'}• If
              we don't have enough data, we use a 28-day cycle{'\n'}• Updates automatically with new
              data{'\n'}• More cycles = better accuracy
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} className="bg-purple-500 py-3 rounded-2xl">
            <Text className="text-white font-semibold text-center">Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
