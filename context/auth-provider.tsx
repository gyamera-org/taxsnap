import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { OnboardingStorage } from '@/lib/utils/onboarding-storage';

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
  signUpWithEmailFree: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
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

  // Helper function to determine where to redirect after auth
  const getPostAuthRoute = async (
    userId: string,
    plan?: string,
    isNewUser?: boolean
  ): Promise<string> => {
    try {
      // Ensure account record exists
      await ensureAccountExists(userId);

      // If explicitly marked as new user (from onboarding flow), go to paywall
      if (isNewUser) {
        return '/paywall?source=onboarding&successRoute=/(tabs)/nutrition';
      }

      // For uncertain cases (like Apple sign-in), check if user has completed onboarding
      const { data: account } = await supabase
        .from('accounts')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single();

      // If user hasn't completed onboarding, redirect to onboarding
      if (!account?.onboarding_completed) {
        return '/onboarding';
      }

      // Existing users with completed onboarding go directly to main app
      return '/(tabs)/nutrition';
    } catch (error) {
      console.error('Error in getPostAuthRoute:', error);
      // Fallback: go to main app, let subscription guard handle the rest
      return '/(tabs)/nutrition';
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

        // Only handle explicit sign out events
        if (event === 'SIGNED_OUT') {
          router.replace('/');
        }

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
      // Existing user signing in - no plan needed
      const route = await getPostAuthRoute(data.user.id, undefined, false);
      router.replace(route as any);
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

            const { data: rpcData, error: rpcError } = await supabase.rpc(
              'process_onboarding_data',
              rpcParams
            );

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

        // New user signing up with a plan
        const route = await getPostAuthRoute(data.user.id, plan, true);
        router.replace(route as any);
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmailFree = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    onboardingData?: any
  ) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          onboarding_data: onboardingData ? JSON.stringify(onboardingData) : null,
        },
      },
    });
    if (data.user && data.session) {
      // Process onboarding data if provided
      if (onboardingData) {
        try {
          const { error } = await supabase.rpc('process_onboarding_data', {
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
          });

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

      // Navigate based on the new flow
      const route = await getPostAuthRoute(data.user.id, 'free', true);
      router.replace(route as any);
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

        // Check if this is a new user or existing user
        // If we have onboarding data, it's definitely a new user from the signup flow
        const isNewUser = !!onboardingData;
        const route = await getPostAuthRoute(data.user.id, plan, isNewUser);
        router.replace(route as any);
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
    router.replace('/auth?mode=signin');
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

      // Clear onboarding data after successful signup
      await OnboardingStorage.clear();

      // Navigate to appropriate route
      const route =
        plan && plan !== 'free'
          ? '/paywall?source=onboarding&successRoute=/(tabs)/nutrition'
          : '/(tabs)/nutrition';

      router.replace(route as any);
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

      // Clear onboarding data after successful signup
      await OnboardingStorage.clear();

      // Navigate to appropriate route
      const route =
        plan && plan !== 'free'
          ? '/paywall?source=onboarding&successRoute=/(tabs)/nutrition'
          : '/(tabs)/nutrition';

      router.replace(route as any);
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      console.error('Apple signup with onboarding failed:', error);
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
    signUpWithEmailFree,
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
