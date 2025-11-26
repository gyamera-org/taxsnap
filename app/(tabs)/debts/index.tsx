import { View, Text, ScrollView, Pressable } from 'react-native';
import { PageLayout, GlassCard, SectionHeader } from '@/components/layouts';
import { Plus, CreditCard, Wallet, Building2 } from 'lucide-react-native';

export default function DebtsScreen() {
  return (
    <PageLayout title="Debts">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Actions */}
        <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-white">
              Your Debts
            </Text>
            <Text className="text-gray-400 mt-1">
              Manage and track all your debts
            </Text>
          </View>
          <Pressable className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
            <Plus size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Debt Categories */}
        <SectionHeader title="Categories" />

        <View className="flex-row px-4 flex-wrap">
          <View className="w-1/3 p-1">
            <GlassCard style={{ marginHorizontal: 0, marginVertical: 4 }}>
              <View className="items-center py-2">
                <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mb-2">
                  <CreditCard size={20} color="#EF4444" />
                </View>
                <Text className="text-gray-400 text-xs">Credit Cards</Text>
                <Text className="text-white font-bold">$0</Text>
              </View>
            </GlassCard>
          </View>
          <View className="w-1/3 p-1">
            <GlassCard style={{ marginHorizontal: 0, marginVertical: 4 }}>
              <View className="items-center py-2">
                <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center mb-2">
                  <Wallet size={20} color="#F59E0B" />
                </View>
                <Text className="text-gray-400 text-xs">Loans</Text>
                <Text className="text-white font-bold">$0</Text>
              </View>
            </GlassCard>
          </View>
          <View className="w-1/3 p-1">
            <GlassCard style={{ marginHorizontal: 0, marginVertical: 4 }}>
              <View className="items-center py-2">
                <View className="w-10 h-10 rounded-full bg-cyan-500/20 items-center justify-center mb-2">
                  <Building2 size={20} color="#06B6D4" />
                </View>
                <Text className="text-gray-400 text-xs">Mortgage</Text>
                <Text className="text-white font-bold">$0</Text>
              </View>
            </GlassCard>
          </View>
        </View>

        {/* Debt List */}
        <SectionHeader title="All Debts" />

        {/* Empty State */}
        <GlassCard>
          <View className="items-center py-8">
            <View className="w-16 h-16 rounded-full bg-gray-500/20 items-center justify-center mb-4">
              <CreditCard size={32} color="#6B7280" />
            </View>
            <Text className="text-white font-semibold text-lg mb-2">
              No debts yet
            </Text>
            <Text className="text-gray-400 text-sm text-center px-4">
              Add your first debt to start tracking your journey to financial freedom.
            </Text>
            <Pressable className="mt-4 bg-white/10 px-6 py-3 rounded-full flex-row items-center">
              <Plus size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Add Debt</Text>
            </Pressable>
          </View>
        </GlassCard>
      </ScrollView>
    </PageLayout>
  );
}
