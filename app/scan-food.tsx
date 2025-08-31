import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { toast } from 'sonner-native';
import { useScanFood } from '@/lib/hooks/use-food-scanner';

import { Camera, ImageIcon, Sparkles, Timer } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ScanFoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scanFood = useScanFood();

  const [selectedMealType, setSelectedMealType] = useState(() => {
    const mealType = (params.mealType as string) || 'breakfast';
    return mealType;
  });
  const [activeButton, setActiveButton] = useState<'camera' | 'gallery' | null>(null);
  const [foodContext, setFoodContext] = useState<string>('');

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to scan food items.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please grant photo library permission to upload food images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const analyzeFoodImage = async (imageUri: string) => {
    try {
      // Navigate to nutrition page to see the update when it happens
      router.push('/(tabs)/nutrition');

      // Show loading toast
      toast.loading('Analyzing food...', {
        description: "We'll automatically add it to your nutrition after analysis",
      });

      // Convert image to base64
      const imageBase64 = await convertImageToBase64(imageUri);

      // Send image for analysis and auto-save
      scanFood.mutate(
        {
          image_base64: imageBase64,
          context: foodContext.trim() || undefined,
          meal_type: selectedMealType,
          auto_save: true,
        },
        {
          onSuccess: (response) => {
            toast.dismiss();
            toast.success('Food analyzed successfully!', {
              description: `Added to your ${selectedMealType} log`,
            });
            setActiveButton(null);
          },
          onError: (error) => {
            console.error('Food analysis error:', error);
            toast.dismiss();
            toast.error('Failed to analyze food', {
              description: 'Please try again with a clearer image',
            });
            setActiveButton(null);
          },
        }
      );
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
      setActiveButton(null);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setActiveButton('camera');

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to take photo');
    } finally {
      setActiveButton(null);
    }
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    setActiveButton('gallery');

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setActiveButton(null);
    }
  };

  return (
    <SubPageLayout title="Scan Food">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-black mb-2">Scan Your Food</Text>
            <Text className="text-gray-600">
              Get instant nutrition analysis and add to your {selectedMealType} meals
            </Text>
          </View>

          {/* Optional Context Input */}
          <View className="mb-6">
            <View className="bg-white rounded-2xl border border-gray-200 p-4">
              <View className="flex-row items-center mb-3">
                <Text className="text-base font-semibold text-gray-900">
                  Add Context (Optional)
                </Text>
                <View className="ml-2 bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-green-800 text-xs font-medium">Helps AI</Text>
                </View>
              </View>
              <TextInput
                value={foodContext}
                onChangeText={setFoodContext}
                placeholder="e.g., Vietnamese Pho, homemade pasta with tomato sauce..."
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-base"
                style={{
                  minHeight: 48,
                  maxHeight: 120,
                  textAlignVertical: 'top',
                }}
                multiline
                numberOfLines={2}
              />
              <Text className="text-gray-500 text-xs mt-2">
                Provide details about the food to help AI identify it more accurately
              </Text>
            </View>
          </View>

          {/* Scan Options */}
          <View className="gap-4">
            <TouchableOpacity
              onPress={handleTakePhoto}
              disabled={activeButton === 'camera'}
              className={`
                bg-white rounded-2xl p-6 border border-gray-200 flex-row items-center
                ${activeButton === 'camera' ? 'opacity-50' : ''}
              `}
            >
              <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mr-4">
                <Camera size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-black">Take Photo</Text>
                <Text className="text-gray-500 text-sm">
                  {activeButton === 'camera' ? 'Taking photo...' : 'Scan food with camera'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUploadPhoto}
              disabled={activeButton === 'gallery'}
              className={`
                bg-white rounded-2xl p-6 border border-gray-200 flex-row items-center
                ${activeButton === 'gallery' ? 'opacity-50' : ''}
              `}
            >
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
                <ImageIcon size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-black">Upload Photo</Text>
                <Text className="text-gray-500 text-sm">
                  {activeButton === 'gallery' ? 'Uploading...' : 'Choose from photo library'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
            <View className="flex-row items-center mb-3">
              <Sparkles size={20} color="#10B981" />
              <Text className="text-lg font-semibold text-black ml-2">Scanning Tips</Text>
            </View>
            <View className="gap-2">
              <Text className="text-gray-700 text-sm">• Make sure the food is clearly visible</Text>
              <Text className="text-gray-700 text-sm">• Ensure good lighting for best results</Text>
              <Text className="text-gray-700 text-sm">• Include context for better accuracy</Text>
              <Text className="text-gray-700 text-sm">
                • Works with meals, snacks, and individual ingredients
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SubPageLayout>
  );
}
