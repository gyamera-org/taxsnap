import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingDown } from 'lucide-react-native';
import { useCurrency } from '@/context/currency-provider';

interface OverviewCardProps {
  totalBalance: number;
  totalOriginal: number;
  monthlyPayment: number;
  debtFreeDate: string;
  isLoading?: boolean;
}

export function OverviewCard({
  totalBalance,
  totalOriginal,
  monthlyPayment,
  debtFreeDate,
  isLoading,
}: OverviewCardProps) {
  const { formatCurrency } = useCurrency();
  const progress = totalOriginal > 0
    ? Math.round(((totalOriginal - totalBalance) / totalOriginal) * 100)
    : 0;
  const hasDebts = totalBalance > 0;

  return (
    <View className="mx-4 my-2 rounded-3xl overflow-hidden">
      <LinearGradient
        colors={['#1a1a1f', '#141418']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute inset-0 rounded-3xl border border-white/[0.08]" />

      <View className="p-5">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-2xl bg-emerald-500/15 items-center justify-center mr-3">
              <TrendingDown size={22} color="#10B981" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs uppercase tracking-wider">Total Debt</Text>
              <Text className="text-white text-3xl font-bold -mt-0.5">
                {isLoading ? '...' : formatCurrency(totalBalance)}
              </Text>
            </View>
          </View>
          {hasDebts && (
            <View className="bg-emerald-500/15 px-3 py-2 rounded-xl">
              <Text className="text-emerald-400 font-bold text-lg">{progress}%</Text>
              <Text className="text-emerald-400/60 text-xs">paid</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {hasDebts && (
          <View className="mb-5">
            <View className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: `${progress}%`, borderRadius: 999 }}
              />
            </View>
          </View>
        )}

        {/* Stats */}
        <View className="flex-row bg-white/[0.03] rounded-2xl p-4">
          <View className="flex-1 border-r border-white/[0.06] pr-4">
            <Text className="text-gray-600 text-xs uppercase tracking-wider mb-1">Monthly</Text>
            <Text className="text-white font-bold text-lg">
              {isLoading ? '...' : formatCurrency(monthlyPayment)}
            </Text>
          </View>
          <View className="flex-1 pl-4">
            <Text className="text-gray-600 text-xs uppercase tracking-wider mb-1">Debt Free</Text>
            <Text className="text-white font-bold text-lg">
              {isLoading ? '...' : debtFreeDate}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
