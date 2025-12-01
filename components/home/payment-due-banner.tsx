import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ChevronRight, Check } from 'lucide-react-native';
import { Debt } from '@/lib/types/debt';
import { useRecordPayment } from '@/lib/hooks/use-debts';
import { useCurrency } from '@/context/currency-provider';
import * as Haptics from 'expo-haptics';

interface PaymentDueBannerProps {
  debts: Debt[];
}

export function PaymentDueBanner({ debts }: PaymentDueBannerProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const { mutate: recordPayment, isPending } = useRecordPayment();

  if (debts.length === 0) return null;

  const totalDue = debts.reduce((sum, d) => sum + d.minimum_payment, 0);

  const handleMarkPaid = (debt: Debt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordPayment({
      debt_id: debt.id,
      amount: debt.minimum_payment,
    });
  };

  const handleViewDebt = (debtId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/debt/${debtId}`);
  };

  // Single debt due
  if (debts.length === 1) {
    const debt = debts[0];
    return (
      <View className="mx-4 mb-4 rounded-2xl overflow-hidden">
        <LinearGradient
          colors={['#1a1f1a', '#141814']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 rounded-2xl border border-emerald-500/30" />

        <View className="p-4">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
              <Bell size={16} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-emerald-400 font-semibold text-sm">Payment Due Today</Text>
              <Text className="text-white font-bold">{debt.name}</Text>
            </View>
            <Text className="text-white font-bold text-lg">
              {formatCurrency(debt.minimum_payment)}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Pressable
              onPress={() => handleMarkPaid(debt)}
              disabled={isPending}
              className="flex-1 flex-row items-center justify-center py-3 rounded-xl bg-emerald-500"
            >
              <Check size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Mark Paid</Text>
            </Pressable>
            <Pressable
              onPress={() => handleViewDebt(debt.id)}
              className="flex-row items-center justify-center px-4 py-3 rounded-xl bg-white/10"
            >
              <Text className="text-gray-300 font-medium">View</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Multiple debts due
  return (
    <View className="mx-4 mb-4 rounded-2xl overflow-hidden">
      <LinearGradient
        colors={['#1a1f1a', '#141814']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute inset-0 rounded-2xl border border-emerald-500/30" />

      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
            <Bell size={16} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-emerald-400 font-semibold text-sm">
              {debts.length} Payments Due Today
            </Text>
            <Text className="text-gray-400 text-xs">Total: {formatCurrency(totalDue)}</Text>
          </View>
        </View>

        {debts.map((debt) => (
          <View
            key={debt.id}
            className="flex-row items-center py-3 border-t border-white/10"
          >
            <View className="flex-1">
              <Text className="text-white font-medium">{debt.name}</Text>
              <Text className="text-gray-500 text-xs">
                {formatCurrency(debt.minimum_payment)}
              </Text>
            </View>
            <Pressable
              onPress={() => handleMarkPaid(debt)}
              disabled={isPending}
              className="w-9 h-9 rounded-full bg-emerald-500/20 items-center justify-center mr-2"
            >
              <Check size={18} color="#10B981" />
            </Pressable>
            <Pressable
              onPress={() => handleViewDebt(debt.id)}
              className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
            >
              <ChevronRight size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
