import { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Search, Filter, Heart, Package, X, Check } from 'lucide-react-native';
import { ProductCard } from '@/components/saves/ProductCard';
import { ProductCardSkeleton } from '@/components/saves/ProductCardSkeleton';
import { ProductDetailModal } from '@/components/saves/ProductDetailModal';
import { ScannedProductUI, convertScannedProductToUI } from '@/lib/types/product';
import { useLocalSearchParams } from 'expo-router';
import { useScansInfinite, useToggleFavorite, useRefreshScans } from '@/lib/hooks/use-scans';

type FilterType = 'all' | 'favorites';
type SortType = 'newest' | 'oldest' | 'name' | 'safety';

const sortOptions = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'name', label: 'Name A-Z' },
  { key: 'safety', label: 'Safety Score' },
];

export default function SavesScreen() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedProduct, setSelectedProduct] = useState<ScannedProductUI | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('newest');

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage, refetch } =
    useScansInfinite(activeFilter, sortBy, searchQuery);
  const flatProducts = data?.pages.flat().map(convertScannedProductToUI) ?? [];
  const refreshScans = useRefreshScans();

  useEffect(() => {
    if (filter === 'favorites') {
      setActiveFilter('favorites');
    } else {
      setActiveFilter('all');
    }
  }, [filter]);

  const getEmptyStateConfig = () => {
    if (searchQuery.trim()) {
      return {
        icon: Search,
        title: 'No Results Found',
        subtitle: `No products match "${searchQuery}"`,
      };
    }

    switch (activeFilter) {
      case 'favorites':
        return {
          icon: Heart,
          title: 'No Favorites Yet',
          subtitle: 'Products you favorite will appear here',
        };

      default:
        return {
          icon: Package,
          title: 'No Products Yet',
          subtitle: 'Start scanning products to see them here',
        };
    }
  };

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

  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite.mutate(productId);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = async () => {
    await refreshScans.mutateAsync();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleSortSelect = (sortType: SortType) => {
    setSortBy(sortType);
    setShowFilterDropdown(false);
  };

  const emptyStateConfig = getEmptyStateConfig();
  const EmptyIcon = emptyStateConfig.icon;

  const renderProductItem = ({ item }: { item: ScannedProductUI }) => (
    <View className="w-[48%] mb-4">
      <ProductCard
        product={item}
        showDate={formatDate(item.scannedAt || item.savedAt || '')}
        onPress={handleProductPress}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );

  const renderSkeletonItem = ({ index }: { index: number }) => (
    <View key={index} className="w-[48%] mb-4">
      <ProductCardSkeleton />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-black">My Products</Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center ${
                showSearch ? 'bg-black' : 'bg-gray-100'
              }`}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Search size={20} color={showSearch ? '#FFFFFF' : '#6B7280'} />
            </TouchableOpacity>

            {/* Filter Dropdown */}
            <View className="relative">
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    showFilterDropdown ? 'bg-black' : 'bg-gray-100'
                  }`}
                  onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <Filter size={20} color={showFilterDropdown ? '#FFFFFF' : '#6B7280'} />
                </TouchableOpacity>
              </View>

              {/* Dropdown Menu */}
              {showFilterDropdown && (
                <View className="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                  <View className="px-4 py-2 border-b border-gray-100">
                    <Text className="text-sm font-semibold text-gray-900">Sort by</Text>
                  </View>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      onPress={() => handleSortSelect(option.key as SortType)}
                      className="flex-row items-center justify-between px-4 py-3 hover:bg-gray-50"
                    >
                      <Text
                        className={`text-sm ${sortBy === option.key ? 'font-semibold text-black' : 'text-gray-700'}`}
                      >
                        {option.label}
                      </Text>
                      {sortBy === option.key && <Check size={16} color="#000" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-black"
              placeholder="Search products, brands, categories..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Filter Tabs - Centered */}
        <View className="items-center">
          <View className="flex-row gap-2">
            {(['all', 'favorites'] as FilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-2xl ${
                  activeFilter === filter ? 'bg-black' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    activeFilter === filter ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {filter === 'all' ? 'All' : 'Favorites'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-2">
        {isLoading ? (
          <FlatList
            data={Array.from({ length: 6 }, (_, i) => i)} // Show 6 skeleton cards
            renderItem={renderSkeletonItem}
            keyExtractor={(_, index) => `skeleton-${index}`}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : flatProducts.length === 0 ? (
          <View className="absolute inset-x-0 items-center justify-center" style={{ top: 120 }}>
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
              <EmptyIcon size={32} color="#6B7280" />
            </View>
            <Text className="text-xl font-bold text-black mb-2">{emptyStateConfig.title}</Text>
            <Text className="text-gray-600 text-center px-8">{emptyStateConfig.subtitle}</Text>
          </View>
        ) : (
          <FlatList
            data={flatProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            refreshing={refreshScans.isPending}
            onRefresh={handleRefresh}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 flex-row justify-center">
                  <View className="flex-row gap-2">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </View>
                </View>
              ) : null
            }
          />
        )}
      </View>

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
