import React, { useState, useEffect } from 'react';
import { View, Pressable, Linking, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { toast } from 'sonner-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Eye, EyeOff } from 'lucide-react-native';
import { OnboardingStorage } from '@/lib/utils/onboarding-storage';

export default function AuthScreen() {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithApple,
    signUpWithOnboarding,
    signUpWithAppleOnboarding,
  } = useAuth();

  const { mode } = useLocalSearchParams<{
    mode?: 'signin' | 'signup';
  }>();

  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasOnboardingData, setHasOnboardingData] = useState(false);

  const canSignUp = mode === 'signup';

  // Check for onboarding data and pre-fill name
  useEffect(() => {
    const checkOnboardingData = async () => {
      const storedData = await OnboardingStorage.load();
      if (storedData?.name) {
        const nameParts = storedData.name.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setHasOnboardingData(true);
      } else {
        setHasOnboardingData(false);
      }
    };

    checkOnboardingData();
  }, []);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      toast.error('Please enter your first and last name');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        if (hasOnboardingData) {
          await signUpWithOnboarding(email, password, firstName.trim(), lastName.trim());
        } else {
          await signUpWithEmail(email, password, firstName.trim(), lastName.trim());
        }
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleAuth = async () => {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        if (hasOnboardingData) {
          try {
            await signUpWithAppleOnboarding();
          } catch (signupError: any) {
            await signInWithApple();
          }
        } else {
          await signInWithApple();
        }
      } else {
        await signInWithApple();
      }

      // After successful authentication, let index page handle navigation
    } catch (error: any) {
      // Check if this is a user cancellation - don't show error for that
      if (!error.message?.includes('cancelled') && !error.message?.includes('canceled')) {
        toast.error(
          error.message || `Failed to ${isSignUp ? 'create account' : 'sign in'} with Apple`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    if (!isSignUp && !canSignUp) {
      router.replace('/onboarding');
      return;
    }

    setIsSignUp(!isSignUp);
    // Clear form fields when switching modes
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error('Cannot open link');
      }
    } catch (error) {
      toast.error('Failed to open link');
    }
  };

  return (
    <View className="flex-1 bg-white px-6">
      <View className="flex-1 justify-center">
        {/* Header */}
        <View className="mb-12">
          <Text className="text-3xl font-bold text-black text-center mb-3">
            {hasOnboardingData
              ? 'Complete Your Setup'
              : isSignUp
                ? 'Create your account'
                : 'Welcome back'}
          </Text>
        </View>

        {/* Email Form */}
        <View className="flex flex-col gap-4">
          {isSignUp && (
            <>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                autoCapitalize="words"
                className="mb-4"
                editable={!isSubmitting}
              />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                autoCapitalize="words"
                className="mb-4"
                editable={!isSubmitting}
              />
            </>
          )}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
            className="mb-4"
            editable={!isSubmitting}
          />
          <View className="relative mb-6">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPassword}
              className="pr-12"
              editable={!isSubmitting}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-0 h-12 justify-center"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </Pressable>
          </View>

          <Button
            title={isSignUp ? 'Create Account' : 'Sign In'}
            onPress={handleEmailAuth}
            disabled={isSubmitting}
            variant="primary"
            loading={isSubmitting}
            className="mb-4"
          />

          {/* Apple Authentication - Show on iOS */}
          {Platform.OS === 'ios' && (
            <>
              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-px bg-slate-300" />
                <Text className="mx-4 text-slate-500">or</Text>
                <View className="flex-1 h-px bg-slate-300" />
              </View>

              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  isSignUp
                    ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                    : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={100}
                style={{
                  width: '100%',
                  height: 50,
                  marginBottom: 16,
                  opacity: isSubmitting ? 0.5 : 1,
                }}
                onPress={isSubmitting ? () => {} : handleAppleAuth}
              />
            </>
          )}

          {(isSignUp || canSignUp) && (
            <Pressable onPress={toggleAuthMode} disabled={isSubmitting}>
              <Text className="text-center text-slate-600 text-lg">
                {isSignUp ? 'Already have an account? ' : 'Need an account? '}
                <Text className="text-pink-500 font-semibold">
                  {isSignUp ? 'Sign In' : 'Get Started'}
                </Text>
              </Text>
            </Pressable>
          )}

          {!isSignUp && !canSignUp && (
            <Pressable onPress={toggleAuthMode} disabled={isSubmitting}>
              <Text className="text-center text-slate-600 text-lg">
                Need an account? <Text className="text-pink-500 font-semibold">Get Started</Text>
              </Text>
            </Pressable>
          )}
        </View>

        {/* Footer */}
        <View className="mt-4">
          <Text className="text-sm text-slate-500 text-center leading-relaxed">
            By continuing, you agree to our{' '}
            <Text
              className="text-pink-500 underline"
              onPress={() => openLink('https://www.lunasync.app/terms')}
            >
              Terms
            </Text>{' '}
            and{' '}
            <Text
              className="text-pink-500 underline"
              onPress={() => openLink('https://www.lunasync.app/privacy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
