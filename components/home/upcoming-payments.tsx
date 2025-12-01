import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Debt } from '@/lib/types/debt';
import { useRecordPayment } from '@/lib/hooks/use-debts';
import { useCurrency } from '@/context/currency-provider';

interface UpcomingPaymentsProps {
  debts: Debt[];
  paidDebtIds?: Set<string>;
}

export function UpcomingPayments({ debts, paidDebtIds = new Set() }: UpcomingPaymentsProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const { mutate: recordPayment, isPending } = useRecordPayment();
  const today = new Date();
  const currentDay = today.getDate();

  const getDaysUntilDue = (dueDate: number) => {
    if (dueDate >= currentDay) return dueDate - currentDay;
    return (30 - currentDay) + dueDate;
  };

  const handleMarkPaid = (debt: Debt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordPayment({
      debt_id: debt.id,
      amount: debt.minimum_payment,
    });
  };

  const upcomingPayments = debts
    .filter(d => d.status === 'active' && !paidDebtIds.has(d.id))
    .map(d => ({ ...d, daysUntil: getDaysUntilDue(d.due_date) }))
    .filter(d => d.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  if (upcomingPayments.length === 0) return null;

  return (
    <View className="mx-4 my-2 rounded-2xl overflow-hidden">
      <LinearGradient
        colors={['#1a1a1f', '#141418']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute inset-0 rounded-2xl border border-white/[0.08]" />

      <View className="p-4">
        {upcomingPayments.map((debt, index) => {
          const isUrgent = debt.daysUntil <= 2;
          const isDueToday = debt.daysUntil === 0;
          const dueText = isDueToday ? 'Due Today' :
                          debt.daysUntil === 1 ? 'Tomorrow' :
                          `In ${debt.daysUntil} days`;

          return (
            <View
              key={debt.id}
              className={`py-3 ${index < upcomingPayments.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
            >
              <Pressable
                onPress={() => router.push(`/debt/${debt.id}`)}
                className="flex-row items-center"
              >
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}
                >
                  <Clock size={14} color={isUrgent ? '#EF4444' : '#F59E0B'} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium" numberOfLines={1}>{debt.name}</Text>
                  <Text className={`text-xs ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
                    {dueText}
                  </Text>
                </View>
                <Text className="text-white font-bold mr-3">{formatCurrency(debt.minimum_payment)}</Text>
              </Pressable>

              {/* Mark Paid Button - show for debts due within 2 days */}
              {isUrgent && (
                <Pressable
                  onPress={() => handleMarkPaid(debt)}
                  disabled={isPending}
                  className="flex-row items-center justify-center mt-3 py-2.5 rounded-xl bg-emerald-500/15"
                >
                  <Check size={16} color="#10B981" />
                  <Text className="text-emerald-400 font-semibold ml-2 text-sm">Mark as Paid</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
