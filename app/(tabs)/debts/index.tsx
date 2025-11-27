import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { PageLayout } from '@/components/layouts';
import {
  DebtListItem,
  EmptyState,
  DebtListSkeleton,
} from '@/components/debts';
import { useDebts } from '@/lib/hooks/use-debts';
import { useDebouncedValue } from '@/lib/hooks/utils';
import { DebtCategory, DebtStatus, DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';

type SortOption = 'interest_rate' | 'balance' | 'name';
type StatusFilter = DebtStatus | 'all';

export default function DebtsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('interest_rate');
  const [categoryFilter, setCategoryFilter] = useState<DebtCategory | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const { data: debts, isLoading } = useDebts(debouncedSearch);

  const handleAddDebt = () => {
    router.push('/debt/add');
  };

  const handleDebtPress = (debtId: string) => {
    router.push(`/debt/${debtId}`);
  };

  // Filter and sort debts
  const filteredDebts = debts
    ?.filter((debt) => {
      // Status filter (default: active)
      if (statusFilter !== 'all' && debt.status !== statusFilter) return false;
      // Category filter
      if (categoryFilter && debt.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'interest_rate':
          return b.interest_rate - a.interest_rate;
        case 'balance':
          return b.current_balance - a.current_balance;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const hasDebts = filteredDebts && filteredDebts.length > 0;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'interest_rate', label: 'Interest Rate' },
    { value: 'balance', label: 'Balance' },
    { value: 'name', label: 'Name' },
  ];

  const categories = Object.entries(DEBT_CATEGORY_CONFIG).map(([key, config]) => ({
    value: key as DebtCategory,
    label: config.label,
  }));

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'paid_off', label: 'Paid Off' },
    { value: 'all', label: 'All' },
  ];

  const headerActions = (
    <View className="flex-row items-center">
      <Pressable
        onPress={() => {
          setShowSearch(!showSearch);
          if (showSearch) setSearchQuery('');
        }}
        className="w-9 h-9 rounded-full overflow-hidden items-center justify-center mr-2"
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.03]" />
        {showSearch ? (
          <X size={18} color="#9CA3AF" />
        ) : (
          <Search size={18} color="#9CA3AF" />
        )}
      </Pressable>
      <Pressable
        onPress={() => setShowFilters(!showFilters)}
        className="w-9 h-9 rounded-full overflow-hidden items-center justify-center mr-2"
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View
          className={`absolute inset-0 rounded-full border ${
            showFilters || categoryFilter || statusFilter !== 'active'
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-white/10 bg-white/[0.03]'
          }`}
        />
        <SlidersHorizontal
          size={18}
          color={showFilters || categoryFilter || statusFilter !== 'active' ? '#10B981' : '#9CA3AF'}
        />
      </Pressable>
      <Pressable
        onPress={handleAddDebt}
        className="w-9 h-9 rounded-full overflow-hidden items-center justify-center"
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View className="absolute inset-0 rounded-full border border-emerald-500/30 bg-emerald-500/80" />
        <Plus size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  return (
    <PageLayout title="Debts" rightAction={headerActions}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* Search Bar (expandable) */}
        {showSearch && (
          <View className="mx-4 mt-2 mb-4 rounded-2xl overflow-hidden bg-white/[0.03]">
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View className="absolute inset-0 rounded-2xl border border-white/10" />
            <View className="flex-row items-center px-4 py-3">
              <Search size={18} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search debts..."
                placeholderTextColor="#6B7280"
                autoFocus
                keyboardAppearance="dark"
                className="flex-1 ml-3 text-white text-base"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={18} color="#6B7280" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Filters Panel (expandable) */}
        {showFilters && (
          <View className={`mx-4 ${showSearch ? '' : 'mt-2'} mb-4 rounded-2xl overflow-hidden bg-white/[0.03]`}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View className="absolute inset-0 rounded-2xl border border-white/10" />
            <View className="p-4">
              {/* Status Filter */}
              <Text className="text-gray-400 text-sm mb-2">Status</Text>
              <View className="flex-row flex-wrap mb-4">
                {statusOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setStatusFilter(option.value)}
                    className={`px-3 py-1.5 rounded-full mr-2 mb-2 ${
                      statusFilter === option.value
                        ? 'bg-emerald-500'
                        : 'bg-white/10'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        statusFilter === option.value ? 'text-white font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Sort Options */}
              <Text className="text-gray-400 text-sm mb-2">Sort by</Text>
              <View className="flex-row flex-wrap mb-4">
                {sortOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setSortBy(option.value)}
                    className={`px-3 py-1.5 rounded-full mr-2 mb-2 ${
                      sortBy === option.value
                        ? 'bg-emerald-500'
                        : 'bg-white/10'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        sortBy === option.value ? 'text-white font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Category Filter */}
              <Text className="text-gray-400 text-sm mb-2">Category</Text>
              <View className="flex-row flex-wrap">
                <Pressable
                  onPress={() => setCategoryFilter(null)}
                  className={`px-3 py-1.5 rounded-full mr-2 mb-2 ${
                    categoryFilter === null ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      categoryFilter === null ? 'text-white font-semibold' : 'text-gray-400'
                    }`}
                  >
                    All
                  </Text>
                </Pressable>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.value}
                    onPress={() => setCategoryFilter(cat.value)}
                    className={`px-3 py-1.5 rounded-full mr-2 mb-2 ${
                      categoryFilter === cat.value
                        ? 'bg-emerald-500'
                        : 'bg-white/10'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        categoryFilter === cat.value
                          ? 'text-white font-semibold'
                          : 'text-gray-400'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Priority Info Banner */}
        {!isLoading && hasDebts && !debouncedSearch && sortBy === 'interest_rate' && (
          <View className="mx-4 mb-4 bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
            <Text className="text-emerald-400 font-semibold mb-1">
              Avalanche Strategy
            </Text>
            <Text className="text-gray-400 text-sm">
              Focus extra payments on the top debt to save the most money.
            </Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && <DebtListSkeleton count={4} />}

        {/* Empty State */}
        {!isLoading && !hasDebts && !debouncedSearch && !categoryFilter && statusFilter === 'active' && (
          <EmptyState onAddDebt={handleAddDebt} />
        )}

        {/* No Search/Filter Results */}
        {!isLoading && !hasDebts && (debouncedSearch || categoryFilter || statusFilter !== 'active') && (
          <View className="items-center py-8 px-4">
            <Text className="text-gray-400 text-center">
              No {statusFilter === 'paid_off' ? 'paid off' : statusFilter === 'all' ? '' : 'active '}debts found
              {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
              {categoryFilter ? ` in ${DEBT_CATEGORY_CONFIG[categoryFilter].label}` : ''}
            </Text>
          </View>
        )}

        {/* Debt List */}
        {!isLoading && hasDebts && (
          <View>
            {filteredDebts.map((debt, index) => (
              <DebtListItem
                key={debt.id}
                debt={debt}
                onPress={() => handleDebtPress(debt.id)}
                showRank={!debouncedSearch && sortBy === 'interest_rate'}
                rank={index + 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
}
