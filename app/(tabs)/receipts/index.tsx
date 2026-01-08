import { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Search,
  TrendingUp,
  Download,
  SlidersHorizontal,
  X,
  DollarSign,
  PiggyBank,
  FileText,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { FilterModal } from '@/components/ui/filter-modal';
import { ReceiptListItem } from '@/components/receipts/receipt-list-item';
import { ExportModal } from '@/components/receipts/export-modal';
import {
  ReceiptListSkeleton,
  SummaryCardsSkeleton,
} from '@/components/ui/skeleton';
import { usePendingReceipt } from '@/context/pending-receipt-provider';
import {
  useReceipts,
  useReceiptSummary,
  useExportReceiptsToCSV,
  useExportReceiptsToPDF,
} from '@/lib/hooks/use-receipts';
import type { TaxCategoryId } from '@/lib/constants/categories';
import type { DateRange, QuickFilterType } from '@/lib/types/receipt';

export default function ReceiptsScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const { pendingReceipt } = usePendingReceipt();

  const [showExportModal, setShowExportModal] = useState(false);

  // Filter state
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<TaxCategoryId[]>([]);
  const searchInputRef = useRef<TextInput>(null);

  // Build filters object for the query
  const filters = useMemo(
    () => ({
      dateRange: selectedRange || undefined,
      searchQuery: searchQuery || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    }),
    [selectedRange, searchQuery, selectedCategories]
  );

  // Use React Query hooks
  const { data: receipts = [], isLoading, isRefetching, refetch } = useReceipts(filters);

  const {
    data: summary = {
      totalReceipts: 0,
      totalAmount: 0,
      totalDeductible: 0,
      estimatedSavings: 0,
    },
  } = useReceiptSummary(filters);

  // Export mutations
  const exportCSV = useExportReceiptsToCSV();
  const exportPDF = useExportReceiptsToPDF();

  const handleRefresh = () => {
    refetch();
  };

  const handleRangeChange = (range: DateRange | null, filter: QuickFilterType) => {
    setSelectedRange(range);
    setQuickFilter(filter);
  };

  const handleExport = async (format: 'csv' | 'pdf', _dateRange: DateRange | null) => {
    // Use the current receipts if no specific date range, otherwise we'd need to fetch
    const exportReceipts = receipts;
    const exportSummary = summary;

    if (exportReceipts.length === 0) {
      throw new Error('No receipts to export');
    }

    if (format === 'csv') {
      await exportCSV.mutateAsync(exportReceipts);
    } else {
      await exportPDF.mutateAsync({ receipts: exportReceipts, summary: exportSummary });
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]}>{t('receipts.title')}</Text>
              {summary.totalReceipts > 0 && (
                <Text style={[styles.titleCount, { color: colors.textMuted }]}>
                  ({summary.totalReceipts})
                </Text>
              )}
            </View>
            <View style={styles.headerActions}>
              {/* Export Button */}
              <Pressable
                style={[
                  styles.headerButton,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowExportModal(true);
                }}
              >
                <Download size={20} color={colors.primary} />
              </Pressable>

              {/* Search Button */}
              <Pressable
                style={[
                  styles.headerButton,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  },
                  isSearchVisible && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsSearchVisible(!isSearchVisible);
                  if (!isSearchVisible) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  } else {
                    setSearchQuery('');
                    Keyboard.dismiss();
                  }
                }}
              >
                {isSearchVisible ? (
                  <X size={20} color={colors.primary} />
                ) : (
                  <Search size={20} color={colors.textSecondary} />
                )}
              </Pressable>

              {/* Filter Button */}
              <Pressable
                style={[
                  styles.headerButton,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  },
                  (quickFilter !== 'all' || selectedCategories.length > 0) && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowFilterModal(true);
                }}
              >
                <SlidersHorizontal
                  size={20}
                  color={(quickFilter !== 'all' || selectedCategories.length > 0) ? colors.primary : colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          {/* Export Modal */}
          <ExportModal
            visible={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
            receiptCount={summary.totalReceipts}
            summary={summary}
          />

          {/* Search Input */}
          {isSearchVisible && (
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <Search size={18} color={colors.textMuted} />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search receipts..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          )}

          {/* Filter Modal */}
          <FilterModal
            visible={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            selectedRange={selectedRange}
            selectedQuickFilter={quickFilter}
            onRangeChange={handleRangeChange}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />
        </View>

        {/* Summary Cards */}
        {isLoading ? (
          <SummaryCardsSkeleton />
        ) : (
          <View style={styles.summaryContainer}>
            {/* Savings */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
              ]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <PiggyBank size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(summary.estimatedSavings)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                {t('receipts.savings')}
              </Text>
            </View>

            {/* Total Expenses */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
              ]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <DollarSign size={16} color="#8B5CF6" />
              </View>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(summary.totalAmount)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                {t('receipts.totalExpenses')}
              </Text>
            </View>

            {/* Total Deductions */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
              ]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <TrendingUp size={16} color="#10B981" />
              </View>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(summary.totalDeductible)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                {t('receipts.deductions')}
              </Text>
            </View>
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {isLoading ? (
            <ReceiptListSkeleton count={4} />
          ) : receipts.length === 0 && !pendingReceipt ? (
            /* Empty State */
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconContainer,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  },
                ]}
              >
                <FileText size={48} color={colors.textMuted} strokeWidth={1} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('receipts.emptyTitle')}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('receipts.emptySubtitle')}
              </Text>
            </View>
          ) : (
            /* Receipt List */
            <View style={styles.receiptList}>
              {/* Pending Receipt - show at top while scanning */}
              {pendingReceipt && <ReceiptListItem pendingReceipt={pendingReceipt} />}
              {receipts.map((receipt) => (
                <ReceiptListItem key={receipt.id} receipt={receipt} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  titleCount: {
    fontSize: 18,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  receiptList: {
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
