import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Sparkles, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { SimpleBeautyDetailModal } from '@/components/beauty/SimpleBeautyDetailModal';
import { useRecentScansPreview } from '@/lib/hooks/use-scans';

// Mock skincare data - will be replaced with real data later
const MOCK_SKINCARE_SCANS = [
  {
    id: '1',
    name: 'Vitamin C Serum',
    image_url: require('@/assets/images/scan_label_example.png'),
    scanned_at: '2024-01-15',
    cycle_compatibility: 'good' as const,
    key_ingredients: [
      {
        name: 'Vitamin C',
        effect: 'good' as const,
        description:
          'Brightens skin and supports collagen production. Safe during all cycle phases.',
      },
      {
        name: 'Hyaluronic Acid',
        effect: 'good' as const,
        description: 'Hydrates skin without clogging pores. Perfect for hormonal skin changes.',
      },
    ],
    cycle_tip:
      'Great for brightening skin during your luteal phase when hormones can cause dullness.',
  },
  {
    id: '2',
    name: 'Retinol Night Cream',
    image_url: require('@/assets/images/scan_barcode_example.png'),
    scanned_at: '2024-01-14',
    cycle_compatibility: 'caution' as const,
    key_ingredients: [
      {
        name: 'Retinol',
        effect: 'caution' as const,
        description:
          'Powerful anti-aging ingredient but can increase skin sensitivity during menstruation.',
      },
      {
        name: 'Niacinamide',
        effect: 'good' as const,
        description:
          'Reduces inflammation and controls oil production. Great for hormonal breakouts.',
      },
    ],
    cycle_tip:
      'Avoid during your period when skin is most sensitive. Best used during follicular phase.',
  },
  {
    id: '3',
    name: 'Gentle Cleanser',
    image_url: require('@/assets/images/porosity-test.png'),
    scanned_at: '2024-01-13',
    cycle_compatibility: 'good' as const,
    key_ingredients: [
      {
        name: 'Ceramides',
        effect: 'good' as const,
        description: 'Strengthens skin barrier and provides gentle hydration for sensitive skin.',
      },
      {
        name: 'Glycerin',
        effect: 'good' as const,
        description: 'Natural humectant that draws moisture to skin without irritation.',
      },
    ],
    cycle_tip:
      'Perfect for all cycle phases, especially during menstruation when skin is sensitive.',
  },
];

interface TodaysBeautyScansProps {
  selectedDate: Date;
  isLoading?: boolean;
}

export function TodaysBeautyScans({ selectedDate, isLoading = false }: TodaysBeautyScansProps) {
  const [selectedProduct, setSelectedProduct] = useState<(typeof MOCK_SKINCARE_SCANS)[0] | null>(
    null
  );
  const [showProductModal, setShowProductModal] = useState(false);

  // Get real scanned products data
  const { data: recentScans = [], isLoading: scansLoading } = useRecentScansPreview();

  // Use real data if available, otherwise fall back to mock data
  const scansToShow =
    recentScans.length > 0
      ? recentScans.map((scan) => ({
          id: scan.id,
          name: scan.name,
          image_url: scan.image_url || require('@/assets/images/scan_label_example.png'),
          cycle_compatibility:
            scan.safety_score > 70
              ? ('good' as const)
              : scan.safety_score > 40
                ? ('caution' as const)
                : ('avoid' as const),
          key_ingredients:
            scan.key_ingredients?.map((ingredient) => ({
              name: ingredient.name,
              effect:
                ingredient.type === 'beneficial'
                  ? ('good' as const)
                  : ingredient.type === 'harmful'
                    ? ('avoid' as const)
                    : ('caution' as const),
              description:
                ingredient.description || `${ingredient.name} - ${ingredient.type} ingredient`,
            })) || [],
          cycle_tip: `Safety score: ${scan.safety_score}/100. ${scan.safety_score > 70 ? 'Generally safe for all cycle phases.' : 'Use with caution during sensitive phases.'}`,
        }))
      : MOCK_SKINCARE_SCANS;

  const handleScanSkincare = () => {
    router.push('/scan-beauty' as any);
  };

  const handleViewProduct = (productId: string) => {
    const product = scansToShow.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowProductModal(true);
    }
  };

  if (isLoading || scansLoading) {
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-pink-100 items-center justify-center mr-3">
                <Sparkles size={20} color="#EC4899" />
              </View>
              <Text className="text-lg font-semibold text-black">Beauty Scans</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            {[1, 2, 3].map((i) => (
              <View key={i} className="w-20 h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-pink-100 items-center justify-center mr-3">
              <Sparkles size={20} color="#EC4899" />
            </View>
            <Text className="text-lg font-semibold text-black">Skincare Scans</Text>
          </View>
          <TouchableOpacity
            onPress={handleScanSkincare}
            className="w-8 h-8 rounded-full bg-pink-50 items-center justify-center"
          >
            <Plus size={16} color="#EC4899" />
          </TouchableOpacity>
        </View>

        {scansToShow.length === 0 ? (
          <View className="items-center py-8">
            <View className="w-16 h-16 rounded-2xl bg-pink-50 items-center justify-center mb-3">
              <Sparkles size={24} color="#EC4899" />
            </View>
            <Text className="text-gray-600 text-center mb-3">No skincare products scanned yet</Text>
            <TouchableOpacity
              onPress={handleScanSkincare}
              className="bg-pink-500 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-medium">Scan Your First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {scansToShow.map((scan) => (
                <TouchableOpacity
                  key={scan.id}
                  onPress={() => handleViewProduct(scan.id)}
                  className="w-20"
                >
                  <View className="relative">
                    <Image
                      source={scan.image_url}
                      className="w-20 h-20 rounded-xl"
                      resizeMode="cover"
                    />
                    {/* Cycle compatibility indicator */}
                    <View
                      className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                        scan.cycle_compatibility === 'good'
                          ? 'bg-green-400'
                          : scan.cycle_compatibility === 'caution'
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                      }`}
                    />
                  </View>
                  <Text className="text-xs text-gray-600 mt-1 text-center" numberOfLines={2}>
                    {scan.name}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Add new scan button */}
              <TouchableOpacity onPress={handleScanSkincare} className="w-20">
                <View className="w-20 h-20 rounded-xl border border-dashed border-pink-200 items-center justify-center">
                  <Plus size={24} color="#EC4899" />
                </View>
                <Text className="text-xs text-pink-500 mt-1 text-center">Add new</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Quick cycle tip */}
        <View className="mt-4 p-3 bg-pink-50 rounded-xl">
          <Text className="text-sm text-pink-700">
            💡 <Text className="font-medium">Cycle Tip:</Text> During your luteal phase, avoid harsh
            actives like retinol to prevent irritation.
          </Text>
        </View>
      </View>

      {/* Product Detail Modal */}
      <SimpleBeautyDetailModal
        product={selectedProduct}
        visible={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
      />
    </View>
  );
}
