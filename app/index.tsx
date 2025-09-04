import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { WelcomeScreen } from '@/components/screens';
import { DefaultLoader } from '@/components/ui/default-loader';
import { useAuth } from '@/context/auth-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const {
    shouldShowPaywall,
    loading: revenueCatLoading,
    isSubscribed,
    isInGracePeriod,
  } = useRevenueCat();

  useEffect(() => {
    const navigate = async () => {
      await SplashScreen.hideAsync();

      if (user) {
        // if user exists but no active subscription, show paywall
        if (shouldShowPaywall) {
          router.replace('/paywall');
        } else {
          // if active subscription, go to nutrition page
          router.replace('/(tabs)/nutrition');
        }
      }
    };

    // Only navigate when not loading
    if (!authLoading && !revenueCatLoading) {
      navigate();
    }
  }, [user, authLoading, shouldShowPaywall, revenueCatLoading, isSubscribed, isInGracePeriod]);

  // if loading, show loading state
  if (authLoading || revenueCatLoading) {
    return <DefaultLoader />;
  }

  // if no user, show welcome page
  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        <WelcomeScreen />
      </View>
    );
  }

  // if user exists, show loader while determining route
  return <DefaultLoader />;
}
