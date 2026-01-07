import { ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onSkip?: () => void;
}

export function OnboardingLayout({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  onSkip,
}: OnboardingLayoutProps) {
  const { t } = useTranslation();

  // Use translation for default label if not provided
  const buttonLabel = nextLabel || t('common.next');

  const handleNext = () => {
    if (nextDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
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

      <SafeAreaView className="flex-1">
        {/* Progress Bar with Back Button */}
        <View className="flex-row items-center py-4 px-6">
          <Pressable onPress={onBack} style={styles.backButton}>
            <View style={styles.backButtonInner}>
              <ChevronLeft size={20} color="#0D9488" />
            </View>
          </Pressable>
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${(currentStep / totalSteps) * 100}%` }]}
            />
          </View>
          {onSkip && (
            <Pressable onPress={onSkip} style={styles.skipButton}>
              <Text className="text-sm text-teal-600 font-medium">{t('onboarding.common.skip')}</Text>
            </Pressable>
          )}
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-6 mt-2">
            <Animated.Text
              entering={FadeInUp.delay(100).duration(300)}
              className="text-2xl font-bold mb-1 text-gray-900"
            >
              {title}
            </Animated.Text>
            {subtitle && (
              <Animated.Text
                entering={FadeInUp.delay(150).duration(300)}
                className="text-sm text-gray-600"
              >
                {subtitle}
              </Animated.Text>
            )}
          </View>

          {/* Options/Content */}
          {children}
        </ScrollView>

        {/* Next Button */}
        <View className="px-6 pb-8">
          <Pressable
            onPress={handleNext}
            disabled={nextDisabled}
            style={[styles.primaryButton, nextDisabled && { opacity: 0.5 }]}
          >
            <LinearGradient
              colors={['#14B8A6', '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text className="text-white font-bold text-lg mr-2">{buttonLabel}</Text>
              <ChevronRight size={20} color="#ffffff" />
            </LinearGradient>
          </Pressable>
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
  backButton: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  backButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 3,
  },
  skipButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
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
});
