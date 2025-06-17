import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { FeatureCard } from '@/components/explore/FeatureCard';
import { ScanningPersonCard } from '@/components/explore/ScanningPersonCard';
import { PremiumBanner } from '@/components/explore/PremiumBanner';
import { CompactProductCard } from '@/components/explore/CompactProductCard';
import { ProductDetailModal } from '@/components/saves/ProductDetailModal';
import { mainFeatures, scanningPeople } from '@/data/exploreData';
import { ScannedProductUI, convertScannedProductToUI } from '@/lib/types/product';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, Heart } from 'lucide-react-native';
import {
  useRecentScansPreview,
  useFavoriteScansPreview,
  useToggleFavorite,
} from '@/lib/hooks/use-scans';

export default function ExploreScreen() {
  const [selectedProduct, setSelectedProduct] = useState<ScannedProductUI | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const { data: recentScansData, isLoading: isLoadingRecent } = useRecentScansPreview();
  const { data: favoritesData, isLoading: isLoadingFavorites } = useFavoriteScansPreview();
  const toggleFavorite = useToggleFavorite();

  const recentScans = recentScansData?.map(convertScannedProductToUI) || [];
  const favoriteProducts = favoritesData?.map(convertScannedProductToUI) || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown date';

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handleProductPress = (product: ScannedProductUI) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite.mutate(productId);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const navigateToSaves = (filter: 'all' | 'favorites') => {
    router.push(`/saves?filter=${filter}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-6">
          <Text className="text-3xl font-bold text-black mb-6">Explore</Text>

          <PremiumBanner />
        </View>

        <View className="px-4">
          {mainFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </View>

        {/* Recent Scans Section */}
        {!isLoadingRecent && recentScans.length > 0 && (
          <View className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Clock size={20} color="#6B7280" />
                <Text className="text-xl font-bold text-black ml-2">Recent Scans</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigateToSaves('all')}
                className="flex-row items-center"
              >
                <Text className="text-gray-600 mr-1">See More</Text>
                <ChevronRight size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
              <View className="flex-row items-center justify-between gap-4">
                {recentScans.map((product) => (
                  <CompactProductCard
                    key={product.id}
                    product={product}
                    showDate={formatDate(product.scannedAt || product.savedAt || '')}
                    onPress={handleProductPress}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Favorites Section */}
        {!isLoadingFavorites && favoriteProducts.length > 0 && (
          <View className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Heart size={20} color="#EF4444" />
                <Text className="text-xl font-bold text-black ml-2">Your Favorites</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigateToSaves('favorites')}
                className="flex-row items-center"
              >
                <Text className="text-gray-600 mr-1">See More</Text>
                <ChevronRight size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
              <View className="flex-row space-x-4">
                {favoriteProducts.map((product) => (
                  <CompactProductCard
                    key={product.id}
                    product={product}
                    showDate={formatDate(product.scannedAt || product.savedAt || '')}
                    onPress={handleProductPress}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View className="px-4 mb-8">
          <Text className="text-xl font-bold text-black mb-4">What People Are Scanning</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
            {scanningPeople.map((person) => (
              <ScanningPersonCard key={person.id} person={person} />
            ))}
          </ScrollView>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={showModal}
        onClose={closeModal}
        onToggleFavorite={handleToggleFavorite}
      />
    </SafeAreaView>
  );
}
