import { useState } from 'react';
import { View, Pressable, ActivityIndicator, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { toast } from 'sonner-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const { mode } = useLocalSearchParams<{ mode?: 'signin' | 'signup' }>();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSignUp = mode === 'signup';

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
        await signUpWithEmail(email, password, firstName.trim(), lastName.trim());
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
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
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text className="text-lg text-slate-600 text-center">
            {isSignUp
              ? 'Join the community that understands your beauty'
              : 'Sign in to continue your beauty journey'}
          </Text>
        </View>

        {/* Email Form */}
        <View className="space-y-4">
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
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            className="mb-6"
            editable={!isSubmitting}
          />

          <Button
            title={isSignUp ? 'Create Account' : 'Sign In'}
            onPress={handleEmailAuth}
            disabled={isSubmitting}
            variant="primary"
            loading={isSubmitting}
            className="mb-4"
          />

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
              onPress={() => openLink('https://your-website.com/terms')}
            >
              Terms
            </Text>{' '}
            and{' '}
            <Text
              className="text-pink-500 underline"
              onPress={() => openLink('https://your-website.com/privacy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
