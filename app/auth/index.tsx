import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  StatusBar,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/context/auth-provider';
import * as Haptics from 'expo-haptics';
import { AppleIcon, GoogleIcon } from '@/components/icons/tab-icons';
import { APP_URLS } from '@/lib/config/urls';
import { PCOSLogo } from '@/components/icons/pcos-logo';
import { useTranslation } from 'react-i18next';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode } = useLocalSearchParams<{ mode?: 'signin' | 'signup' }>();
  const { signInWithApple, signInWithGoogle, loading: authLoading } = useAuth();
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isSignUp = mode === 'signup';
  const isLoading = authLoading || appleLoading || googleLoading;

  const handleAppleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAppleLoading(true);
    try {
      await signInWithApple();
      // Navigation is handled by auth state change listener
    } catch (error) {
      console.error('Apple auth error:', error);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Navigation is handled by auth state change listener
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Liquid Glass Background */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <Animated.View entering={FadeIn.duration(1000)} style={styles.orb1} />
      <Animated.View entering={FadeIn.duration(1000).delay(200)} style={styles.orb2} />
      <Animated.View entering={FadeIn.duration(1000).delay(400)} style={styles.orb3} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.centerContent}>
            {/* Glass Card */}
            <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.glassCard}>
              <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                  <PCOSLogo size={64} color="#0D9488" textColor="#ffffff" />
                </View>

                {/* Title */}
                <Animated.Text
                  entering={FadeInUp.delay(300).duration(600)}
                  style={styles.title}
                >
                  {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
                </Animated.Text>

                {/* Subtitle */}
                <Animated.Text
                  entering={FadeInUp.delay(400).duration(600)}
                  style={styles.subtitle}
                >
                  {isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitle')}
                </Animated.Text>

                {/* Auth Buttons */}
                <Animated.View
                  entering={FadeInUp.delay(500).duration(500)}
                  style={styles.buttonsContainer}
                >
                  {/* Apple Sign In - iOS only */}
                  {Platform.OS === 'ios' && (
                    <Pressable
                      onPress={handleAppleAuth}
                      disabled={isLoading}
                      style={[styles.appleButton, isLoading && styles.buttonDisabled]}
                    >
                      <LinearGradient
                        colors={['#14B8A6', '#0D9488', '#0F766E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                      {appleLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <>
                          <AppleIcon size={20} color="#ffffff" />
                          <Text style={styles.appleButtonText}>{t('auth.continueWithApple')}</Text>
                        </>
                      )}
                    </Pressable>
                  )}

                  {/* Google Sign In - temporarily disabled */}
                  {/* <Pressable
                    onPress={handleGoogleAuth}
                    disabled={isLoading}
                    style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color="#111827" />
                    ) : (
                      <>
                        <GoogleIcon size={20} />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                      </>
                    )}
                  </Pressable> */}
                </Animated.View>

                {/* Toggle Auth Mode */}
                <Animated.View entering={FadeInUp.delay(600).duration(500)}>
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
                    <Text style={styles.toggleText}>
                      {isSignUp ? (
                        <>
                          {t('auth.alreadyHaveAccount')}{' '}
                          <Text style={styles.toggleTextHighlight}>{t('welcome.signIn')}</Text>
                        </>
                      ) : (
                        <>
                          {t('auth.dontHaveAccount')}{' '}
                          <Text style={styles.toggleTextHighlight}>{t('welcome.getStarted')}</Text>
                        </>
                      )}
                    </Text>
                  </Pressable>
                </Animated.View>
              </BlurView>
            </Animated.View>
          </View>

          {/* Terms */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t('auth.terms')}{' '}
              <Text
                style={styles.termsLink}
                onPress={() => Linking.openURL(APP_URLS.terms)}
              >
                {t('auth.termsLink')}
              </Text>
              {' '}{t('auth.and')}{' '}
              <Text
                style={styles.termsLink}
                onPress={() => Linking.openURL(APP_URLS.privacy)}
              >
                {t('auth.privacyLink')}
              </Text>
            </Text>
          </Animated.View>
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
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  glassCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#0D9488',
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
  logoContainer: {
    marginBottom: 24,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  appleButton: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appleButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 12,
  },
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.5)',
  },
  googleButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  toggleButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  toggleText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  toggleTextHighlight: {
    color: '#0D9488',
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  termsLink: {
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    top: -50,
    right: -50,
  },
  orb2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    bottom: 100,
    left: -30,
  },
  orb3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(94, 234, 212, 0.12)',
    top: '40%',
    right: 20,
  },
});
