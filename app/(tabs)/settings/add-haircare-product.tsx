import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';

import { Camera, ImageIcon, Package } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAnalyzeScan, NonBeautyProductError } from '@/lib/hooks/use-analyze-scan';
import { useAddBeautyProduct } from '@/lib/hooks/use-beauty-products';
import { ProductDetailModal } from '@/components/saves/ProductDetailModal/ProductDetailModal';
import { ScannedProductUI } from '@/lib/types/product';

interface ManualProduct {
  name: string;
  brand: string;
  category: string;
}

export default function AddHaircareProductScreen() {
  const router = useRouter();
  const analyzeScan = useAnalyzeScan();
  const addBeautyProduct = useAddBeautyProduct();

  const [activeButton, setActiveButton] = useState<'camera' | 'gallery' | null>(null);
  const [scannedProduct, setScannedProduct] = useState<ScannedProductUI | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [manualProduct, setManualProduct] = useState<ManualProduct>({
    name: '',
    brand: '',
    category: 'Shampoo',
  });

  const haircareCategories = [
    'Shampoo',
    'Conditioner',
    'Hair Mask',
    'Hair Oil',
    'Serum',
    'Styling Cream',
    'Hair Spray',
    'Dry Shampoo',
    'Leave-in Treatment',
    'Scalp Treatment',
    'Other',
  ];

  const handleGoBack = () => {
    router.push('/(tabs)/settings/haircare-products');
  };

  const requestPermission = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan haircare products.',
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

  const pickImage = async (source: 'camera' | 'library') => {
    const hasPermission = await requestPermission(source);
    if (!hasPermission) return;

    setActiveButton(source);

    try {
      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      toast.error('Failed to pick image');
    } finally {
      setActiveButton(null);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    try {
      toast.loading('Analyzing product...', {
        description: 'Getting ingredient details',
      });

      const analysisResult = await analyzeScan.mutateAsync({
        imageUri,
        productType: 'haircare',
      });

      const productUI: ScannedProductUI = {
        id: `scan_${Date.now()}`,
        name: analysisResult.name,
        brand: analysisResult.brand,
        category: analysisResult.category,
        safetyScore: analysisResult.safety_score,
        image: { uri: imageUri },
        ingredients: analysisResult.ingredients,
        keyIngredients: analysisResult.key_ingredients,
        productLinks: analysisResult.product_links || [],
        isFavorite: false,
        cycleInsights: undefined,
        hormoneImpact: undefined,
      };

      setScannedProduct(productUI);
      setShowProductDetail(true);
      toast.dismiss();
    } catch (error) {
      console.error('Analysis error:', error);
      toast.dismiss();

      if (error instanceof NonBeautyProductError) {
        toast.error('Not a haircare product', {
          description: 'Please scan a haircare product',
        });
      } else {
        toast.error('Failed to analyze product');
      }
    }
  };

  const handleManualAdd = async () => {
    if (!manualProduct.name.trim() || !manualProduct.brand.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      toast.loading('Adding product...', {
        description: 'Saving to your collection',
      });

      const beautyProduct = {
        name: manualProduct.name.trim(),
        brand: manualProduct.brand.trim(),
        category: manualProduct.category,
        product_type: 'haircare' as const,
        safety_score: 8,
        ingredients: [],
        key_ingredients: [],
        usage_frequency: 'daily' as const,
        cycle_phase_preference: 'any' as const,
        is_active: true,
      };

      await addBeautyProduct.mutateAsync(beautyProduct);

      toast.dismiss();
      toast.success('Adding to your collection...', {
        description: 'Product will appear in your list automatically',
      });

      // Reset form and go back
      setManualProduct({ name: '', brand: '', category: 'Shampoo' });
      router.push('/(tabs)/settings/haircare-products');
    } catch (error) {
      console.error('Manual add error:', error);
      toast.dismiss();
      toast.error('Failed to add product');
    }
  };

  const handleSaveScan = async () => {
    if (!scannedProduct) return;

    try {
      toast.loading('Saving haircare product...', {
        description: 'Adding to your collection',
      });

      const beautyProduct = {
        name: scannedProduct.name,
        brand: scannedProduct.brand,
        category: scannedProduct.category,
        product_type: 'haircare' as const,
        safety_score: scannedProduct.safetyScore,
        ingredients: scannedProduct.ingredients,
        key_ingredients: scannedProduct.keyIngredients,
        usage_frequency: 'daily' as const,
        cycle_phase_preference: 'any' as const,
        is_active: true,
      };

      await addBeautyProduct.mutateAsync(beautyProduct);

      toast.dismiss();
      toast.success('Analyzing complete!', {
        description: 'Product will appear in your collection automatically',
      });

      setShowProductDetail(false);
      router.push('/(tabs)/settings/haircare-products');
    } catch (error) {
      console.error('Save product error:', error);
      toast.dismiss();
      toast.error('Failed to save product');
    }
  };

  return (
    <>
      <SubPageLayout title="Add Haircare Product" onBack={handleGoBack}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-6">
            {/* Scan Options */}
            <View className="mb-8">
              <Text className="text-xl font-bold text-black mb-4">Scan Product</Text>
              <View className="gap-3">
                <TouchableOpacity
                  onPress={() => pickImage('camera')}
                  disabled={activeButton === 'camera'}
                  className="bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center"
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-50">
                    <Camera size={20} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-black">Scan with Camera</Text>
                    <Text className="text-gray-500 text-sm">
                      {activeButton === 'camera'
                        ? 'Taking photo...'
                        : 'Get instant ingredient analysis'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => pickImage('library')}
                  disabled={activeButton === 'gallery'}
                  className="bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center"
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-indigo-50">
                    <ImageIcon size={20} color="#6366F1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-black">Upload Photo</Text>
                    <Text className="text-gray-500 text-sm">
                      {activeButton === 'gallery' ? 'Uploading...' : 'Choose from photo library'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Manual Entry */}
            <View>
              <Text className="text-xl font-bold text-black mb-4">Add Manually</Text>
              <View className="bg-white rounded-2xl p-4 border border-gray-200 gap-4">
                <View>
                  <Text className="text-base font-medium text-black mb-2">Product Name *</Text>
                  <TextInput
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-base"
                    placeholder="e.g., Hydrating Shampoo"
                    value={manualProduct.name}
                    onChangeText={(text) => setManualProduct((prev) => ({ ...prev, name: text }))}
                  />
                </View>

                <View>
                  <Text className="text-base font-medium text-black mb-2">Brand *</Text>
                  <TextInput
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-base"
                    placeholder="e.g., Olaplex"
                    value={manualProduct.brand}
                    onChangeText={(text) => setManualProduct((prev) => ({ ...prev, brand: text }))}
                  />
                </View>

                <View>
                  <Text className="text-base font-medium text-black mb-2">Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {haircareCategories.map((category) => (
                        <TouchableOpacity
                          key={category}
                          onPress={() => setManualProduct((prev) => ({ ...prev, category }))}
                          className={`px-4 py-2 rounded-full border ${
                            manualProduct.category === category
                              ? 'bg-purple-100 border-purple-300'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              manualProduct.category === category
                                ? 'text-purple-700 font-medium'
                                : 'text-gray-600'
                            }`}
                          >
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <Button
                  title="Add Product"
                  onPress={handleManualAdd}
                  variant="primary"
                  className="mt-4"
                  disabled={
                    !manualProduct.name.trim() ||
                    !manualProduct.brand.trim() ||
                    addBeautyProduct.isPending
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SubPageLayout>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={scannedProduct}
        visible={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        onSaveScan={handleSaveScan}
        isSavingScan={addBeautyProduct.isPending}
        modalHeight="80%"
      />
    </>
  );
}
