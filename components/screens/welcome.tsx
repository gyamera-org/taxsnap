import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Text } from '../ui/text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { DefaultLoader } from '@/components/ui/default-loader';

export function WelcomeScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/nutrition');
    }
  }, [user, loading]);

  const onSignIn = useCallback(() => {
    router.push('/auth?mode=signin');
  }, []);

  if (loading) {
    return <DefaultLoader />;
  }

  if (user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text className="mt-4 text-gray-700">Redirecting...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-pink-500">
      <SafeAreaView className="flex-1 justify-center items-center px-8">
        {/* App name */}
        <Animated.View className="items-center mb-20" entering={FadeIn.delay(300).duration(1000)}>
          <Animated.Text
            className="text-6xl font-bold text-white mb-2"
            entering={SlideInUp.delay(500).duration(800)}
          >
            LunaSync
          </Animated.Text>
        </Animated.View>

        {/* Connected elements with flowing design */}
        <View className="items-center mb-32 relative">
          {/* Background flowing connections */}
          <Animated.View className="absolute inset-0" entering={FadeIn.delay(1400).duration(1500)}>
            <Svg
              height="320"
              width="350"
              style={{ position: 'absolute', top: -20, left: '50%', marginLeft: -175 }}
            >
              {/* Flowing organic connections around nutrition */}
              <Path
                d="M175 40 Q130 65 140 95 Q150 120 175 125 Q200 120 210 95 Q220 65 175 40"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Central cycle connection */}
              <Path
                d="M175 125 Q120 150 135 185 Q150 210 175 215 Q200 210 215 185 Q230 150 175 125"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />

              {/* Workouts connection */}
              <Path
                d="M175 215 Q130 240 140 270 Q150 295 175 300 Q200 295 210 270 Q220 240 175 215"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Side flowing connections */}
              <Path
                d="M100 120 Q140 140 175 160 Q210 140 250 120"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />

              <Path
                d="M90 180 Q130 200 175 200 Q220 200 260 180"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>

          {/* Nutrition */}
          <Animated.Text
            className="text-2xl font-light text-white mb-4 z-10 relative"
            entering={SlideInUp.delay(800).duration(600)}
          >
            Nutrition
          </Animated.Text>

          {/* Cycle - center */}
          <Animated.Text
            className="text-4xl font-bold text-white my-8 z-10 relative"
            entering={SlideInUp.delay(1000).duration(600)}
          >
            • Cycle •
          </Animated.Text>

          {/* Workouts */}
          <Animated.Text
            className="text-2xl font-light text-white mt-4 mb-8 z-10 relative"
            entering={SlideInUp.delay(1200).duration(600)}
          >
            Workouts
          </Animated.Text>

          {/* AI transformation message */}
          <Animated.Text
            className="text-lg text-white/90 text-center leading-relaxed px-4 font-light z-10 relative"
            entering={FadeIn.delay(2000).duration(1200)}
          >
            Connected by AI
          </Animated.Text>
        </View>
        {/* Clean CTA - positioned at bottom */}
        <View className="absolute bottom-12 left-6 right-6">
          <Animated.View entering={SlideInUp.delay(2200).duration(800)}>
            <Button
              title="Get Started"
              onPress={() => router.push('/onboarding')}
              variant="secondary"
              size="large"
              className="mb-6 bg-white text-pink-600"
            />

            <Animated.View
              className="flex-row items-center justify-center"
              entering={FadeIn.delay(2400).duration(600)}
            >
              <Text className="text-white/80 text-base">Already have an account? </Text>
              <Text onPress={onSignIn} className="text-white text-base font-semibold">
                Sign In
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
