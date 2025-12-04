import { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PCOSLogo } from '@/components/icons/pcos-logo';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_WIDTH = SCREEN_WIDTH * 0.58;
const FRAME_HEIGHT = FRAME_WIDTH * 2.1;

export function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const scanOpacity = useSharedValue(1);
  const resultOpacity = useSharedValue(0);

  useEffect(() => {
    const fadeDuration = 1500;
    const holdDuration = 3500;

    scanOpacity.value = withDelay(
      holdDuration,
      withRepeat(
        withSequence(
          withTiming(0, { duration: fadeDuration, easing: Easing.inOut(Easing.ease) }),
          withDelay(
            holdDuration,
            withTiming(1, { duration: fadeDuration, easing: Easing.inOut(Easing.ease) })
          ),
          withDelay(holdDuration, withTiming(1, { duration: 0 }))
        ),
        -1,
        false
      )
    );

    resultOpacity.value = withDelay(
      holdDuration,
      withRepeat(
        withSequence(
          withTiming(1, { duration: fadeDuration, easing: Easing.inOut(Easing.ease) }),
          withDelay(
            holdDuration,
            withTiming(0, { duration: fadeDuration, easing: Easing.inOut(Easing.ease) })
          ),
          withDelay(holdDuration, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      )
    );
  }, []);

  const scanStyle = useAnimatedStyle(() => ({
    opacity: scanOpacity.value,
    position: 'absolute' as const,
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    position: 'absolute' as const,
  }));

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleSignIn = () => {
    router.push('/auth?mode=signin');
  };

  return (
    <View className="flex-1">
      {/* Background gradient */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs for liquid effect */}
      <Animated.View
        entering={FadeIn.delay(100).duration(1000)}
        style={[styles.orb, styles.orb1]}
      />
      <Animated.View
        entering={FadeIn.delay(200).duration(1000)}
        style={[styles.orb, styles.orb2]}
      />
      <Animated.View
        entering={FadeIn.delay(300).duration(1000)}
        style={[styles.orb, styles.orb3]}
      />
      <Animated.View
        entering={FadeIn.delay(400).duration(1000)}
        style={[styles.orb, styles.orb4]}
      />

      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* Demo Screenshots with Phone Frame */}
          <Animated.View
            entering={FadeIn.delay(100).duration(600)}
            className="items-center mt-4 mb-6"
            style={{ height: FRAME_HEIGHT + 20 }}
          >
            {/* Phone Frame with glass effect */}
            <View style={styles.phoneFrame}>
              {/* Dynamic Island / Notch */}
              <View style={styles.dynamicIsland} />

              {/* Screen Container */}
              <View style={styles.screenContainer}>
                {/* Scan Screenshot */}
                <Animated.View
                  style={[
                    {
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                    },
                    scanStyle,
                  ]}
                >
                  <Image
                    source={require('@/assets/images/demo-scan.png')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </Animated.View>

                {/* Result Screenshot */}
                <Animated.View
                  style={[
                    {
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                    },
                    resultStyle,
                  ]}
                >
                  <Image
                    source={require('@/assets/images/demo-result.png')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </Animated.View>
              </View>

              {/* Home Indicator */}
              <View style={styles.homeIndicator} />
            </View>
          </Animated.View>

          {/* Brand Section - Logo and Name on same line */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="flex-row items-center justify-center mb-3"
          >
            <View style={{ marginRight: 12 }}>
              <PCOSLogo size={44} color="#000000" textColor="#ffffff" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{t('welcome.appName')}</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.Text
            entering={FadeInUp.delay(500).duration(600)}
            className="text-base text-center px-4 mb-8 text-gray-600"
          >
            {t('welcome.tagline')}
          </Animated.Text>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Bottom Section with Actions */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)} className="pb-8">
            {/* Get Started Button */}
            <Pressable onPress={handleGetStarted} style={styles.primaryButton}>
              <LinearGradient
                colors={['#14B8A6', '#0D9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text className="text-white font-bold text-lg mr-2">{t('welcome.getStarted')}</Text>
                <ChevronRight size={20} color="#ffffff" />
              </LinearGradient>
            </Pressable>

            {/* Sign In Link - Glass style */}
            <Pressable onPress={handleSignIn} style={styles.signInButton}>
              <View style={styles.signInGlass}>
                <Text className="text-gray-600 text-center">
                  {t('welcome.alreadyHaveAccount')}{' '}
                  <Text className="text-teal-600 font-semibold">{t('welcome.signIn')}</Text>
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(20, 184, 166, 0.18)',
    top: -60,
    right: -60,
  },
  orb2: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    bottom: 150,
    left: -50,
  },
  orb3: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(94, 234, 212, 0.12)',
    top: '35%',
    right: -30,
  },
  orb4: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    bottom: 80,
    right: 20,
  },
  phoneFrame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    backgroundColor: '#1F2937',
    borderRadius: 40,
    padding: 6,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  dynamicIsland: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 20,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    zIndex: 10,
  },
  screenContainer: {
    flex: 1,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  signInGlass: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
  },
});
