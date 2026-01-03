import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { PageLayout } from '@/components/layouts';
import { SaveButton } from '@/components/ui/form-page';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Check, Receipt, Info } from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';
import { useRouter } from 'expo-router';

const EXPENSE_OPTIONS = [
  { id: 'under1k', annualEstimate: '$12,000/year', deductionPotential: 'Low' },
  { id: '1kto2k', annualEstimate: '$18,000/year', deductionPotential: 'Medium' },
  { id: '2kto5k', annualEstimate: '$42,000/year', deductionPotential: 'High' },
  { id: 'over5k', annualEstimate: '$60,000+/year', deductionPotential: 'Very High' },
];

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const router = useRouter();
  const { data: account, isLoading } = useAccount();
  const updateAccount = useUpdateAccount();

  const [selectedExpenses, setSelectedExpenses] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (account?.onboarding_monthly_expenses) {
      setSelectedExpenses(account.onboarding_monthly_expenses);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      setHasChanges(selectedExpenses !== account.onboarding_monthly_expenses);
    }
  }, [selectedExpenses, account]);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExpenses(id);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      await updateAccount.mutateAsync({
        onboarding_monthly_expenses: selectedExpenses,
      });
      router.back();
    } catch {
      // Error handled by mutation
    }
  };

  const getLabel = (id: string) => {
    const labels: Record<string, string> = {
      under1k: t('onboarding.quiz.question4.options.under1k'),
      '1kto2k': t('onboarding.quiz.question4.options.1kto2k'),
      '2kto5k': t('onboarding.quiz.question4.options.2kto5k'),
      over5k: t('onboarding.quiz.question4.options.over5k'),
    };
    return labels[id];
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'Low': return '#94A3B8';
      case 'Medium': return '#F59E0B';
      case 'High': return '#10B981';
      case 'Very High': return '#8B5CF6';
      default: return colors.textSecondary;
    }
  };

  return (
    <PageLayout
      title={t('taxProfile.monthlyExpenses')}
      showBackButton
      rightAction={
        <SaveButton onPress={handleSave} disabled={!hasChanges} loading={updateAccount.isPending} />
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <Receipt size={28} color="#F59E0B" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('onboarding.quiz.question4.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('onboarding.quiz.question4.subtitle')}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {EXPENSE_OPTIONS.map((option) => {
            const isSelected = selectedExpenses === option.id;
            const potentialColor = getPotentialColor(option.deductionPotential);
            return (
              <Pressable
                key={option.id}
                onPress={() => handleSelect(option.id)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? `${colors.primary}08` : colors.card,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionMain}>
                    <Text style={[styles.optionLabel, { color: isSelected ? colors.primary : colors.text }]}>
                      {getLabel(option.id)}
                    </Text>
                    <Text style={[styles.optionAnnual, { color: colors.textSecondary }]}>
                      {option.annualEstimate}
                    </Text>
                  </View>
                  <View style={styles.optionBadges}>
                    <View style={[styles.potentialBadge, { backgroundColor: `${potentialColor}15` }]}>
                      <View style={[styles.potentialDot, { backgroundColor: potentialColor }]} />
                      <Text style={[styles.potentialText, { color: potentialColor }]}>
                        {option.deductionPotential}
                      </Text>
                    </View>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Info Note */}
        <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
          <Info size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Include software subscriptions, supplies, travel, meals, home office costs, and any other business-related expenses.
          </Text>
        </View>
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
    paddingTop: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionMain: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionAnnual: {
    fontSize: 13,
  },
  optionBadges: {
    marginLeft: 12,
  },
  potentialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  potentialDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  potentialText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
