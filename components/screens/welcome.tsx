import { View, Text, Pressable, StatusBar, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Icon */}
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              style={[styles.iconContainer, { backgroundColor: colors.primary }]}
            >
              <Sparkles size={40} color="#ffffff" />
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeInUp.delay(300).duration(600)}
              style={[styles.title, { color: colors.text }]}
            >
              {t('welcome.title')}
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInUp.delay(400).duration(600)}
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {t('welcome.subtitle')}
            </Animated.Text>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Get Started Button */}
            <Animated.View entering={FadeIn.delay(500).duration(500)}>
              <Pressable
                onPress={handleGetStarted}
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.primaryButtonText}>{t('welcome.getStarted')}</Text>
              </Pressable>
            </Animated.View>

            {/* Sign In Link */}
            <Animated.View entering={FadeIn.delay(600).duration(400)}>
              <Pressable onPress={handleSignIn} style={styles.signInButton}>
                <Text style={[styles.signInText, { color: colors.textSecondary }]}>
                  {t('welcome.alreadyHaveAccount')}{' '}
                  <Text style={[styles.signInLink, { color: colors.primary }]}>{t('welcome.signIn')}</Text>
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
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  bottomSection: {
    paddingBottom: 32,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signInButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 15,
  },
  signInLink: {
    fontWeight: '600',
  },
});
