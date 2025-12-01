import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Debt } from '@/lib/types/debt';
import {
  calculatePayoffMonths,
  calculateTotalInterest,
} from '@/lib/utils/debt-calculator';
import { useCurrency } from '@/context/currency-provider';

interface PaymentChartProps {
  debt: Debt;
}

interface PaymentMonth {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}

function calculatePaymentSchedule(debt: Debt, maxMonths: number = 12): PaymentMonth[] {
  const schedule: PaymentMonth[] = [];
  let balance = debt.current_balance;
  const monthlyRate = debt.interest_rate / 12;
  const payment = debt.minimum_payment;

  for (let month = 1; month <= maxMonths && balance > 0; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(payment - interestPayment, balance);
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      month,
      principal: principalPayment,
      interest: interestPayment,
      balance,
    });
  }

  return schedule;
}

type DurationOption = 6 | 12 | 24 | 'all';

export function PaymentChart({ debt }: PaymentChartProps) {
  const { formatCurrency } = useCurrency();
  const [duration, setDuration] = useState<DurationOption>(12);

  const totalMonths = calculatePayoffMonths(
    debt.current_balance,
    debt.interest_rate,
    debt.minimum_payment
  );

  const totalInterest = calculateTotalInterest(
    debt.current_balance,
    debt.interest_rate,
    debt.minimum_payment
  );

  // Calculate display months based on selection
  const getDisplayMonths = () => {
    if (duration === 'all') {
      return isFinite(totalMonths) ? Math.min(totalMonths, 60) : 12;
    }
    return Math.min(duration, isFinite(totalMonths) ? totalMonths : duration);
  };

  const displayMonths = getDisplayMonths();
  const schedule = calculatePaymentSchedule(debt, displayMonths);

  // Find max values for scaling
  const maxPrincipal = Math.max(...schedule.map(s => s.principal));
  const maxInterest = Math.max(...schedule.map(s => s.interest));
  const maxValue = Math.max(maxPrincipal, maxInterest);

  // Calculate totals for the displayed period
  const totalPrincipalInPeriod = schedule.reduce((sum, m) => sum + m.principal, 0);
  const totalInterestInPeriod = schedule.reduce((sum, m) => sum + m.interest, 0);

  const durationOptions: { value: DurationOption; label: string }[] = [
    { value: 6, label: '6m' },
    { value: 12, label: '1y' },
    { value: 24, label: '2y' },
    { value: 'all', label: 'All' },
  ];

  // Determine how many bars to show based on screen space
  const barsToShow = Math.min(schedule.length, duration === 6 ? 6 : 12);
  const step = Math.max(1, Math.floor(schedule.length / barsToShow));
  const displaySchedule = schedule.filter((_, i) => i % step === 0).slice(0, barsToShow);

  return (
    <View className="mx-4 my-2 rounded-2xl overflow-hidden">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      </BlurView>
      <View className="absolute inset-0 rounded-2xl border border-white/10" />

      <View className="p-5">
        {/* Header with duration selector */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white font-semibold text-base">Payment Breakdown</Text>
          <View className="flex-row bg-white/5 rounded-full p-0.5">
            {durationOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setDuration(option.value)}
                className={`px-3 py-1 rounded-full ${
                  duration === option.value ? 'bg-emerald-500' : ''
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    duration === option.value ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Chart - Side by side bars */}
        <View className="flex-row items-end justify-between mb-2" style={{ height: 128 }}>
          {displaySchedule.map((month, index) => {
            const chartHeight = 128;
            const principalHeight = maxValue > 0 ? (month.principal / maxValue) * chartHeight : 0;
            const interestHeight = maxValue > 0 ? (month.interest / maxValue) * chartHeight : 0;

            return (
              <View key={index} className="flex-1 mx-0.5 flex-row items-end justify-center">
                {/* Principal bar */}
                <View
                  className="rounded-t-sm mr-px"
                  style={{
                    width: '45%',
                    height: Math.max(principalHeight, principalHeight > 0 ? 2 : 0),
                    backgroundColor: '#10B981',
                  }}
                />
                {/* Interest bar */}
                <View
                  className="rounded-t-sm"
                  style={{
                    width: '45%',
                    height: Math.max(interestHeight, interestHeight > 0 ? 2 : 0),
                    backgroundColor: '#EF4444',
                  }}
                />
              </View>
            );
          })}
        </View>

        {/* X-axis labels */}
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-500 text-xs">Month 1</Text>
          <Text className="text-gray-500 text-xs">Month {displayMonths}</Text>
        </View>

        {/* Legend */}
        <View className="flex-row justify-center gap-6 mb-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm bg-emerald-500 mr-2" />
            <Text className="text-gray-400 text-xs">Principal</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm bg-red-500 mr-2" />
            <Text className="text-gray-400 text-xs">Interest</Text>
          </View>
        </View>

        {/* Summary stats */}
        <View className="pt-4 border-t border-white/10">
          <View className="flex-row justify-between mb-3">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">Principal ({displayMonths}mo)</Text>
              <Text className="text-emerald-400 font-bold text-lg">
                {formatCurrency(totalPrincipalInPeriod)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-gray-500 text-xs mb-1">Interest ({displayMonths}mo)</Text>
              <Text className="text-red-400 font-bold text-lg">
                {formatCurrency(totalInterestInPeriod)}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-gray-500 text-xs mb-1">Total ({displayMonths}mo)</Text>
              <Text className="text-white font-bold text-lg">
                {formatCurrency(totalPrincipalInPeriod + totalInterestInPeriod)}
              </Text>
            </View>
          </View>

          {/* Total lifetime cost */}
          <View className="bg-white/5 rounded-xl p-3 flex-row justify-between items-center">
            <Text className="text-gray-400 text-sm">Total cost to payoff</Text>
            <View className="items-end">
              <Text className="text-white font-bold text-lg">
                {formatCurrency(debt.current_balance + totalInterest)}
              </Text>
              <Text className="text-red-400 text-xs">
                {formatCurrency(totalInterest)} in interest
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

interface AmortizationProgressProps {
  debt: Debt;
}

export function AmortizationProgress({ debt }: AmortizationProgressProps) {
  const { formatCurrency } = useCurrency();
  const totalMonths = calculatePayoffMonths(
    debt.current_balance,
    debt.interest_rate,
    debt.minimum_payment
  );

  const totalPaidOff = debt.original_balance - debt.current_balance;
  const percentPaid = debt.original_balance > 0
    ? (totalPaidOff / debt.original_balance) * 100
    : 0;

  return (
    <View className="mx-4 my-2 rounded-2xl overflow-hidden">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      </BlurView>
      <View className="absolute inset-0 rounded-2xl border border-white/10" />

      <View className="p-5">
        <Text className="text-white font-semibold text-base mb-4">Payoff Progress</Text>

        <View className="mb-4">
          <View className="h-2 bg-white/10 rounded-full overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(percentPaid, 100)}%` }}
            />
          </View>

          <View className="flex-row justify-between mt-2">
            <View className="items-start">
              <Text className="text-emerald-400 font-bold text-lg">{percentPaid.toFixed(1)}%</Text>
              <Text className="text-gray-500 text-xs">Completed</Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-400 font-bold text-lg">{(100 - percentPaid).toFixed(1)}%</Text>
              <Text className="text-gray-500 text-xs">Remaining</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between pt-4 border-t border-white/10">
          <View>
            <Text className="text-gray-500 text-xs">Paid Off</Text>
            <Text className="text-emerald-400 font-semibold">{formatCurrency(totalPaidOff)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Remaining</Text>
            <Text className="text-white font-semibold">{formatCurrency(debt.current_balance)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 text-xs">Months Left</Text>
            <Text className="text-gray-400 font-semibold">
              {isFinite(totalMonths) ? totalMonths : '∞'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
