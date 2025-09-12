import React from 'react';
import { View, TouchableOpacity, Modal, SafeAreaView, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Plus } from 'lucide-react-native';
import { InfiniteScrollList, SearchBar } from '@/components/common/infinite-scroll-list';
import { FoodItem } from '@/lib/types/nutrition-tracking';
import { useTheme } from '@/context/theme-provider';

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
  const { isDark } = useTheme();
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Search Foods</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <SearchBar
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search for foods..."
              autoFocus={true}
              isDark={isDark}
            />

            {/* Quick Category Filters */}
            <View className="mt-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 px-1">
                  {['All', 'Fruit', 'Vegetable', 'Protein', 'Grains', 'Dairy', 'Snacks'].map(
                    (category) => {
                      const categoryValue = category === 'All' ? null : category.toLowerCase();
                      const isSelected = activeCategory === categoryValue;
                      
                      return (
                        <TouchableOpacity
                          key={category}
                          onPress={() => onCategoryChange(categoryValue)}
                          className={`px-3 py-1.5 rounded-full border ${
                            isSelected
                              ? isDark 
                                ? 'bg-green-900/30 border-green-600' 
                                : 'bg-green-100 border-green-200'
                              : isDark 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-slate-100 border-slate-200'
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              isSelected
                                ? isDark ? 'text-green-300' : 'text-green-700'
                                : isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            {category}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
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
              className={`rounded-xl p-4 mb-2 border mx-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className={`font-semibold flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{food.name}</Text>
                    {food.category && (
                      <View className={`px-2 py-1 rounded-full ml-2 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                        <Text className={`text-xs font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>{food.category}</Text>
                      </View>
                    )}
                  </View>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {food.brand} • {food.servingSize}
                  </Text>
                  <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
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
