import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';

import { Plus, Package, Heart, Calendar, Eye, Trash2 } from 'lucide-react-native';
import { useHaircareProducts, UserBeautyProduct } from '@/lib/hooks/use-beauty-products';

export default function HaircareProductsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleGoBack = () => {
    router.push('/(tabs)/settings');
  };

  // Fetch saved haircare products
  const { data: savedProducts = [], isLoading, refetch } = useHaircareProducts();

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<UserBeautyProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleViewProduct = (product: UserBeautyProduct) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleDeleteProduct = async (product: UserBeautyProduct) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to remove "${product.name}" from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error, data } = await supabase
                .from('user_beauty_products')
                .delete()
                .eq('id', product.id)
                .select(); // Add select to see what was deleted

              if (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete product');
                return;
              }

              // Force immediate refresh - the realtime should also trigger
              await refetch();
            } catch (error) {
              console.error('Delete error:', error);
              toast.error('Failed to delete product');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <SubPageLayout
        title="Haircare Products"
        onBack={handleGoBack}
        rightElement={
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/settings/add-haircare-product')}
            className="w-10 h-10 items-center justify-center bg-purple-100 rounded-full"
          >
            <Plus size={20} color="#8B5CF6" />
          </TouchableOpacity>
        }
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <View className="px-4 py-4">
            {isLoading ? (
              <View className="bg-white rounded-2xl p-6 border border-gray-200">
                <Text className="text-gray-500 text-center">Loading...</Text>
              </View>
            ) : savedProducts.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 border border-gray-200">
                <View className="items-center">
                  <Package size={40} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-2">No products yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Tap + to add your first product
                  </Text>
                </View>
              </View>
            ) : (
              <View className="gap-3">
                {savedProducts.map((product: UserBeautyProduct) => (
                  <View
                    key={product.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-black mb-1">
                          {product.name}
                        </Text>
                        <Text className="text-gray-600 text-sm mb-2">
                          {product.brand} • {product.category}
                        </Text>
                        <View className="flex-row items-center">
                          <View
                            className={`px-2 py-1 rounded-full ${getSafetyScoreBg(product.safety_score)}`}
                          >
                            <Text
                              className={`text-xs font-medium ${getSafetyScoreColor(product.safety_score)}`}
                            >
                              Safety: {product.safety_score}/10
                            </Text>
                          </View>
                          <View className="ml-2 flex-row items-center">
                            <Calendar size={12} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 ml-1">
                              {formatDate(product.created_at)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Action buttons */}
                      <View className="flex-row gap-2 ml-3">
                        <TouchableOpacity
                          onPress={() => handleViewProduct(product)}
                          className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center"
                        >
                          <Eye size={16} color="#8B5CF6" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDeleteProduct(product)}
                          className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {product.key_ingredients && product.key_ingredients.length > 0 && (
                      <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                          Key Ingredients ({product.key_ingredients.length})
                        </Text>
                        <View className="flex-row flex-wrap gap-1">
                          {product.key_ingredients.slice(0, 3).map((ingredient, index) => (
                            <View
                              key={index}
                              className={`px-2 py-1 rounded-full ${
                                ingredient.type === 'beneficial'
                                  ? 'bg-green-100'
                                  : ingredient.type === 'harmful'
                                    ? 'bg-red-100'
                                    : 'bg-gray-100'
                              }`}
                            >
                              <Text
                                className={`text-xs ${
                                  ingredient.type === 'beneficial'
                                    ? 'text-green-700'
                                    : ingredient.type === 'harmful'
                                      ? 'text-red-700'
                                      : 'text-gray-700'
                                }`}
                              >
                                {ingredient.name}
                              </Text>
                            </View>
                          ))}
                          {product.key_ingredients.length > 3 && (
                            <View className="px-2 py-1 rounded-full bg-gray-100">
                              <Text className="text-xs text-gray-600">
                                +{product.key_ingredients.length - 3} more
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SubPageLayout>

      {/* Product Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Text className="text-purple-500 text-lg">Close</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Product Details</Text>
              <View style={{ width: 50 }} />
            </View>
          </View>

          {selectedProduct && (
            <ScrollView className="flex-1 px-4 py-6">
              {/* Product Header */}
              <View className="bg-white rounded-2xl p-6 border border-gray-200 mb-4">
                <Text className="text-2xl font-bold text-black mb-2">{selectedProduct.name}</Text>
                <Text className="text-lg text-gray-600 mb-4">
                  {selectedProduct.brand} • {selectedProduct.category}
                </Text>

                {/* Safety Score & AI Recommendations */}
                <View className="gap-3">
                  <View
                    className={`px-4 py-3 rounded-xl ${getSafetyScoreBg(selectedProduct.safety_score)}`}
                  >
                    <Text
                      className={`text-lg font-bold ${getSafetyScoreColor(selectedProduct.safety_score)}`}
                    >
                      Safety Score: {selectedProduct.safety_score}/10
                    </Text>
                  </View>

                  {/* AI Recommended Usage */}
                  <View className="bg-purple-50 px-4 py-3 rounded-xl">
                    <Text className="text-sm text-gray-600 mb-1">AI Recommends</Text>
                    <Text className="text-base font-medium text-purple-700 capitalize">
                      {selectedProduct.usage_frequency} •{' '}
                      {selectedProduct.cycle_phase_preference || 'Anytime'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Key Ingredients Analysis - Most Important */}
              {selectedProduct.key_ingredients && selectedProduct.key_ingredients.length > 0 && (
                <View className="bg-white rounded-2xl p-6 border border-gray-200 mb-4">
                  <Text className="text-lg font-bold text-black mb-4">
                    Ingredient Safety Analysis
                  </Text>
                  <View className="gap-4">
                    {selectedProduct.key_ingredients.map((ingredient, index) => (
                      <View key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-base font-semibold text-black">
                            {ingredient.name}
                          </Text>
                          <View
                            className={`px-3 py-1 rounded-full ${
                              ingredient.type === 'beneficial'
                                ? 'bg-green-100'
                                : ingredient.type === 'harmful'
                                  ? 'bg-red-100'
                                  : 'bg-yellow-100'
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold uppercase ${
                                ingredient.type === 'beneficial'
                                  ? 'text-green-700'
                                  : ingredient.type === 'harmful'
                                    ? 'text-red-700'
                                    : 'text-yellow-700'
                              }`}
                            >
                              {ingredient.type}
                            </Text>
                          </View>
                        </View>
                        {ingredient.description && (
                          <Text className="text-sm text-gray-600 leading-5">
                            {ingredient.description}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Complete Ingredients List */}
              {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                <View className="bg-white rounded-2xl p-6 border border-gray-200">
                  <Text className="text-lg font-bold text-black mb-3">
                    Complete Ingredient List ({selectedProduct.ingredients.length})
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {selectedProduct.ingredients.map((ingredient, index) => (
                      <View
                        key={index}
                        className="px-3 py-2 rounded-full bg-gray-100 border border-gray-200"
                      >
                        <Text className="text-sm text-gray-700">{ingredient}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}
