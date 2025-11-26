import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock } from 'lucide-react-native';
import { Debt } from '@/lib/types/debt';
import { formatCurrency } from '@/lib/utils/debt-calculator';

interface UpcomingPaymentsProps {
  debts: Debt[];
}

export function UpcomingPayments({ debts }: UpcomingPaymentsProps) {
  const router = useRouter();
  const today = new Date();
  const currentDay = today.getDate();

  const getDaysUntilDue = (dueDate: number) => {
    if (dueDate >= currentDay) return dueDate - currentDay;
    return (30 - currentDay) + dueDate;
  };

  const upcomingPayments = debts
    .filter(d => d.status === 'active')
    .map(d => ({ ...d, daysUntil: getDaysUntilDue(d.due_date) }))
    .filter(d => d.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

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
          const dueText = debt.daysUntil === 0 ? 'Today' :
                          debt.daysUntil === 1 ? 'Tomorrow' :
                          `${debt.daysUntil} days`;

          return (
            <Pressable key={debt.id} onPress={() => router.push(`/debt/${debt.id}`)}>
              <View className={`flex-row items-center justify-between py-3 ${index < upcomingPayments.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
                <View className="flex-row items-center flex-1">
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
                </View>
                <Text className="text-white font-bold">{formatCurrency(debt.minimum_payment)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
