import { View, ActivityIndicator, Dimensions, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text } from '../ui/text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import {
  Sparkles,
  Heart,
  Shield,
  ScanLine,
  Apple,
  Dumbbell,
  Moon,
  Flower2,
  Droplets,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

function IconBackground({ children }: { children: React.ReactNode }) {
  const sparklesOpacity = useSharedValue(0.4);
  const sparkles2X = useSharedValue(0);
  const heartScale = useSharedValue(1);
  const moonRotation = useSharedValue(0);
  const flowerY = useSharedValue(-30);
  const appleOpacity = useSharedValue(0.3);
  const appleScale = useSharedValue(1);
  const dumbbellRotation = useSharedValue(0);
  const dropletsScale = useSharedValue(1);
  const dropletsY = useSharedValue(0);

  useEffect(() => {
    // Gentle sparkles fade
    sparklesOpacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 4000 }), withTiming(0.4, { duration: 4000 })),
      -1,
      true
    );

    // Second sparkles horizontal movement
    sparkles2X.value = withRepeat(
      withSequence(withTiming(30, { duration: 7000 }), withTiming(-30, { duration: 7000 })),
      -1,
      true
    );

    // Gentle heart pulse
    heartScale.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 3500 }), withTiming(1, { duration: 3500 })),
      -1,
      true
    );

    // Slow moon rotation
    moonRotation.value = withRepeat(withTiming(360, { duration: 15000 }), -1, false);

    // Gentle flower float
    flowerY.value = withRepeat(
      withSequence(withTiming(height * 0.25, { duration: 6000 }), withTiming(-30, { duration: 0 })),
      -1,
      false
    );

    // Apple gentle fade and scale
    appleOpacity.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 5000 }), withTiming(0.3, { duration: 5000 })),
      -1,
      true
    );

    appleScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 4000 }), withTiming(1, { duration: 4000 })),
      -1,
      true
    );

    // Dumbbell gentle rotation
    dumbbellRotation.value = withRepeat(withTiming(360, { duration: 12000 }), -1, false);

    // Droplets gentle scale and vertical movement
    dropletsScale.value = withRepeat(
      withSequence(withTiming(1.2, { duration: 4500 }), withTiming(1, { duration: 4500 })),
      -1,
      true
    );

    dropletsY.value = withRepeat(
      withSequence(withTiming(-20, { duration: 5500 }), withTiming(20, { duration: 5500 })),
      -1,
      true
    );
  }, []);

  const sparklesStyle = useAnimatedStyle(() => ({
    opacity: sparklesOpacity.value,
  }));

  const sparkles2Style = useAnimatedStyle(() => ({
    opacity: sparklesOpacity.value,
    transform: [{ translateX: sparkles2X.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${moonRotation.value}deg` }],
  }));

  const flowerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: flowerY.value }],
  }));

  const appleStyle = useAnimatedStyle(() => ({
    opacity: appleOpacity.value,
    transform: [{ scale: appleScale.value }],
  }));

  const dumbbellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dumbbellRotation.value}deg` }],
  }));

  const dropletsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dropletsScale.value }, { translateY: dropletsY.value }],
  }));

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460'] as [string, string, ...string[]]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />

      {/* Floating wellness icons */}
      <Animated.View style={[{ position: 'absolute', top: 120, right: 40 }, sparklesStyle]}>
        <Sparkles size={35} color="#FFD700" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 180, left: 25 }, heartStyle]}>
        <Heart size={32} color="#FF69B4" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 140, right: 90 }, moonStyle]}>
        <Moon size={28} color="#E0E7FF" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 280, left: 50 }, flowerStyle]}>
        <Flower2 size={30} color="#F472B6" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 320, right: 30 }, appleStyle]}>
        <Apple size={32} color="#10B981" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', bottom: 280, left: 35 }, dumbbellStyle]}>
        <Dumbbell size={28} color="#8B5CF6" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', bottom: 240, right: 50 }, dropletsStyle]}>
        <Droplets size={26} color="#3B82F6" />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', bottom: 180, left: 70 }, sparkles2Style]}>
        <Sparkles size={22} color="#FFA500" />
      </Animated.View>

      {children}
    </View>
  );
}

export function WelcomeScreen() {
  const { user, loading } = useAuth();
  const { offerings, loading: revenueCatLoading } = useRevenueCat();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/nutrition');
    }
  }, [user, loading]);

  console.log('offerings', offerings);

  const onYearlySubscription = useCallback(() => {
    router.push('/onboarding?plan=yearly');
  }, []);

  const onMonthlySubscription = useCallback(() => {
    router.push('/onboarding?plan=monthly');
  }, []);

  // Get packages from offerings state
  const yearlyPackage =
    offerings?.current?.availablePackages?.find(
      (pkg: PurchasesPackage) =>
        pkg.packageType === 'ANNUAL' ||
        pkg.identifier.includes('annual') ||
        pkg.identifier.includes('yearly') ||
        pkg.product.identifier.includes('yearly')
    ) || null;

  const monthlyPackage =
    offerings?.current?.availablePackages?.find(
      (pkg: PurchasesPackage) =>
        pkg.packageType === 'MONTHLY' ||
        pkg.identifier.includes('monthly') ||
        pkg.product.identifier.includes('monthly')
    ) || null;

  // Helper function to format price
  const formatPrice = (pkg: PurchasesPackage | null, isYearly: boolean = false) => {
    console.log('pkg', pkg);

    if (!pkg) return isYearly ? '$1.67/month' : '$2.99';

    const price = pkg.product.priceString;
    if (isYearly && pkg.product.price) {
      // Calculate monthly equivalent for yearly plan
      const yearlyPrice = pkg.product.price;
      const monthlyEquivalent = (yearlyPrice / 12).toFixed(2);
      return `$${monthlyEquivalent}/month`;
    }
    return price;
  };

  const onSignIn = useCallback(() => {
    router.push('/auth?mode=signin');
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="mt-4 text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (user) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="mt-4 text-white">Redirecting...</Text>
      </SafeAreaView>
    );
  }

  return (
    <IconBackground>
      <SafeAreaView className="flex-1 justify-between">
        {/* Main headline positioned in the center */}
        <Animated.View
          className="flex-1 px-6 items-center justify-center"
          entering={FadeIn.delay(500).duration(1000)}
        >
          <Animated.View className="items-center">
            <Animated.Text
              className="text-6xl font-bold text-white text-center leading-tight mb-6"
              entering={SlideInUp.delay(800).duration(800)}
            >
              Aurae
            </Animated.Text>
            <Animated.Text
              className="text-3xl text-white text-center leading-relaxed font-light mb-4"
              entering={SlideInUp.delay(1000).duration(800)}
            >
              You're doing amazing, beautiful
            </Animated.Text>
            <Animated.Text
              className="text-lg text-white/80 text-center leading-relaxed"
              entering={SlideInUp.delay(1200).duration(800)}
            >
              Let's work with your hormones, not against them
            </Animated.Text>
          </Animated.View>
        </Animated.View>

        {/* Bottom section with simple get started button */}
        <Animated.View className="px-6 pb-8" entering={SlideInUp.delay(1500).duration(800)}>
          <Animated.View entering={FadeIn.delay(1800).duration(600)}>
            <Button
              title="Get Started"
              onPress={() => router.push('/onboarding')}
              variant="primary"
              size="large"
            />
          </Animated.View>

          <Animated.View
            className="flex-row items-center justify-center mt-4"
            entering={FadeIn.delay(2000).duration(600)}
          >
            <Text className="text-white/80 text-sm">Already have an account? </Text>
            <Text onPress={onSignIn} className="text-pink-300 text-sm font-bold underline">
              Sign In
            </Text>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </IconBackground>
  );
}
