import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import SubPageLayout from '@/components/layouts/sub-page';
import { useLocalSearchParams } from 'expo-router';
import { Heart, AlertCircle } from 'lucide-react-native';
import { Skeleton } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSaveProduct, useRemoveSavedProduct, useSavedProducts } from '@/lib/hooks/use-products';
import { useAuth } from '@/context/auth-provider';
import { Accordion } from '@/components/ui/accordion';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return (
      <SubPageLayout title="Product Not Found">
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={48} color="#6B7280" />
          <Text className="text-xl font-medium text-gray-600 mt-4 text-center">
            Invalid Product ID
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            The product URL is invalid or malformed.
          </Text>
        </View>
      </SubPageLayout>
    );
  }

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.products.getProduct(id),
    enabled: !!id,
    retry: 1,
  });

  const { data: savedProducts = [] } = useSavedProducts({
    enabled: !!user?.id,
  });

  const isBookmarked = savedProducts.some((saved) => saved.productId === id);

  const saveProductMutation = useSaveProduct();
  const removeSavedProductMutation = useRemoveSavedProduct();

  const handleBookmarkToggle = async () => {
    if (!product || !user) {
      return;
    }

    try {
      if (isBookmarked) {
        await removeSavedProductMutation.mutateAsync(product.id);
      } else {
        await saveProductMutation.mutateAsync({ productId: product.id });
      }
    } catch (error: any) {
      if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        try {
          await removeSavedProductMutation.mutateAsync(product.id);
        } catch (removeError) {
          console.error('Error removing saved product:', removeError);
        }
      }
    }
  };

  const isToggling = saveProductMutation.isPending || removeSavedProductMutation.isPending;

  if (isLoadingProduct) {
    return (
      <SubPageLayout title="Loading Product...">
        <ScrollView className="flex-1">
          <View className="px-6">
            <Skeleton className="h-8 w-3/4 mb-6" />

            <View className="bg-slate-100 p-4 rounded-2xl mb-6">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <View className="flex-row gap-4">
                <Skeleton className="h-16 flex-1 rounded-xl" />
                <Skeleton className="h-16 flex-1 rounded-xl" />
                <Skeleton className="h-16 flex-1 rounded-xl" />
              </View>
            </View>

            <Skeleton className="h-6 w-1/4 mb-4" />
            <View className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-xl" />
              ))}
            </View>
          </View>
        </ScrollView>
      </SubPageLayout>
    );
  }

  if (productError || !product) {
    return (
      <SubPageLayout title="Product Not Found">
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={48} color="#6B7280" />
          <Text className="text-xl font-medium text-gray-600 mt-4 text-center">
            Product not found
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            The product you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout
      title="Product Details"
      rightElement={
        <View className="flex-row items-center">
          <Pressable
            onPress={handleBookmarkToggle}
            className={`mr-2 p-2 rounded-full ${isToggling ? 'opacity-50' : ''} ${isBookmarked ? 'bg-black' : 'bg-gray-100'}`}
            disabled={isToggling}
          >
            <Heart
              size={18}
              color={isBookmarked ? '#FFFFFF' : '#6B7280'}
              fill={isBookmarked ? '#FFFFFF' : 'none'}
              strokeWidth={isBookmarked ? 2 : 1.5}
            />
          </Pressable>
        </View>
      }
    >
      <ScrollView className="flex-1">
        <View className="px-6">
          <Text className="text-2xl font-semibold mb-2">{product.name}</Text>
          <Text className="text-lg text-gray-600 mb-6">
            {product.brand} - {product.type}
          </Text>

          {/* Key Properties */}
          <View className="mb-6">
            <Text className="text-lg font-medium mb-4">Key Properties</Text>
            <View className="flex-row gap-4">
              <View
                className={`p-4 rounded-xl flex-1 items-center ${product.sulfateFree ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                <Text
                  className={`text-sm mb-1 ${product.sulfateFree ? 'text-green-700' : 'text-gray-600'}`}
                >
                  Sulfate Free
                </Text>
                <Text
                  className={`text-base font-medium ${product.sulfateFree ? 'text-green-800' : 'text-gray-700'}`}
                >
                  {product.sulfateFree ? 'Yes' : 'No'}
                </Text>
              </View>
              <View
                className={`p-4 rounded-xl flex-1 items-center ${product.siliconeFree ? 'bg-blue-100' : 'bg-gray-100'}`}
              >
                <Text
                  className={`text-sm mb-1 ${product.siliconeFree ? 'text-blue-700' : 'text-gray-600'}`}
                >
                  Silicone Free
                </Text>
                <Text
                  className={`text-base font-medium ${product.siliconeFree ? 'text-blue-800' : 'text-gray-700'}`}
                >
                  {product.siliconeFree ? 'Yes' : 'No'}
                </Text>
              </View>
              <View
                className={`p-4 rounded-xl flex-1 items-center ${product.crueltyFree ? 'bg-purple-100' : 'bg-gray-100'}`}
              >
                <Text
                  className={`text-sm mb-1 ${product.crueltyFree ? 'text-purple-700' : 'text-gray-600'}`}
                >
                  Cruelty Free
                </Text>
                <Text
                  className={`text-base font-medium ${product.crueltyFree ? 'text-purple-800' : 'text-gray-700'}`}
                >
                  {product.crueltyFree ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Info */}
          {(product.category || product.size || product.price || product.coilyHairFriendly) && (
            <View className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl mb-6 border border-slate-200">
              <Text className="text-lg font-medium mb-4 text-slate-800">Product Details</Text>
              <View className="flex flex-col gap-2">
                {product.category && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-600">Category</Text>
                    <View className="bg-orange-100 px-3 py-1 rounded-full">
                      <Text className="text-base font-medium capitalize text-orange-800">
                        {product.category}
                      </Text>
                    </View>
                  </View>
                )}
                {product.size && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-600">Size</Text>
                    <Text className="text-base font-medium text-slate-800">{product.size}</Text>
                  </View>
                )}
                {product.price && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-600">Price</Text>
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-base font-medium text-green-800">${product.price}</Text>
                    </View>
                  </View>
                )}
                {product.coilyHairFriendly && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-600">Coily Hair Friendly</Text>
                    <View className="bg-pink-100 px-3 py-1 rounded-full">
                      <Text className="text-base font-medium text-pink-800">Yes</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View className="mb-6">
              <Text className="text-xl mb-4 font-semibold">Description</Text>
              <View className="bg-slate-100 p-4 rounded-2xl">
                <Text className="text-gray-800 leading-6">{product.description}</Text>
              </View>
            </View>
          )}

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl mb-4 font-semibold">Ingredients</Text>
              <View className="bg-slate-100 rounded-2xl overflow-hidden">
                {product.ingredients.map((ingredient: any, index: number) => {
                  // Handle both string ingredients and object ingredients
                  const ingredientName =
                    typeof ingredient === 'string'
                      ? ingredient
                      : ingredient?.name || 'Unknown ingredient';
                  const ingredientEffect =
                    typeof ingredient === 'object' && ingredient?.effect ? ingredient.effect : null;
                  const ingredientPurpose =
                    typeof ingredient === 'object' && ingredient?.purpose
                      ? ingredient.purpose
                      : null;

                  // If it's just a string ingredient with no additional info, show it simply
                  if (typeof ingredient === 'string' || (!ingredientPurpose && !ingredientEffect)) {
                    return (
                      <View key={index} className="border-b border-gray-200 last:border-b-0 p-4">
                        <Text className="text-base">{ingredientName}</Text>
                      </View>
                    );
                  }

                  // If it has detailed info, make it an accordion
                  return (
                    <View key={index} className="border-b border-gray-200 last:border-b-0">
                      <Accordion title={ingredientName}>
                        <View className="flex flex-col gap-2">
                          {ingredientPurpose && (
                            <View>
                              <Text className="text-sm font-medium text-gray-700">Purpose:</Text>
                              <Text className="text-sm text-gray-600">{ingredientPurpose}</Text>
                            </View>
                          )}
                          {ingredientEffect && (
                            <View>
                              <Text className="text-sm font-medium text-gray-700">Effect:</Text>
                              <Text className="text-sm text-gray-600">{ingredientEffect}</Text>
                            </View>
                          )}
                        </View>
                      </Accordion>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Hair Types */}
          {product.suitableHairTypes && product.suitableHairTypes.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl mb-4 font-semibold text-slate-800">
                Suitable for Hair Types
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {product.suitableHairTypes.map((hairType, index) => (
                  <View
                    key={index}
                    className="bg-gradient-to-r from-teal-100 to-cyan-100 px-3 py-2 rounded-full border border-teal-200"
                  >
                    <Text className="text-sm font-medium text-teal-800">{hairType}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Additional Information */}
          {/* <View className="mb-6">
            <Text className="text-xl mb-4 font-semibold text-slate-800">
              Additional Information
            </Text>
            <View className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200">
              <View className="space-y-3">
                {product.barcode && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-600">Barcode</Text>
                    <View className="bg-gray-100 px-3 py-1 rounded-full">
                      <Text className="text-base font-mono text-gray-800">{product.barcode}</Text>
                    </View>
                  </View>
                )}
                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-600">Custom Product</Text>
                  <View
                    className={`px-3 py-1 rounded-full ${product.isCustom ? 'bg-purple-100' : 'bg-gray-100'}`}
                  >
                    <Text
                      className={`text-base font-medium ${product.isCustom ? 'text-purple-800' : 'text-gray-700'}`}
                    >
                      {product.isCustom ? 'Yes' : 'No'}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-600">Added</Text>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-base font-medium text-blue-800">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View> */}
        </View>
      </ScrollView>
    </SubPageLayout>
  );
}
