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
        handleUserSession(session.user.id);
      } else {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsReady, authLoading, session]);

  const handleUserSession = async (userId: string) => {
    try {
      await SplashScreen.hideAsync();

      if (!user) {
        router.replace('/');
        return;
      }

      if (user) {
        router.replace('/(tabs)/nutrition');
      } else {
        router.replace('/');
      }
    } catch (error) {
      await SplashScreen.hideAsync();
      router.replace('/');
    }
  };

  if (!fontsReady || authLoading) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <WelcomeScreen />
    </View>
  );
}
