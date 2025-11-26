import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@debt_free_onboarding_complete';

export default function Index() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useRevenueCat();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // Wait for all loading states to complete
    if (authLoading || subscriptionLoading || checkingOnboarding) {
      return;
    }

    navigateToAppropriateScreen();
  }, [user, authLoading, subscriptionLoading, isSubscribed, checkingOnboarding, hasSeenOnboarding]);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const navigateToAppropriateScreen = () => {
    // Case 1: User not logged in and hasn't seen onboarding -> Welcome screen
    if (!user && !hasSeenOnboarding) {
      router.replace('/welcome');
      return;
    }

    // Case 2: User not logged in but has seen onboarding -> Auth screen
    if (!user && hasSeenOnboarding) {
      router.replace('/auth?mode=signin');
      return;
    }

    // Case 3: User logged in but not subscribed -> Paywall
    // Note: You can adjust this logic based on your business model
    // Currently showing paywall for non-subscribers after login
    if (user && !isSubscribed) {
      // Check if they've completed a trial or should see paywall
      // For now, let them into the app (soft paywall approach)
      router.replace('/(tabs)/home');
      return;
    }

    // Case 4: User logged in and subscribed -> Home
    if (user && isSubscribed) {
      router.replace('/(tabs)/home');
      return;
    }

    // Default: Go to home
    router.replace('/(tabs)/home');
  };

  // Show loading indicator while checking states
  return (
    <View className="flex-1 bg-[#0F0F0F] items-center justify-center">
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}

// Helper function to mark onboarding as complete (call this after signup)
export const markOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
  }
};

// Helper function to reset onboarding (useful for testing)
export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};
