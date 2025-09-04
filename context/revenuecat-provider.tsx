import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { useAuth } from './auth-provider';
import { supabase } from '@/lib/supabase/client';

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
};

interface SubscriptionState {
  isSubscribed: boolean;
  loading: boolean;
  customerInfo: CustomerInfo | null;
  error: string | null;
  offerings: PurchasesOfferings | null;
  // Grace period logic
  isInGracePeriod: boolean;
  daysRemainingInGrace: number;
  shouldShowPaywall: boolean;
}

interface SubscriptionContextValue extends SubscriptionState {
  refreshSubscriptionStatus: () => Promise<void>;
  restorePurchases: () => Promise<CustomerInfo>;
  // Core RevenueCat functionality
  purchasePackage: (pack: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    loading: false,
    customerInfo: null,
    error: null,
    offerings: null,
    isInGracePeriod: false,
    daysRemainingInGrace: 0,
    shouldShowPaywall: true,
  });

  // Initialize RevenueCat on mount
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Load subscription when user changes
  useEffect(() => {
    if (user) {
      // Identify user with RevenueCat
      Purchases.logIn(user.id)
        .then(() => {
          return loadSubscriptionStatus();
        })
        .catch((error) => {
          console.error('❌ Error setting RevenueCat user ID:', error);
          // Still try to load subscription status
          loadSubscriptionStatus();
        });
    } else {
      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        customerInfo: null,
        isInGracePeriod: false,
        daysRemainingInGrace: 0,
        shouldShowPaywall: true,
        loading: false,
      }));
    }
  }, [user]);

  const initializeRevenueCat = async () => {
    try {
      if (Platform.OS === 'ios' && APIKeys.apple) {
        await Purchases.configure({ apiKey: APIKeys.apple });
        // if (__DEV__) {
        //   Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        // }
      } else {
        const errorMsg = 'RevenueCat configuration failed';
        setState((prev) => ({ ...prev, error: errorMsg }));
        return;
      }

      // Load offerings with retry logic
      await loadOfferingsWithRetry();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to initialize RevenueCat',
      }));
    }
  };

  const loadOfferingsWithRetry = async (retries = 2) => {
    for (let i = 0; i < retries; i++) {
      try {
        const offerings = await Purchases.getOfferings();
        if (!offerings?.current) {
          throw new Error('No current offering available');
        }

        setState((prev) => ({ ...prev, offerings, error: null }));
        return;
      } catch (error) {
        if (i === retries - 1) {
          setState((prev) => ({
            ...prev,
            error: 'Unable to load subscription plans.',
          }));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      const purchaseInfo = await Purchases.purchasePackage(pack);
      setState((prev) => ({ ...prev, customerInfo: purchaseInfo.customerInfo }));
      await loadSubscriptionStatus();
      return { success: true };
    } catch (error: any) {
      if (error?.userCancelled) {
        return { success: false, error: 'Purchase was cancelled' };
      }
      return { success: false, error: 'Purchase failed. Please try again.' };
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const customerInfo = await Purchases.getCustomerInfo();
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;

      // Grace period logic - ONLY for new users without subscriptions
      const GRACE_PERIOD_DAYS = 7;
      let isInGracePeriod = false;
      let daysRemainingInGrace = 0;

      if (!hasActiveSubscription && user) {
        const { data: accountData } = await supabase
          .from('accounts')
          .select('created_at')
          .eq('id', user.id)
          .single();

        if (accountData) {
          const accountCreationDate = new Date(accountData.created_at);
          const daysSinceCreation = Math.floor(
            (Date.now() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          isInGracePeriod = daysSinceCreation < GRACE_PERIOD_DAYS;
          daysRemainingInGrace = Math.max(0, GRACE_PERIOD_DAYS - daysSinceCreation);
        }
      }

      // PayWall decision: Show paywall ONLY if no active subscription AND not in grace period
      const shouldShowPaywall = !hasActiveSubscription && !isInGracePeriod;

      setState((prev) => ({
        ...prev,
        isSubscribed: hasActiveSubscription,
        customerInfo,
        isInGracePeriod,
        daysRemainingInGrace,
        shouldShowPaywall,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error('❌ Failed to load subscription status:', error);
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
      setState((prev) => ({ ...prev, loading: false, error: 'Failed to restore purchases' }));
      throw error;
    }
  };

  const value: SubscriptionContextValue = {
    ...state,
    refreshSubscriptionStatus,
    restorePurchases,
    purchasePackage,
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
