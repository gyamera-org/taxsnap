import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/context/auth-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { WelcomeScreen } from '@/components/screens';

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

  useEffect(() => {
    async function prepare() {
      try {
        // Preload fonts or make necessary API calls here
        // Example: await Font.loadAsync({ ... });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Hide splash screen when auth loading is complete
  const onLayoutRootView = useCallback(() => {
    if (appIsReady && !authLoading) {
      SplashScreen.hide();
    }
  }, [appIsReady, authLoading]);

  // Handle routing when user and subscription status are known
  useEffect(() => {
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
  }, [appIsReady, user, authLoading, subscriptionLoading, isSubscribed]);

  // Only wait for auth loading initially
  if (!appIsReady || authLoading) {
    return null;
  }

  // If user exists but subscription is still loading, show loader
  if (user && subscriptionLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center" onLayout={onLayoutRootView}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  // No user -> show welcome screen
  if (!user) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <WelcomeScreen />
      </View>
    );
  }

  // User exists -> show loader while navigating
  return (
    <View className="flex-1 bg-white items-center justify-center" onLayout={onLayoutRootView}>
      <ActivityIndicator size="large" color="#0D9488" />
    </View>
  );
}
