import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { useAuth } from './auth-provider';

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
};

interface SubscriptionState {
  isSubscribed: boolean;
  isTrialing: boolean;
  loading: boolean;
  customerInfo: CustomerInfo | null;
  error: string | null;
  offerings: PurchasesOfferings | null;
}

interface SubscriptionContextValue extends SubscriptionState {
  refreshSubscriptionStatus: () => Promise<void>;
  restorePurchases: () => Promise<CustomerInfo>;
  purchasePackage: (pack: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    isTrialing: false,
    loading: true,
    customerInfo: null,
    error: null,
    offerings: null,
  });

  // Initialize RevenueCat on mount
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Load subscription when user changes
  useEffect(() => {
    if (user) {
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
  }, [user]);

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
