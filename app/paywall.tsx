import { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Zap, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { toast } from 'sonner-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { DefaultLoader } from '@/components/ui/default-loader';

const features = [
  {
    icon: Crown,
    title: 'Smart Nutrition',
    description: 'AI meal scanning & tracking',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    icon: Zap,
    title: 'Cycle-Sync',
    description: 'Workouts adapted to your cycle',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  {
    icon: Heart,
    title: 'Cycle Tracking',
    description: 'Track periods & predictions',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description: 'Personalized health insights',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
];

export default function PaywallScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const { offerings, purchasePackage, restorePurchases, error, loading } = useRevenueCat();
  const params = useLocalSearchParams();

  // Get params for customization
  const source = (params.source as string) || 'manual';
  const feature = params.feature as string;
  const customTitle = params.title as string;
  const customSubtitle = params.subtitle as string;
  const dismissible = params.dismissible !== 'false'; // Default to true unless explicitly false
  const successRoute = (params.successRoute as string) || '/(tabs)/nutrition';

  const handlePurchase = async (planType: 'monthly' | 'yearly') => {
    if (!offerings?.current) {
      toast.error(error || 'No subscription plans available');
      return;
    }

    setIsLoading(true);
    try {
      const packageToPurchase = offerings.current.availablePackages.find((pkg) =>
        planType === 'yearly'
          ? pkg.identifier.includes('annual')
          : pkg.identifier.includes('monthly')
      );

      if (!packageToPurchase) {
        throw new Error(`${planType} plan not found`);
      }

      const result = await purchasePackage(packageToPurchase);

      if (result.success) {
        if (successRoute) {
          router.replace(successRoute as any);
        } else {
          router.back();
        }
      }
    } catch (error: any) {
      if (error.code !== 'PURCHASES_CANCELLED_BY_USER') {
        console.error('Purchase error:', error);
        toast.error('Purchase failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (dismissible) {
      router.back();
    }
  };

  const getDisplayTitle = () => {
    if (customTitle) return customTitle;

    switch (source) {
      case 'grace_period':
        return 'Your Free Trial is Ending';
      case 'feature_gate':
        return 'Unlock Premium Features';
      case 'onboarding':
        return 'Choose Your Plan';
      default:
        return 'Upgrade to Premium';
    }
  };

  const getDisplaySubtitle = () => {
    if (customSubtitle) return customSubtitle;

    switch (source) {
      case 'grace_period':
        return 'Continue your wellness journey with unlimited access to all features';
      case 'feature_gate':
        return feature
          ? `Unlock ${feature} and more with a premium subscription`
          : 'Unlock this feature and more with a premium subscription';
      case 'onboarding':
        return 'Get started with personalized health and wellness tracking';
      default:
        return 'Join thousands of women taking control of their health';
    }
  };

  const yearlyPackage = offerings?.current?.availablePackages.find((pkg) =>
    pkg.identifier.includes('annual')
  );
  const monthlyPackage = offerings?.current?.availablePackages.find((pkg) =>
    pkg.identifier.includes('monthly')
  );

  const yearlyPrice = yearlyPackage?.product.priceString || '$39.99';
  const monthlyPrice = monthlyPackage?.product.priceString || '$6.99';

  // Calculate yearly savings
  const yearlyMonthlyCost = yearlyPackage ? yearlyPackage.product.price / 12 : 7.49;
  const monthlyCost = monthlyPackage?.product.price || 12.99;
  const savings = Math.round(((monthlyCost - yearlyMonthlyCost) / monthlyCost) * 100);

  // Show loading state while RevenueCat initializes
  if (loading) {
    return <DefaultLoader />;
  }

  // Show error state if RevenueCat failed to load
  if (error || (!offerings?.current && !loading)) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-red-50 p-4 rounded-xl border border-red-200 mb-4">
              <Text className="text-red-800 font-semibold text-center mb-2">
                Unable to Load Subscription Plans
              </Text>
              <Text className="text-red-600 text-sm text-center leading-5">
                {error || 'Please check your internet connection and try again.'}
              </Text>
            </View>
            <Button
              title="Try Again"
              onPress={() => {
                router.back();
                // The provider will retry when the screen is reopened
              }}
              variant="primary"
              size="large"
              className="bg-pink-500 text-white"
            />
            {dismissible && (
              <TouchableOpacity onPress={handleClose} className="mt-4">
                <Text className="text-slate-500 text-center underline">Skip for now</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 pt-8">
          {/* Title Section */}
          <Animated.View className="px-6 py-6" entering={FadeIn.delay(200)}>
            <Text className="text-2xl font-bold text-slate-900 text-center mb-3">
              {getDisplayTitle()}
            </Text>
            <Text className="text-base text-slate-600 text-center leading-5">
              {getDisplaySubtitle()}
            </Text>
          </Animated.View>

          {/* Features List - Single Column */}
          <Animated.View className="px-6 mb-6" entering={FadeIn.delay(400)}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                className="flex-row items-center mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                entering={SlideInUp.delay(600 + index * 100)}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon size={20} color={feature.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-semibold text-base mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-slate-600 text-sm leading-5">{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Pricing Plans */}
          <Animated.View className="px-6 flex-1 justify-end pb-8" entering={FadeIn.delay(1000)}>
            {/* Yearly Plan */}
            <TouchableOpacity
              onPress={() => setSelectedPlan('yearly')}
              className={`p-3 rounded-xl mb-3 border ${
                selectedPlan === 'yearly'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-slate-900 font-bold text-base">Yearly</Text>
                    <View className="ml-2 px-2 py-0.5 bg-green-500 rounded-full">
                      <Text className="text-white text-xs font-bold">Save {savings}%</Text>
                    </View>
                  </View>
                  <Text className="text-slate-600 text-xs">
                    7 days free, then ${yearlyMonthlyCost.toFixed(2)}/month
                  </Text>
                </View>
                <Text className="text-slate-900 font-bold text-lg">{yearlyPrice}</Text>
              </View>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              onPress={() => setSelectedPlan('monthly')}
              className={`p-3 rounded-xl mb-4 border ${
                selectedPlan === 'monthly'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-base">Monthly</Text>
                  <Text className="text-slate-600 text-xs">3 days free, then billed monthly</Text>
                </View>
                <Text className="text-slate-900 font-bold text-lg">{monthlyPrice}</Text>
              </View>
            </TouchableOpacity>

            {/* Subscribe Button */}
            <Button
              title={
                isLoading
                  ? 'Processing...'
                  : `Start ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Plan`
              }
              onPress={() => handlePurchase(selectedPlan)}
              variant="primary"
              size="large"
              className="bg-pink-500 text-white"
              disabled={isLoading}
            />

            {isLoading && (
              <View className="flex-row items-center justify-center mt-3">
                <ActivityIndicator size="small" color="#FF69B4" />
                <Text className="text-slate-600 ml-2 text-sm">Processing your subscription...</Text>
              </View>
            )}

            {/* Restore Purchases & Terms */}
            <View className="mt-3">
              <TouchableOpacity
                onPress={async () => {
                  try {
                    setIsLoading(true);
                    const customerInfo = await restorePurchases();

                    if (
                      customerInfo.entitlements.active &&
                      Object.keys(customerInfo.entitlements.active).length > 0
                    ) {
                      if (successRoute) {
                        router.replace(successRoute as any);
                      } else {
                        router.back();
                      }
                    } else {
                      toast.info('No previous purchases found.');
                    }
                  } catch (error) {
                    console.error('Restore error:', error);
                    toast.error('Failed to restore purchases. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="mb-2"
                disabled={isLoading}
              >
                <Text className="text-slate-500 text-center text-xs underline">
                  Restore Purchases
                </Text>
              </TouchableOpacity>

              {/* Terms and Privacy Links */}
              <View className="flex-row justify-center items-center">
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://lunasync.app/terms')}
                  className="mr-4"
                >
                  <Text className="text-slate-500 text-xs underline">Terms</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://lunasync.app/privacy')}>
                  <Text className="text-slate-500 text-xs underline">Privacy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
