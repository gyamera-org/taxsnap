import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { useAuth } from './auth-provider';
import { supabase } from '@/lib/supabase/client';
import { DEV_MODE_CONFIG, isBypassActive } from '@/lib/config/dev-mode';

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
};

const MAX_FREE_SCANS = 3;

interface SubscriptionState {
  isSubscribed: boolean;
  isTrialing: boolean;
  loading: boolean;
  customerInfo: CustomerInfo | null;
  error: string | null;
  offerings: PurchasesOfferings | null;
  // Free scan limit
  freeScansUsed: number;
  freeScansRemaining: number;
  canScan: boolean;
}

interface SubscriptionContextValue extends SubscriptionState {
  refreshSubscriptionStatus: () => Promise<void>;
  restorePurchases: () => Promise<CustomerInfo>;
  purchasePackage: (pack: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  recordFreeScan: () => Promise<void>;
  maxFreeScans: number;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const isPaywallBypassed = isBypassActive('PAYWALL');
  const isUnlimitedScansBypassed = isBypassActive('UNLIMITED_FREE_SCANS');

  // In dev mode with paywall bypass, start with subscribed state
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: isPaywallBypassed ? DEV_MODE_CONFIG.mockSubscription.isSubscribed : false,
    isTrialing: isPaywallBypassed ? DEV_MODE_CONFIG.mockSubscription.isTrialing : false,
    loading: !isPaywallBypassed,
    customerInfo: null,
    error: null,
    offerings: null,
    freeScansUsed: 0,
    freeScansRemaining: isUnlimitedScansBypassed
      ? DEV_MODE_CONFIG.mockSubscription.freeScansRemaining
      : MAX_FREE_SCANS,
    canScan: true,
  });

  // Load free scan count from database
  const loadFreeScanCount = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('free_scans_used')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading free scan count:', error);
        return;
      }

      // If no account row exists yet, treat as 0 scans used
      if (!data) {
        setState((prev) => ({
          ...prev,
          freeScansUsed: 0,
          freeScansRemaining: MAX_FREE_SCANS,
          canScan: prev.isSubscribed || MAX_FREE_SCANS > 0,
        }));
        return;
      }

      const scansUsed = data?.free_scans_used ?? 0;
      const remaining = Math.max(0, MAX_FREE_SCANS - scansUsed);

      setState((prev) => ({
        ...prev,
        freeScansUsed: scansUsed,
        freeScansRemaining: remaining,
        canScan: prev.isSubscribed || remaining > 0,
      }));
    } catch (error) {
      console.error('Error loading free scan count:', error);
    }
  }, [user]);

  // Record a free scan in database
  const recordFreeScan = useCallback(async () => {
    if (!user) return;

    try {
      // Increment free_scans_used in the database
      const { data, error } = await supabase.rpc('increment_free_scans', {
        user_id: user.id,
      });

      // If RPC doesn't exist, fall back to manual update
      if (error?.code === 'PGRST202') {
        // RPC not found, use direct update
        const { data: accountData } = await supabase
          .from('accounts')
          .select('free_scans_used')
          .eq('id', user.id)
          .single();

        const currentCount = accountData?.free_scans_used ?? 0;
        const newCount = currentCount + 1;

        await supabase
          .from('accounts')
          .update({ free_scans_used: newCount })
          .eq('id', user.id);

        const remaining = Math.max(0, MAX_FREE_SCANS - newCount);
        setState((prev) => ({
          ...prev,
          freeScansUsed: newCount,
          freeScansRemaining: remaining,
          canScan: prev.isSubscribed || remaining > 0,
        }));
      } else if (error) {
        console.error('Error recording free scan:', error);
      } else {
        // RPC succeeded, reload the count
        await loadFreeScanCount();
      }
    } catch (error) {
      console.error('Error recording free scan:', error);
    }
  }, [user, loadFreeScanCount]);

  // Initialize RevenueCat on mount (skip in dev mode with paywall bypass)
  useEffect(() => {
    if (isPaywallBypassed) {
      console.log('🔧 Paywall bypassed - skipping RevenueCat initialization');
      return;
    }
    initializeRevenueCat();
  }, [isPaywallBypassed]);

  // Load free scan count when user changes (skip in dev mode with unlimited scans)
  useEffect(() => {
    if (isUnlimitedScansBypassed) {
      console.log('🔧 Unlimited scans enabled - skipping scan count load');
      return;
    }
    if (user) {
      loadFreeScanCount();
    }
  }, [user, loadFreeScanCount, isUnlimitedScansBypassed]);

  // Load subscription when user changes (skip in dev mode with paywall bypass)
  useEffect(() => {
    // Skip RevenueCat in dev mode with paywall bypass
    if (isPaywallBypassed) {
      return;
    }

    // Don't do anything until auth is done loading
    if (authLoading) {
      return;
    }

    if (user) {
      // Set loading to true immediately while we fetch subscription status
      setState((prev) => ({ ...prev, loading: true }));

      Purchases.logIn(user.id)
        .then(() => {
          return loadSubscriptionStatus();
        })
        .catch((error) => {
          console.error('Error setting RevenueCat user ID:', error);
          loadSubscriptionStatus();
        });
    } else {
      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isTrialing: false,
        customerInfo: null,
        loading: false,
      }));
    }
  }, [user, authLoading, isPaywallBypassed]);

  const initializeRevenueCat = async () => {
    try {
      const apiKey = Platform.OS === 'ios' ? APIKeys.apple : APIKeys.android;

      if (!apiKey) {
        console.error('RevenueCat API key not configured');
        setState((prev) => ({ ...prev, error: 'RevenueCat not configured', loading: false }));
        return;
      }

      await Purchases.configure({ apiKey });

      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      await loadOfferingsWithRetry();
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to initialize subscriptions',
        loading: false,
      }));
    }
  };

  const loadOfferingsWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const offerings = await Purchases.getOfferings();

        if (!offerings?.current) {
          throw new Error('No current offering available');
        }

        setState((prev) => ({ ...prev, offerings, error: null }));
        return;
      } catch (error) {
        console.error(`Offerings load attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          setState((prev) => ({
            ...prev,
            error: 'Unable to load subscription plans',
          }));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const purchaseInfo = await Purchases.purchasePackage(pack);
      setState((prev) => ({ ...prev, customerInfo: purchaseInfo.customerInfo }));

      await loadSubscriptionStatus();

      return { success: true };
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));

      if (error?.userCancelled) {
        return { success: false, error: 'Purchase was cancelled' };
      }

      console.error('Purchase error:', error);
      return { success: false, error: 'Purchase failed. Please try again.' };
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const customerInfo = await Purchases.getCustomerInfo();

      // Check for active entitlements
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;

      // Check if user is in trial period
      let isTrialing = false;
      if (hasActiveSubscription) {
        const activeEntitlement = Object.values(customerInfo.entitlements.active)[0];
        if (activeEntitlement?.periodType === 'TRIAL') {
          isTrialing = true;
        }
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: hasActiveSubscription,
        isTrialing,
        customerInfo,
        loading: false,
        error: null,
        // Subscribers can always scan, free users check remaining scans
        canScan: hasActiveSubscription || prev.freeScansRemaining > 0,
      }));
    } catch (error: any) {
      console.error('Failed to load subscription status:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load subscription status',
      }));
    }
  };

  const refreshSubscriptionStatus = async () => {
    await loadSubscriptionStatus();
  };

  const restorePurchases = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const customerInfo = await Purchases.restorePurchases();
      setState((prev) => ({ ...prev, customerInfo }));
      await loadSubscriptionStatus();
      return customerInfo;
    } catch (error: any) {
      console.error('Failed to restore purchases:', error);
      setState((prev) => ({ ...prev, loading: false, error: 'Failed to restore purchases' }));
      throw error;
    }
  };

  const value: SubscriptionContextValue = {
    ...state,
    refreshSubscriptionStatus,
    restorePurchases,
    purchasePackage,
    recordFreeScan,
    maxFreeScans: MAX_FREE_SCANS,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useRevenueCat() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
}
