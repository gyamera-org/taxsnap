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
import { useRevenueCat } from '@/context/revenuecat-provider';
import { useTheme } from '@/context/theme-provider';
import { CosmicBackground } from '@/components/ui/cosmic-background';
import { OTPInput } from '@/components/ui/otp-input';

export default function AuthScreen() {
  const {
    signInWithEmail,
    signInWithApple,
    signUpWithOnboarding,
    signUpWithAppleOnboarding,
    sendOTPEmail,
    verifyOTP,
    resetPasswordWithVerifiedOTP,
  } = useAuth();

  const { mode, method } = useLocalSearchParams<{
    mode?: 'signin' | 'signup';
    method?: 'apple' | 'google' | 'email';
  }>();

  const [isSignUp, setIsSignUp] = useState(mode === 'signup');

  useEffect(() => {
    if (mode === 'signup') {
      setAuthMode('signup');
      setIsSignUp(true);
    } else {
      setAuthMode('signin');
      setIsSignUp(false);
    }
  }, [mode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasOnboardingData, setHasOnboardingData] = useState(false);
  const [authMode, setAuthMode] = useState<
    'signin' | 'signup' | 'forgot-password' | 'verify-otp' | 'new-password'
  >('signin');
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const { shouldShowPaywall } = useRevenueCat();
  const { isDark } = useTheme();

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

  // Handle automatic auth method triggering from chat onboarding
  useEffect(() => {
    if (method && isSignUp && hasOnboardingData) {
      if (method === 'apple') {
        handleAppleAuth();
      }
      // Note: Google and Email methods would require additional UI interaction
      // so they're not automatically triggered
    }
  }, [method, isSignUp, hasOnboardingData]);

  const handlePostAuth = () => {
    if (shouldShowPaywall) {
      router.replace('/paywall');
    } else {
      router.replace('/(tabs)/nutrition');
    }
  };
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
        await signUpWithOnboarding(email, password, firstName.trim(), lastName.trim());
      } else {
        await signInWithEmail(email, password);
        handlePostAuth();
      }
      // Navigate back to index after successful auth - let index.tsx handle routing
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
        await signUpWithAppleOnboarding();
      } else {
        await signInWithApple();
        handlePostAuth();
      }
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

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOTPEmail(resetEmail);
      toast.success('Verification code sent to your email');
      setAuthMode('verify-otp');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOTP(otpCode);
      toast.success('Code verified successfully');
      setAuthMode('new-password');
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPassword = async () => {
    if (!password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordWithVerifiedOTP(resetEmail, password);
      toast.success('Password updated successfully');
      setAuthMode('signin');
      setResetEmail('');
      setOtpCode('');
      setPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    if (!isSignUp && !canSignUp) {
      router.replace('/onboarding');
      return;
    }

    if (authMode === 'signin') {
      setAuthMode('signup');
      setIsSignUp(true);
    } else if (authMode === 'signup') {
      setAuthMode('signin');
      setIsSignUp(false);
    }

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

  const getTitle = () => {
    switch (authMode) {
      case 'signup':
        return hasOnboardingData ? 'Complete Your Setup' : 'Create your account';
      case 'forgot-password':
        return 'Reset Password';
      case 'verify-otp':
        return 'Verify Code';
      case 'new-password':
        return 'New Password';
      default:
        return 'Welcome back';
    }
  };

  const getCurrentForm = () => {
    switch (authMode) {
      case 'signup':
        return renderSignUpForm();
      case 'forgot-password':
        return renderForgotPasswordForm();
      case 'verify-otp':
        return renderVerifyOTPForm();
      case 'new-password':
        return renderNewPasswordForm();
      default:
        return renderSignInForm();
    }
  };

  const renderSignInForm = () => (
    <View className="flex flex-col gap-4">
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
            <EyeOff size={20} color={isDark ? '#64748B' : '#9CA3AF'} />
          ) : (
            <Eye size={20} color={isDark ? '#64748B' : '#9CA3AF'} />
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={() => setAuthMode('forgot-password')}
        disabled={isSubmitting}
        className="mb-4"
      >
        <Text className={`text-right text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Forgot password?
        </Text>
      </Pressable>

      <Button
        title="Sign In"
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
            <View className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
            <Text className={`mx-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>or</Text>
            <View className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
          </View>

          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
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

      <Pressable onPress={toggleAuthMode} disabled={isSubmitting}>
        <Text className={`text-center text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Need an account? <Text className="text-pink-500 font-semibold">Get Started</Text>
        </Text>
      </Pressable>
    </View>
  );

  const renderSignUpForm = () => (
    <View className="flex flex-col gap-4">
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
            <EyeOff size={20} color={isDark ? '#64748B' : '#9CA3AF'} />
          ) : (
            <Eye size={20} color={isDark ? '#64748B' : '#9CA3AF'} />
          )}
        </Pressable>
      </View>

      <Button
        title="Create Account"
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
            <View className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
            <Text className={`mx-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>or</Text>
            <View className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
          </View>

          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={
              isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
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

      <Pressable onPress={toggleAuthMode} disabled={isSubmitting}>
        <Text className={`text-center text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Already have an account? <Text className="text-pink-500 font-semibold">Sign In</Text>
        </Text>
      </Pressable>
    </View>
  );

  const renderForgotPasswordForm = () => (
    <View className="flex flex-col gap-4">
      <Text className={`text-center mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Enter your email address and we'll send you a verification code to reset your password.
      </Text>

      <TextInput
        value={resetEmail}
        onChangeText={setResetEmail}
        placeholder="Email address"
        autoCapitalize="none"
        keyboardType="email-address"
        className="mb-4"
        editable={!isSubmitting}
      />

      <Button
        title="Send Verification Code"
        onPress={handleForgotPassword}
        disabled={isSubmitting}
        variant="primary"
        loading={isSubmitting}
        className="mb-4"
      />

      <Pressable onPress={() => setAuthMode('signin')} disabled={isSubmitting}>
        <Text className={`text-center text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Back to <Text className="text-pink-500 font-semibold">Sign In</Text>
        </Text>
      </Pressable>
    </View>
  );

  const renderVerifyOTPForm = () => (
    <View className="flex flex-col gap-4">
      <Text className={`text-center mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Enter the 6-digit verification code sent to {resetEmail}
      </Text>

      <View className="mb-6">
        <OTPInput value={otpCode} onChange={setOtpCode} length={6} disabled={isSubmitting} />
      </View>

      <Button
        title="Verify Code"
        onPress={handleVerifyOTP}
        disabled={isSubmitting}
        variant="primary"
        loading={isSubmitting}
        className="mb-4"
      />

      <Pressable onPress={() => setAuthMode('forgot-password')} disabled={isSubmitting}>
        <Text className={`text-center text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Back to <Text className="text-pink-500 font-semibold">Email Entry</Text>
        </Text>
      </Pressable>
    </View>
  );

  const renderNewPasswordForm = () => (
    <View className="flex flex-col gap-4">
      <Text className={`text-center mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Enter your new password
      </Text>

      <View className="relative mb-6">
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
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
            <EyeOff size={20} color={isDark ? '#64748B' : '#9CA3AF'} />
          ) : (
            <Eye size={20} color={isDark ? '#64748B' : '#9CA3AF'} />
          )}
        </Pressable>
      </View>

      <Button
        title="Update Password"
        onPress={handleNewPassword}
        disabled={isSubmitting}
        variant="primary"
        loading={isSubmitting}
        className="mb-4"
      />
    </View>
  );

  const authContent = (
    <View className="flex-1 px-6">
      <View className="flex-1 justify-center">
        {/* Header */}
        <View className="mb-12">
          <Text
            className={`text-3xl font-bold text-center mb-3 ${
              isDark ? 'text-white' : 'text-black'
            }`}
          >
            {getTitle()}
          </Text>
        </View>

        {getCurrentForm()}

        {/* Footer - Only show on main auth screens */}
        {(authMode === 'signin' || authMode === 'signup') && (
          <View className="mt-4">
            <Text
              className={`text-sm text-center leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
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
        )}
      </View>
    </View>
  );

  return isDark ? (
    <CosmicBackground theme="settings" isDark={isDark}>
      {authContent}
    </CosmicBackground>
  ) : (
    <View className="flex-1 bg-white">{authContent}</View>
  );
}
