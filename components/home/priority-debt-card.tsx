import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, ChevronRight } from 'lucide-react-native';
import { Debt, DEBT_CATEGORY_CONFIG } from '@/lib/types/debt';
import { formatPercentage } from '@/lib/utils/debt-calculator';
import { useCurrency } from '@/context/currency-provider';

interface PriorityDebtCardProps {
  debt: Debt;
}

export function PriorityDebtCard({ debt }: PriorityDebtCardProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const categoryConfig = DEBT_CATEGORY_CONFIG[debt.category];

  return (
    <Pressable onPress={() => router.push(`/debt/${debt.id}`)}>
      <View className="mx-4 my-2 rounded-2xl overflow-hidden">
        <LinearGradient
          colors={['#1f1418', '#1a1215']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 rounded-2xl border border-red-500/20" />

        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-xl bg-red-500/15 items-center justify-center mr-3">
                <Flame size={18} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold" numberOfLines={1}>
                  {debt.name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-red-400 text-xs font-bold mr-2">
                    {formatPercentage(debt.interest_rate)} APR
                  </Text>
                  <Text style={{ color: categoryConfig.color }} className="text-xs">
                    {categoryConfig.label}
                  </Text>
                </View>
              </View>
            </View>
            <View className="items-end ml-3">
              <Text className="text-white font-bold">
                {formatCurrency(debt.current_balance)}
              </Text>
              <Text className="text-gray-600 text-xs">
                {formatCurrency(debt.minimum_payment)}/mo
              </Text>
            </View>
            <ChevronRight size={18} color="#4B5563" style={{ marginLeft: 8 }} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
