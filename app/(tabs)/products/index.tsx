import { View, Pressable, Text, ActivityIndicator } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ButtonWithIcon, ProductGridSkeleton } from '@/components/ui';
import { router } from 'expo-router';
import EmptyState from '@/components/empty-state';
import PageLayout from '@/components/layouts/page-layout';
import ProductListItem from '@/components/product-list-item';
import { ProductFilter } from '@/components/product-filter';
import { ProductSearch } from '@/components/product-search';
import { FlatList } from 'react-native';
import { cn } from '@/lib/utils';
import { useProducts, useSavedProducts, useCustomProducts } from '@/lib/hooks/use-api';
import { useAuth } from '@/context/auth-provider';
import type { Product, CustomProduct } from '@/lib/api/types';

type Tab = 'all' | 'my-products' | 'saved';

export default function ProductsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>('all');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const { user } = useAuth();

  const enableQueries = !!user;

  const {
    data: allProductsData,
    isLoading: isLoadingProducts,
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(
    selectedType !== 'all' ? { category: selectedType as any } : { search: searchQuery },
    {
      enabled: enableQueries && activeTab === 'all',
      staleTime: 5 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const allProducts = useMemo(() => {
    if (!allProductsData) return [];

    if ('pages' in allProductsData && Array.isArray(allProductsData.pages)) {
      return allProductsData.pages.flatMap((page: any) => page.products || []);
    }

    if ('products' in allProductsData) {
      return (allProductsData as any).products || [];
    }

    return [];
  }, [allProductsData]);

  const { data: savedProducts = [], isLoading: isLoadingSaved } = useSavedProducts({
    enabled: enableQueries && activeTab === 'saved',
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: customProducts = [], isLoading: isLoadingCustom } = useCustomProducts({
    enabled: enableQueries && activeTab === 'my-products',
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const filteredProducts = useMemo(() => {
    let products: (Product | { id: string; name: string; type: string; brand?: string })[] = [];

    try {
      switch (activeTab) {
        case 'all':
          products = Array.isArray(allProducts) ? allProducts : [];
          break;
        case 'saved':
          products = Array.isArray(savedProducts)
            ? savedProducts.map((sp) => sp?.product).filter(Boolean)
            : [];
          break;
        case 'my-products':
          products = Array.isArray(customProducts)
            ? customProducts.map((customProduct: CustomProduct) => ({
                id: customProduct.id,
                name: customProduct.name,
                type: 'Custom Product',
                brand: 'Custom',
                description: customProduct.description,
                ingredients: customProduct.ingredients,
              }))
            : [];
          break;
        default:
          products = [];
      }

      if (searchQuery && products.length > 0) {
        products = products.filter(
          (product) =>
            product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product?.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      const uniqueProducts = products.reduce((acc: any[], current) => {
        const existingProduct = acc.find((p) => p.id === current.id);
        if (!existingProduct && current.id) {
          acc.push(current);
        }
        return acc;
      }, []);

      return uniqueProducts;
    } catch (error) {
      console.log('Error filtering products:', error);
      return [];
    }
  }, [allProducts, savedProducts, customProducts, searchQuery, activeTab]);

  const isLoading = isLoadingProducts || isLoadingSaved || isLoadingCustom;

  const handleLoadMore = () => {
    if (activeTab === 'all' && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (activeTab !== 'all' || !isFetchingNextPage) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#000" />
        <Text className="mt-2 text-gray-600">Loading more products...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!user) {
      return (
        <EmptyState
          icon={Search}
          title="Sign in required"
          description="Please sign in to view and manage your products"
          action={{
            label: 'Sign In',
            onPress: () => router.push('/auth'),
            icon: Plus,
          }}
        />
      );
    }

    if (productsError && activeTab === 'all') {
      return (
        <EmptyState
          icon={Search}
          title="Unable to load products"
          description="Please check your connection and try again"
          action={{
            label: 'Try Scanning',
            onPress: () => router.push('/scan'),
            icon: Plus,
          }}
        />
      );
    }

    return (
      <EmptyState
        icon={Search}
        title="No products found"
        description={
          searchQuery
            ? 'Try adjusting your search or filters'
            : activeTab === 'all'
              ? 'No products available. Start by scanning or adding products.'
              : activeTab === 'my-products'
                ? 'No custom products yet. Create your first custom product to get started.'
                : 'Start by scanning or adding products to your collection'
        }
        action={{
          label: activeTab === 'my-products' ? 'Add Custom Product' : 'Scan Product',
          onPress: () => router.push(activeTab === 'my-products' ? '/products/add' : '/scan'),
          icon: Plus,
        }}
      />
    );
  };

  const renderLoadingState = () => <ProductGridSkeleton count={8} />;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'my-products', label: 'My Products' },
    { id: 'saved', label: 'Saved' },
  ];

  return (
    <PageLayout
      title="Products"
      btn={
        <ButtonWithIcon
          label="Add Custom"
          icon={Plus}
          onPress={() => router.push('/products/add')}
        />
      }
    >
      <View className="flex-1">
        <View className="px-4 pt-2 pb-4">
          <View className="flex-row items-center gap-2 w-full">
            <View className="flex-1">
              <ProductSearch onSearch={setSearchQuery} />
            </View>
            <ProductFilter selectedType={selectedType} onSelectType={setSelectedType} />
          </View>

          <View className="flex-row mt-4">
            {tabs.map((tab) => (
              <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} className="flex-1">
                <View className="items-center py-2">
                  <Text
                    className={cn(
                      'text-base font-medium',
                      activeTab === tab.id ? 'text-black' : 'text-gray-500'
                    )}
                  >
                    {tab.label}
                  </Text>
                </View>
                <View
                  className={cn('h-0.5', activeTab === tab.id ? 'bg-black' : 'bg-transparent')}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {isLoading ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={filteredProducts || []}
            renderItem={({ item }) => {
              if (!item || !item.id) return null;

              const handlePress = () => {
                if (activeTab === 'my-products') {
                  router.push(`/products/custom/${item.id}`);
                } else {
                  router.push(`/products/${item.id}`);
                }
              };

              return (
                <ProductListItem
                  name={item.name}
                  type={item.type}
                  brand={item.brand}
                  onPress={handlePress}
                />
              );
            }}
            keyExtractor={(item, index) => `${activeTab}-${item?.id || `product-${index}`}`}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingBottom: 20,
            }}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            key={activeTab}
          />
        )}
      </View>
    </PageLayout>
  );
}
