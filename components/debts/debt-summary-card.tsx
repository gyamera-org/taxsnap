import { View, Text } from 'react-native';
import { TrendingDown, Target, Wallet } from 'lucide-react-native';
import { GlassCard } from '@/components/layouts';
import { DebtSummary } from '@/lib/types/debt';
import { formatPercentage } from '@/lib/utils/debt-calculator';
import { useCurrency } from '@/context/currency-provider';

interface DebtSummaryCardProps {
  summary: DebtSummary;
}

export function DebtSummaryCard({ summary }: DebtSummaryCardProps) {
  const { formatCurrency } = useCurrency();
  const totalProgress = summary.total_original_balance > 0
    ? Math.round(((summary.total_original_balance - summary.total_balance) / summary.total_original_balance) * 100)
    : 0;

  return (
    <GlassCard>
      {/* Total Balance Header */}
      <View className="items-center mb-4">
        <Text className="text-gray-400 text-sm mb-1">Total Debt</Text>
        <Text className="text-white font-bold text-3xl">
          {formatCurrency(summary.total_balance)}
        </Text>
        <Text className="text-emerald-400 text-sm mt-1">
          {totalProgress}% paid off
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
        <View
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${totalProgress}%` }}
        />
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between">
        <View className="items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center mb-2">
            <Wallet size={20} color="#F59E0B" />
          </View>
          <Text className="text-gray-400 text-xs">Monthly Min</Text>
          <Text className="text-white font-semibold">
            {formatCurrency(summary.total_minimum_payment)}
          </Text>
        </View>

        <View className="items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-cyan-500/20 items-center justify-center mb-2">
            <Target size={20} color="#06B6D4" />
          </View>
          <Text className="text-gray-400 text-xs">Debts</Text>
          <Text className="text-white font-semibold">
            {summary.debt_count}
          </Text>
        </View>

        <View className="items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mb-2">
            <TrendingDown size={20} color="#EF4444" />
          </View>
          <Text className="text-gray-400 text-xs">Highest APR</Text>
          <Text className="text-white font-semibold">
            {summary.highest_rate_debt
              ? formatPercentage(summary.highest_rate_debt.interest_rate)
              : 'N/A'}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
