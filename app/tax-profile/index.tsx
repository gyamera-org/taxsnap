import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAccount } from '@/lib/hooks/use-accounts';
import { PageLayout } from '@/components/layouts';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  DollarSign,
  Briefcase,
  Receipt,
  FileText,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemedColors } from '@/lib/utils/theme';
import { TAX_CATEGORIES } from '@/lib/constants/categories';

interface SettingCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  value: string | null;
  subtitle?: string;
  onPress: () => void;
  colors: ReturnType<typeof useThemedColors>;
}

function SettingCard({ icon: Icon, iconColor, iconBg, title, value, subtitle, onPress, colors }: SettingCardProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.cardValue, { color: colors.text }]} numberOfLines={1}>
          {value || 'Not set'}
        </Text>
        {subtitle && (
          <Text style={[styles.cardSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export default function TaxProfileScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const router = useRouter();
  const { data: account, isLoading } = useAccount();

  // Get display values from account
  const getIncomeLabel = (income: string | null | undefined) => {
    const labels: Record<string, string> = {
      under75k: t('onboarding.quiz.question1.options.under75k'),
      '75k150k': t('onboarding.quiz.question1.options.75k150k'),
      '150k300k': t('onboarding.quiz.question1.options.150k300k'),
      over300k: t('onboarding.quiz.question1.options.over300k'),
    };
    return income ? labels[income] || null : null;
  };

  const getWorkTypeLabel = (workType: string | null | undefined) => {
    const labels: Record<string, string> = {
      freelancer: t('onboarding.quiz.question2.options.freelancer'),
      contractor: t('onboarding.quiz.question2.options.contractor'),
      smallBiz: t('onboarding.quiz.question2.options.smallBiz'),
      sideHustle: t('onboarding.quiz.question2.options.sideHustle'),
    };
    return workType ? labels[workType] || null : null;
  };

  const getExpensesLabel = (expenses: string | null | undefined) => {
    const labels: Record<string, string> = {
      under1k: t('onboarding.quiz.question4.options.under1k'),
      '1kto2k': t('onboarding.quiz.question4.options.1kto2k'),
      '2kto5k': t('onboarding.quiz.question4.options.2kto5k'),
      over5k: t('onboarding.quiz.question4.options.over5k'),
    };
    return expenses ? labels[expenses] || null : null;
  };

  const getSelectedCategoriesCount = () => {
    if (!account?.onboarding_current_tracking) return 0;
    try {
      const parsed = JSON.parse(account.onboarding_current_tracking);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  const getCategoriesSubtitle = () => {
    const count = getSelectedCategoriesCount();
    if (count === 0) return 'Select your expense types';
    if (count === 1) return '1 category selected';
    return `${count} categories selected`;
  };

  const savings = account?.onboarding_estimated_savings || 0;
  const missed = account?.onboarding_estimated_missed_deductions || 0;

  return (
    <PageLayout title={t('taxProfile.title')} showBackButton>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Savings Summary Card */}
        <View style={[styles.savingsCard, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }]}>
          <View style={styles.savingsHeader}>
            <View style={[styles.savingsIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <TrendingUp size={24} color={colors.primary} />
            </View>
            <View style={styles.savingsHeaderText}>
              <Text style={[styles.savingsTitle, { color: colors.text }]}>
                {t('taxProfile.estimatedSavings')}
              </Text>
              <Text style={[styles.savingsHint, { color: colors.textSecondary }]}>
                Based on your tax profile
              </Text>
            </View>
          </View>

          <View style={styles.savingsStats}>
            <View style={styles.savingsStat}>
              <Text style={[styles.savingsStatLabel, { color: colors.textSecondary }]}>
                {t('taxProfile.missedDeductions')}
              </Text>
              <Text style={[styles.savingsStatValue, { color: colors.text }]}>
                ${missed.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.savingsDivider, { backgroundColor: `${colors.primary}20` }]} />
            <View style={styles.savingsStat}>
              <Text style={[styles.savingsStatLabel, { color: colors.textSecondary }]}>
                {t('taxProfile.potentialSavings')}
              </Text>
              <Text style={[styles.savingsStatValueHighlight, { color: colors.primary }]}>
                ${savings.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={[styles.savingsTip, { backgroundColor: `${colors.primary}10` }]}>
            <Sparkles size={14} color={colors.primary} />
            <Text style={[styles.savingsTipText, { color: colors.primary }]}>
              Complete your profile to get accurate estimates
            </Text>
          </View>
        </View>

        {/* Section Header */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          YOUR TAX INFORMATION
        </Text>

        {/* Settings Cards */}
        <View style={styles.cardsContainer}>
          <SettingCard
            icon={DollarSign}
            iconColor="#10B981"
            iconBg="rgba(16, 185, 129, 0.1)"
            title={t('taxProfile.income')}
            value={getIncomeLabel(account?.onboarding_income)}
            onPress={() => router.push('/tax-profile/income')}
            colors={colors}
          />

          <SettingCard
            icon={Briefcase}
            iconColor="#8B5CF6"
            iconBg="rgba(139, 92, 246, 0.1)"
            title={t('taxProfile.workType')}
            value={getWorkTypeLabel(account?.onboarding_work_type)}
            onPress={() => router.push('/tax-profile/work-type')}
            colors={colors}
          />

          <SettingCard
            icon={Receipt}
            iconColor="#F59E0B"
            iconBg="rgba(245, 158, 11, 0.1)"
            title={t('taxProfile.monthlyExpenses')}
            value={getExpensesLabel(account?.onboarding_monthly_expenses)}
            onPress={() => router.push('/tax-profile/expenses')}
            colors={colors}
          />

          <SettingCard
            icon={FileText}
            iconColor="#3B82F6"
            iconBg="rgba(59, 130, 246, 0.1)"
            title={t('taxProfile.expenseCategories')}
            value={getCategoriesSubtitle()}
            subtitle="IRS Schedule C categories"
            onPress={() => router.push('/tax-profile/categories')}
            colors={colors}
          />
        </View>

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          {t('taxProfile.disclaimer')}
        </Text>
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  savingsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  savingsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsHeaderText: {
    flex: 1,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  savingsHint: {
    fontSize: 13,
    marginTop: 2,
  },
  savingsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsStat: {
    flex: 1,
    alignItems: 'center',
  },
  savingsStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  savingsStatValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  savingsStatValueHighlight: {
    fontSize: 24,
    fontWeight: '800',
  },
  savingsDivider: {
    width: 1,
    height: 44,
    marginHorizontal: 16,
  },
  savingsTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  savingsTipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
