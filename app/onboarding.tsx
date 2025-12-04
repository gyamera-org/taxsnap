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
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { PCOSLogo } from '@/components/icons/pcos-logo';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppleIcon } from '@/components/icons/tab-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  GoalStep,
  SymptomsStep,
  StrugglesStep,
  FoodRelationshipStep,
  FavoriteFoodsStep,
  ActivityStep,
  PersonalizedStep,
  ReviewStep,
} from '@/components/onboarding/steps';
import { useOnboarding } from '@/context/onboarding-provider';
import { useTranslation } from 'react-i18next';

type Step =
  | 'welcome'
  | 'goal'
  | 'symptoms'
  | 'struggles'
  | 'food-relationship'
  | 'favorite-foods'
  | 'activity'
  | 'personalized'
  | 'review'
  | 'signup';

export default function OnboardingScreen() {
  const router = useRouter();
  const { signInWithApple, loading: authLoading } = useAuth();
  const { data: onboardingData, resetData } = useOnboarding();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('welcome');
  const [appleLoading, setAppleLoading] = useState(false);

  const isLoading = authLoading || appleLoading;

  const steps: Step[] = [
    'welcome',
    'goal',
    'symptoms',
    'struggles',
    'food-relationship',
    'favorite-foods',
    'activity',
    'personalized',
    'review',
    'signup',
  ];
  const currentIndex = steps.indexOf(step);
  const totalSteps = steps.length - 3; // Exclude welcome, review and signup from count

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

  const goToStep = (targetStep: Step) => {
    setStep(targetStep);
  };

  const handleAppleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Re-enable Apple auth and save onboarding data
    // setAppleLoading(true);
    // try {
    //   await signInWithApple();
    //   // Save onboarding preferences to database here
    // } catch (error) {
    //   console.error('Apple auth error:', error);
    // } finally {
    //   setAppleLoading(false);
    // }
    router.replace('/(tabs)/home');
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(300)}
            className="flex-1"
          >
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

            <SafeAreaView className="flex-1">
              <View className="flex-1 px-6 justify-center items-center">
                {/* Glass card container */}
                <Animated.View
                  entering={FadeIn.delay(200).duration(600)}
                  style={styles.glassCard}
                >
                  <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                    {/* App Logo */}
                    <View style={styles.logoContainer}>
                      <PCOSLogo size={72} color="#0D9488" textColor="#ffffff" />
                    </View>

                    {/* Title */}
                    <Animated.Text
                      entering={FadeInUp.delay(300).duration(600)}
                      className="text-gray-900 text-2xl font-bold text-center mb-3"
                    >
                      {t('onboarding.welcome.title')}
                    </Animated.Text>

                    {/* Subtitle */}
                    <Animated.Text
                      entering={FadeInUp.delay(400).duration(600)}
                      className="text-gray-600 text-base text-center leading-relaxed"
                    >
                      {t('onboarding.welcome.subtitle')}
                    </Animated.Text>

                    {/* Feature pills */}
                    <Animated.View
                      entering={FadeInUp.delay(500).duration(500)}
                      className="flex-row flex-wrap justify-center mt-6 gap-2"
                    >
                      {[
                        t('welcome.featurePills.personalized'),
                        t('welcome.featurePills.scienceBacked'),
                        t('welcome.featurePills.twoMin')
                      ].map((pill, index) => (
                        <View
                          key={pill}
                          style={styles.featurePill}
                        >
                          <Text className="text-teal-700 text-xs font-medium">{pill}</Text>
                        </View>
                      ))}
                    </Animated.View>
                  </BlurView>
                </Animated.View>
              </View>

              {/* Start button */}
              <Animated.View
                entering={FadeInDown.delay(600).duration(500)}
                className="px-6 pb-8"
              >
                <Pressable onPress={goNext} style={styles.primaryButton}>
                  <LinearGradient
                    colors={['#14B8A6', '#0D9488']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text className="text-white font-bold text-lg mr-2">{t('onboarding.welcome.letsGo')}</Text>
                    <ChevronRight size={20} color="#ffffff" />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </SafeAreaView>
          </Animated.View>
        );

      case 'goal':
        return (
          <GoalStep
            currentStep={1}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'symptoms':
        return (
          <SymptomsStep
            currentStep={2}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'struggles':
        return (
          <StrugglesStep
            currentStep={3}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'food-relationship':
        return (
          <FoodRelationshipStep
            currentStep={4}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'favorite-foods':
        return (
          <FavoriteFoodsStep
            currentStep={5}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'activity':
        return (
          <ActivityStep
            currentStep={6}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'personalized':
        return <PersonalizedStep onComplete={() => goToStep('review')} />;

      case 'review':
        return <ReviewStep onComplete={() => goToStep('signup')} />;

      case 'signup':
        return (
          <Animated.View
            entering={FadeInRight.duration(300)}
            className="flex-1"
          >
            {/* Background gradient */}
            <LinearGradient
              colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
              locations={[0, 0.3, 0.7, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Floating orbs */}
            <Animated.View
              entering={FadeIn.delay(100).duration(1000)}
              style={[styles.orb, styles.orb1]}
            />
            <Animated.View
              entering={FadeIn.delay(200).duration(1000)}
              style={[styles.orb, styles.orb2]}
            />

            <SafeAreaView className="flex-1">
              {/* Back button */}
              <View className="py-4 px-6">
                <Pressable onPress={goBack} style={styles.backButton}>
                  <BlurView intensity={40} tint="light" style={styles.backButtonBlur}>
                    <ChevronLeft size={20} color="#0D9488" />
                  </BlurView>
                </Pressable>
              </View>

              <View className="flex-1 px-6 justify-center">
                {/* Glass card */}
                <Animated.View
                  entering={FadeIn.delay(100).duration(500)}
                  style={styles.glassCard}
                >
                  <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                    {/* Success icon */}
                    <View style={styles.iconContainer}>
                      <LinearGradient
                        colors={['#14B8A6', '#0D9488', '#0F766E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconGradient}
                      >
                        <Check size={32} color="#ffffff" />
                      </LinearGradient>
                    </View>

                    <Animated.Text
                      entering={FadeInUp.delay(200).duration(500)}
                      className="text-gray-900 text-2xl font-bold text-center mb-2"
                    >
                      {t('onboarding.signup.title')}
                    </Animated.Text>

                    <Animated.Text
                      entering={FadeInUp.delay(300).duration(500)}
                      className="text-gray-600 text-base text-center leading-relaxed mb-6"
                    >
                      {t('onboarding.signup.subtitle')}
                    </Animated.Text>

                    {/* Benefits with glass pills */}
                    <Animated.View
                      entering={FadeInUp.delay(400).duration(500)}
                      className="w-full"
                    >
                      {[
                        t('onboarding.signup.benefits.personalizedRatings'),
                        t('onboarding.signup.benefits.basedOnYou'),
                        t('onboarding.signup.benefits.learnImpact'),
                      ].map((benefit, index) => (
                        <View key={benefit} style={styles.benefitRow}>
                          <View style={styles.benefitCheck}>
                            <Check size={12} color="#ffffff" />
                          </View>
                          <Text className="text-gray-700 flex-1 text-sm">{benefit}</Text>
                        </View>
                      ))}
                    </Animated.View>
                  </BlurView>
                </Animated.View>

                {/* Apple Sign In Button */}
                <Animated.View
                  entering={FadeInUp.delay(500).duration(500)}
                  className="mt-6"
                >
                  {Platform.OS === 'ios' && (
                    <Pressable
                      onPress={handleAppleAuth}
                      disabled={isLoading}
                      style={[styles.appleButton, isLoading && { opacity: 0.7 }]}
                    >
                      <LinearGradient
                        colors={['#14B8A6', '#0D9488', '#0F766E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                      {appleLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <AppleIcon size={20} color="#fff" />
                          <Text className="text-white font-semibold text-lg ml-3">
                            {t('onboarding.signup.continueWithApple')}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </Animated.View>
              </View>

              <Animated.View
                entering={FadeIn.delay(600).duration(500)}
                className="px-6 pb-8"
              >
                <Text className="text-gray-500 text-xs text-center">
                  {t('onboarding.signup.terms')}{' '}
                  <Text
                    className="text-teal-600 font-medium"
                    onPress={() => Linking.openURL(APP_URLS.terms)}
                  >
                    {t('onboarding.signup.termsLink')}
                  </Text>
                  {' '}{t('onboarding.signup.and')}{' '}
                  <Text
                    className="text-teal-600 font-medium"
                    onPress={() => Linking.openURL(APP_URLS.privacy)}
                  >
                    {t('onboarding.signup.privacyLink')}
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    bottom: 100,
    left: -40,
  },
  orb3: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(94, 234, 212, 0.1)',
    top: '40%',
    right: -20,
  },
  glassCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  blurContainer: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featurePill: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appleButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
