import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { usePaywall } from '@/context/paywall-provider';
import { usePremiumFeature } from '@/lib/hooks/use-premium-feature';
import { SubscriptionGuard } from '@/components/subscription-guard';

// Example 1: Manual paywall trigger
export function ManualPaywallExample() {
  const { showPaywall } = usePaywall();

  const handleShowPaywall = () => {
    showPaywall({
      source: 'manual',
      title: 'Upgrade Required',
      subtitle: 'Unlock advanced features with a premium subscription',
      dismissible: true,
      successRoute: '/(tabs)/nutrition', // Where to go after successful subscription
    });
  };

  return <Button title="Show Paywall" onPress={handleShowPaywall} />;
}

// Example 2: Premium feature gate
export function PremiumFeatureExample() {
  const { requirePremium, canUseFeature, daysRemainingInGrace } = usePremiumFeature({
    feature: 'advanced_meal_scanning',
    featureName: 'Advanced Meal Scanning',
    successRoute: '/(tabs)/nutrition',
  });

  const handleAdvancedScan = () => {
    if (requirePremium()) {
      // User has access, proceed with feature
      console.log('Starting advanced scan...');
    }
    // If user doesn't have access, paywall is automatically shown
  };

  return (
    <View>
      <Button title="Start Advanced Scan" onPress={handleAdvancedScan} />

      {!canUseFeature && daysRemainingInGrace > 0 && (
        <Text className="text-amber-600 text-sm mt-2">
          Free trial: {daysRemainingInGrace} days remaining
        </Text>
      )}
    </View>
  );
}

// Example 3: Grace period reminder
export function GracePeriodReminderExample() {
  const { showGracePeriodReminder, isInGracePeriod, daysRemainingInGrace } = usePremiumFeature({
    feature: 'general',
  });

  if (!isInGracePeriod) return null;

  return (
    <TouchableOpacity
      onPress={showGracePeriodReminder}
      className="bg-amber-50 border border-amber-200 rounded-lg p-4 m-4"
    >
      <Text className="text-amber-800 font-semibold">
        Free Trial: {daysRemainingInGrace} days left
      </Text>
      <Text className="text-amber-600 text-sm">
        Tap to subscribe and keep your premium features
      </Text>
    </TouchableOpacity>
  );
}

// Example 4: Component-level subscription guard
export function ProtectedFeatureExample() {
  return (
    <SubscriptionGuard feature="meal_planning" requireSubscription={true}>
      <View className="p-4">
        <Text className="text-lg font-bold">Premium Meal Planning</Text>
        <Text className="text-gray-600">
          This feature is protected and will show paywall if user doesn't have access
        </Text>
        {/* Your protected content here */}
      </View>
    </SubscriptionGuard>
  );
}

// Example 5: Feature with optional subscription requirement
export function FlexibleFeatureExample() {
  const { canUseFeature, requirePremium } = usePremiumFeature({
    feature: 'export_data',
    featureName: 'Data Export',
  });

  const handleExport = (format: 'basic' | 'advanced') => {
    if (format === 'advanced' && !requirePremium()) {
      return; // Paywall shown
    }

    // Proceed with export
    console.log(`Exporting in ${format} format`);
  };

  return (
    <View className="p-4">
      <Button
        title="Export Basic Data (Free)"
        onPress={() => handleExport('basic')}
        className="mb-2"
      />

      <Button
        title={`Export Advanced Data ${canUseFeature ? '' : '(Premium)'}`}
        onPress={() => handleExport('advanced')}
        variant={canUseFeature ? 'primary' : 'secondary'}
      />
    </View>
  );
}
