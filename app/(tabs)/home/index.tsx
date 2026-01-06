import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  PiggyBank,
  Camera,
  ChevronRight,
  DollarSign,
  FileText,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { useReceiptSummary, useReceipts } from '@/lib/hooks/use-receipts';
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

  // Get recent receipts (last 3)
  const recentReceipts = receipts.slice(0, 3);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

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

          {/* Main Savings Card */}
          <View
            style={[
              styles.savingsCard,
              {
                backgroundColor: isDark
                  ? 'rgba(0, 192, 232, 0.08)'
                  : 'rgba(0, 192, 232, 0.06)',
                borderColor: isDark
                  ? 'rgba(0, 192, 232, 0.2)'
                  : 'rgba(0, 192, 232, 0.15)',
              },
            ]}
          >
            <View style={styles.savingsHeader}>
              <View
                style={[
                  styles.savingsIconWrapper,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <PiggyBank size={20} color={colors.primary} />
              </View>
              <Text style={[styles.savingsLabel, { color: colors.textSecondary }]}>
                {t('home.estimatedSavings')}
              </Text>
            </View>
            <Text style={[styles.savingsAmount, { color: colors.text }]}>
              {formatCurrency(summary.estimatedSavings)}
            </Text>
            <Text style={[styles.savingsSubtext, { color: colors.textMuted }]}>
              {t('home.thisYear')}
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

          {/* Scan CTA */}
          <Pressable onPress={handleScanPress} style={styles.scanCTAWrapper}>
            <LinearGradient
              colors={[colors.primary, isDark ? '#0099BB' : '#00A8CC']}
              style={styles.scanCTA}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.scanCTAContent}>
                <View style={styles.scanCTALeft}>
                  <View style={styles.scanCTAIconWrapper}>
                    <Camera size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.scanCTATitle}>{t('home.scanReceipt')}</Text>
                    <Text style={styles.scanCTASubtitle}>
                      {t('home.scanReceiptSubtitle')}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </Pressable>

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
      {/* Receipt Image Thumbnail */}
      {receipt.image_uri ? (
        <Image
          source={{ uri: receipt.image_uri }}
          style={styles.receiptThumbnail}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.receiptThumbnail,
            styles.receiptThumbnailPlaceholder,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
          ]}
        >
          <FileText size={16} color={colors.textMuted} />
        </View>
      )}

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
  savingsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  savingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  savingsAmount: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 4,
  },
  savingsSubtext: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
  scanCTAWrapper: {
    marginBottom: 28,
  },
  scanCTA: {
    borderRadius: 16,
    shadowColor: '#00C0E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  scanCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  scanCTALeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanCTAIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scanCTATitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  scanCTASubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
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
    padding: 12,
  },
  receiptThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  receiptThumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptDetails: {
    flex: 1,
    marginLeft: 12,
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
