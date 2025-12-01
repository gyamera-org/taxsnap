import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageLayout } from '@/components/layouts';
import { FormField, SaveButton } from '@/components/ui/form-page';
import { useDebt, useUpdateDebt } from '@/lib/hooks/use-debts';
import { DebtCategory, DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';
import { Check } from 'lucide-react-native';
import { DebtDetailSkeleton } from '@/components/debts';
import { useCurrency } from '@/context/currency-provider';

const CATEGORIES: DebtCategory[] = [
  'credit_card',
  'personal_loan',
  'auto_loan',
  'student_loan',
  'mortgage',
  'medical',
  'other',
];

const DUE_DATE_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function EditDebtScreen() {
  const { currency } = useCurrency();
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';
  const router = useRouter();
  const { data: debt, isLoading } = useDebt(id);
  const updateDebt = useUpdateDebt();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DebtCategory>('credit_card');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [dueDate, setDueDate] = useState(1);

  // Populate form with existing debt data
  useEffect(() => {
    if (debt) {
      setName(debt.name);
      setCategory(debt.category);
      setBalance(debt.current_balance.toString());
      setInterestRate((debt.interest_rate * 100).toFixed(2));
      setMinimumPayment(debt.minimum_payment.toString());
      setDueDate(debt.due_date);
    }
  }, [debt]);

  const isValid =
    name.trim() &&
    parseFloat(balance) > 0 &&
    parseFloat(interestRate) >= 0 &&
    parseFloat(minimumPayment) > 0;

  const handleSave = async () => {
    if (!isValid || !debt) return;

    await updateDebt.mutateAsync({
      id,
      name: name.trim(),
      category,
      current_balance: parseFloat(balance),
      interest_rate: parseFloat(interestRate) / 100,
      minimum_payment: parseFloat(minimumPayment),
      due_date: dueDate,
    });

    router.back();
  };

  if (isLoading) {
    return (
      <PageLayout title="" showBackButton>
        <DebtDetailSkeleton />
      </PageLayout>
    );
  }

  if (!debt) {
    return (
      <PageLayout title="Not Found" showBackButton>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-400 text-center">
            Debt not found. It may have been deleted.
          </Text>
        </View>
      </PageLayout>
    );
  }

  const getDueDateSuffix = (day: number) => {
    if (day === 1 || day === 21 || day === 31) return 'st';
    if (day === 2 || day === 22) return 'nd';
    if (day === 3 || day === 23) return 'rd';
    return 'th';
  };

  return (
    <PageLayout
      title="Edit Debt"
      showBackButton
      rightAction={
        <SaveButton
          onPress={handleSave}
          disabled={!isValid}
          loading={updateDebt.isPending}
          label="Save"
        />
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-5">
          {/* Name */}
          <FormField
            label="Debt Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Visa Gold Card"
          />

          {/* Category */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-gray-400 ml-1">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const config = DEBT_CATEGORY_CONFIG[cat];
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className="rounded-full overflow-hidden"
                  >
                    <View
                      className={`px-4 py-2 rounded-full flex-row items-center ${
                        isSelected ? '' : 'bg-white/[0.03] border border-white/10'
                      }`}
                      style={isSelected ? { backgroundColor: config.color + '30' } : undefined}
                    >
                      {isSelected && (
                        <Check size={14} color={config.color} style={{ marginRight: 4 }} />
                      )}
                      <Text
                        className="text-sm"
                        style={{ color: isSelected ? config.color : '#9CA3AF' }}
                      >
                        {config.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Current Balance */}
          <FormField
            label={`Current Balance (${currency.symbol})`}
            value={balance}
            onChangeText={setBalance}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          {/* Interest Rate */}
          <FormField
            label="Interest Rate (APR %)"
            value={interestRate}
            onChangeText={setInterestRate}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          {/* Minimum Payment */}
          <FormField
            label={`Minimum Monthly Payment (${currency.symbol})`}
            value={minimumPayment}
            onChangeText={setMinimumPayment}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          {/* Due Date */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-gray-400 ml-1">Due Date (Day of Month)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {DUE_DATE_OPTIONS.map((day) => {
                const isSelected = dueDate === day;
                return (
                  <Pressable
                    key={day}
                    onPress={() => setDueDate(day)}
                    className="rounded-full overflow-hidden"
                  >
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500'
                          : 'bg-white/[0.03] border border-white/10'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {day}{getDueDateSuffix(day)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
}
