import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { PageLayout } from '@/components/layouts';
import { SaveButton } from '@/components/ui/form-page';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Check, Briefcase, Info, Palette, Wrench, Building2, Zap } from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';
import { useRouter } from 'expo-router';

const WORK_TYPE_OPTIONS = [
  {
    id: 'freelancer',
    icon: Palette,
    iconColor: '#8B5CF6',
    iconBg: 'rgba(139, 92, 246, 0.1)',
    hint: 'Designers, writers, creators',
  },
  {
    id: 'contractor',
    icon: Wrench,
    iconColor: '#F59E0B',
    iconBg: 'rgba(245, 158, 11, 0.1)',
    hint: 'Tech, consulting, trades',
  },
  {
    id: 'smallBiz',
    icon: Building2,
    iconColor: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.1)',
    hint: 'LLC, sole proprietor, agency',
  },
  {
    id: 'sideHustle',
    icon: Zap,
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.1)',
    hint: 'Part-time, gig economy',
  },
];

export default function WorkTypeScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const router = useRouter();
  const { data: account, isLoading } = useAccount();
  const updateAccount = useUpdateAccount();

  const [selectedWorkType, setSelectedWorkType] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (account?.onboarding_work_type) {
      setSelectedWorkType(account.onboarding_work_type);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      setHasChanges(selectedWorkType !== account.onboarding_work_type);
    }
  }, [selectedWorkType, account]);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWorkType(id);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      await updateAccount.mutateAsync({
        onboarding_work_type: selectedWorkType,
      });
      router.back();
    } catch {
      // Error handled by mutation
    }
  };

  const getLabel = (id: string) => {
    const labels: Record<string, string> = {
      freelancer: t('onboarding.quiz.question2.options.freelancer'),
      contractor: t('onboarding.quiz.question2.options.contractor'),
      smallBiz: t('onboarding.quiz.question2.options.smallBiz'),
      sideHustle: t('onboarding.quiz.question2.options.sideHustle'),
    };
    return labels[id];
  };

  return (
    <PageLayout
      title={t('taxProfile.workType')}
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
          <View style={[styles.headerIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Briefcase size={28} color="#8B5CF6" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('onboarding.quiz.question2.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('onboarding.quiz.question2.subtitle')}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {WORK_TYPE_OPTIONS.map((option) => {
            const isSelected = selectedWorkType === option.id;
            const Icon = option.icon;
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
                <View style={[styles.optionIcon, { backgroundColor: option.iconBg }]}>
                  <Icon size={22} color={option.iconColor} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, { color: isSelected ? colors.primary : colors.text }]}>
                    {getLabel(option.id)}
                  </Text>
                  <Text style={[styles.optionHint, { color: colors.textSecondary }]}>
                    {option.hint}
                  </Text>
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
            Different work types have different deduction opportunities. We'll tailor suggestions based on your selection.
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
    gap: 14,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionHint: {
    fontSize: 13,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
