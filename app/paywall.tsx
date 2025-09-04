import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Dumbbell, Apple } from 'lucide-react-native';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { toast } from 'sonner-native';
import { DefaultLoader } from '@/components/ui/default-loader';

const features = [
  {
    icon: Apple,
    title: 'Smart Nutrition',
    description: 'AI powered meal scanning & nutrition tracking',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    icon: Dumbbell,
    title: 'Workouts For You',
    description: 'Tailored to your cycle, goals & lifestyle',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  {
    icon: Heart,
    title: 'Cycle Insights',
    description: 'Accurate period tracking & predictions',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  {
    icon: Sparkles,
    title: 'Track How You Feel',
    description: 'Understand your body, mind & patterns',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
];

export default function PaywallScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const { 
    offerings, 
    purchasePackage, 
    restorePurchases, 
    error, 
    loading,
    isSubscribed,
    isInGracePeriod,
    shouldShowPaywall
  } = useRevenueCat();
  // Auto-redirect if user is already subscribed or in grace period
  useEffect(() => {
    if (!loading && !shouldShowPaywall) {
      if (isSubscribed || isInGracePeriod) {
        // Add a small delay to ensure subscription status is properly synced
        setTimeout(() => {
          router.replace('/(tabs)/nutrition');
        }, 100);
      }
    }
  }, [loading, shouldShowPaywall, isSubscribed, isInGracePeriod]);

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
        // Add a small delay to ensure subscription status is updated
        setTimeout(() => {
          router.replace('/(tabs)/nutrition');
        }, 500);
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

  const handleRetry = () => {
    // Go back and come back to trigger re-initialization
    router.back();
    setTimeout(() => {
      router.push('/paywall');
    }, 100);
  };

  const handleRestorePurchases = async () => {
    try {
      setIsLoading(true);
      
      // Use RevenueCat provider's restore function - it handles everything properly
      const customerInfo = await restorePurchases();

      if (
        customerInfo.entitlements.active &&
        Object.keys(customerInfo.entitlements.active).length > 0
      ) {
        toast.success('Purchases restored! Redirecting...');
        
        // The RevenueCat provider already refreshed the subscription status
        // The useEffect hook will handle the redirect when subscriptionStatus updates
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } else {
        toast.info('No previous purchases found.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases. Please try again.');
      setIsLoading(false);
    }
  };

  const yearlyPackage = offerings?.current?.availablePackages.find((pkg) =>
    pkg.identifier.includes('annual')
  );
  const monthlyPackage = offerings?.current?.availablePackages.find((pkg) =>
    pkg.identifier.includes('monthly')
  );

  const monthlyPrice = monthlyPackage?.product.priceString || '$6.99';

  // Calculate yearly savings
  const yearlyMonthlyCost = yearlyPackage ? yearlyPackage.product.price / 12 : 7.49;
  const monthlyCost = monthlyPackage?.product.price || 12.99;
  const savings = Math.round(((monthlyCost - yearlyMonthlyCost) / monthlyCost) * 100);

  // Show loading state - since data is preloaded during app initialization,
  // this should be much faster than before
  if (loading || !offerings) {
    return <DefaultLoader />;
  }

  // Show error state if RevenueCat failed to load (only after we've had a chance to load)
  if (error || !offerings?.current) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-red-50 p-4 rounded-xl border border-red-200 mb-4">
              <Text className="text-red-800 font-semibold text-center mb-2">
                Unable to Load Subscription Plans
              </Text>
              <Text className="text-red-600 text-sm text-center leading-5">
                {error
                  ? `Error: ${error}`
                  : 'Unable to connect to subscription service. Please check your internet connection and try again.'}
              </Text>
            </View>
            <Button
              title="Try Again"
              onPress={handleRetry}
              variant="primary"
              size="large"
              className="bg-pink-500 text-white"
            />
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
          <View className="px-6 py-8 mb-8">
            <Text className="text-2xl font-bold text-slate-900 text-center mb-4">
              Upgrade to Premium
            </Text>
            <Text className="text-base text-slate-600 text-center leading-6">
              Join thousands of women taking control of their health
            </Text>
          </View>

          {/* Features List - Grid Layout */}
          <View className="px-6 mb-10">
            <View className="flex-row flex-wrap justify-between">
              {features.map((feature) => (
                <View
                  key={feature.title}
                  className="w-[48%] p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-3"
                >
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <feature.icon size={24} color={feature.color} />
                  </View>
                  <Text className="text-slate-900 font-bold text-base mb-2">{feature.title}</Text>
                  <Text className="text-slate-600 text-xs leading-4">{feature.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing Plans */}
          <View className="px-6 flex-1 justify-end pb-8">
            <View className="flex flex-row gap-4 mb-6">
              {/* Monthly Plan */}
              <TouchableOpacity
                onPress={() => setSelectedPlan('monthly')}
                className={`relative flex-1 p-6 rounded-3xl border-2 bg-white ${
                  selectedPlan === 'monthly' ? 'border-pink-500' : 'border-gray-200'
                }`}
              >
                {selectedPlan === 'monthly' && (
                  <View className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-pink-500 px-4 py-1 rounded-full">
                    <Text className="text-white text-sm font-bold">7 days free trial</Text>
                  </View>
                )}
                {selectedPlan === 'monthly' && (
                  <View className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full items-center justify-center">
                    <Text className="text-white text-lg font-bold">✓</Text>
                  </View>
                )}
                <View className="items-center">
                  <Text className="text-lg font-semibold text-gray-700 mb-2">Monthly</Text>
                  <Text className="text-3xl font-black text-gray-900">
                    {monthlyPackage?.product.priceString
                      ? monthlyPackage.product.price.toLocaleString('en-US', {
                          style: 'currency',
                          currency: monthlyPackage.product.currencyCode || 'USD',
                        })
                      : monthlyPrice}{' '}
                    <Text className="text-lg font-medium text-gray-500">/mo</Text>
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Yearly Plan */}
              <TouchableOpacity
                onPress={() => setSelectedPlan('yearly')}
                className={`relative flex-1 p-6 rounded-3xl border-2 bg-white ${
                  selectedPlan === 'yearly' ? 'border-pink-500' : 'border-gray-200'
                }`}
              >
                {selectedPlan === 'yearly' && (
                  <View className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-pink-500 px-4 py-1 rounded-full">
                    <Text className="text-white text-sm font-bold">Save {savings}%</Text>
                  </View>
                )}
                {selectedPlan === 'yearly' && (
                  <View className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full items-center justify-center">
                    <Text className="text-white text-lg font-bold">✓</Text>
                  </View>
                )}
                <View className="items-center">
                  <Text className="text-lg font-semibold text-gray-700 mb-2">Yearly</Text>
                  <Text className="text-3xl font-black text-gray-900">
                    {yearlyPackage?.product.priceString
                      ? (yearlyPackage.product.price / 12).toLocaleString('en-US', {
                          style: 'currency',
                          currency: yearlyPackage.product.currencyCode || 'USD',
                        })
                      : `$${yearlyMonthlyCost.toFixed(2)}`}{' '}
                    <Text className="text-lg font-medium text-gray-500">/mo</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Subscribe Button */}
            <Button
              title={isLoading ? 'Processing your subscription...' : `Continue`}
              onPress={() => handlePurchase(selectedPlan)}
              variant="primary"
              size="large"
              className="bg-pink-500 text-white"
              disabled={isLoading}
            />

            {/* Restore Purchases & Terms */}
            <View className="mt-3">
              <TouchableOpacity
                onPress={handleRestorePurchases}
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
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
