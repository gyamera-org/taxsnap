import { View, ActivityIndicator, Dimensions, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text } from '../ui/text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

function VideoBackground({
  videoSource,
  children,
}: {
  videoSource: any;
  children: React.ReactNode;
}) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoOpacity = useSharedValue(0);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
    setIsVideoLoaded(true);
    videoOpacity.value = withTiming(1, { duration: 1000 });
  });

  const videoStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  return (
    <View className="flex-1">
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          },
          videoStyle,
        ]}
      >
        <VideoView
          style={{
            width,
            height,
          }}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
      </Animated.View>
      <View className="flex-1 bg-black/40">{children}</View>
    </View>
  );
}

export function WelcomeScreen() {
  const { user, loading } = useAuth();
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const fullAnswerText = "We'll Tell You 😉";

  useEffect(() => {
    // Start typing effect after a delay
    const timer = setTimeout(() => {
      setShowTyping(true);
      setShowCursor(true);
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex <= fullAnswerText.length) {
          setTypedText(fullAnswerText.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          // Stop cursor blinking after typing is done
          setTimeout(() => setShowCursor(false), 1000);
        }
      }, 80); // 80ms per character for natural typing speed

      return () => clearInterval(typeInterval);
    }, 1200); // Delay before typing starts

    return () => clearTimeout(timer);
  }, []);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [showCursor]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/explore');
    }
  }, [user, loading]);

  const onGetStarted = useCallback(() => {
    router.replace('/onboarding');
  }, []);

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
    <VideoBackground videoSource={require('@/assets/onboarding/example.mp4')}>
      <SafeAreaView className="flex-1 justify-between">
        {/* Main headline positioned at left top */}
        <Animated.View
          className="px-8 pt-12 items-start"
          entering={FadeIn.delay(500).duration(1000)}
        >
          <Animated.Text
            className="text-6xl font-bold text-white text-left leading-tight"
            entering={SlideInUp.delay(800).duration(800)}
          >
            What's In{'\n'}That Beauty Product?
          </Animated.Text>

          {showTyping && (
            <Animated.View className="mt-5" entering={FadeIn.delay(200).duration(600)}>
              <RNText className="text-3xl font-semibold text-white text-left leading-10">
                {typedText}
                {showCursor && <RNText className="text-white text-3xl">|</RNText>}
              </RNText>
            </Animated.View>
          )}
        </Animated.View>

        {/* Bottom section with buttons */}
        <Animated.View className="px-8 pb-12" entering={SlideInUp.delay(1500).duration(800)}>
          <Animated.View entering={FadeIn.delay(1800).duration(600)}>
            <Button
              title="Get Started"
              onPress={onGetStarted}
              variant="primary"
              size="large"
              className="mb-4"
            />
          </Animated.View>

          <Animated.View
            className="flex-row items-center justify-center mt-4"
            entering={FadeIn.delay(2000).duration(600)}
          >
            <Text className="text-white/80 text-base">Already have an account? </Text>
            <Text onPress={onSignIn} className="text-pink-300 text-base font-bold underline">
              Sign In
            </Text>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </VideoBackground>
  );
}
