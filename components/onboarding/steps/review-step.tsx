import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ChevronRight, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

interface ReviewStepProps {
  onComplete: () => void;
}

export function ReviewStep({ onComplete }: ReviewStepProps) {
  const { t } = useTranslation();

  const handleReview = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.log('Store review error:', error);
    }

    // Continue regardless of review outcome
    onComplete();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  return (
    <View className="flex-1">
      {/* Background gradient */}
      <LinearGradient
        colors={['#FFFBEB', '#FEF3C7', '#FDE68A', '#FFFBEB']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs - amber/gold theme */}
      <Animated.View entering={FadeIn.delay(100).duration(1000)} style={[styles.orb, styles.orb1]} />
      <Animated.View entering={FadeIn.delay(200).duration(1000)} style={[styles.orb, styles.orb2]} />
      <Animated.View entering={FadeIn.delay(300).duration(1000)} style={[styles.orb, styles.orb3]} />

      <SafeAreaView className="flex-1">
        {/* Skip button */}
        <View className="py-4 px-6 flex-row justify-end">
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <BlurView intensity={30} tint="light" style={styles.skipButtonBlur}>
              <Text className="text-amber-700 text-sm font-medium">{t('onboarding.common.skip')}</Text>
            </BlurView>
          </Pressable>
        </View>

        <View className="flex-1 px-6 justify-center">
          {/* Glass card */}
          <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.glassCard}>
            <BlurView intensity={40} tint="light" style={styles.blurContainer}>
              {/* Animated stars */}
              <Animated.View
                entering={FadeIn.delay(100).duration(500)}
                className="flex-row items-center justify-center mb-6"
              >
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Animated.View
                    key={i}
                    entering={FadeIn.delay(200 + i * 100).duration(400)}
                    style={styles.starContainer}
                  >
                    <Star size={28} color="#F59E0B" fill="#F59E0B" />
                  </Animated.View>
                ))}
              </Animated.View>

              {/* Title */}
              <Animated.Text
                entering={FadeInUp.delay(500).duration(500)}
                className="text-gray-900 text-2xl font-bold text-center mb-2"
              >
                {t('onboarding.review.title')}
              </Animated.Text>

              {/* Description */}
              <Animated.Text
                entering={FadeInUp.delay(600).duration(500)}
                className="text-gray-600 text-base text-center leading-relaxed"
              >
                {t('onboarding.review.description')}
              </Animated.Text>
            </BlurView>
          </Animated.View>
        </View>

        {/* Buttons */}
        <Animated.View entering={FadeInDown.delay(700).duration(500)} className="px-6 pb-8">
          <Pressable onPress={handleReview} style={styles.primaryButton}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Star size={20} color="#ffffff" fill="#ffffff" />
              <Text className="text-white font-bold text-lg ml-2">{t('onboarding.review.rateButton')}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleSkip} className="mt-4">
            <Text className="text-amber-700/70 text-center text-sm font-medium">{t('onboarding.review.maybeLater')}</Text>
          </Pressable>
        </Animated.View>
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    bottom: 100,
    left: -40,
  },
  orb3: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    top: '40%',
    right: -20,
  },
  glassCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  blurContainer: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  starContainer: {
    marginHorizontal: 3,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  skipButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  skipButtonBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
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
