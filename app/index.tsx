import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/context/auth-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { WelcomeScreen } from '@/components/screens';
import { isBypassActive } from '@/lib/config/dev-mode';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function Index() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useRevenueCat();

  // Check if all bypasses are active for quick dev mode routing
  const isFullDevMode =
    isBypassActive('AUTH') && isBypassActive('ONBOARDING') && isBypassActive('PAYWALL');

  useEffect(() => {
    setAppIsReady(true);
  }, []);

  // Determine if everything is loaded
  const isFullyLoaded = appIsReady && !authLoading && (!user || !subscriptionLoading);

  // Hide splash screen when all loading is complete
  useEffect(() => {
    if (isFullyLoaded) {
      SplashScreen.hide();
    }
  }, [isFullyLoaded]);

  // Backup: also hide on layout in case effect doesn't trigger
  const onLayoutRootView = useCallback(() => {
    if (isFullyLoaded) {
      SplashScreen.hide();
    }
  }, [isFullyLoaded]);

  // Handle routing when user and subscription status are known
  useEffect(() => {
    // In full dev mode, go straight to home
    if (isFullDevMode && appIsReady) {
      console.log('🔧 Full dev mode active - navigating directly to home');
      router.replace('/(tabs)/home');
      return;
    }

    if (!appIsReady || authLoading) {
      return;
    }

    // No user - don't wait for subscription loading
    if (!user) {
      return;
    }

    // User exists - wait for subscription status before routing
    if (subscriptionLoading) {
      return;
    }

    // Show paywall to non-subscribers (they can skip with "Continue for Free")
    if (!isSubscribed) {
      router.replace('/paywall');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [appIsReady, user, authLoading, subscriptionLoading, isSubscribed, isFullDevMode]);

  // Keep splash screen visible while loading
  if (!appIsReady || authLoading) {
    return null;
  }

  // For logged-in users: keep splash visible until subscription status is known
  // This prevents the paywall flash for subscribed users
  if (user && subscriptionLoading) {
    return null;
  }

  // No user -> show welcome screen
  if (!user) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <WelcomeScreen />
      </View>
    );
  }

  // User exists and subscription loaded -> show loader while navigating to home/paywall
  return (
    <View className="flex-1 bg-white items-center justify-center" onLayout={onLayoutRootView}>
      <ActivityIndicator size="large" color="#0D9488" />
    </View>
  );
}
