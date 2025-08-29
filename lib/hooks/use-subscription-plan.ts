import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-provider';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export interface UserSubscriptionInfo {
  selected_plan: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_active: boolean;
  subscription_expires: string | null;
  subscription_started_at: string | null;
  subscription_cancelled_at: string | null;
  plan_changed_at: string | null;
}

// Hook to get user's subscription info from database
export function useUserSubscriptionInfo() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.subscription.info(user?.id),
    queryFn: async (): Promise<UserSubscriptionInfo | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase.rpc('get_user_subscription_info', {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user?.id,
  });
}

// Hook to update user's selected plan
export function useUpdateSelectedPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedPlan: 'free' | 'monthly' | 'yearly') => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('update_user_plan', {
        p_user_id: user.id,
        p_selected_plan: selectedPlan,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, selectedPlan) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.info(user?.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
    },
    onError: (error: any) => handleError(error, 'Failed to update plan'),
  });
}

// Hook to change subscription plan (upgrade/downgrade)
export function useChangePlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPlan: 'monthly' | 'yearly') => {
      if (!user?.id) throw new Error('User not authenticated');

      // First update the selected plan in database
      const { error: updateError } = await supabase.rpc('update_user_plan', {
        p_user_id: user.id,
        p_selected_plan: newPlan,
      });

      if (updateError) throw updateError;

      // Get current offerings
      // const currentOffering = await revenueCatService.getCurrentOffering();

      // if (!currentOffering?.availablePackages) {
      //   throw new Error('No subscription options available');
      // }

      // // Find the package for the new plan
      // const packageToPurchase = currentOffering.availablePackages.find((pkg: any) =>
      //   newPlan === 'yearly'
      //     ? pkg.packageType === 'ANNUAL' ||
      //       pkg.identifier.includes('yearly') ||
      //       pkg.product.identifier.includes('yearly')
      //     : pkg.packageType === 'MONTHLY' ||
      //       pkg.identifier.includes('monthly') ||
      //       pkg.product.identifier.includes('monthly')
      // );

      // if (!packageToPurchase) {
      //   throw new Error('Selected subscription plan not available');
      // }

      // Check if we're in Expo Go - if so, simulate success
      const isExpoGo = __DEV__ && !process.env.EXPO_STANDALONE_APP;

      if (isExpoGo) {
        // Simulate plan change in Expo Go
        await supabase.rpc('update_subscription_status', {
          p_user_id: user.id,
          p_subscription_status: 'active',
          p_subscription_plan: newPlan,
          p_subscription_active: true,
          p_subscription_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
        return { success: true, message: 'Plan changed successfully (Expo Go simulation)' };
      }

      // Process actual plan change with RevenueCat
      // const result = await revenueCatService.purchasePackage(packageToPurchase);

      // if (result.success) {
      //   // Update subscription status in database
      //   await supabase.rpc('update_subscription_status', {
      //     p_user_id: user.id,
      //     p_subscription_status: 'active',
      //     p_subscription_plan: newPlan,
      //     p_subscription_active: true,
      //   });

      //   return { success: true, message: 'Plan changed successfully!' };
      // } else {
      //   throw new Error(result.error || 'Failed to change plan');
      // }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.info(user?.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
      // toast.success(result.message);
    },
    onError: (error: any) => handleError(error, 'Failed to change plan'),
  });
}

// Hook to detect subscription mismatches
export function useSubscriptionMismatch() {
  const { data: subscriptionInfo } = useUserSubscriptionInfo();

  if (!subscriptionInfo) return null;

  const hasMismatch =
    subscriptionInfo.selected_plan !== 'free' &&
    subscriptionInfo.subscription_plan === 'free' &&
    !subscriptionInfo.subscription_active;

  return {
    hasMismatch,
    selectedPlan: subscriptionInfo.selected_plan,
    currentPlan: subscriptionInfo.subscription_plan,
    status: subscriptionInfo.subscription_status,
    needsPayment: hasMismatch,
  };
}

// Hook to sync subscription status from RevenueCat
export function useSyncSubscriptionStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get subscription status from RevenueCat
      // const result = await revenueCatService.checkSubscriptionStatus(user.id);

      // if (result.error) {
      //   throw new Error(result.error);
      // }

      // // Get subscription details
      // const subscriptionInfo = revenueCatService.getSubscriptionInfo(result.customerInfo!);

      // // Update database with current status
      // await supabase.rpc('update_subscription_status', {
      //   p_user_id: user.id,
      //   p_subscription_status: result.isSubscribed ? 'active' : 'inactive',
      //   p_subscription_plan: subscriptionInfo.plan,
      //   p_subscription_active: result.isSubscribed,
      //   p_subscription_expires: subscriptionInfo.expiresAt?.toISOString() || null,
      // });

      // return {
      //   isSubscribed: result.isSubscribed,
      //   plan: subscriptionInfo.plan,
      //   expiresAt: subscriptionInfo.expiresAt,
      // };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.info(user?.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
    },
    onError: (error: any) => handleError(error, 'Failed to sync subscription status'),
  });
}
