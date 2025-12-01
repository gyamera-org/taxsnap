import { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, ChevronRight, Target, Check } from 'lucide-react-native';
import { PageLayout, SectionHeader } from '@/components/layouts';
import { GlassBottomSheet, GlassBottomSheetRef } from '@/components/ui/glass-bottom-sheet';
import {
  OverviewCard,
  PriorityDebtCard,
  UpcomingPayments,
  QuickStats,
} from '@/components/home';
import { useDebts, useDebtSummary, useTodaysPaidDebtIds } from '@/lib/hooks/use-debts';
import {
  formatDate,
  calculatePayoffMonths,
  calculatePayoffDate,
} from '@/lib/utils/debt-calculator';

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const bottomSheetRef = useRef<GlassBottomSheetRef>(null);

  const { data: debts, isLoading: debtsLoading } = useDebts();
  const { data: summary, isLoading: summaryLoading } = useDebtSummary();
  const { data: paidTodayIds } = useTodaysPaidDebtIds();

  const isLoading = debtsLoading || summaryLoading;

  const activeDebts = debts?.filter(d => d.status === 'active') || [];
  const paidOffDebts = debts?.filter(d => d.status === 'paid_off') || [];

  // Calculate stats
  const totalOriginal = summary?.total_original_balance || 0;
  const totalBalance = summary?.total_balance || 0;
  const totalPaid = totalOriginal - totalBalance;

  // Average interest rate for payoff calculation
  const avgRate = activeDebts.length > 0
    ? activeDebts.reduce((sum, d) => sum + d.interest_rate, 0) / activeDebts.length
    : 0;

  // Calculate interest saved by paying extra
  const interestSaved = activeDebts.reduce((saved, debt) => {
    const paidPrincipal = debt.original_balance - debt.current_balance;
    if (paidPrincipal <= 0) return saved;
    // Estimate interest avoided by paying down principal faster
    const monthsAhead = paidPrincipal / debt.minimum_payment;
    const avgMonthlyInterest = (debt.interest_rate / 12) * debt.original_balance;
    return saved + Math.max(0, monthsAhead * avgMonthlyInterest * 0.5);
  }, 0);

  // Payoff date estimate
  const totalMonths = totalBalance && summary?.total_minimum_payment
    ? calculatePayoffMonths(totalBalance, avgRate || 0.15, summary.total_minimum_payment)
    : 0;
  const payoffDate = calculatePayoffDate(totalMonths);
  const debtFreeDate = payoffDate ? formatDate(payoffDate) : '--';

  const hasDebts = activeDebts.length > 0;

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    bottomSheetRef.current?.close();
  };

  // Year selector button
  const yearSelector = (
    <Pressable
      onPress={() => bottomSheetRef.current?.expand()}
      className="flex-row items-center px-3 py-2 rounded-xl overflow-hidden"
    >
      <LinearGradient
        colors={['#1a1a1f', '#141418']}
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute inset-0 rounded-xl border border-white/[0.08]" />
      <Text className="text-white font-semibold mr-1">{selectedYear}</Text>
      <ChevronDown size={16} color="#6B7280" />
    </Pressable>
  );

  // View all action for section header
  const viewAllAction = (
    <Pressable
      onPress={() => router.push('/(tabs)/debts')}
      className="flex-row items-center"
    >
      <Text className="text-emerald-400 text-sm font-medium mr-0.5">View All</Text>
      <ChevronRight size={14} color="#10B981" />
    </Pressable>
  );

  return (
    <PageLayout title="Overview" rightAction={yearSelector}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Overview */}
        <OverviewCard
          totalBalance={totalBalance}
          totalOriginal={totalOriginal}
          monthlyPayment={summary?.total_minimum_payment || 0}
          debtFreeDate={debtFreeDate}
          isLoading={isLoading}
        />

        {/* Stats Grid */}
        <QuickStats
          activeCount={activeDebts.length}
          paidOffCount={paidOffDebts.length}
          totalPaid={totalPaid}
          interestSaved={interestSaved}
          isLoading={isLoading}
        />

        {/* Priority */}
        {summary?.highest_rate_debt && (
          <>
            <SectionHeader title="Priority" />
            <PriorityDebtCard debt={summary.highest_rate_debt} />
          </>
        )}

        {/* Upcoming */}
        {hasDebts && (
          <>
            <SectionHeader title="Upcoming" action={viewAllAction} />
            <UpcomingPayments debts={activeDebts} paidDebtIds={paidTodayIds} />
          </>
        )}

        {/* Empty State */}
        {!isLoading && !hasDebts && (
          <Pressable onPress={() => router.push('/debt/add')} className="mx-4 mt-6">
            <View className="rounded-2xl overflow-hidden">
              <LinearGradient
                colors={['#1a1a1f', '#141418']}
                style={StyleSheet.absoluteFill}
              />
              <View className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
              <View className="p-5 flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-emerald-500/15 items-center justify-center mr-4">
                  <Target size={24} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">
                    {paidOffDebts.length > 0 ? 'Add another debt' : 'Add your first debt'}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {paidOffDebts.length > 0 ? 'Keep the momentum going!' : 'Start your debt-free journey'}
                  </Text>
                </View>
                <ChevronRight size={20} color="#4B5563" />
              </View>
            </View>
          </Pressable>
        )}
      </ScrollView>

      {/* Year Picker Bottom Sheet */}
      <GlassBottomSheet ref={bottomSheetRef} snapPoints={['30%']}>
        <View className="px-5 pt-2">
          <Text className="text-white text-lg font-semibold mb-4">Select Year</Text>
          {yearOptions.map((year) => (
            <Pressable
              key={year}
              onPress={() => handleYearSelect(year)}
              className="flex-row items-center justify-between py-4 border-b border-white/[0.06]"
            >
              <Text className={`text-lg ${selectedYear === year ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                {year}
              </Text>
              {selectedYear === year && (
                <Check size={20} color="#10B981" />
              )}
            </Pressable>
          ))}
        </View>
      </GlassBottomSheet>
    </PageLayout>
  );
}
