import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { toast } from 'sonner-native';
import { useScanFood } from '@/lib/hooks/use-food-scanner';

import { Camera, ImageIcon, Sparkles, Timer, QrCode, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScanFoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scanFood = useScanFood();

  const [selectedMealType, setSelectedMealType] = useState(() => {
    const mealType = (params.mealType as string) || 'breakfast';
    return mealType;
  });
  const [activeButton, setActiveButton] = useState<'camera' | 'gallery' | 'barcode' | null>(null);
  const [foodContext, setFoodContext] = useState<string>('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [cameraPermission, requestCameraPermissionHook] = useCameraPermissions();

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

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data:image/jpeg;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
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
        const imageUri = result.assets[0].uri;
        await analyzeFoodImage(imageUri);
      } else {
        setActiveButton(null);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to take photo');
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
        const imageUri = result.assets[0].uri;
        await analyzeFoodImage(imageUri);
      } else {
        setActiveButton(null);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      toast.error('Failed to upload photo');
      setActiveButton(null);
    }
  };

  const analyzeFoodImage = async (imageUri: string) => {
    try {
      const base64Data = await convertImageToBase64(imageUri);

      // Navigate to nutrition page to see the update when it happens
      router.push('/(tabs)/nutrition');

      // Show loading toast
      toast.loading('AI is analyzing your food...', {
        description: 'This may take a moment',
      });

      // Send to AI for analysis and auto-save
      console.log('🍽️ Sending to AI scanner with meal type:', selectedMealType);
      scanFood.mutate(
        {
          image_base64: base64Data,
          context: foodContext.trim() || undefined,
          meal_type: selectedMealType,
          auto_save: true,
        },
        {
          onSuccess: (response) => {
            setActiveButton(null);
          },
          onError: (error) => {
            console.error('Food analysis error:', error);
            toast.error('Unable to analyze food image. Please try again or log manually.');
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

  const analyzeFoodByBarcode = async (barcode: string) => {
    try {
      setShowBarcodeScanner(false);

      // Navigate to nutrition page to see the update when it happens
      router.push('/(tabs)/nutrition');

      // Show loading toast
      toast.loading('Looking up product...', {
        description: 'Searching food database',
      });

      // Send barcode for analysis and auto-save
      console.log('🏷️ Sending barcode to scanner with meal type:', selectedMealType);
      scanFood.mutate(
        {
          barcode,
          context: foodContext.trim() || undefined,
          meal_type: selectedMealType,
          auto_save: true,
        },
        {
          onSuccess: (response) => {
            setActiveButton(null);
          },
          onError: (error) => {
            console.error('Barcode lookup error:', error);
            toast.error('Product not found. Try scanning the food image instead.');
            setActiveButton(null);
          },
        }
      );
    } catch (error) {
      console.error('Barcode processing error:', error);
      toast.error('Failed to process barcode');
      setActiveButton(null);
    }
  };

  const handleBarcodeScanning = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermissionHook();
      if (!permission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan barcodes.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setActiveButton('barcode');
    setShowBarcodeScanner(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setShowBarcodeScanner(false);
    analyzeFoodByBarcode(data);
  };

  return (
    <SubPageLayout title="Scan Food" onBack={() => router.back()}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View className="px-4 mb-6">
          <View className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Sparkles size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-bold text-gray-900">AI Food Scanner</Text>
            </View>
            <Text className="text-gray-700 leading-relaxed">
              Take a photo or upload an image of your food, and our AI will automatically detect the
              food type, calculate nutrition values, and add it to your {selectedMealType} meals.
            </Text>
          </View>
        </View>

        {/* Optional Context Input */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-2xl border border-gray-200 p-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-base font-semibold text-gray-900">Add Context (Optional)</Text>
              <View className="ml-2 bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-800 text-xs font-medium">Helps AI</Text>
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

        {/* Camera and Gallery Options */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            onPress={handleTakePhoto}
            disabled={scanFood.isPending}
            activeOpacity={scanFood.isPending ? 1 : 0.8}
            className="rounded-2xl p-6 shadow-lg"
            style={{
              backgroundColor:
                scanFood.isPending && activeButton === 'camera' ? '#9CA3AF' : '#10B981',
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Camera size={24} color="white" />
                  <Text className="text-white text-xl font-bold ml-3">
                    {scanFood.isPending && activeButton === 'camera'
                      ? 'Analyzing Food...'
                      : 'Take Photo'}
                  </Text>
                </View>
                <Text className="text-white/90 text-sm">
                  {scanFood.isPending && activeButton === 'camera'
                    ? 'AI is analyzing your food image...'
                    : 'Capture your food with the camera'}
                </Text>
              </View>
              <View className="ml-4">
                {scanFood.isPending && activeButton === 'camera' ? (
                  <View className="animate-spin">
                    <Timer size={24} color="white" />
                  </View>
                ) : (
                  <Camera size={24} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Upload from Gallery Option */}
          <TouchableOpacity
            onPress={handleUploadPhoto}
            disabled={scanFood.isPending}
            activeOpacity={scanFood.isPending ? 1 : 0.8}
            className="rounded-2xl p-6 shadow-lg mt-4"
            style={{
              backgroundColor:
                scanFood.isPending && activeButton === 'gallery' ? '#9CA3AF' : '#3B82F6',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <ImageIcon size={24} color="white" />
                  <Text className="text-white text-xl font-bold ml-3">
                    {scanFood.isPending && activeButton === 'gallery'
                      ? 'Analyzing Food...'
                      : 'Upload Photo'}
                  </Text>
                </View>
                <Text className="text-blue-100 text-sm">
                  {scanFood.isPending && activeButton === 'gallery'
                    ? 'AI is analyzing your food image...'
                    : 'Choose an existing photo from your gallery'}
                </Text>
              </View>
              <View className="ml-4">
                {scanFood.isPending && activeButton === 'gallery' ? (
                  <View className="animate-spin">
                    <Timer size={24} color="white" />
                  </View>
                ) : (
                  <ImageIcon size={24} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Barcode Scanning Option - Commented out for now */}
          {/* <TouchableOpacity
            onPress={handleBarcodeScanning}
            disabled={scanFood.isPending}
            activeOpacity={scanFood.isPending ? 1 : 0.8}
            className="rounded-2xl p-6 shadow-lg mt-4"
            style={{
              backgroundColor:
                scanFood.isPending && activeButton === 'barcode' ? '#9CA3AF' : '#8B5CF6',
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <QrCode size={24} color="white" />
                  <Text className="text-white text-xl font-bold ml-3">
                    {scanFood.isPending && activeButton === 'barcode'
                      ? 'Looking up...'
                      : 'Scan Barcode'}
                  </Text>
                </View>
                <Text className="text-purple-100 text-sm">
                  {scanFood.isPending && activeButton === 'barcode'
                    ? 'Searching product database...'
                    : 'Scan product barcode for instant nutrition data'}
                </Text>
              </View>
              <View className="ml-4">
                {scanFood.isPending && activeButton === 'barcode' ? (
                  <View className="animate-spin">
                    <Timer size={24} color="white" />
                  </View>
                ) : (
                  <QrCode size={24} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Analysis notification when running */}
        {scanFood.isPending && (
          <View className="mx-4 mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <View className="animate-spin mr-3">
                <Timer size={16} color="#3B82F6" />
              </View>
              <Text className="text-blue-900 font-semibold">AI is analyzing your food...</Text>
            </View>
            <Text className="text-blue-700 text-sm">
              Go to the Nutrition tab to see your meal appear automatically when analysis completes!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Barcode Scanner Modal - Commented out for now */}
      {/* <Modal
        visible={showBarcodeScanner}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowBarcodeScanner(false);
          setActiveButton(null);
        }}
      >
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between p-4 pt-12 bg-black/80">
            <TouchableOpacity
              onPress={() => {
                setShowBarcodeScanner(false);
                setActiveButton(null);
              }}
              className="bg-white/20 rounded-full p-2"
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">Scan Barcode</Text>
            <View style={{ width: 40 }} />
          </View>

          {cameraPermission?.granted && (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
              }}
            />
          )}

          <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-6">
            <Text className="text-white text-center text-lg font-medium mb-2">
              Point camera at barcode
            </Text>
            <Text className="text-white/70 text-center">
              Position the barcode within the frame to scan
            </Text>
          </View>
        </View>
      </Modal> */}
    </SubPageLayout>
  );
}
