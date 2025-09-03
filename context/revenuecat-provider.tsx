import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesOfferings,
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { useAuth } from './auth-provider';

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
};

interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionType: 'free' | 'weekly' | 'yearly';
  isInTrial: boolean;
  trialEndsAt: Date | null;
  trialDuration: number | null;
  isEligibleForTrial: boolean;
  loading: boolean;
  customerInfo: CustomerInfo | null;
  error: string | null;
  // Core RevenueCat data
  offerings: PurchasesOfferings | null;
  packages: PurchasesPackage[];
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
    subscriptionType: 'free',
    isInTrial: false,
    trialEndsAt: null,
    trialDuration: null,
    isEligibleForTrial: true,
    loading: false,
    customerInfo: null,
    error: null,
    offerings: null,
    packages: [],
  });

  // Initialize RevenueCat on mount
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Load subscription when user changes
  useEffect(() => {
    if (user) {
      loadSubscriptionStatus();
    } else {
      setState({
        isSubscribed: false,
        subscriptionType: 'free',
        isInTrial: false,
        trialEndsAt: null,
        trialDuration: null,
        isEligibleForTrial: true,
        loading: false,
        customerInfo: null,
        error: null,
        offerings: null,
        packages: [],
      });
    }
  }, [user]);

  const initializeRevenueCat = async () => {
    try {
      // Debug: Log environment info

      // Configure RevenueCat for the platform
      if (Platform.OS === 'ios' && APIKeys.apple) {
        await Purchases.configure({
          apiKey: APIKeys.apple,
          appUserID: null, // Anonymous user initially
          userDefaultsSuiteName: undefined,
        });
      } else {
        const errorMsg = !APIKeys.apple
          ? 'RevenueCat API key not found. Please set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY environment variable.'
          : 'RevenueCat only configured for iOS platform';
        console.warn(errorMsg);
        setState((prev) => ({
          ...prev,
          error: errorMsg,
        }));
        return;
      }

      // Enable debug logs for development
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

      // Set attributes for better debugging
      if (__DEV__) {
        Purchases.setAttributes({
          $email: 'dev@lunasync.app',
          $displayName: 'Development User',
        });
      }

      // Load offerings with retry logic
      await loadOfferingsWithRetry();
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
      setState((prev) => ({
        ...prev,
        error: `Failed to initialize RevenueCat: ${error?.message}`,
      }));
    }
  };

  const loadOfferingsWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const offerings = await Purchases.getOfferings();

        // Check if we have any offerings
        if (!offerings || !offerings.current) {
          console.warn('No current offering found in RevenueCat');
          if (i === retries - 1) {
            setState((prev) => ({
              ...prev,
              error: 'No subscription plans configured. Please check RevenueCat dashboard.',
            }));
          }
          throw new Error('No current offering available');
        }

        // Get all packages from all offerings
        const allPackages: PurchasesPackage[] = [];
        Object.values(offerings.all).forEach((offering: PurchasesOffering) => {
          if (offering.availablePackages) {
            allPackages.push(...offering.availablePackages);
          }
        });

        setState((prev) => ({
          ...prev,
          offerings,
          packages: allPackages,
          error: null,
        }));

        return; // Success, exit retry loop
      } catch (error) {
        console.error(`Error loading offerings (attempt ${i + 1}):`, error);
        if (i === retries - 1) {
          // Last attempt failed
          console.error('Failed to load offerings after all retries');
          setState((prev) => ({
            ...prev,
            error:
              'Unable to load subscription plans. Please check your internet connection and try again.',
          }));
        } else {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
  };

  const loadOfferings = async () => {
    await loadOfferingsWithRetry();
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      const purchaseInfo = await Purchases.purchasePackage(pack);

      // Update customer info after purchase
      setState((prev) => ({
        ...prev,
        customerInfo: purchaseInfo.customerInfo,
      }));

      // Refresh subscription status
      await loadSubscriptionStatus();

      return { success: true };
    } catch (error: any) {
      if (error?.userCancelled) {
        return {
          success: false,
          error: 'Purchase was cancelled',
        };
      }

      // Handle specific error cases
      if (error?.code === 'InvalidReceiptError') {
        return {
          success: false,
          error: 'There was a problem with the App Store. Please try again.',
        };
      }

      // Log the full error for debugging
      console.error('Purchase failed with error:', {
        code: error?.code,
        message: error?.message,
        underlyingError: error?.underlyingErrorMessage,
      });

      return {
        success: false,
        error: 'Unable to complete purchase. Please try again later.',
      };
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const customerInfo = await Purchases.getCustomerInfo();
      const isSubscribed = Object.keys(customerInfo.entitlements.active).length > 0;
      const isEligibleForTrial = Object.keys(customerInfo.entitlements.all).length === 0;

      // Basic subscription info - you can expand this based on your needs
      let subscriptionType: 'free' | 'weekly' | 'yearly' = 'free';
      let isInTrial = false;
      let trialEndsAt: Date | null = null;
      let trialDuration: number | null = null;

      if (isSubscribed) {
        const entitlementId = Object.keys(customerInfo.entitlements.active)[0];
        const entitlement = customerInfo.entitlements.active[entitlementId];

        isInTrial = entitlement.periodType === 'trial';
        trialEndsAt =
          isInTrial && entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;

        // Determine plan based on product ID
        const productId = entitlement.productIdentifier;
        if (productId.includes('yearly')) {
          subscriptionType = 'yearly';
          trialDuration = isInTrial ? 7 : null;
        } else if (productId.includes('weekly')) {
          subscriptionType = 'weekly';
          trialDuration = isInTrial ? 3 : null;
        }
      }

      setState((prev) => ({
        ...prev,
        isSubscribed,
        subscriptionType,
        isInTrial,
        trialEndsAt,
        trialDuration,
        isEligibleForTrial,
        customerInfo,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error('Failed to load subscription status:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load subscription status',
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

      // Update state with restored info
      setState((prev) => ({
        ...prev,
        customerInfo,
      }));

      // Refresh subscription status after restore
      await loadSubscriptionStatus();

      return customerInfo;
    } catch (error: any) {
      console.error('Failed to restore purchases:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to restore purchases',
      }));
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

export const useSubscription = useRevenueCat;
