import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { OnboardingStorage } from '@/lib/utils/onboarding-storage';
// Navigation logic moved to useAppInitialization hook

// Note: RevenueCat functionality is now in the RevenueCatProvider context

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    plan?: string,
    onboardingData?: any
  ) => Promise<void>;
  signInWithApple: (plan?: string, onboardingData?: any) => Promise<void>;
  signUpWithOnboarding: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    plan?: string
  ) => Promise<void>;
  signUpWithAppleOnboarding: (plan?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    (async () => {
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
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        setLoading(false);
      }
    );

    return () => sub.subscription.unsubscribe();
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

  const signUpWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    plan?: string,
    onboardingData?: any
  ) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            selected_plan: plan || 'free',
            onboarding_data: onboardingData ? JSON.stringify(onboardingData) : null,
          },
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      if (data.user && data.session) {
        // Process onboarding data if provided
        if (onboardingData) {
          try {
            const rpcParams = {
              p_user_id: data.user.id,
              p_name: onboardingData.name,
              p_date_of_birth: onboardingData.dateOfBirth,
              p_fitness_goal: onboardingData.fitnessGoal,
              p_fitness_frequency: onboardingData.fitnessFrequency,
              p_fitness_experience: onboardingData.fitnessExperience,
              p_nutrition_goal: onboardingData.nutritionGoal,
              p_activity_level: onboardingData.activityLevel,
              p_nutrition_experience: onboardingData.nutritionExperience,
              p_height: onboardingData.height,
              p_weight: onboardingData.weight,
              p_weight_goal: onboardingData.weightGoal,
              p_units: onboardingData.units,
            };

            const { error: rpcError } = await supabase.rpc('process_onboarding_data', rpcParams);

            if (rpcError) {
              console.error('❌ Onboarding processing failed:', rpcError);
              toast.error(
                'Account created but settings could not be saved. Please update them in Settings.'
              );
            }
          } catch (error) {
            console.error('❌ Error processing onboarding data:', error);
            toast.error(
              'Account created but settings could not be saved. Please update them in Settings.'
            );
          }
        }

        // Navigation handled by useAppInitialization hook
        // Just ensure account exists for new users
        await ensureAccountExists(data.user.id);
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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
              p_user_id: data.user.id,
              p_name: onboardingData.name,
              p_date_of_birth: onboardingData.dateOfBirth,
              p_fitness_goal: onboardingData.fitnessGoal,
              p_fitness_frequency: onboardingData.fitnessFrequency,
              p_fitness_experience: onboardingData.fitnessExperience,
              p_nutrition_goal: onboardingData.nutritionGoal,
              p_activity_level: onboardingData.activityLevel,
              p_nutrition_experience: onboardingData.nutritionExperience,
              p_height: onboardingData.height,
              p_weight: onboardingData.weight,
              p_weight_goal: onboardingData.weightGoal,
              p_units: onboardingData.units,
            };

            const { error } = await supabase.rpc('process_onboarding_data', rpcParams);

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

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    // Clear onboarding data on signout
    await OnboardingStorage.clear();
    setLoading(false);
    if (error) throw error;
    // Navigation handled by onAuthStateChange listener
  };

  // New transactional signup with onboarding via Edge Function
  const signUpWithOnboarding = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    plan?: string
  ) => {
    setLoading(true);
    try {
      // Load onboarding data from storage
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

      // Navigation handled by index page after auth state updates
    } catch (error: any) {
      console.error('Signup with onboarding failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // New transactional Apple signup with onboarding via Edge Function
  const signUpWithAppleOnboarding = async (plan?: string) => {
    setLoading(true);
    try {
      // Load onboarding data from storage
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

      // Set the session from the edge function response
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

      // Clear onboarding data after successful signup
      await OnboardingStorage.clear();

      // Navigation handled by index page after auth state updates
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

  const value = {
    session,
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithApple,
    signUpWithOnboarding,
    signUpWithAppleOnboarding,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
