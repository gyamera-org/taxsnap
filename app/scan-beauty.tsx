import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { useAnalyzeScan, NonBeautyProductError } from '@/lib/hooks/use-analyze-scan';
import { useSaveScanWithInsights } from '@/lib/hooks/use-beauty-recommendations';

import { Camera, ImageIcon, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ProductDetailModal } from '@/components/saves/ProductDetailModal/ProductDetailModal';
import { ScannedProductUI } from '@/lib/types/product';

export default function ScanBeautyScreen() {
  const router = useRouter();
  const analyzeScan = useAnalyzeScan();
  const saveScanWithInsights = useSaveScanWithInsights();

  const [activeButton, setActiveButton] = useState<'camera' | 'gallery' | null>(null);

  const [scannedProduct, setScannedProduct] = useState<ScannedProductUI | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const requestPermission = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan beauty products.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Permission Required',
          'Please grant photo library permission to upload product images.',
          [{ text: 'OK' }]
        );
        return false;
      }
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

  const analyzeProductImage = async (imageUri: string) => {
    try {
      setActiveButton(null);

      toast.loading('Analyzing product...', {
        description: 'Getting beauty insights for you',
      });

      const base64Data = await convertImageToBase64(imageUri);
      const analysis = await analyzeScan.mutateAsync({ imageUrl: base64Data });

      // Convert to UI format
      const productUI: ScannedProductUI = {
        id: `temp_${Date.now()}`,
        name: analysis.name,
        brand: analysis.brand,
        category: analysis.category,
        safetyScore: analysis.safety_score,
        image: { uri: imageUri },
        ingredients: analysis.ingredients,
        keyIngredients: analysis.key_ingredients,
        cycleInsights: analysis.cycle_insights
          ? {
              menstrualPhase: {
                recommended: analysis.cycle_insights.menstrual_phase.recommended,
                reason: analysis.cycle_insights.menstrual_phase.reason,
              },
              follicularPhase: {
                recommended: analysis.cycle_insights.follicular_phase.recommended,
                reason: analysis.cycle_insights.follicular_phase.reason,
              },
              ovulatoryPhase: {
                recommended: analysis.cycle_insights.ovulatory_phase.recommended,
                reason: analysis.cycle_insights.ovulatory_phase.reason,
              },
              lutealPhase: {
                recommended: analysis.cycle_insights.luteal_phase.recommended,
                reason: analysis.cycle_insights.luteal_phase.reason,
              },
            }
          : undefined,
        hormoneImpact: analysis.hormone_impact
          ? {
              mayWorsenPms: analysis.hormone_impact.may_worsen_pms,
              mayCauseBreakouts: analysis.hormone_impact.may_cause_breakouts,
              goodForSensitiveSkin: analysis.hormone_impact.good_for_sensitive_skin,
              description: analysis.hormone_impact.description,
            }
          : undefined,
        productLinks: analysis.product_links,
        isFavorite: false,
      };

      setScannedProduct(productUI);
      setShowProductDetail(true);
      toast.dismiss();
    } catch (error) {
      console.error('Beauty scanning failed:', error);
      toast.dismiss();

      if (error instanceof NonBeautyProductError) {
        toast.error('Not a beauty product', {
          description: `This looks like ${error.detectedCategory}. Try scanning skincare, makeup, or hair products.`,
        });
      } else {
        toast.error('Scan failed', {
          description: 'Please try again with a clearer image.',
        });
      }
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermission('camera');
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
        await analyzeProductImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to take photo');
      setActiveButton(null);
    }
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestPermission('library');
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
        await analyzeProductImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setActiveButton(null);
    }
  };

  const handleSaveScan = async () => {
    if (!scannedProduct) return;

    try {
      toast.loading('Saving product...', {
        description: 'Adding to your collection',
      });

      // Convert back to database format for saving
      const scanData = {
        id: `scan_${Date.now()}`,
        name: scannedProduct.name,
        brand: scannedProduct.brand,
        category: scannedProduct.category,
        safety_score: scannedProduct.safetyScore,
        image_url: scannedProduct.image?.uri || '',
        ingredients: scannedProduct.ingredients,
        key_ingredients: scannedProduct.keyIngredients,
        product_links: scannedProduct.productLinks,
      };

      await saveScanWithInsights.mutateAsync(scanData);

      toast.dismiss();
      toast.success('Product saved!', {
        description: 'Check it out in your cycle tab',
      });

      setShowProductDetail(false);
      router.back();
    } catch (error) {
      console.error('Save scan error:', error);
      toast.dismiss();
      toast.error('Failed to save product');
    }
  };

  return (
    <SubPageLayout title="Scan Skincare Product">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-black mb-2">Scan Your Skincare</Text>
            <Text className="text-gray-600">
              Get instant insights about skincare ingredients and cycle compatibility
            </Text>
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
              <View className="w-12 h-12 rounded-full bg-pink-50 items-center justify-center mr-4">
                <Camera size={24} color="#EC4899" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-black">Take Photo</Text>
                <Text className="text-gray-500 text-sm">
                  {activeButton === 'camera' ? 'Taking photo...' : 'Scan product with camera'}
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
              <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mr-4">
                <ImageIcon size={24} color="#8B5CF6" />
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
          <View className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
            <View className="flex-row items-center mb-3">
              <Sparkles size={20} color="#EC4899" />
              <Text className="text-lg font-semibold text-black ml-2">Scanning Tips</Text>
            </View>
            <View className="gap-2">
              <Text className="text-gray-700 text-sm">
                • Make sure the product label is clearly visible
              </Text>
              <Text className="text-gray-700 text-sm">• Ensure good lighting for best results</Text>
              <Text className="text-gray-700 text-sm">
                • Focus on ingredients list if available
              </Text>
              <Text className="text-gray-700 text-sm">
                • Works best with skincare products (serums, creams, cleansers)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={scannedProduct}
        visible={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        onSaveScan={handleSaveScan}
        isSavingScan={saveScanWithInsights.isPending}
        modalHeight="80%"
      />
    </SubPageLayout>
  );
}
