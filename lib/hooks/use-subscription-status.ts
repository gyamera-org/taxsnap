import { useQuery } from '@tanstack/react-query';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-provider';

interface SubscriptionStatus {
  isSubscribed: boolean;
  isInGracePeriod: boolean;
  daysRemainingInGrace: number;
  shouldShowPaywall: boolean;
  subscriptionType?: 'monthly' | 'yearly';
  expirationDate?: Date;
  gracePeriodEndDate?: Date;
}

const GRACE_PERIOD_DAYS = 7; // 7 days grace period

export function useSubscriptionStatus() {
  const { customerInfo } = useRevenueCat();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user) {
        return {
          isSubscribed: false,
          isInGracePeriod: false,
          daysRemainingInGrace: 0,
          shouldShowPaywall: true,
        };
      }

      // Check RevenueCat subscription status
      const hasActiveSubscription =
        customerInfo?.entitlements.active &&
        Object.keys(customerInfo.entitlements.active).length > 0;

      if (hasActiveSubscription) {
        // User has active subscription
        const activeEntitlement = Object.values(customerInfo.entitlements.active)[0];
        const expirationDate = activeEntitlement.expirationDate
          ? new Date(activeEntitlement.expirationDate)
          : undefined;

        return {
          isSubscribed: true,
          isInGracePeriod: false,
          daysRemainingInGrace: 0,
          shouldShowPaywall: false,
          subscriptionType: activeEntitlement.productIdentifier?.includes('yearly')
            ? 'yearly'
            : 'monthly',
          expirationDate,
        };
      }

      // Check account creation date for grace period
      const { data: accountData, error } = await supabase
        .from('accounts')
        .select('created_at')
        .eq('id', user.id)
        .single();

      if (error || !accountData) {
        return {
          isSubscribed: false,
          isInGracePeriod: false,
          daysRemainingInGrace: 0,
          shouldShowPaywall: true,
        };
      }

      const accountCreationDate = new Date(accountData.created_at);
      const currentDate = new Date();
      const daysSinceCreation = Math.floor(
        (currentDate.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isInGracePeriod = daysSinceCreation < GRACE_PERIOD_DAYS;
      const daysRemainingInGrace = Math.max(0, GRACE_PERIOD_DAYS - daysSinceCreation);
      const gracePeriodEndDate = new Date(accountCreationDate);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + GRACE_PERIOD_DAYS);

      return {
        isSubscribed: false,
        isInGracePeriod,
        daysRemainingInGrace,
        shouldShowPaywall: !isInGracePeriod, // Show paywall if not in grace period
        gracePeriodEndDate,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
