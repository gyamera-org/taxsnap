import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_WIDTH = SCREEN_WIDTH * 0.7;
const FRAME_HEIGHT = FRAME_WIDTH * 2.1;

type WelcomeStep = 0 | 1 | 2;

export function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WelcomeStep>(0);

  const handleContinue = useCallback(() => {
    if (currentStep < 2) {
      setCurrentStep((prev) => (prev + 1) as WelcomeStep);
    } else {
      router.push('/onboarding');
    }
  }, [currentStep, router]);

  const handleSignIn = () => {
    router.push('/auth?mode=signin');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep0 />;
      case 1:
        return <WelcomeStep1 />;
      case 2:
        return <WelcomeStep2 />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient - same as app */}
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Step Content */}
          <View style={styles.stepContainer}>{renderStep()}</View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Continue Button */}
            <Pressable onPress={handleContinue} style={styles.continueButton}>
              <LinearGradient
                colors={['#14B8A6', '#0D9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.continueButtonText}>
                  {t('welcomeFlow.continue')}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Sign In Link - Only on first step */}
            {currentStep === 0 && (
              <Animated.View entering={FadeIn.delay(600).duration(400)}>
                <Pressable onPress={handleSignIn} style={styles.signInButton}>
                  <Text style={styles.signInText}>
                    {t('welcome.alreadyHaveAccount')}{' '}
                    <Text style={styles.signInLink}>{t('welcome.signIn')}</Text>
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Step 0: Your next healthy meal starts with a photo
function WelcomeStep0() {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.valuePropsStep}
    >
      <Animated.View
        entering={FadeIn.delay(200).duration(400)}
        style={styles.iconContainer}
      >
        <FastImage
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logoIcon}
          resizeMode={FastImage.resizeMode.contain}
        />
      </Animated.View>
      <Animated.Text
        entering={FadeIn.delay(300).duration(400)}
        style={styles.valuePropTitle}
      >
        {t('welcomeFlow.step1.title')}
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(400).duration(400)}
        style={styles.valuePropSubtitle}
      >
        {t('welcomeFlow.step1.subtitle')}
      </Animated.Text>
    </Animated.View>
  );
}

// Step 1: Just snap a pic of your food
function WelcomeStep1() {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={SlideInRight.duration(400)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.mockupStep}
    >
      <Animated.Text
        entering={FadeIn.delay(100).duration(400)}
        style={styles.mockupTitle}
      >
        {t('welcomeFlow.step2.title')}
      </Animated.Text>

      <Animated.View
        entering={FadeIn.delay(200).duration(500)}
        style={styles.phoneFrame}
      >
        <View style={styles.dynamicIsland} />
        <View style={styles.screenContainer}>
          <FastImage
            source={require('@/assets/images/demo-scan.jpg')}
            style={styles.mockupImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
        <View style={styles.homeIndicator} />
      </Animated.View>
    </Animated.View>
  );
}

// Step 2: And get PCOS-friendly insights
function WelcomeStep2() {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={SlideInRight.duration(400)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.mockupStep}
    >
      <Animated.Text
        entering={FadeIn.delay(100).duration(400)}
        style={styles.mockupTitle}
      >
        {t('welcomeFlow.step3.title')}
      </Animated.Text>

      <Animated.View
        entering={FadeIn.delay(200).duration(500)}
        style={styles.phoneFrame}
      >
        <View style={styles.dynamicIsland} />
        <View style={styles.screenContainer}>
          <FastImage
            source={require('@/assets/images/demo-result.jpg')}
            style={styles.mockupImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
        <View style={styles.homeIndicator} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Floating orbs
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

  // Step 0 - Value Prop
  valuePropsStep: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  iconContainer: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 48,
    height: 48,
  },
  valuePropTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 42,
  },
  valuePropSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 26,
    marginTop: 12,
  },

  // Steps 1 & 2 - Mockups
  mockupStep: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  mockupTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 36,
  },
  phoneFrame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.4)',
    borderRadius: 44,
    padding: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  dynamicIsland: {
    position: 'absolute',
    top: 12,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 22,
    backgroundColor: 'rgba(13, 148, 136, 0.3)',
    borderRadius: 12,
    zIndex: 10,
  },
  screenContainer: {
    flex: 1,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mockupImage: {
    width: '100%',
    height: '100%',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 4,
    backgroundColor: 'rgba(13, 148, 136, 0.4)',
    borderRadius: 2,
  },

  // Bottom Section
  bottomSection: {
    paddingBottom: 24,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinkText: {
    fontSize: 12,
    color: 'rgba(107, 114, 128, 0.8)',
  },
  footerDivider: {
    fontSize: 12,
    color: 'rgba(107, 114, 128, 0.5)',
    marginHorizontal: 8,
  },
  signInButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signInLink: {
    color: '#0D9488',
    fontWeight: '600',
  },
});
