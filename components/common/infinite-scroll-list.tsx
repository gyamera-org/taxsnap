import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

interface InfiniteScrollListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  onLoadMore: () => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  emptyMessage?: string;
  emptySubtitle?: string;
  keyExtractor: (item: T, index: number) => string;
  estimatedItemSize?: number;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  numColumns?: number;
}

export function InfiniteScrollList<T>({
  data,
  renderItem,
  onLoadMore,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  error,
  onRefresh,
  isRefreshing = false,
  emptyMessage = 'No items found',
  emptySubtitle = 'Try adjusting your search terms',
  keyExtractor,
  estimatedItemSize = 80,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  numColumns = 1,
}: InfiniteScrollListProps<T>) {
  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage && !isLoading) {
      onLoadMore();
    }
  }, [isFetchingNextPage, hasNextPage, isLoading, onLoadMore]);

  const renderFooter = () => {
    if (error) {
      return (
        <View className="p-4 items-center">
          <AlertCircle size={24} color="#EF4444" />
          <Text className="text-red-600 text-center mt-2 font-medium">Failed to load items</Text>
          <Text className="text-gray-500 text-center text-sm mt-1">{error.message}</Text>
          {hasNextPage && (
            <TouchableOpacity
              onPress={handleLoadMore}
              className="bg-blue-500 px-4 py-2 rounded-lg mt-3"
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (isFetchingNextPage) {
      return (
        <View className="p-4 items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-gray-500 text-sm mt-2">Loading more...</Text>
        </View>
      );
    }

    if (!hasNextPage && data.length > 0) {
      return (
        <View className="p-4 items-center">
          <Text className="text-gray-400 text-sm">You've reached the end</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 text-lg mt-4">Loading...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center p-8">
        <View className="bg-gray-100 rounded-full p-4 mb-4">
          <AlertCircle size={32} color="#9CA3AF" />
        </View>
        <Text className="text-gray-900 text-lg font-semibold mb-2">{emptyMessage}</Text>
        <Text className="text-gray-500 text-center">{emptySubtitle}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        ) : undefined
      }
      contentContainerStyle={[
        { flexGrow: 1 },
        data.length === 0 && { flex: 1 },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      numColumns={numColumns}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      getItemLayout={
        estimatedItemSize
          ? (data, index) => ({
              length: estimatedItemSize,
              offset: estimatedItemSize * index,
              index,
            })
          : undefined
      }
    />
  );
}

// Enhanced search bar with debounced input
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  isDark?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  autoFocus = false,
  isDark,
}: SearchBarProps) {
  const theme = useTheme();
  const isThemeDark = isDark !== undefined ? isDark : theme?.isDark;
  
  return (
    <View className={`border rounded-2xl mx-4 mb-4 ${isThemeDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
      <View className="flex-row items-center px-4 py-3">
        <View className="mr-3">
          <Search size={20} color="#9CA3AF" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className={`flex-1 text-base ${isThemeDark ? 'text-white' : 'text-gray-900'}`}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
