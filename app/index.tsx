import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { WelcomeScreen } from '@/components/screens';
import { useAuth } from '@/context/auth-provider';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [fontsReady, setFontsReady] = useState(false);
  const { loading: authLoading, session, user } = useAuth();

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(Entypo.font);
        setFontsReady(true);
      } catch (e) {
        console.warn(e);
        setFontsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsReady && !authLoading) {
      if (session && session.user) {
        SplashScreen.hideAsync()
          .then(() => {
            router.replace('/(tabs)/explore');
          })
          .catch((error) => {
            console.error('Error hiding splash screen:', error);
            router.replace('/(tabs)/explore');
          });
      } else {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsReady, authLoading, session]);

  if (!fontsReady || authLoading) {
    return null;
  }

  // Show welcome screen for non-authenticated users
  return (
    <View style={{ flex: 1 }}>
      <WelcomeScreen />
    </View>
  );
}
