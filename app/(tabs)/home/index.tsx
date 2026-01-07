import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  DollarSign,
  FileText,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { useReceiptSummary, useReceipts, useCategoryBreakdown, CategoryBreakdown } from '@/lib/hooks/use-receipts';
import { useReviewPrompt } from '@/lib/hooks/use-review-prompt';
import { getCategoryById } from '@/lib/constants/categories';
import type { Receipt } from '@/lib/types/receipt';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();

  // Fetch real data
  const { data: summary = { totalReceipts: 0, totalAmount: 0, totalDeductible: 0, estimatedSavings: 0 } } = useReceiptSummary();
  const { data: receipts = [] } = useReceipts();
  const { data: categoryBreakdown = [] } = useCategoryBreakdown();
  const { maybeRequestReview } = useReviewPrompt();

  // Request app review on home screen (natural pause point)
  // Only prompts if: 3+ receipts AND 7+ days of usage
  useEffect(() => {
    maybeRequestReview();
  }, [maybeRequestReview]);

  // Get recent receipts (last 3)
  const recentReceipts = receipts.slice(0, 3);

  // Get top categories (limit to 4 for display)
  const topCategories = categoryBreakdown.slice(0, 4);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const handleScanPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/scan');
  };

  // Calculate total for percentage
  const totalDeductible = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {t('home.greeting')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('home.subtitle')}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                ]}
              >
                <DollarSign size={16} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrency(summary.totalDeductible)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t('home.deductions')}
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <FileText size={16} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {summary.totalReceipts}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {t('home.receipts')}
              </Text>
            </View>
          </View>

          {/* Category Breakdown Section */}
          {topCategories.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('home.byCategory')}
                </Text>
              </View>

              <View
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : '#FFFFFF',
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                {topCategories.map((cat, index) => (
                  <CategoryRow
                    key={cat.category}
                    category={cat}
                    totalDeductible={totalDeductible}
                    colors={colors}
                    isDark={isDark}
                    isLast={index === topCategories.length - 1}
                  />
                ))}

                {categoryBreakdown.length > 4 && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/(tabs)/home/categories');
                    }}
                    style={styles.viewAllCategories}
                  >
                    <Text style={[styles.viewAllText, { color: colors.primary }]}>
                      {t('home.viewAllCategories', { count: categoryBreakdown.length - 4 })}
                    </Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Recent Receipts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('home.recentReceipts')}
              </Text>
              {receipts.length > 0 && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(tabs)/receipts');
                  }}
                >
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>
                    {t('common.seeAll')}
                  </Text>
                </Pressable>
              )}
            </View>

            {recentReceipts.length === 0 ? (
              /* Empty State */
              <Pressable
                onPress={handleScanPress}
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(0,0,0,0.02)',
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.emptyIconWrapper,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Plus size={24} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('home.noReceiptsYet')}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {t('home.tapToScanFirst')}
                </Text>
              </Pressable>
            ) : (
              /* Receipt List */
              <View style={styles.receiptList}>
                {recentReceipts.map((receipt) => (
                  <RecentReceiptItem
                    key={receipt.id}
                    receipt={receipt}
                    colors={colors}
                    isDark={isDark}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/receipt/${receipt.id}`);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Category progress colors
const CATEGORY_COLORS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
];

function CategoryRow({
  category,
  totalDeductible,
  colors,
  isDark,
  isLast,
}: {
  category: CategoryBreakdown;
  totalDeductible: number;
  colors: ReturnType<typeof useThemedColors>;
  isDark: boolean;
  isLast: boolean;
}) {
  const percentage = totalDeductible > 0 ? (category.total / totalDeductible) * 100 : 0;
  const colorIndex = CATEGORY_COLORS.length > 0 ? Math.abs(category.category.charCodeAt(0)) % CATEGORY_COLORS.length : 0;
  const barColor = CATEGORY_COLORS[colorIndex];

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <View
      style={[
        styles.categoryRow,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        },
      ]}
    >
      <View style={styles.categoryInfo}>
        <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
          {category.categoryName}
        </Text>
        <Text style={[styles.categoryCount, { color: colors.textMuted }]}>
          {category.count} {category.count === 1 ? 'receipt' : 'receipts'}
        </Text>
      </View>
      <View style={styles.categoryRight}>
        <Text style={[styles.categoryAmount, { color: colors.text }]}>
          {formatCurrency(category.total)}
        </Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: barColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.categoryPercentage, { color: colors.textMuted }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

function RecentReceiptItem({
  receipt,
  colors,
  isDark,
  onPress,
}: {
  receipt: Receipt;
  colors: ReturnType<typeof useThemedColors>;
  isDark: boolean;
  onPress: () => void;
}) {
  const category = receipt.category ? getCategoryById(receipt.category) : null;

  const formatAmount = (cents: number | null) => {
    if (!cents) return '$0';
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.receiptItem,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        },
      ]}
    >
      {/* Receipt Details */}
      <View style={styles.receiptDetails}>
        <Text style={[styles.receiptVendor, { color: colors.text }]} numberOfLines={1}>
          {receipt.vendor || 'Unknown Vendor'}
        </Text>
        <Text style={[styles.receiptMeta, { color: colors.textMuted }]}>
          {receipt.date ? format(new Date(receipt.date), 'MMM d') : 'No date'}
          {category && ` · ${category.name}`}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.receiptAmountWrapper}>
        <Text style={[styles.receiptAmount, { color: colors.text }]}>
          {formatAmount(receipt.total_amount)}
        </Text>
        {receipt.deductible_amount && receipt.deductible_amount > 0 && (
          <Text style={[styles.receiptDeductible, { color: '#10B981' }]}>
            -{formatAmount(receipt.deductible_amount)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Category breakdown
  categoryCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryPercentage: {
    fontSize: 11,
    width: 28,
    textAlign: 'right',
  },
  viewAllCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Empty state
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Recent receipts list
  receiptList: {
    gap: 10,
  },
  receiptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  receiptDetails: {
    flex: 1,
  },
  receiptVendor: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  receiptMeta: {
    fontSize: 13,
  },
  receiptAmountWrapper: {
    alignItems: 'flex-end',
  },
  receiptAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  receiptDeductible: {
    fontSize: 12,
    fontWeight: '500',
  },
});
