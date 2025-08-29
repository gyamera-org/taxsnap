import { View, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { Text } from '@/components/ui/text';
import { Search, Filter, X, ChevronDown } from 'lucide-react-native';

export interface FilterOptions {
  category: string | null;
  safetyScore: string | null;
  sortBy: 'name' | 'date' | 'score';
}

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const categories = ['All', 'Hair', 'Skin', 'Face', 'Perfume'];
const safetyLevels = ['All', 'Safe (8-10)', 'Moderate (6-7)', 'Caution (0-5)'];
const sortOptions = [
  { value: 'date', label: 'Recent' },
  { value: 'name', label: 'Name' },
  { value: 'score', label: 'Safety Score' },
];

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}: SearchAndFilterProps) {
  const [showFilterModal, setShowFilterModal] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: null,
      safetyScore: null,
      sortBy: 'date',
    });
  };

  const hasActiveFilters = filters.category || filters.safetyScore || filters.sortBy !== 'date';

  const getActiveFilterText = () => {
    const activeFilters = [];
    if (filters.category) activeFilters.push(filters.category);
    if (filters.safetyScore) activeFilters.push(filters.safetyScore.split(' ')[0]);
    if (filters.sortBy !== 'date') {
      const sortLabel = sortOptions.find((opt) => opt.value === filters.sortBy)?.label;
      if (sortLabel) activeFilters.push(sortLabel);
    }
    return activeFilters.length > 0 ? activeFilters.join(', ') : 'Filter';
  };

  return (
    <View className="px-4 py-4">
      {/* Search Bar */}
      <View className="flex-row items-center">
        <View className="flex-1 flex-row items-center bg-white border rounded-2xl px-4 py-3 mr-3">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 text-base text-black ml-3"
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className={`px-4 py-3 rounded-2xl border flex-row items-center ${hasActiveFilters ? 'bg-black' : 'bg-white'}`}
        >
          <Filter size={16} color={hasActiveFilters ? '#fff' : '#000'} />
          <Text
            className={`ml-2 text-sm font-medium ${hasActiveFilters ? 'text-white' : 'text-black'}`}
          >
            {hasActiveFilters ? 'Filtered' : 'Filter'}
          </Text>
          <ChevronDown size={16} color={hasActiveFilters ? '#fff' : '#000'} className="ml-1" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
              <Text className="text-xl font-bold text-black">Filter & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="p-6">
              {/* Category Filter */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-black mb-3">Category</Text>
                <View className="flex-row flex-wrap">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => updateFilter('category', category === 'All' ? null : category)}
                      className={`px-4 py-2 rounded-xl mr-2 mb-2 ${
                        (category === 'All' && !filters.category) || filters.category === category
                          ? 'bg-black'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          (category === 'All' && !filters.category) || filters.category === category
                            ? 'text-white'
                            : 'text-black'
                        }`}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Safety Score Filter */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-black mb-3">Safety Level</Text>
                <View className="flex-row flex-wrap">
                  {safetyLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => updateFilter('safetyScore', level === 'All' ? null : level)}
                      className={`px-4 py-2 rounded-xl mr-2 mb-2 ${
                        (level === 'All' && !filters.safetyScore) || filters.safetyScore === level
                          ? 'bg-black'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          (level === 'All' && !filters.safetyScore) || filters.safetyScore === level
                            ? 'text-white'
                            : 'text-black'
                        }`}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort By */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-black mb-3">Sort by</Text>
                <View className="flex-row flex-wrap">
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => updateFilter('sortBy', option.value)}
                      className={`px-4 py-2 rounded-xl mr-2 mb-2 ${
                        filters.sortBy === option.value ? 'bg-black' : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          filters.sortBy === option.value ? 'text-white' : 'text-black'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                {hasActiveFilters && (
                  <TouchableOpacity
                    onPress={clearFilters}
                    className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
                  >
                    <Text className="text-black text-base font-medium">Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowFilterModal(false)}
                  className="flex-1 bg-black rounded-2xl py-4 items-center"
                >
                  <Text className="text-white text-base font-medium">Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
