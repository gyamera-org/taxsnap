import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { PageLayout } from '@/components/layouts';
import { SaveButton } from '@/components/ui/form-page';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Check, DollarSign, Info } from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';
import { useRouter } from 'expo-router';

const INCOME_OPTIONS = [
  { id: 'under75k', taxBracket: '12-22%', description: 'Entry-level self-employment' },
  { id: '75k150k', taxBracket: '22-24%', description: 'Established professional' },
  { id: '150k300k', taxBracket: '24-32%', description: 'High-earning professional' },
  { id: 'over300k', taxBracket: '32-37%', description: 'Top earner' },
];

export default function IncomeScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const router = useRouter();
  const { data: account, isLoading } = useAccount();
  const updateAccount = useUpdateAccount();

  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (account?.onboarding_income) {
      setSelectedIncome(account.onboarding_income);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      setHasChanges(selectedIncome !== account.onboarding_income);
    }
  }, [selectedIncome, account]);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIncome(id);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      await updateAccount.mutateAsync({
        onboarding_income: selectedIncome,
      });
      router.back();
    } catch {
      // Error handled by mutation
    }
  };

  const getLabel = (id: string) => {
    const labels: Record<string, string> = {
      under75k: t('onboarding.quiz.question1.options.under75k'),
      '75k150k': t('onboarding.quiz.question1.options.75k150k'),
      '150k300k': t('onboarding.quiz.question1.options.150k300k'),
      over300k: t('onboarding.quiz.question1.options.over300k'),
    };
    return labels[id];
  };

  return (
    <PageLayout
      title={t('taxProfile.income')}
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
          <View style={[styles.headerIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <DollarSign size={28} color="#10B981" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('onboarding.quiz.question1.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('onboarding.quiz.question1.subtitle')}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {INCOME_OPTIONS.map((option) => {
            const isSelected = selectedIncome === option.id;
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
                    <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                  <View style={[styles.taxBracket, { backgroundColor: `${colors.primary}10` }]}>
                    <Text style={[styles.taxBracketText, { color: colors.primary }]}>
                      {option.taxBracket}
                    </Text>
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
            Your income level helps us estimate your tax bracket and potential savings from deductions.
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
  optionDescription: {
    fontSize: 13,
  },
  taxBracket: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  taxBracketText: {
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
