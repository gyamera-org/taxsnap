import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_URLS } from '@/lib/config/urls';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInRight,
  FadeOutLeft,
  FadeInDown,
} from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Check, Sparkles, Shield, Zap, Star } from 'lucide-react-native';
import * as StoreReview from 'expo-store-review';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppleIcon } from '@/components/icons/tab-icons';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';

type Step = 'slide1' | 'slide2' | 'slide3' | 'rating' | 'signup';

interface SlideProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  isFirst?: boolean;
  colors: ReturnType<typeof useThemedColors>;
}

function OnboardingSlide({
  icon,
  title,
  subtitle,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isFirst,
  colors,
}: SlideProps) {
  return (
    <Animated.View
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      style={[styles.slideContainer, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button and progress */}
        <View style={styles.header}>
          {!isFirst ? (
            <Pressable
              onPress={onBack}
              style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
            >
              <ChevronLeft size={20} color={colors.primary} />
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  { backgroundColor: colors.border },
                  index < currentStep && { backgroundColor: colors.primary },
                  index === currentStep - 1 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View
            entering={FadeIn.delay(100).duration(500)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              {icon}
            </View>

            {/* Title */}
            <Animated.Text
              entering={FadeInUp.delay(200).duration(500)}
              style={[styles.title, { color: colors.text }]}
            >
              {title}
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInUp.delay(300).duration(500)}
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {subtitle}
            </Animated.Text>
          </Animated.View>
        </View>

        {/* Next button */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.footer}>
          <Pressable
            onPress={onNext}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ChevronRight size={20} color="#ffffff" />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { signInWithApple, loading: authLoading } = useAuth();
  const colors = useThemedColors();
  const { isDark } = useTheme();

  const [step, setStep] = useState<Step>('slide1');
  const [appleLoading, setAppleLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  const isLoading = authLoading || appleLoading;

  const steps: Step[] = ['slide1', 'slide2', 'slide3', 'rating', 'signup'];

  const goBack = () => {
    const i = steps.indexOf(step);
    if (i > 0) {
      setStep(steps[i - 1]);
    } else {
      router.back();
    }
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const i = steps.indexOf(step);
    if (i < steps.length - 1) {
      setStep(steps[i + 1]);
    }
  };

  const handleAppleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleRateApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRatingLoading(true);
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.error('Rating error:', error);
    } finally {
      setRatingLoading(false);
      goNext();
    }
  };

  const handleSkipRating = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goNext();
  };

  const renderStep = () => {
    switch (step) {
      case 'slide1':
        return (
          <OnboardingSlide
            icon={<Sparkles size={32} color="#ffffff" />}
            title="Welcome to Your App"
            subtitle="Discover amazing features designed just for you."
            currentStep={1}
            totalSteps={3}
            onNext={goNext}
            onBack={goBack}
            isFirst
            colors={colors}
          />
        );

      case 'slide2':
        return (
          <OnboardingSlide
            icon={<Zap size={32} color="#ffffff" />}
            title="Fast & Simple"
            subtitle="Get things done quickly with our intuitive interface."
            currentStep={2}
            totalSteps={3}
            onNext={goNext}
            onBack={goBack}
            colors={colors}
          />
        );

      case 'slide3':
        return (
          <OnboardingSlide
            icon={<Shield size={32} color="#ffffff" />}
            title="Secure & Private"
            subtitle="Your data is protected with industry-leading security."
            currentStep={3}
            totalSteps={3}
            onNext={goNext}
            onBack={goBack}
            colors={colors}
          />
        );

      case 'rating':
        return (
          <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(300)}
            style={[styles.slideContainer, { backgroundColor: colors.background }]}
          >
            <SafeAreaView style={styles.safeArea}>
              {/* Header with back button */}
              <View style={styles.headerSimple}>
                <Pressable
                  onPress={goBack}
                  style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
                >
                  <ChevronLeft size={20} color={colors.primary} />
                </Pressable>
              </View>

              <View style={styles.content}>
                <Animated.View
                  entering={FadeIn.delay(100).duration(500)}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  {/* Star icon */}
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                    <Star size={32} color="#ffffff" fill="#ffffff" />
                  </View>

                  <Animated.Text
                    entering={FadeInUp.delay(200).duration(500)}
                    style={[styles.title, { color: colors.text }]}
                  >
                    Enjoying the app?
                  </Animated.Text>

                  <Animated.Text
                    entering={FadeInUp.delay(300).duration(500)}
                    style={[styles.subtitle, { color: colors.textSecondary }]}
                  >
                    Your feedback helps us improve. Would you like to rate us on the App Store?
                  </Animated.Text>
                </Animated.View>

                {/* Rating buttons */}
                <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.ratingButtonsContainer}>
                  <Pressable
                    onPress={handleRateApp}
                    disabled={ratingLoading}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: colors.primary },
                      ratingLoading && { opacity: 0.7 },
                    ]}
                  >
                    {ratingLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Star size={20} color="#ffffff" fill="#ffffff" />
                        <Text style={[styles.buttonText, { marginLeft: 8, marginRight: 0 }]}>Rate App</Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={handleSkipRating}
                    style={[styles.skipButton, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Maybe Later</Text>
                  </Pressable>
                </Animated.View>
              </View>
            </SafeAreaView>
          </Animated.View>
        );

      case 'signup':
        return (
          <Animated.View
            entering={FadeInRight.duration(300)}
            style={[styles.slideContainer, { backgroundColor: colors.background }]}
          >
            <SafeAreaView style={styles.safeArea}>
              {/* Back button */}
              <View style={styles.headerSimple}>
                <Pressable
                  onPress={goBack}
                  style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
                >
                  <ChevronLeft size={20} color={colors.primary} />
                </Pressable>
              </View>

              <View style={styles.content}>
                {/* Card */}
                <Animated.View
                  entering={FadeIn.delay(100).duration(500)}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  {/* Success icon */}
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                    <Check size={32} color="#ffffff" />
                  </View>

                  <Animated.Text
                    entering={FadeInUp.delay(200).duration(500)}
                    style={[styles.title, { color: colors.text }]}
                  >
                    You're all set!
                  </Animated.Text>

                  <Animated.Text
                    entering={FadeInUp.delay(300).duration(500)}
                    style={[styles.subtitle, { color: colors.textSecondary }]}
                  >
                    Create an account to get started.
                  </Animated.Text>
                </Animated.View>

                {/* Apple Sign In Button */}
                <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.authButtonContainer}>
                  {Platform.OS === 'ios' && (
                    <Pressable
                      onPress={handleAppleAuth}
                      disabled={isLoading}
                      style={[
                        styles.appleButton,
                        { backgroundColor: colors.primary },
                        isLoading && { opacity: 0.7 },
                      ]}
                    >
                      {appleLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <AppleIcon size={20} color="#fff" />
                          <Text style={styles.appleButtonText}>Continue with Apple</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </Animated.View>
              </View>

              <Animated.View entering={FadeIn.delay(500).duration(500)} style={styles.termsContainer}>
                <Text style={[styles.termsText, { color: colors.textMuted }]}>
                  By continuing, you agree to our{' '}
                  <Text
                    style={[styles.termsLink, { color: colors.primary }]}
                    onPress={() => Linking.openURL(APP_URLS.terms)}
                  >
                    Terms
                  </Text>
                  {' & '}
                  <Text
                    style={[styles.termsLink, { color: colors.primary }]}
                    onPress={() => Linking.openURL(APP_URLS.privacy)}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </Animated.View>
            </SafeAreaView>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerSimple: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  authButtonContainer: {
    marginTop: 24,
  },
  ratingButtonsContainer: {
    marginTop: 24,
    gap: 12,
  },
  skipButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  termsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: '500',
  },
});
