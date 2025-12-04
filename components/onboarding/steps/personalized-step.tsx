import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useOnboarding } from '@/context/onboarding-provider';
import { ChevronRight, Target, Heart, Utensils } from 'lucide-react-native';
import { PCOSLogo } from '@/components/icons/pcos-logo';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

interface PersonalizedStepProps {
  onComplete: () => void;
}

export function PersonalizedStep({ onComplete }: PersonalizedStepProps) {
  const { data } = useOnboarding();
  const { t } = useTranslation();

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  // Get personalized message based on goal
  const getGoalMessage = () => {
    switch (data.primaryGoal) {
      case 'manage-weight':
        return t('onboarding.personalized.goalMessages.manageWeight');
      case 'reduce-symptoms':
        return t('onboarding.personalized.goalMessages.reduceSymptoms');
      case 'fertility':
        return t('onboarding.personalized.goalMessages.fertility');
      case 'energy':
        return t('onboarding.personalized.goalMessages.energy');
      case 'understand':
        return t('onboarding.personalized.goalMessages.understand');
      case 'peace':
        return t('onboarding.personalized.goalMessages.peace');
      default:
        return t('onboarding.personalized.goalMessages.default');
    }
  };

  const summaryItems = [
    {
      icon: Target,
      label: t('onboarding.personalized.summary.focus'),
      value: getGoalMessage(),
      color: '#14B8A6',
    },
    {
      icon: Heart,
      label: t('onboarding.personalized.summary.symptomsTracked'),
      value: t('onboarding.personalized.summary.symptomCount', { count: data.symptoms.length }),
      color: '#F472B6',
    },
    {
      icon: Utensils,
      label: t('onboarding.personalized.summary.foodsNoted'),
      value: t('onboarding.personalized.summary.foodCount', { count: data.feelGoodFoods.length }),
      color: '#FB923C',
    },
  ].filter((item) => {
    if (item.label === t('onboarding.personalized.summary.symptomsTracked')) return data.symptoms.length > 0;
    if (item.label === t('onboarding.personalized.summary.foodsNoted')) return data.feelGoodFoods.length > 0;
    return true;
  });

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

      {/* Floating orbs */}
      <Animated.View entering={FadeIn.delay(100).duration(1000)} style={[styles.orb, styles.orb1]} />
      <Animated.View entering={FadeIn.delay(200).duration(1000)} style={[styles.orb, styles.orb2]} />
      <Animated.View entering={FadeIn.delay(300).duration(1000)} style={[styles.orb, styles.orb3]} />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 justify-center">
          {/* Main glass card */}
          <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.glassCard}>
            <BlurView intensity={40} tint="light" style={styles.blurContainer}>
              {/* App Logo */}
              <View style={styles.logoContainer}>
                <PCOSLogo size={72} color="#0D9488" textColor="#ffffff" />
              </View>

              {/* Title */}
              <Animated.Text
                entering={FadeInUp.delay(200).duration(500)}
                className="text-gray-900 text-2xl font-bold text-center mb-2"
              >
                {t('onboarding.personalized.title')}
              </Animated.Text>

              {/* Description */}
              <Animated.Text
                entering={FadeInUp.delay(300).duration(500)}
                className="text-gray-600 text-base text-center leading-relaxed mb-6"
              >
                {t('onboarding.personalized.description')}
              </Animated.Text>

              {/* Summary items */}
              <Animated.View
                entering={FadeInUp.delay(400).duration(500)}
                className="w-full"
              >
                {summaryItems.map((item, index) => (
                  <View key={item.label} style={styles.summaryItem}>
                    <View style={[styles.summaryIcon, { backgroundColor: `${item.color}15` }]}>
                      <item.icon size={18} color={item.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 text-xs uppercase tracking-wide">
                        {item.label}
                      </Text>
                      <Text className="text-gray-800 text-sm font-medium capitalize">
                        {item.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </Animated.View>
            </BlurView>
          </Animated.View>
        </View>

        {/* Continue button */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} className="px-6 pb-8">
          <Pressable onPress={handleContinue} style={styles.primaryButton}>
            <LinearGradient
              colors={['#14B8A6', '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text className="text-white font-bold text-lg mr-2">{t('common.next')}</Text>
              <ChevronRight size={20} color="#ffffff" />
            </LinearGradient>
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
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
