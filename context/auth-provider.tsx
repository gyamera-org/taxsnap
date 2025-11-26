import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { emailService } from '@/lib/services/email-service';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithApple: (plan?: string, onboardingData?: any) => Promise<void>;
  signUpWithOnboarding: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    plan?: string
  ) => Promise<void>;
  signUpWithAppleOnboarding: (plan?: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  sendOTPEmail: (email: string) => Promise<{ otpCode: string }>;
  verifyOTP: (otpCode: string) => Promise<boolean>;
  resetPasswordWithVerifiedOTP: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpTokenStorage, setOtpTokenStorage] = useState<string | null>(null);

  // Helper function to ensure account exists in database
  const ensureAccountExists = async (userId: string): Promise<void> => {
    try {
      // Call the function to create account if it doesn't exist
      const { error } = await supabase.rpc('create_missing_account', { p_user_id: userId });
      if (error) {
        console.error('Error ensuring account exists:', error);
      }
    } catch (error) {
      console.error('Error calling create_missing_account:', error);
    }
  };

  // Navigation after auth is now handled by useAppInitialization hook
  // This just ensures the account record exists
  const handlePostAuth = async (userId: string): Promise<void> => {
    try {
      await ensureAccountExists(userId);
    } catch (error) {
      console.error('Error in handlePostAuth:', error);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session: restored },
        } = await supabase.auth.getSession();
        setSession(restored);
        setUser(restored?.user ?? null);
      } catch (err) {
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getSession();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data.user) {
      await handlePostAuth(data.user.id);
    }
    setLoading(false);
    if (error) throw error;
  };

  const signInWithApple = async (plan?: string, onboardingData?: any) => {
    setLoading(true);
    try {
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Add user metadata if we have the name from Apple
      const options: any = {};
      if (
        appleCredential.fullName?.givenName ||
        appleCredential.fullName?.familyName ||
        plan ||
        onboardingData
      ) {
        const firstName =
          appleCredential.fullName?.givenName || onboardingData?.name?.split(' ')[0] || '';
        const lastName =
          appleCredential.fullName?.familyName ||
          onboardingData?.name?.split(' ').slice(1).join(' ') ||
          '';

        options.data = {
          first_name: firstName,
          last_name: lastName,
          selected_plan: plan || 'free',
          onboarding_data: onboardingData ? JSON.stringify(onboardingData) : null,
        };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleCredential.identityToken!,
        nonce,
        options,
      });

      if (data.user) {
        // Process onboarding data if provided (for new users)
        if (onboardingData) {
          try {
            const rpcParams = {
              // Required parameters first
              p_user_id: data.user.id,
              p_name: onboardingData.name,
              p_date_of_birth: onboardingData.dateOfBirth,
              p_nutrition_goal: onboardingData.nutritionGoal,
              p_activity_level: onboardingData.activityLevel,
              p_fitness_goal: onboardingData.fitnessGoal,
              p_fitness_frequency: onboardingData.fitnessFrequency,
              p_height: onboardingData.height,
              p_weight: onboardingData.weight,
              p_units: onboardingData.units,

              // Optional parameters with defaults
              p_last_period_start: onboardingData.lastPeriodStart,
              p_cycle_regularity: onboardingData.cycleRegularity,
              p_cycle_symptoms: onboardingData.cycleSymptoms || [],
              p_nutrition_style: onboardingData.nutritionStyle,
              p_nutrition_experience: onboardingData.nutritionExperience,
              p_fitness_experience: onboardingData.fitnessExperience,
              p_fitness_styles: onboardingData.fitnessStyles || [],
              p_fitness_location: onboardingData.fitnessLocation,
              p_weight_goal: onboardingData.weightGoal,
              p_plan: plan || 'free',
            };

            const { error } = await supabase.rpc('process_chat_onboarding_data', rpcParams);

            if (error) {
              console.error('Onboarding processing failed:', error.message);
              toast.error(
                'Account created but settings could not be saved. Please update them in Settings.'
              );
            }
          } catch (error) {
            console.error('Error processing onboarding data:', error);
            toast.error(
              'Account created but settings could not be saved. Please update them in Settings.'
            );
          }
        }

        // Apple sign-in routing - use centralized navigation
        await handlePostAuth(data.user.id);
      }

      if (error) throw error;
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithOnboarding = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    plan?: string
  ) => {
    setLoading(true);
    try {
      const onboardingData = await OnboardingStorage.load();
      if (!onboardingData) {
        throw new Error('Onboarding data not found. Please complete onboarding first.');
      }

      // Call Edge Function for transactional signup + onboarding
      const { data, error } = await supabase.functions.invoke('signup-with-onboarding', {
        body: {
          email,
          password,
          firstName,
          lastName,
          plan: plan || 'free',
          onboardingData,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Signup failed');

      // Set the session from the edge function response
      if (data.session) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error('❌ Error setting session:', sessionError);
          throw sessionError;
        }
      }

      // Clear onboarding data after successful signup
      await OnboardingStorage.clear();
      router.replace('/paywall');

      // Navigation handled by index page after auth state updates
    } catch (error: any) {
      console.error('Signup with onboarding failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithAppleOnboarding = async (plan?: string) => {
    setLoading(true);
    try {
      const onboardingData = await OnboardingStorage.load();
      if (!onboardingData) {
        throw new Error('Onboarding data not found. Please complete onboarding first.');
      }

      // Get Apple credentials
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Call Edge Function for transactional Apple signup + onboarding
      const { data, error } = await supabase.functions.invoke('signup-with-onboarding', {
        body: {
          plan: plan || 'free',
          appleCredential: {
            identityToken: appleCredential.identityToken!,
            nonce,
            fullName: appleCredential.fullName,
          },
          onboardingData,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Apple signup failed');

      if (data.session) {
        const { data: _sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error('❌ Error setting session:', sessionError);
          throw sessionError;
        }
      }

      await OnboardingStorage.clear();
      router.replace('/paywall');
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      console.error('❌ Apple signup with onboarding failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const sendOTPEmail = async (email: string): Promise<{ otpCode: string }> => {
    // Generate OTP code on client side
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase.functions.invoke('sent-otp-email', {
      body: { email, otpCode },
    });

    if (error) {
      throw new Error(error.message || 'Failed to send OTP email');
    }

    // Store the OTP code temporarily for verification (in production, use more secure storage)
    setOtpTokenStorage(otpCode);

    return { otpCode: 'sent' }; // Don't return actual code for security
  };

  const verifyOTP = async (otpCode: string): Promise<boolean> => {
    if (!otpTokenStorage) {
      throw new Error('No OTP session found. Please request a new code.');
    }

    // Verify OTP matches what we stored
    if (otpTokenStorage !== otpCode) {
      throw new Error('Invalid verification code. Please try again.');
    }

    return true;
  };

  const resetPasswordWithVerifiedOTP = async (email: string, newPassword: string) => {
    if (!otpTokenStorage) {
      throw new Error('No OTP session found. Please request a new code.');
    }

    // Reset password using our Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('reset-password-with-otp', {
        body: {
          email,
          newPassword,
        },
      });

      // Clear the stored OTP after attempt
      setOtpTokenStorage(null);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to reset password');
      }

      if (!data?.success) {
        console.error('Password reset failed, data:', data);
        throw new Error(data?.error || 'Password reset failed');
      }
    } catch (error: any) {
      // Clear the token after attempt (success or failure)
      setOtpTokenStorage(null);
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signInWithEmail,
    signInWithApple,
    signUpWithOnboarding,
    signUpWithAppleOnboarding,
    resetPasswordForEmail,
    sendOTPEmail,
    verifyOTP,
    resetPasswordWithVerifiedOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
