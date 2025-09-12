import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Linking, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Dumbbell, Apple, ArrowLeft } from 'lucide-react-native';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { toast } from 'sonner-native';
import { DefaultLoader } from '@/components/ui/default-loader';
import { useTheme } from '@/context/theme-provider';
import { CosmicBackground } from '@/components/ui/cosmic-background';

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
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const {
    offerings,
    purchasePackage,
    restorePurchases,
    error,
    loading,
    isSubscribed,
    isInGracePeriod,
    shouldShowPaywall,
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

  const monthlyPrice = monthlyPackage?.product.priceString || '$3.99';

  // Calculate yearly savings
  const yearlyMonthlyCost = yearlyPackage ? yearlyPackage.product.price / 12 : 2.49;
  const monthlyCost = monthlyPackage?.product.price || 3.99;
  const yearlyCost = yearlyPackage?.product.price || 29.99;
  const savings = Math.round(((monthlyCost - yearlyMonthlyCost) / monthlyCost) * 100);

  // Show loading state - since data is preloaded during app initialization,
  // this should be much faster than before
  if (loading || !offerings) {
    return <DefaultLoader />;
  }

  // Show error state if RevenueCat failed to load (only after we've had a chance to load)
  if (error || !offerings?.current) {
    return (
      <CosmicBackground theme="settings" isDark={isDark}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center px-6">
            <View className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
              <Text className={`font-semibold text-center mb-2 ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                Unable to Load Subscription Plans
              </Text>
              <Text className={`text-sm text-center leading-5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
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
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground theme="settings" isDark={isDark}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            maxWidth: isTablet ? 600 : '100%',
            marginHorizontal: 'auto',
            width: '100%',
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 pt-8">
            {/* Back Button & Continue for Free */}
            <View
              className={`${
                isTablet ? 'px-12' : 'px-6'
              } mb-2 flex-row items-center justify-between`}
            >
              <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                <ArrowLeft size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text className={`ml-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('/(tabs)/nutrition')}
                className="py-2 px-3"
                disabled={isLoading}
              >
                <Text className={`font-medium text-sm underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Continue for Free
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title Section */}
            <View className={`${isTablet ? 'px-12' : 'px-6'} py-6 mb-4`}>
              <Text
                className={`${
                  isTablet ? 'text-4xl' : 'text-2xl'
                } font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                Upgrade to Premium
              </Text>
              <Text
                className={`${
                  isTablet ? 'text-lg' : 'text-base'
                } text-center leading-6 px-6 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}
              >
                Your body changes every month, LunaSync adapts with you.
              </Text>
            </View>

            {/* Features List - Grid Layout */}
            <View className={`${isTablet ? 'px-12' : 'px-6'} mb-10`}>
              <View
                className={`${isTablet ? 'grid grid-cols-2' : 'flex-row flex-wrap'} ${
                  isTablet ? 'gap-6' : 'justify-between'
                }`}
              >
                {features.map((feature) => (
                  <View
                    key={feature.title}
                    className={`${
                      isTablet ? 'w-full' : 'w-[48%]'
                    } p-6 rounded-2xl border mb-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <View
                      className={`${
                        isTablet ? 'w-16 h-16' : 'w-12 h-12'
                      } rounded-2xl items-center justify-center mb-3`}
                      style={{ backgroundColor: feature.bgColor }}
                    >
                      <feature.icon size={isTablet ? 32 : 24} color={feature.color} />
                    </View>
                    <Text
                      className={`font-bold ${
                        isTablet ? 'text-xl' : 'text-base'
                      } mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
                    >
                      {feature.title}
                    </Text>
                    <Text
                      className={`${isTablet ? 'text-base' : 'text-xs'} leading-4 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}
                    >
                      {feature.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Pricing Plans */}
            <View className={`${isTablet ? 'px-12' : 'px-6'} flex-1 justify-end pb-8`}>
              <View
                className={`flex ${isTablet ? 'flex-row max-w-md mx-auto' : 'flex-row'} gap-4 mb-6`}
              >
                {/* Monthly Plan */}
                <TouchableOpacity
                  onPress={() => setSelectedPlan('monthly')}
                  className={`relative flex-1 ${
                    isTablet ? 'p-8' : 'p-6'
                  } rounded-3xl border-2 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } ${
                    selectedPlan === 'monthly' 
                      ? 'border-pink-500' 
                      : isDark ? 'border-gray-600' : 'border-gray-200'
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
                    <Text
                      className={`${
                        isTablet ? 'text-xl' : 'text-lg'
                      } font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Monthly
                    </Text>
                    <Text
                      className={`${isTablet ? 'text-4xl' : 'text-3xl'} font-black ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {monthlyPackage?.product.priceString
                        ? monthlyPackage.product.price.toLocaleString('en-US', {
                            style: 'currency',
                            currency: monthlyPackage.product.currencyCode || 'USD',
                          })
                        : monthlyPrice}{' '}
                      <Text
                        className={`${isTablet ? 'text-xl' : 'text-lg'} font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        /mo
                      </Text>
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Yearly Plan */}
                <TouchableOpacity
                  onPress={() => setSelectedPlan('yearly')}
                  className={`relative flex-1 ${
                    isTablet ? 'p-8' : 'p-6'
                  } rounded-3xl border-2 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } ${
                    selectedPlan === 'yearly' 
                      ? 'border-pink-500' 
                      : isDark ? 'border-gray-600' : 'border-gray-200'
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
                    <Text
                      className={`${
                        isTablet ? 'text-xl' : 'text-lg'
                      } font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Yearly
                    </Text>
                    <Text
                      className={`${isTablet ? 'text-4xl' : 'text-3xl'} font-black ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {yearlyPackage?.product.priceString
                        ? yearlyPackage.product.price.toLocaleString('en-US', {
                            style: 'currency',
                            currency: yearlyPackage.product.currencyCode || 'USD',
                          })
                        : `$${yearlyCost.toFixed(2)}`}{' '}
                      <Text
                        className={`${isTablet ? 'text-xl' : 'text-lg'} font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        /yr
                      </Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Subscribe Button */}
              <View className={isTablet ? 'max-w-md mx-auto w-full' : ''}>
                <Button
                  title={isLoading ? 'Processing your subscription...' : `Start Premium`}
                  onPress={() => handlePurchase(selectedPlan)}
                  variant="primary"
                  size="large"
                  className="bg-pink-500 text-white"
                  disabled={isLoading}
                />
              </View>

              {/* Restore Purchases & Terms */}
              <View className="mt-3">
                <TouchableOpacity
                  onPress={handleRestorePurchases}
                  className="mb-2"
                  disabled={isLoading}
                >
                  <Text
                    className={`text-center ${
                      isTablet ? 'text-sm' : 'text-xs'
                    } underline ${isDark ? 'text-gray-400' : 'text-slate-500'}`}
                  >
                    Restore Purchases
                  </Text>
                </TouchableOpacity>

                {/* Terms and Privacy Links */}
                <View className="flex-row justify-center items-center">
                  <TouchableOpacity
                    onPress={() => Linking.openURL('https://lunasync.app/terms')}
                    className="mr-4"
                  >
                    <Text
                      className={`${isTablet ? 'text-sm' : 'text-xs'} underline ${isDark ? 'text-gray-400' : 'text-slate-500'}`}
                    >
                      Terms
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Linking.openURL('https://lunasync.app/privacy')}>
                    <Text
                      className={`${isTablet ? 'text-sm' : 'text-xs'} underline ${isDark ? 'text-gray-400' : 'text-slate-500'}`}
                    >
                      Privacy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}
