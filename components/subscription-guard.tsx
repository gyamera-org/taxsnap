import React, { useEffect } from 'react';
import { useSubscriptionStatus } from '@/lib/hooks/use-subscription-status';
import { usePaywall } from '@/context/paywall-provider';
import { useAuth } from '@/context/auth-provider';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
  requireSubscription?: boolean;
}

export function SubscriptionGuard({
  children,
  feature,
  requireSubscription = false,
}: SubscriptionGuardProps) {
  const { user } = useAuth();
  const { data: subscriptionStatus, isLoading } = useSubscriptionStatus();
  const { showPaywall } = usePaywall();

  useEffect(() => {
    if (!user || isLoading) return;

    if (requireSubscription && subscriptionStatus?.shouldShowPaywall) {
      showPaywall({
        source: subscriptionStatus.isInGracePeriod ? 'grace_period' : 'feature_gate',
        feature,
        title: subscriptionStatus.isInGracePeriod
          ? `${subscriptionStatus.daysRemainingInGrace} Days Left in Free Trial`
          : 'Premium Feature',
        subtitle: subscriptionStatus.isInGracePeriod
          ? 'Subscribe now to continue accessing all features after your trial ends'
          : 'This feature requires a premium subscription',
        dismissible: subscriptionStatus.isInGracePeriod, // Don't allow dismiss if grace period ended
      });
    }
  }, [user, subscriptionStatus, isLoading, requireSubscription, feature, showPaywall]);

  // If loading, show the children (they can handle their own loading states)
  if (isLoading) {
    return <>{children}</>;
  }

  // If user is subscribed or in grace period, show content
  if (
    !requireSubscription ||
    subscriptionStatus?.isSubscribed ||
    subscriptionStatus?.isInGracePeriod
  ) {
    return <>{children}</>;
  }

  // If subscription is required but user is not subscribed and not in grace period
  // The paywall will show, but we can still render children underneath
  return <>{children}</>;
}
