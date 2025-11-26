import { useState } from 'react';
import { View, Text, Pressable, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-provider';

export default function AuthScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: 'signin' | 'signup' }>();
  const { signInWithApple, signInWithGoogle, loading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isSignUp = mode === 'signup';

  const handleAppleAuth = async () => {
    setIsAuthenticating(true);
    try {
      await signInWithApple();
      // Navigation is handled by auth state change listener
    } catch (error) {
      console.error('Apple auth error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    try {
      await signInWithGoogle();
      // Navigation is handled by auth state change listener
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const isLoading = loading || isAuthenticating;

  return (
    <View className="flex-1 bg-[#0F0F0F]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 justify-center">
          {/* Title */}
          <View className="mb-10">
            <Text className="text-white text-3xl font-bold text-center mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text className="text-gray-400 text-center">
              {isSignUp
                ? 'Sign up to start your debt-free journey'
                : 'Sign in to continue your progress'}
            </Text>
          </View>

          {/* Auth Buttons */}
          <View className="mb-8">
            {/* Apple Sign In - iOS only */}
            {Platform.OS === 'ios' && (
              <Pressable
                onPress={handleAppleAuth}
                disabled={isLoading}
                className={`rounded-2xl overflow-hidden mb-3 ${
                  isLoading ? 'opacity-70' : ''
                }`}
              >
                <View className="bg-white py-4 px-6 flex-row items-center justify-center">
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      <Text className="text-black text-xl mr-3"></Text>
                      <Text className="text-black font-semibold text-lg">
                        Continue with Apple
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>
            )}

            {/* Google Sign In */}
            <Pressable
              onPress={handleGoogleAuth}
              disabled={isLoading}
              className={`rounded-2xl overflow-hidden ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              <View className="bg-white/10 border border-white/20 rounded-2xl py-4 px-6 flex-row items-center justify-center">
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="text-white text-xl mr-3">G</Text>
                    <Text className="text-white font-semibold text-lg">
                      Continue with Google
                    </Text>
                  </>
                )}
              </View>
            </Pressable>
          </View>

          {/* Toggle Auth Mode */}
          <Pressable
            onPress={() => {
              if (isSignUp) {
                router.setParams({ mode: 'signin' });
              } else {
                router.push('/onboarding');
              }
            }}
            className="py-3"
          >
            <Text className="text-gray-400 text-center">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <Text className="text-emerald-400 font-semibold">Sign In</Text>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Text className="text-emerald-400 font-semibold">
                    Get Started
                  </Text>
                </>
              )}
            </Text>
          </Pressable>

          {/* Terms */}
          <Text className="text-gray-600 text-sm text-center mt-8 px-4">
            By continuing, you agree to our{' '}
            <Text className="text-emerald-400">Terms of Service</Text> and{' '}
            <Text className="text-emerald-400">Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
