import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Text } from '../ui/text';
import { Button } from '@/components/ui/button';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';

export function WelcomeScreen() {
  // No automatic redirection logic - handled by main app index now

  const onSignIn = useCallback(() => {
    router.push('/auth?mode=signin');
  }, []);

  return (
    <View className="flex-1">
      {/* Full screen background image */}
      <Image
        source={{
          uri: 'https://res.cloudinary.com/josephine19001/image/upload/v1756914155/LunaSync/Main_Welcome_screen_ltuh35.png',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        contentFit="contain"
        contentPosition="top"
      />

      {/* Light overlay for better image visibility */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Content */}
      <View className="flex-1 justify-end">
        {/* Solid bottom container with rounded top corners - extends to screen bottom */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 50, // Account for home indicator
          }}
        >
          <Animated.View entering={FadeIn.delay(300).duration(800)}>
            <Text className="text-5xl font-bold text-black mb-4 leading-tight">
              Your Health Journey
            </Text>
            <Text className="text-xl text-gray-700 mb-8 leading-relaxed">
              Track your period, nutrition, and workouts in sync with how you feel
            </Text>

            {/* Action buttons */}
            <View className="space-y-4">
              <Button
                title="Get Started"
                onPress={() => router.push('/onboarding')}
                variant="primary"
                size="large"
                className="bg-pink-500"
              />
              <TouchableOpacity onPress={onSignIn} className="py-3">
                <Text className="text-gray-700 text-center text-base">
                  Part of the community? <Text className="font-semibold text-black">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
