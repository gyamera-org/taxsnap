import { View, Pressable, Text } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ButtonWithIcon } from '@/components/ui';
import { router } from 'expo-router';
import EmptyState from '@/components/empty-state';
import PageLayout from '@/components/layouts/page-layout';
import ProductListItem from '@/components/product-list-item';
import products from '@/mock/products.json';
import { ProductFilter } from '@/components/product-filter';
import { ProductSearch } from '@/components/product-search';
import { FlatList } from 'react-native';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'my-products' | 'saved';

export default function ProductsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>('all');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || product.type === selectedType;
      return matchesSearch && matchesType;
    });

    switch (activeTab) {
      case 'my-products':
        filtered = [];
        break;
      case 'saved':
        filtered = [];
        break;
    }

    return filtered;
  }, [searchQuery, selectedType, activeTab]);

  const renderEmptyState = () => (
    <EmptyState
      icon={Search}
      title="No products found"
      description={
        searchQuery
          ? 'Try adjusting your search or filters'
          : 'Start by adding some products to your collection'
      }
      action={{
        label: 'Add Product',
        onPress: () => router.push('/scan'),
        icon: Plus,
      }}
    />
  );

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
          label="Manual Log"
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

        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ProductListItem {...item} onPress={() => router.push(`/products/${item.id}`)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingBottom: 20,
          }}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </PageLayout>
  );
}
