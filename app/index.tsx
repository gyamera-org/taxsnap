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

  useEffect(() => {
    if (!appIsReady || authLoading || subscriptionLoading) {
      return;
    }

    if (user) {
      if (!isSubscribed) {
        router.replace('/paywall');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [appIsReady, user, authLoading, subscriptionLoading, isSubscribed]);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady && !authLoading && !subscriptionLoading) {
      SplashScreen.hide();
    }
  }, [appIsReady, authLoading, subscriptionLoading]);

  if (!appIsReady || authLoading || subscriptionLoading) {
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

  // User exists -> show loader while navigating
  return (
    <View
      className="flex-1 bg-[#0F0F0F] items-center justify-center"
      onLayout={onLayoutRootView}
    >
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}
