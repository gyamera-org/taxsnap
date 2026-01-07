import { View, Text, Pressable, StatusBar, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { ArrowRight } from 'lucide-react-native';
import { AppLogo } from '@/components/icons/app-logo';

export function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { isDark } = useTheme();

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleSignIn = () => {
    router.push('/auth?mode=signin');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FAFAFA' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Subtle gradient accent */}
      <Animated.View
        entering={FadeIn.delay(100).duration(1200)}
        style={[
          styles.gradientOrb,
          {
            backgroundColor: colors.primary,
            opacity: isDark ? 0.3 : 0.5,
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {/* Minimal App Badge */}
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              style={[
                styles.badge,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              <AppLogo size={18} color={colors.primary} />
              <Text style={[styles.badgeText, { color: isDark ? '#fff' : '#000' }]}>
                {t('welcome.badge')}
              </Text>
            </Animated.View>

            {/* Main Headline - Big & Bold */}
            <Animated.Text
              entering={FadeInUp.delay(300).duration(700)}
              style={[styles.headline, { color: isDark ? '#fff' : '#000' }]}
            >
              {t('welcome.headline')}
            </Animated.Text>

            {/* Minimal subtext */}
            <Animated.Text
              entering={FadeInUp.delay(400).duration(700)}
              style={[styles.subtext, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}
            >
              {t('welcome.subheadline')}
            </Animated.Text>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Primary CTA */}
            <Animated.View entering={FadeIn.delay(500).duration(500)}>
              <Pressable
                onPress={handleGetStarted}
                style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              >
                <Text style={styles.primaryButtonText}>{t('welcome.getStarted')}</Text>
                <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
              </Pressable>
            </Animated.View>

            {/* Sign In Link */}
            <Animated.View entering={FadeIn.delay(600).duration(400)}>
              <Pressable onPress={handleSignIn} style={styles.signInButton}>
                <Text style={[styles.signInText, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                  {t('welcome.alreadyHaveAccount')}{' '}
                  <Text style={[styles.signInLink, { color: colors.primary }]}>
                    {t('welcome.signIn')}
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
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
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  gradientOrb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -150,
    right: -150,
    overflow: 'hidden',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    marginBottom: 28,
    gap: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 50,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
  bottomSection: {
    paddingBottom: 36,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginBottom: 20,
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  signInButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 15,
  },
  signInLink: {
    fontWeight: '600',
  },
});
