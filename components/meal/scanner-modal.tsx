import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Camera, ImageIcon, X, Loader2 } from 'lucide-react-native';

interface ScannerModalProps {
  showScanner: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onUploadPhoto: () => void;
  isAnalyzing: boolean;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  showScanner,
  onClose,
  onTakePhoto,
  onUploadPhoto,
  isAnalyzing,
}) => {
  return (
    <>
      {/* Camera Modal */}
      <Modal visible={showScanner} transparent animationType="slide">
        <View className="flex-1 bg-black/90 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Scan Food</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <TouchableOpacity
                onPress={onTakePhoto}
                className="bg-green-500 rounded-2xl p-4 flex-row items-center"
                style={{
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Camera size={24} color="white" />
                <View className="flex-1 ml-4">
                  <Text className="text-white font-semibold text-lg">Take Photo</Text>
                  <Text className="text-white/80 text-sm">Use camera to scan food</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onUploadPhoto}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center"
              >
                <ImageIcon size={24} color="#10B981" />
                <View className="flex-1 ml-4">
                  <Text className="text-gray-900 font-semibold text-lg">Upload Photo</Text>
                  <Text className="text-gray-500 text-sm">Choose from gallery</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text className="text-center text-gray-400 text-sm mt-6">
              AI will analyze the food and estimate nutrition values
            </Text>
          </View>
        </View>
      </Modal>

      {/* Analyzing Overlay */}
      <Modal visible={isAnalyzing} transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center p-4">
          <View className="bg-white rounded-2xl p-8 items-center min-w-[250px]">
            <View className="relative">
              <Loader2
                size={48}
                color="#10B981"
                style={{
                  transform: [{ rotate: '0deg' }],
                }}
              />
            </View>
            <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">Analyzing Food</Text>
            <Text className="text-gray-600 text-center">
              AI is processing your image and calculating nutrition values...
            </Text>
            <View className="flex-row items-center mt-4">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1 opacity-70" />
              <View className="w-2 h-2 bg-green-500 rounded-full opacity-40" />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
