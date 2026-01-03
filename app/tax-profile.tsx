import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { FormPage, SaveButton } from '@/components/ui/form-page';
import { OptionSelector } from '@/components/ui/option-selector';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Check,
  FileText,
} from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';

// Schedule C expense categories with typical deduction amounts
const SCHEDULE_C_CATEGORIES = [
  { id: 'advertising', name: 'Advertising', line: 8 },
  { id: 'car_truck', name: 'Car & Truck', line: 9 },
  { id: 'commissions_fees', name: 'Commissions & Fees', line: 10 },
  { id: 'contract_labor', name: 'Contract Labor', line: 11 },
  { id: 'insurance', name: 'Insurance', line: 15 },
  { id: 'legal_professional', name: 'Legal & Professional', line: 17 },
  { id: 'office_expense', name: 'Office Expense', line: 18 },
  { id: 'rent_property', name: 'Rent - Business Property', line: '20b' },
  { id: 'supplies', name: 'Supplies', line: 22 },
  { id: 'travel', name: 'Travel', line: '24a' },
  { id: 'meals', name: 'Meals (50% deductible)', line: '24b', rate: 0.5 },
  { id: 'utilities', name: 'Utilities', line: 25 },
  { id: 'home_office', name: 'Home Office', line: 30 },
  { id: 'other', name: 'Other Expenses', line: '27a' },
] as const;

interface ExpenseCategorySelectorProps {
  selectedCategories: string[];
  onToggle: (id: string) => void;
  colors: ReturnType<typeof useThemedColors>;
}

function ExpenseCategorySelector({ selectedCategories, onToggle, colors }: ExpenseCategorySelectorProps) {
  const { t } = useTranslation();

  const handleToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(id);
  };

  return (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: colors.iconBackground }]}>
          <FileText size={18} color={colors.primary} />
        </View>
        <View style={styles.categoryHeaderText}>
          <Text style={[styles.categoryLabel, { color: colors.text }]}>
            {t('taxProfile.expenseCategories')}
          </Text>
          <Text style={[styles.categorySubtitle, { color: colors.textSecondary }]}>
            {t('taxProfile.expenseCategoriesHint')}
          </Text>
        </View>
      </View>
      <View style={styles.categoryGrid}>
        {SCHEDULE_C_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <Pressable
              key={category.id}
              onPress={() => handleToggle(category.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: isSelected ? colors.primary : colors.text },
                ]}
                numberOfLines={1}
              >
                {category.name}
              </Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.scheduleNote, { color: colors.textMuted }]}>
        {t('taxProfile.scheduleCNote')}
      </Text>
    </View>
  );
}

export default function TaxProfileScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { data: account, isLoading } = useAccount();
  const updateAccount = useUpdateAccount();

  const [income, setIncome] = useState<string | null>(null);
  const [workType, setWorkType] = useState<string | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState<string | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load initial data from account
  useEffect(() => {
    if (account) {
      setIncome(account.onboarding_income);
      setWorkType(account.onboarding_work_type);
      setMonthlyExpenses(account.onboarding_monthly_expenses);
      // Parse expense categories from current_tracking field (we're repurposing it)
      if (account.onboarding_current_tracking) {
        try {
          const parsed = JSON.parse(account.onboarding_current_tracking);
          if (Array.isArray(parsed)) {
            setExpenseCategories(parsed);
          }
        } catch {
          // If it's not JSON, it's the old format - migrate to empty array
          setExpenseCategories([]);
        }
      }
    }
  }, [account]);

  // Track changes
  useEffect(() => {
    if (account) {
      const incomeChanged = income !== account.onboarding_income;
      const workTypeChanged = workType !== account.onboarding_work_type;
      const expensesChanged = monthlyExpenses !== account.onboarding_monthly_expenses;

      let categoriesChanged = false;
      if (account.onboarding_current_tracking) {
        try {
          const parsed = JSON.parse(account.onboarding_current_tracking);
          categoriesChanged = JSON.stringify(expenseCategories.sort()) !== JSON.stringify((parsed || []).sort());
        } catch {
          categoriesChanged = expenseCategories.length > 0;
        }
      } else {
        categoriesChanged = expenseCategories.length > 0;
      }

      setHasChanges(incomeChanged || workTypeChanged || expensesChanged || categoriesChanged);
    }
  }, [income, workType, monthlyExpenses, expenseCategories, account]);

  const toggleExpenseCategory = (categoryId: string) => {
    setExpenseCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Calculate estimated savings based on Schedule C data
  const calculateSavings = () => {
    // Base monthly expense amount
    const monthlyExpenseBase: Record<string, number> = {
      under1k: 750,
      '1kto2k': 1500,
      '2kto5k': 3500,
      over5k: 7500,
    };

    // Work type multiplier (some professions have more deductible expenses)
    const workTypeMultiplier: Record<string, number> = {
      freelancer: 1.1,
      contractor: 1.2,
      smallBiz: 1.4,
      sideHustle: 0.8,
    };

    // Income affects tax rate
    const effectiveTaxRate: Record<string, number> = {
      under75k: 0.22, // 12% income + ~10% SE tax
      '75k150k': 0.27, // 22% income + ~5% SE tax (some phaseout)
      '150k300k': 0.32, // 24-32% income + partial SE
      over300k: 0.37, // 35%+ income
    };

    // Category-specific annual estimates (common deduction amounts)
    const categoryEstimates: Record<string, number> = {
      advertising: 1200,
      car_truck: 6000, // IRS mileage rate × typical business miles
      commissions_fees: 2400,
      contract_labor: 5000,
      insurance: 1800,
      legal_professional: 1500,
      office_expense: 2400,
      rent_property: 12000,
      supplies: 1200,
      travel: 3000,
      meals: 2400, // Note: only 50% deductible
      utilities: 1800,
      home_office: 1800, // Simplified method max ~$1500, regular can be more
      other: 1000,
    };

    const baseMonthly = monthlyExpenseBase[monthlyExpenses || '1kto2k'] || 1500;
    const workMultiplier = workTypeMultiplier[workType || 'freelancer'] || 1.0;
    const taxRate = effectiveTaxRate[income || 'under75k'] || 0.25;

    // Calculate annual expenses
    let annualDeductible = baseMonthly * 12 * workMultiplier;

    // Add bonus for selecting specific categories (shows they're tracking)
    if (expenseCategories.length > 0) {
      // Calculate potential from selected categories
      let categoryTotal = 0;
      expenseCategories.forEach((catId) => {
        const estimate = categoryEstimates[catId] || 500;
        // Meals are 50% deductible
        const rate = catId === 'meals' ? 0.5 : 1.0;
        categoryTotal += estimate * rate;
      });

      // Use the higher of the two estimates (category-based vs general)
      annualDeductible = Math.max(annualDeductible, categoryTotal);
    }

    // Estimated missed deductions (what they're probably not tracking)
    const missedMultiplier = expenseCategories.length < 3 ? 1.3 : expenseCategories.length < 6 ? 1.15 : 1.0;
    const missed = Math.round(annualDeductible * missedMultiplier);

    // Tax savings
    const savings = Math.round(missed * taxRate);

    return { missed, savings };
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    const { missed, savings } = calculateSavings();

    try {
      await updateAccount.mutateAsync({
        onboarding_income: income,
        onboarding_work_type: workType,
        onboarding_current_tracking: JSON.stringify(expenseCategories), // Store categories as JSON
        onboarding_monthly_expenses: monthlyExpenses,
        onboarding_estimated_savings: savings,
        onboarding_estimated_missed_deductions: missed,
      });
      setHasChanges(false);
    } catch {
      // Error handled by mutation
    }
  };

  const incomeOptions = [
    { id: 'under75k', label: t('onboarding.quiz.question1.options.under75k') },
    { id: '75k150k', label: t('onboarding.quiz.question1.options.75k150k') },
    { id: '150k300k', label: t('onboarding.quiz.question1.options.150k300k') },
    { id: 'over300k', label: t('onboarding.quiz.question1.options.over300k') },
  ];

  const workTypeOptions = [
    { id: 'freelancer', label: t('onboarding.quiz.question2.options.freelancer') },
    { id: 'contractor', label: t('onboarding.quiz.question2.options.contractor') },
    { id: 'smallBiz', label: t('onboarding.quiz.question2.options.smallBiz') },
    { id: 'sideHustle', label: t('onboarding.quiz.question2.options.sideHustle') },
  ];

  const expensesOptions = [
    { id: 'under1k', label: t('onboarding.quiz.question4.options.under1k') },
    { id: '1kto2k', label: t('onboarding.quiz.question4.options.1kto2k') },
    { id: '2kto5k', label: t('onboarding.quiz.question4.options.2kto5k') },
    { id: 'over5k', label: t('onboarding.quiz.question4.options.over5k') },
  ];

  const { missed, savings } = calculateSavings();

  return (
    <FormPage
      title={t('taxProfile.title')}
      isLoading={isLoading}
      skeletonFields={5}
      rightAction={
        <SaveButton onPress={handleSave} disabled={!hasChanges} loading={updateAccount.isPending} />
      }
    >
      {/* Estimated Savings Card */}
      <View style={[styles.savingsCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
        <View style={styles.savingsHeader}>
          <View style={[styles.savingsIcon, { backgroundColor: colors.primary }]}>
            <TrendingUp size={20} color="#fff" />
          </View>
          <Text style={[styles.savingsTitle, { color: colors.text }]}>
            {t('taxProfile.estimatedSavings')}
          </Text>
        </View>
        <View style={styles.savingsValues}>
          <View style={styles.savingsItem}>
            <Text style={[styles.savingsLabel, { color: colors.textSecondary }]}>
              {t('taxProfile.missedDeductions')}
            </Text>
            <Text style={[styles.savingsAmount, { color: colors.text }]}>
              ${missed.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.savingsDivider, { backgroundColor: `${colors.primary}30` }]} />
          <View style={styles.savingsItem}>
            <Text style={[styles.savingsLabel, { color: colors.textSecondary }]}>
              {t('taxProfile.potentialSavings')}
            </Text>
            <Text style={[styles.savingsAmountHighlight, { color: colors.primary }]}>
              ${savings.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <OptionSelector
        label={t('taxProfile.income')}
        options={incomeOptions}
        selectedOption={income}
        onSelect={setIncome}
        icon={DollarSign}
      />

      <OptionSelector
        label={t('taxProfile.workType')}
        options={workTypeOptions}
        selectedOption={workType}
        onSelect={setWorkType}
        icon={Briefcase}
      />

      <OptionSelector
        label={t('taxProfile.monthlyExpenses')}
        options={expensesOptions}
        selectedOption={monthlyExpenses}
        onSelect={setMonthlyExpenses}
        icon={DollarSign}
      />

      {/* Schedule C Expense Categories */}
      <ExpenseCategorySelector
        selectedCategories={expenseCategories}
        onToggle={toggleExpenseCategory}
        colors={colors}
      />

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        {t('taxProfile.disclaimer')}
      </Text>
    </FormPage>
  );
}

const styles = StyleSheet.create({
  savingsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  savingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingsValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsItem: {
    flex: 1,
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  savingsAmountHighlight: {
    fontSize: 20,
    fontWeight: '800',
  },
  savingsDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
  },
  categoryContainer: {
    gap: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  categoryHeaderText: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  categorySubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleNote: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
