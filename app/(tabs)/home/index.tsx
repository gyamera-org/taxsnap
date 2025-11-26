import { View, Text, ScrollView } from 'react-native';
import { PageLayout, GlassCard, SectionHeader } from '@/components/layouts';
import { TrendingDown, Target, Calendar } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <PageLayout title="Home">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Welcome Section */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-3xl font-bold text-white">
            Welcome back
          </Text>
          <Text className="text-gray-400 mt-1">
            Track your journey to financial freedom
          </Text>
        </View>

        {/* Overview Card */}
        <GlassCard>
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
              <TrendingDown size={20} color="#10B981" />
            </View>
            <View>
              <Text className="text-gray-400 text-sm">Total Debt</Text>
              <Text className="text-white text-2xl font-bold">$0.00</Text>
            </View>
          </View>
          <View className="h-px bg-white/10 my-3" />
          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-400 text-xs">Monthly Payment</Text>
              <Text className="text-white font-semibold">$0.00</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-xs">Debt Free Date</Text>
              <Text className="text-white font-semibold">--</Text>
            </View>
          </View>
        </GlassCard>

        {/* Quick Stats */}
        <SectionHeader title="Quick Stats" />

        <View className="flex-row px-4">
          <View className="flex-1 mr-2">
            <GlassCard style={{ marginHorizontal: 0 }}>
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center mb-2">
                  <Target size={24} color="#3B82F6" />
                </View>
                <Text className="text-gray-400 text-xs">Active Debts</Text>
                <Text className="text-white text-xl font-bold">0</Text>
              </View>
            </GlassCard>
          </View>
          <View className="flex-1 ml-2">
            <GlassCard style={{ marginHorizontal: 0 }}>
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-purple-500/20 items-center justify-center mb-2">
                  <Calendar size={24} color="#A855F7" />
                </View>
                <Text className="text-gray-400 text-xs">Payments Due</Text>
                <Text className="text-white text-xl font-bold">0</Text>
              </View>
            </GlassCard>
          </View>
        </View>

        {/* Getting Started */}
        <SectionHeader title="Getting Started" />

        <GlassCard>
          <Text className="text-white font-semibold mb-2">
            Add your first debt
          </Text>
          <Text className="text-gray-400 text-sm">
            Start by adding your debts to track your progress towards financial freedom.
          </Text>
        </GlassCard>
      </ScrollView>
    </PageLayout>
  );
}
