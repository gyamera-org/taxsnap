import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Trophy, TrendingUp, PiggyBank } from 'lucide-react-native';
import { useCurrency } from '@/context/currency-provider';

interface QuickStatsProps {
  activeCount: number;
  paidOffCount: number;
  totalPaid: number;
  interestSaved: number;
  isLoading?: boolean;
}

export function QuickStats({
  activeCount,
  paidOffCount,
  totalPaid,
  interestSaved,
  isLoading,
}: QuickStatsProps) {
  const { formatCurrency } = useCurrency();
  const stats = [
    { icon: Target, color: '#3B82F6', label: 'Active', value: String(activeCount) },
    { icon: Trophy, color: '#A855F7', label: 'Paid Off', value: String(paidOffCount) },
    { icon: TrendingUp, color: '#10B981', label: 'Paid', value: formatCurrency(totalPaid) },
    { icon: PiggyBank, color: '#F59E0B', label: 'Saved', value: formatCurrency(interestSaved) },
  ];

  return (
    <View className="flex-row flex-wrap mx-3 mt-1">
      {stats.map((stat) => (
        <View key={stat.label} className="w-1/2 p-1">
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={['#1a1a1f', '#141418']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View className="absolute inset-0 rounded-2xl border border-white/[0.08]" />

            <View className="p-4 flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon size={18} color={stat.color} />
              </View>
              <View>
                <Text className="text-gray-600 text-xs uppercase tracking-wider">{stat.label}</Text>
                <Text className="text-white font-bold text-base">
                  {isLoading ? '...' : stat.value}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
