import { useEffect } from 'react';
import { View } from 'react-native';

import * as SplashScreen from 'expo-splash-screen';
import { WelcomeScreen } from '@/components/screens';
import { useAuth } from '@/context/auth-provider';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      SplashScreen.hideAsync();
    }
  }, [authLoading]);

  if (authLoading) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <WelcomeScreen />
    </View>
  );
}
