import React, { createContext, useContext, ReactNode } from 'react';
import { router } from 'expo-router';
import { useRevenueCat } from './revenuecat-provider';

interface PaywallContextType {
  showPaywall: (options?: PaywallOptions) => void;
}

interface PaywallOptions {
  source?: 'grace_period' | 'feature_gate' | 'onboarding' | 'manual';
  feature?: string;
  title?: string;
  subtitle?: string;
  dismissible?: boolean;
  successRoute?: string; // Where to go after successful purchase
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export function PaywallProvider({ children }: { children: ReactNode }) {
  const { customerInfo } = useRevenueCat();

  const showPaywall = (options: PaywallOptions = {}) => {
    // Don't show paywall if user is already subscribed
    if (
      customerInfo?.entitlements.active &&
      Object.keys(customerInfo.entitlements.active).length > 0
    ) {
      return;
    }

    // Build query params for the paywall screen
    const params = new URLSearchParams();

    if (options.source) params.append('source', options.source);
    if (options.feature) params.append('feature', options.feature);
    if (options.title) params.append('title', options.title);
    if (options.subtitle) params.append('subtitle', options.subtitle);
    if (options.dismissible !== undefined)
      params.append('dismissible', options.dismissible.toString());
    if (options.successRoute) params.append('successRoute', options.successRoute);

    // Navigate to paywall screen
    const paywallUrl = `/paywall${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(paywallUrl as any);
  };

  const value = {
    showPaywall,
  };

  return <PaywallContext.Provider value={value}>{children}</PaywallContext.Provider>;
}

export function usePaywall(): PaywallContextType {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
}
