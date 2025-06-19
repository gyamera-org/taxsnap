import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscription } from '../context/subscription-provider';
import { toast } from 'sonner-native';
import { Button } from '@/components/ui/button';

export default function PaywallScreen() {
  const {
    products,
    loading: subscriptionLoading,
    purchaseSubscription,
    restorePurchases,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string>('weekly');
  const [loading, setLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);

  const handleRestore = async () => {
    try {
      setRestoreLoading(true);
      await restorePurchases();
      toast.success('Purchases restored successfully');
      router.replace('/'); // Redirect to welcome page after successful restore
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('No purchases found to restore');
    } finally {
      setRestoreLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      let productId = 'com.beautyscan.app.weekly';
      if (selectedPlan === 'yearly') productId = 'com.beautyscan.app.yearly';

      await purchaseSubscription(productId);

      // If we reach here, the purchase was successful
      toast.success('Subscription activated!');
      router.replace('/(tabs)/explore');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueFree = async () => {
    router.replace('/auth?mode=signup');
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else toast.error('Unable to open link');
    } catch {
      toast.error('Unable to open link');
    }
  };

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1 px-5 pt-10">
        {/* Close Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-5 z-10 bg-white/20 rounded-[20px] w-10 h-10 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mt-16 mb-10">
          <Text className="text-4xl font-bold text-white text-center mb-2">Stop Guessing.</Text>
          <Text className="text-4xl font-bold text-white text-center mb-5">Start Knowing. 🧬</Text>

          {/* Features */}
          <View className="items-start mb-10">
            <View className="flex-row items-center mb-3">
              <Ionicons name="scan" size={20} color="#FF69B4" className="mr-3" />
              <Text className="text-white text-lg">
                <Text className="font-bold">Instantly decode</Text> any ingredient list
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Ionicons name="warning" size={20} color="#FF69B4" className="mr-3" />
              <Text className="text-white text-lg">
                Identify <Text className="font-bold">harmful toxins & allergens</Text>
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={20} color="#FF69B4" className="mr-3" />
              <Text className="text-white text-lg">
                Make <Text className="font-bold">science-backed</Text> beauty choices
              </Text>
            </View>
          </View>
        </View>

        {/* Free Trial Toggle */}
        <View className="bg-pink-500/15 rounded-2xl p-4 mb-5 flex-row items-center justify-between border border-pink-500/30 mx-8">
          <Text className="text-white text-lg font-semibold">Free Trial Enabled</Text>
          <TouchableOpacity
            onPress={() => setFreeTrialEnabled(!freeTrialEnabled)}
            className={`w-15 h-8 rounded-full justify-center px-0.5 ${
              freeTrialEnabled ? 'bg-pink-500 items-end' : 'bg-white/30 items-start'
            }`}
          >
            <View className="w-7 h-7 rounded-full bg-white" />
          </TouchableOpacity>
        </View>

        {/* Pricing Options */}
        <View className="mb-8 px-8">
          {/* Yearly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('yearly')}
            className={`bg-pink-500/10 rounded-2xl p-4 mb-3 relative ${
              selectedPlan === 'yearly' ? 'border-2 border-pink-500' : 'border border-pink-500/30'
            }`}
          >
            {selectedPlan === 'yearly' && (
              <View className="absolute -top-2 right-4 bg-pink-600 rounded-xl px-3 py-1">
                <Text className="text-white text-xs font-bold">💖 BEST VALUE</Text>
              </View>
            )}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`w-5 h-5 rounded-full border-2 border-pink-500 mr-3 items-center justify-center ${
                    selectedPlan === 'yearly' ? 'bg-pink-500' : 'bg-transparent'
                  }`}
                >
                  {selectedPlan === 'yearly' && <View className="w-2 h-2 rounded-full bg-white" />}
                </View>
                <Text className="text-white text-lg font-bold">YEARLY ACCESS</Text>
              </View>
              <View className="items-end">
                <Text className="text-pink-500 text-lg font-bold">$0.77</Text>
                <Text className="text-white/70 text-sm">per week</Text>
              </View>
            </View>
            <Text className="text-white/70 text-sm ml-8">$39.99 per year</Text>
          </TouchableOpacity>

          {/* Weekly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('weekly')}
            className={`bg-pink-500/10 rounded-2xl p-4 ${
              selectedPlan === 'weekly' ? 'border-2 border-pink-500' : 'border border-pink-500/30'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`w-5 h-5 rounded-full border-2 border-pink-500 mr-3 items-center justify-center ${
                    selectedPlan === 'weekly' ? 'bg-pink-500' : 'bg-transparent'
                  }`}
                >
                  {selectedPlan === 'weekly' && <View className="w-2 h-2 rounded-full bg-white" />}
                </View>
                <Text className="text-white text-lg font-bold">3-DAY FREE TRIAL</Text>
              </View>
              <View className="items-end">
                <Text className="text-white/70 text-sm">then $3.99</Text>
                <Text className="text-white/70 text-sm">per week</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Try for Free Button */}
        <Button
          title={loading ? 'Processing...' : 'Start Your Glow Up ✨'}
          onPress={handlePurchase}
          disabled={loading || subscriptionLoading}
          variant="primary"
          loading={loading}
          className="mx-8 mb-3"
        />

        {/* No payment now */}
        <View className="items-center mb-5">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#FF69B4" className="mr-2" />
            <Text className="text-white/70 text-sm">No payment now</Text>
          </View>
        </View>

        {/* Footer Links */}
        <View className="flex-row justify-center items-center gap-10 mt-8">
          <TouchableOpacity onPress={handleRestore} disabled={restoreLoading}>
            <Text className="text-white/60 text-sm">
              {restoreLoading ? 'Restoring...' : 'Restore'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openLink('https://beautyscan.app/terms')}>
            <Text className="text-white/60 text-sm">Terms</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openLink('https://beautyscan.app/privacy')}>
            <Text className="text-white/60 text-sm">Privacy</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
