import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner-native';
import { useAnalyzeScan, NonBeautyProductError } from '@/lib/hooks/use-analyze-scan';
import { useAddBeautyProduct } from '@/lib/hooks/use-beauty-products';

import { Camera, ImageIcon, Plus, X, Package, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProductDetailModal } from '@/components/saves/ProductDetailModal/ProductDetailModal';
import { ScannedProductUI } from '@/lib/types/product';

interface ManualProduct {
  name: string;
  brand: string;
  category: string;
}

interface ProductScanningModalProps {
  visible: boolean;
  onClose: () => void;
  productType: 'skincare' | 'haircare';
  categories: string[];
  onProductSaved?: () => void;
}

export function ProductScanningModal({
  visible,
  onClose,
  productType,
  categories,
  onProductSaved,
}: ProductScanningModalProps) {
  const analyzeScan = useAnalyzeScan();
  const addBeautyProduct = useAddBeautyProduct();

  const [activeButton, setActiveButton] = useState<'camera' | 'gallery' | null>(null);
  const [scannedProduct, setScannedProduct] = useState<ScannedProductUI | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualProduct, setManualProduct] = useState<ManualProduct>({
    name: '',
    brand: '',
    category: categories[0] || '',
  });

  const requestPermission = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          `Please grant camera permission to scan ${productType} products.`,
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

      toast.loading(`Analyzing ${productType} product...`, {
        description: 'Getting ingredient insights for you',
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
        cycleInsights: undefined, // Will be added when product is saved with insights
        hormoneImpact: undefined, // Will be added when product is saved with insights
        productLinks: analysis.product_links,
        isFavorite: false,
      };

      setScannedProduct(productUI);
      setShowProductDetail(true);
      toast.dismiss();
    } catch (error) {
      console.error(`${productType} scanning failed:`, error);
      toast.dismiss();

      if (error instanceof NonBeautyProductError) {
        toast.error(`Not a ${productType} product`, {
          description: `This looks like ${error.detectedCategory}. Try scanning ${productType} products.`,
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

  const handleManualAdd = () => {
    if (!manualProduct.name.trim() || !manualProduct.brand.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    // Create a mock product for manual entry (without full analysis)
    const mockProduct: ScannedProductUI = {
      id: `manual_${Date.now()}`,
      name: manualProduct.name.trim(),
      brand: manualProduct.brand.trim(),
      category: manualProduct.category,
      safetyScore: 8, // Default safety score for manual entries
      image: undefined,
      ingredients: [],
      keyIngredients: [],
      productLinks: [],
      isFavorite: false,
    };

    setScannedProduct(mockProduct);
    setShowProductDetail(true);
    setShowManualModal(false);
    setManualProduct({ name: '', brand: '', category: categories[0] || '' });
  };

  const handleSaveScan = async () => {
    if (!scannedProduct) return;

    try {
      toast.loading(`Saving ${productType} product...`, {
        description: 'Adding to your collection',
      });

      // Convert to beauty product format
      const beautyProduct = {
        name: scannedProduct.name,
        brand: scannedProduct.brand,
        category: scannedProduct.category,
        product_type: productType,
        safety_score: scannedProduct.safetyScore,
        ingredients: scannedProduct.ingredients,
        key_ingredients: scannedProduct.keyIngredients,
        usage_frequency: 'daily' as const,
        cycle_phase_preference: 'any' as const,
        is_active: true,
      };

      await addBeautyProduct.mutateAsync(beautyProduct);

      toast.dismiss();
      toast.success(`${productType} product added!`, {
        description: 'Added to your product collection',
      });

      setShowProductDetail(false);
      onClose();
      onProductSaved?.();
    } catch (error) {
      console.error('Save product error:', error);
      toast.dismiss();
      toast.error('Failed to save product');
    }
  };

  const resetAndClose = () => {
    setActiveButton(null);
    setScannedProduct(null);
    setShowProductDetail(false);
    setShowManualModal(false);
    setManualProduct({ name: '', brand: '', category: categories[0] || '' });
    onClose();
  };

  return (
    <>
      {/* Main Scanning Modal */}
      <Modal
        visible={visible && !showManualModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetAndClose}
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={resetAndClose}>
                <X size={24} color="#000" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold">
                Add {productType === 'skincare' ? 'Skincare' : 'Haircare'} Product
              </Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            <View className="gap-4 mb-8">
              <TouchableOpacity
                onPress={handleTakePhoto}
                disabled={activeButton === 'camera'}
                className={`
                  bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center
                  ${activeButton === 'camera' ? 'opacity-50' : ''}
                `}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    productType === 'skincare' ? 'bg-pink-50' : 'bg-purple-50'
                  }`}
                >
                  <Camera size={20} color={productType === 'skincare' ? '#EC4899' : '#8B5CF6'} />
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
                onPress={handleUploadPhoto}
                disabled={activeButton === 'gallery'}
                className={`
                  bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center
                  ${activeButton === 'gallery' ? 'opacity-50' : ''}
                `}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    productType === 'skincare' ? 'bg-purple-50' : 'bg-indigo-50'
                  }`}
                >
                  <ImageIcon size={20} color={productType === 'skincare' ? '#8B5CF6' : '#6366F1'} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-black">Upload Photo</Text>
                  <Text className="text-gray-500 text-sm">
                    {activeButton === 'gallery' ? 'Uploading...' : 'Choose from photo library'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowManualModal(true)}
                className="bg-white rounded-2xl p-4 border border-gray-200 flex-row items-center"
              >
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Plus size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-black">Add Manually</Text>
                  <Text className="text-gray-500 text-sm">Enter product details yourself</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Manual Add Modal */}
      <Modal
        visible={showManualModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowManualModal(false)}
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowManualModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Add Product Manually</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            <View className="gap-4">
              <View>
                <Text className="text-base font-medium text-black mb-2">Product Name *</Text>
                <TextInput
                  className="bg-white rounded-xl p-4 border border-gray-200 text-base"
                  placeholder="e.g., Vitamin C Serum"
                  value={manualProduct.name}
                  onChangeText={(text) => setManualProduct((prev) => ({ ...prev, name: text }))}
                />
              </View>

              <View>
                <Text className="text-base font-medium text-black mb-2">Brand *</Text>
                <TextInput
                  className="bg-white rounded-xl p-4 border border-gray-200 text-base"
                  placeholder="e.g., The Ordinary"
                  value={manualProduct.brand}
                  onChangeText={(text) => setManualProduct((prev) => ({ ...prev, brand: text }))}
                />
              </View>

              <View>
                <Text className="text-base font-medium text-black mb-2">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  <View className="flex-row gap-2">
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => setManualProduct((prev) => ({ ...prev, category }))}
                        className={`px-4 py-2 rounded-full border ${
                          manualProduct.category === category
                            ? productType === 'skincare'
                              ? 'bg-pink-100 border-pink-300'
                              : 'bg-purple-100 border-purple-300'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            manualProduct.category === category
                              ? productType === 'skincare'
                                ? 'text-pink-700 font-medium'
                                : 'text-purple-700 font-medium'
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
            </View>

            <Button
              title="Add Product"
              onPress={handleManualAdd}
              variant="primary"
              className="mt-8"
              disabled={!manualProduct.name.trim() || !manualProduct.brand.trim()}
            />
          </ScrollView>
        </View>
      </Modal>

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
