import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Unlock,
  TrendingUp,
  Calendar,
  PiggyBank,
  Check,
} from 'lucide-react-native';

const MONTHLY_PRICE = 6.99;
const YEARLY_PRICE = 49.99;
const TRIAL_DAYS = 7;

type PlanType = 'monthly' | 'yearly';

const features = [
  {
    icon: TrendingUp,
    title: 'Debt Avalanche Scheduler',
    description: 'Optimized payment strategy to save thousands',
  },
  {
    icon: Calendar,
    title: 'Custom Payoff Timeline',
    description: 'See your exact debt-free date',
  },
  {
    icon: PiggyBank,
    title: 'Scenario Planner',
    description: 'What-if analysis for extra payments',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  const currentPrice = selectedPlan === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE;
  const savingsPercent = Math.round((1 - (YEARLY_PRICE / 12) / MONTHLY_PRICE) * 100);

  const handleStartTrial = async () => {
    setIsLoading(true);
    // TODO: Implement RevenueCat purchase with selectedPlan
    // For now, simulate and navigate to app
    setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 500);
  };

  return (
    <View className="flex-1 bg-[#0F0F0F]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-4">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-3xl bg-emerald-500/20 items-center justify-center mb-4">
                <Unlock size={40} color="#10B981" />
              </View>
              <Text className="text-white text-2xl font-bold text-center mb-2">
                Unlock Your Savings
              </Text>
              <Text className="text-gray-400 text-center">
                You're about to save thousands
              </Text>
            </View>

            {/* Features */}
            <View className="rounded-2xl overflow-hidden mb-6">
              <LinearGradient
                colors={['#1a1a1f', '#141418']}
                style={StyleSheet.absoluteFill}
              />
              <View className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
              <View className="p-5">
                {features.map((feature, index) => (
                  <View
                    key={feature.title}
                    className={`flex-row items-center ${
                      index < features.length - 1
                        ? 'pb-4 mb-4 border-b border-white/10'
                        : ''
                    }`}
                  >
                    <View className="w-12 h-12 rounded-xl bg-emerald-500/15 items-center justify-center mr-4">
                      <feature.icon size={24} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base">
                        {feature.title}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {feature.description}
                      </Text>
                    </View>
                    <Check size={20} color="#10B981" />
                  </View>
                ))}
              </View>
            </View>

            {/* Plan Selection - Row Layout */}
            <View className="flex-row mb-6">
              {/* Yearly Plan */}
              <Pressable
                onPress={() => setSelectedPlan('yearly')}
                className="flex-1 mr-2"
              >
                <View className="rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={selectedPlan === 'yearly' ? ['#0f1f1a', '#0a1512'] : ['#1a1a1f', '#141418']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View className={`absolute inset-0 rounded-2xl border-2 ${
                    selectedPlan === 'yearly' ? 'border-emerald-500' : 'border-white/10'
                  }`} />
                  {/* Save Badge */}
                  <View className="absolute top-0 right-0 bg-emerald-500 px-2 py-1 rounded-bl-xl rounded-tr-xl">
                    <Text className="text-white text-xs font-bold">-{savingsPercent}%</Text>
                  </View>
                  <View className="p-4 items-center">
                    <View className={`w-5 h-5 rounded-full border-2 mb-3 items-center justify-center ${
                      selectedPlan === 'yearly' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-500'
                    }`}>
                      {selectedPlan === 'yearly' && <Check size={12} color="#fff" />}
                    </View>
                    <Text className="text-white font-bold text-lg mb-1">Yearly</Text>
                    <Text className="text-white font-bold text-2xl">${YEARLY_PRICE}</Text>
                    <Text className="text-gray-500 text-sm">${(YEARLY_PRICE / 12).toFixed(2)}/mo</Text>
                  </View>
                </View>
              </Pressable>

              {/* Monthly Plan */}
              <Pressable
                onPress={() => setSelectedPlan('monthly')}
                className="flex-1 ml-2"
              >
                <View className="rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={selectedPlan === 'monthly' ? ['#0f1f1a', '#0a1512'] : ['#1a1a1f', '#141418']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View className={`absolute inset-0 rounded-2xl border-2 ${
                    selectedPlan === 'monthly' ? 'border-emerald-500' : 'border-white/10'
                  }`} />
                  <View className="p-4 items-center">
                    <View className={`w-5 h-5 rounded-full border-2 mb-3 items-center justify-center ${
                      selectedPlan === 'monthly' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-500'
                    }`}>
                      {selectedPlan === 'monthly' && <Check size={12} color="#fff" />}
                    </View>
                    <Text className="text-white font-bold text-lg mb-1">Monthly</Text>
                    <Text className="text-white font-bold text-2xl">${MONTHLY_PRICE}</Text>
                    <Text className="text-gray-500 text-sm">/month</Text>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* Trial Info - Only for Yearly */}
            {selectedPlan === 'yearly' && (
              <View className="bg-white/5 rounded-xl p-4 mb-6">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-lg bg-amber-500/20 items-center justify-center mr-3">
                    <Text className="text-amber-400 font-bold">7</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium">
                      {TRIAL_DAYS}-Day Free Trial
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Cancel anytime, no charge
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* CTA Button */}
            <Pressable
              onPress={handleStartTrial}
              disabled={isLoading}
              className={`rounded-2xl overflow-hidden mb-6 ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="py-4 px-6 items-center">
                <Text className="text-white font-bold text-lg">
                  {isLoading
                    ? 'Processing...'
                    : selectedPlan === 'yearly'
                      ? 'Start 7-Day Free Trial'
                      : 'Subscribe Now'}
                </Text>
                {selectedPlan === 'yearly' ? (
                  <Text className="text-emerald-200 text-sm mt-1">
                    Then ${currentPrice}/year
                  </Text>
                ) : (
                  <Text className="text-emerald-200 text-sm mt-1">
                    ${currentPrice}/month
                  </Text>
                )}
              </View>
            </Pressable>

            {/* Secondary Actions */}
            <View className="items-center pb-4">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() =>
                    Linking.openURL('https://debt-free.app/terms')
                  }
                >
                  <Text className="text-gray-600 text-xs underline">Terms</Text>
                </Pressable>
                <Text className="text-gray-600 mx-2">|</Text>
                <Pressable
                  onPress={() =>
                    Linking.openURL('https://debt-free.app/privacy')
                  }
                >
                  <Text className="text-gray-600 text-xs underline">
                    Privacy
                  </Text>
                </Pressable>
                <Text className="text-gray-600 mx-2">|</Text>
                <Pressable onPress={() => {}}>
                  <Text className="text-gray-600 text-xs underline">
                    Restore Purchases
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
