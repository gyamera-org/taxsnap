import { usePaywall } from '@/context/paywall-provider';
import { useSubscriptionStatus } from './use-subscription-status';
import { useCallback } from 'react';

interface UsePremiumFeatureOptions {
  feature: string;
  featureName?: string;
  successRoute?: string; // Where to go after successful subscription
}

/**
 * Hook to check if a user can access a premium feature and show paywall if needed
 */
export function usePremiumFeature({
  feature,
  featureName,
  successRoute,
}: UsePremiumFeatureOptions) {
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const { showPaywall } = usePaywall();

  const canUseFeature = subscriptionStatus?.isSubscribed || subscriptionStatus?.isInGracePeriod;

  const requirePremium = useCallback(() => {
    if (canUseFeature) {
      return true; // User can use the feature
    }

    // Show paywall
    showPaywall({
      source: 'feature_gate',
      feature,
      title: 'Premium Feature',
      subtitle: `${featureName || 'This feature'} requires a premium subscription`,
      successRoute,
      dismissible: true,
    });

    return false; // User cannot use the feature
  }, [canUseFeature, showPaywall, feature, featureName, successRoute]);

  const showGracePeriodReminder = useCallback(() => {
    if (!subscriptionStatus?.isInGracePeriod) return;

    showPaywall({
      source: 'grace_period',
      title: `${subscriptionStatus.daysRemainingInGrace} Days Left`,
      subtitle: 'Subscribe now to continue accessing all features after your trial ends',
      dismissible: true,
    });
  }, [subscriptionStatus, showPaywall]);

  return {
    canUseFeature,
    isSubscribed: subscriptionStatus?.isSubscribed || false,
    isInGracePeriod: subscriptionStatus?.isInGracePeriod || false,
    daysRemainingInGrace: subscriptionStatus?.daysRemainingInGrace || 0,
    requirePremium,
    showGracePeriodReminder,
  };
}
