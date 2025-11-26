import { useState } from 'react';
import { View, Text, Pressable, Platform, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: 'signin' | 'signup' }>();
  const [isLoading, setIsLoading] = useState(false);

  const isSignUp = mode === 'signup';

  const handleAppleAuth = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Apple authentication
      // For now, navigate to paywall or home
      setTimeout(() => {
        if (isSignUp) {
          router.replace('/paywall');
        } else {
          router.replace('/(tabs)/home');
        }
      }, 500);
    } catch (error) {
      console.error('Apple auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google authentication
      // For now, navigate to paywall or home
      setTimeout(() => {
        if (isSignUp) {
          router.replace('/paywall');
        } else {
          router.replace('/(tabs)/home');
        }
      }, 500);
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
                  <Text className="text-black text-xl mr-3"></Text>
                  <Text className="text-black font-semibold text-lg">
                    Continue with Apple
                  </Text>
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
                <Text className="text-white text-xl mr-3">G</Text>
                <Text className="text-white font-semibold text-lg">
                  Continue with Google
                </Text>
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
