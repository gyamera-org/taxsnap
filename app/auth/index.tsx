import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/context/auth-provider';
import * as Haptics from 'expo-haptics';
import { AppleIcon } from '@/components/icons/tab-icons';
import { APP_URLS } from '@/lib/config/urls';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@/lib/utils/theme';
import { Shield } from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode } = useLocalSearchParams<{ mode?: 'signin' | 'signup' }>();
  const { signInWithApple, loading: authLoading } = useAuth();
  const [appleLoading, setAppleLoading] = useState(false);
  const colors = useThemedColors();

  const isSignUp = mode === 'signup';
  const isLoading = authLoading || appleLoading;

  const handleAppleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Apple auth error:', error);
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Icon */}
            <Animated.View
              entering={FadeIn.delay(200).duration(500)}
              style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}
            >
              <Shield size={40} color={colors.primary} />
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeInUp.delay(300).duration(600)}
              style={[styles.title, { color: colors.text }]}
            >
              {isSignUp ? t('auth.signUpTitle') : t('auth.welcomeBack')}
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInUp.delay(400).duration(600)}
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitle')}
            </Animated.Text>

            {/* Apple Sign In Button */}
            {Platform.OS === 'ios' && (
              <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.buttonContainer}>
                <Pressable
                  onPress={handleAppleAuth}
                  disabled={isLoading}
                  style={[
                    styles.appleButton,
                    { backgroundColor: colors.primary, shadowColor: colors.primary },
                    isLoading && styles.buttonDisabled,
                  ]}
                >
                  {appleLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <AppleIcon size={20} color="#ffffff" />
                      <Text style={styles.appleButtonText}>{t('auth.continueWithApple')}</Text>
                    </>
                  )}
                </Pressable>
              </Animated.View>
            )}

            {/* Toggle Auth Mode */}
            <Animated.View entering={FadeIn.delay(600).duration(500)}>
              <Pressable
                onPress={() => {
                  if (isSignUp) {
                    router.setParams({ mode: 'signin' });
                  } else {
                    router.push('/onboarding');
                  }
                }}
                style={styles.toggleButton}
              >
                <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                  {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{' '}
                  <Text style={[styles.toggleTextHighlight, { color: colors.primary }]}>
                    {isSignUp ? t('welcome.signIn') : t('welcome.getStarted')}
                  </Text>
                </Text>
              </Pressable>
            </Animated.View>
          </View>

          {/* Bottom Section - Terms Only */}
          <View style={styles.bottomSection}>
            <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.termsContainer}>
              <Text style={[styles.termsText, { color: colors.textMuted }]}>
                {t('auth.terms')}{' '}
                <Text
                  style={[styles.termsLink, { color: colors.textSecondary }]}
                  onPress={() => Linking.openURL(APP_URLS.terms)}
                >
                  {t('auth.termsLink')}
                </Text>{' '}
                {t('auth.and')}{' '}
                <Text
                  style={[styles.termsLink, { color: colors.textSecondary }]}
                  onPress={() => Linking.openURL(APP_URLS.privacy)}
                >
                  {t('auth.privacyLink')}
                </Text>
              </Text>
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
    justifyContent: 'space-between',
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
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 32,
  },
  bottomSection: {
    paddingBottom: 32,
  },
  appleButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appleButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  toggleButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    textAlign: 'center',
  },
  toggleTextHighlight: {
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});
