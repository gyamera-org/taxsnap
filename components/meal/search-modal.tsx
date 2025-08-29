import React from 'react';
import { View, TouchableOpacity, Modal, SafeAreaView, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Plus } from 'lucide-react-native';
import { InfiniteScrollList, SearchBar } from '@/components/common/infinite-scroll-list';
import { FoodItem } from '@/lib/types/nutrition-tracking';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  foods: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  isLoading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  error: any;
  hasActiveSearch: boolean;
  popularFoodsLoading: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  foods,
  onAddFood,
  isLoading,
  hasNextPage,
  onLoadMore,
  error,
  hasActiveSearch,
  popularFoodsLoading,
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Search Foods</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <SearchBar
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search for foods..."
              autoFocus={true}
            />

            {/* Quick Category Filters */}
            <View className="mt-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 px-1">
                  {['All', 'Fruit', 'Vegetable', 'Protein', 'Grains', 'Dairy', 'Snacks'].map(
                    (category) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() =>
                          onCategoryChange(category === 'All' ? null : category.toLowerCase())
                        }
                        className={`px-3 py-1.5 rounded-full border ${
                          (category === 'All' && !activeCategory) ||
                          activeCategory === category.toLowerCase()
                            ? 'bg-green-100 border-green-200'
                            : 'bg-slate-100 border-slate-200'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            (category === 'All' && !activeCategory) ||
                            activeCategory === category.toLowerCase()
                              ? 'text-green-700'
                              : 'text-gray-600'
                          }`}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        <InfiniteScrollList
          data={foods}
          renderItem={({ item: food }) => (
            <TouchableOpacity
              onPress={() => onAddFood(food)}
              className="bg-white rounded-xl p-4 mb-2 border border-gray-100 mx-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-semibold text-gray-900 flex-1">{food.name}</Text>
                    {food.category && (
                      <View className="bg-green-100 px-2 py-1 rounded-full ml-2">
                        <Text className="text-xs text-green-700 font-medium">{food.category}</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-500">
                    {food.brand} • {food.servingSize}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {food.nutrition.calories} cal • P: {food.nutrition.protein}g • C:{' '}
                    {food.nutrition.carbs}g • F: {food.nutrition.fat}g
                  </Text>
                </View>
                <Plus size={20} color="#10B981" />
              </View>
            </TouchableOpacity>
          )}
          onLoadMore={onLoadMore}
          isLoading={hasActiveSearch ? isLoading : popularFoodsLoading}
          isFetchingNextPage={false}
          hasNextPage={hasNextPage}
          error={error}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          emptyMessage={
            searchQuery.length > 0
              ? `No foods found for "${searchQuery}"`
              : 'Start typing to search foods'
          }
          emptySubtitle={
            searchQuery.length > 0
              ? 'Try a different search or scan your food with AI'
              : 'Search our community database or scan with AI'
          }
          estimatedItemSize={100}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </SafeAreaView>
    </Modal>
  );
};
