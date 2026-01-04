import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  Receipt,
  Camera,
  ChevronRight,
  Sparkles,
  DollarSign,
  FileText,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();

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

          {/* Savings Card - Main Hero */}
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
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <Text style={[styles.savingsLabel, { color: colors.textSecondary }]}>
                {t('home.estimatedSavings')}
              </Text>
            </View>
            <Text style={[styles.savingsAmount, { color: colors.text }]}>$0</Text>
            <Text style={[styles.savingsSubtext, { color: colors.textMuted }]}>
              {t('home.thisYear')}
            </Text>
          </View>

          {/* Quick Stats Row */}
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
              <Text style={[styles.statValue, { color: colors.text }]}>$0</Text>
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
              <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
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

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('home.quickActions')}
            </Text>
            <View style={styles.actionsGrid}>
              <QuickAction
                icon={Receipt}
                label={t('home.viewReceipts')}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/receipts');
                }}
                colors={colors}
                isDark={isDark}
              />
              <QuickAction
                icon={Sparkles}
                label={t('home.aiInsights')}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                colors={colors}
                isDark={isDark}
                disabled
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onPress,
  colors,
  isDark,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useThemedColors>;
  isDark: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionCard,
        {
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.02)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View
        style={[styles.actionIcon, { backgroundColor: colors.iconBackground }]}
      >
        <Icon size={20} color={colors.textSecondary} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
