import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { useAuth } from '@/context/auth-provider';
import { useTranslation } from 'react-i18next';

export default function AuthCallback() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [authComplete, setAuthComplete] = useState(false);
  const { user } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useRevenueCat();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  // Wait for subscription status to load before navigating
  useEffect(() => {
    if (!authComplete || !user) return;

    // Wait until subscription loading is complete
    if (subscriptionLoading) return;

    // Now we know subscription status - route accordingly
    if (isSubscribed) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/paywall');
    }
  }, [authComplete, user, subscriptionLoading, isSubscribed]);

  const handleAuthCallback = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        toast.error(t('authToasts.authFailed'));
        router.replace('/auth?mode=signin');
        return;
      }

      if (data.session?.user) {
        // Mark auth as complete, navigation will happen via useEffect above
        setAuthComplete(true);
      } else {
        router.replace('/auth?mode=signin');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      toast.error(t('authToasts.authFailed'));
      router.replace('/auth?mode=signin');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0D9488" />
      <Text className="mt-4 text-slate-600">
        {isProcessing ? t('authToasts.completingSignIn') : t('common.loading')}
      </Text>
    </View>
  );
}
