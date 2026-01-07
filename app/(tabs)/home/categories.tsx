import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { useCategoryBreakdown, CategoryBreakdown } from '@/lib/hooks/use-receipts';

// Category progress colors
const CATEGORY_COLORS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#14B8A6', // teal
  '#6366F1', // indigo
];

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();

  const { data: categoryBreakdown = [] } = useCategoryBreakdown();

  // Calculate total for percentage
  const totalDeductible = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('categories.title')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Summary Card */}
        <View style={styles.summaryContainer}>
          <View
            style={[
              styles.summaryCard,
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
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
              {t('categories.totalDeductible')}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(totalDeductible)}
            </Text>
            <Text style={[styles.summarySubtext, { color: colors.textMuted }]}>
              {t('categories.acrossCategories', { count: categoryBreakdown.length })}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {categoryBreakdown.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('categories.noCategories')}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {t('categories.noCategoriesSubtitle')}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.categoryList,
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
              {categoryBreakdown.map((cat, index) => (
                <CategoryRow
                  key={cat.category}
                  category={cat}
                  totalDeductible={totalDeductible}
                  colors={colors}
                  isDark={isDark}
                  isLast={index === categoryBreakdown.length - 1}
                  colorIndex={index}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: '/(tabs)/receipts',
                      params: { category: cat.category },
                    });
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function CategoryRow({
  category,
  totalDeductible,
  colors,
  isDark,
  isLast,
  colorIndex,
  onPress,
}: {
  category: CategoryBreakdown;
  totalDeductible: number;
  colors: ReturnType<typeof useThemedColors>;
  isDark: boolean;
  isLast: boolean;
  colorIndex: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const percentage = totalDeductible > 0 ? (category.total / totalDeductible) * 100 : 0;
  const barColor = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.categoryRow,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        },
      ]}
    >
      <View style={styles.categoryLeft}>
        <View style={[styles.categoryColorDot, { backgroundColor: barColor }]} />
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
            {category.categoryName}
          </Text>
          <Text style={[styles.categoryCount, { color: colors.textMuted }]}>
            {category.count} {category.count === 1 ? t('categories.receipt') : t('categories.receipts')}
          </Text>
        </View>
      </View>
      <View style={styles.categoryRight}>
        <Text style={[styles.categoryAmount, { color: colors.text }]}>
          {formatCurrency(category.total)}
        </Text>
        <View style={styles.progressContainer}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  summarySubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    width: 32,
    textAlign: 'right',
  },
});
