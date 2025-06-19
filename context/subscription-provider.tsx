import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { iapService, PurchaseResult, Product } from '@/lib/services/iap-service';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './auth-provider';

interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionType: 'free' | 'monthly' | 'yearly';
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface SubscriptionContextValue extends SubscriptionState {
  purchaseSubscription: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  initializeIAP: () => Promise<void>;
  getRemainingFreeScans: () => number;
  canAccessFeature: (feature: string) => boolean;
  incrementFreeUsage: (feature: string) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

const FREE_LIMITS = {
  scans: 5,
  routines: 2,
  profiles: 1,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    subscriptionType: 'free',
    products: [],
    loading: false,
    error: null,
  });

  const [freeUsage, setFreeUsage] = useState({
    scans: 0,
    routines: 0,
    profiles: 0,
  });

  useEffect(() => {
    if (user) {
      initializeIAP();
      // loadSubscriptionStatus(); // Temporarily disabled - causes RPC timeout
      loadFreeUsage();
    }
  }, [user]);

  const initializeIAP = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await iapService.initialize();
      const products = await iapService.getProducts();
      setState((s) => ({ ...s, products, loading: false }));
    } catch (e: any) {
      console.warn('IAP initialization failed:', e.message);
      // In development or when IAP is not available, continue without error
      setState((s) => ({
        ...s,
        loading: false,
        products: [],
        error: null, // Don't show error to user in development
      }));
    }
  };

  const loadFreeUsage = async () => {
    try {
      const json = await AsyncStorage.getItem('free_usage');
      if (json) setFreeUsage(JSON.parse(json));
      else {
        await AsyncStorage.setItem('free_usage', JSON.stringify(freeUsage));
      }
    } catch {
      /* ignore */
    }
  };

  const verifyWithBackend = async (purchase: PurchaseResult) => {
    await supabase.functions.invoke('verify_receipt', {
      body: {
        receipt: purchase.transactionReceipt,
        productId: purchase.productId,
        platform: Platform.OS,
        transactionId: purchase.transactionId,
      },
    });
  };

  const purchaseSubscription = async (productId: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await iapService.purchaseProduct(productId);
      await verifyWithBackend(result);
      setState((s) => ({
        ...s,
        isSubscribed: true,
        subscriptionType: productId.includes('yearly') ? 'yearly' : 'monthly',
        loading: false,
      }));
      Alert.alert('Success', 'Subscription activated!');
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e.message || 'Purchase failed',
      }));
      Alert.alert('Purchase failed', e.message || '');
    }
  };

  const restorePurchases = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const purchases = await iapService.restorePurchases();
      if (purchases.length) {
        const active =
          purchases.find((p) =>
            ['com.beautyscan.app.yearly', 'com.beautyscan.app.weekly'].includes(p.productId)
          ) || purchases[0];
        await verifyWithBackend(active);
        setState((s) => ({
          ...s,
          isSubscribed: true,
          subscriptionType: active.productId.includes('yearly') ? 'yearly' : 'monthly',
          loading: false,
        }));
        // loadSubscriptionStatus(); // Temporarily disabled - causes RPC timeout
        Alert.alert('Restored', 'Your subscription has been restored');
      } else {
        setState((s) => ({ ...s, loading: false }));
        Alert.alert('No purchases found', 'Please sign in with the account you purchased with');
      }
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e.message || 'Restore failed',
      }));
      Alert.alert('Restore failed', e.message || '');
    }
  };

  // Freemium logic
  const getRemainingFreeScans = () =>
    state.isSubscribed ? Infinity : FREE_LIMITS.scans - freeUsage.scans;
  const canAccessFeature = (f: string) =>
    state.isSubscribed || ['product_scan', 'routine_generation', 'multiple_profiles'].includes(f);
  const incrementFreeUsage = async (f: string) => {
    if (state.isSubscribed) return;
    const next = { ...freeUsage };
    if (f === 'product_scan') next.scans++;
    if (f === 'routine_generation') next.routines++;
    if (f === 'multiple_profiles') next.profiles++;
    setFreeUsage(next);
    await AsyncStorage.setItem('free_usage', JSON.stringify(next));
  };

  const value: SubscriptionContextValue = {
    ...state,
    purchaseSubscription,
    restorePurchases,
    initializeIAP,
    getRemainingFreeScans,
    canAccessFeature,
    incrementFreeUsage,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be inside SubscriptionProvider');
  return ctx;
}
