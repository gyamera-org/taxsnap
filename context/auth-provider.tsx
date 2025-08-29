import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

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

      // Check if we're in development environment
      const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

      if (isDevelopment && isNewUser) {
        // In development, new users go directly to nutrition after signup
        return '/(tabs)/nutrition';
      }

      // Initialize RevenueCat with the user ID first
      // TODO: Update to use RevenueCat context
      // await revenueCatService.identifyUser(userId);

      // Check subscription status
      // TODO: Update to use RevenueCat context
      // const result = await revenueCatService.checkSubscriptionStatus(userId);
      const result = { isSubscribed: false, error: null }; // Temporary fallback

      if (result.error) {
        console.error('Error checking subscription:', result.error);
        // If can't check subscription, send to payment if plan specified, otherwise welcome
        return plan ? `/payment-processing?plan=${plan}` : '/';
      }

      // If user has active subscription, go directly to main app
      if (result.isSubscribed) {
        return '/(tabs)/nutrition';
      }

      // User doesn't have active subscription
      if (plan) {
        // User has a plan (new or existing) - trigger immediate purchase
        toast.info('Processing your subscription...');
        const success = await handleImmediatePurchase(userId, plan);
        if (success) {
          return '/(tabs)/nutrition';
        } else {
          // Payment failed - show payment popup again
          return await showPaymentRetry(userId, plan);
        }
      } else {
        // No plan specified - user needs to choose a plan first
        toast.info('Please choose a subscription plan to continue.');
        return '/'; // Back to welcome screen to choose plan
      }
    } catch (error) {
      console.error('Error in getPostAuthRoute:', error);
      // Fallback: always go back to welcome to choose plan
      toast.error('Something went wrong. Please try again.');
      return '/';
    }
  };

  // Helper function to trigger immediate purchase
  const handleImmediatePurchase = async (userId: string, plan: string): Promise<boolean> => {
    try {
      // Get current offerings
      // TODO: Update to use RevenueCat context
      // const currentOffering = await revenueCatService.getCurrentOffering();
      const currentOffering: any = null; // Temporary fallback

      if (!currentOffering?.availablePackages) {
        toast.error('No subscription options available');
        return false;
      }

      // Find the package based on selected plan
      const packageToPurchase = currentOffering.availablePackages.find((pkg: any) =>
        plan === 'yearly'
          ? pkg.packageType === 'ANNUAL' ||
            pkg.identifier.includes('yearly') ||
            pkg.product.identifier.includes('yearly')
          : pkg.packageType === 'MONTHLY' ||
            pkg.identifier.includes('monthly') ||
            pkg.product.identifier.includes('monthly')
      );

      if (!packageToPurchase) {
        toast.error('Selected subscription plan not available');
        return false;
      }

      // Check if we're in Expo Go - if so, simulate success
      const isExpoGo = __DEV__ && !process.env.EXPO_STANDALONE_APP;

      if (isExpoGo) {
        // Simulate purchase in Expo Go
        return true;
      }

      // Process actual purchase with RevenueCat
      // TODO: Update to use RevenueCat context
      // const result = await revenueCatService.purchasePackage(packageToPurchase);
      const result: any = { success: false }; // Temporary fallback

      if (result.success) {
        // Update RevenueCat with the user ID to sync subscription
        // TODO: Update to use RevenueCat context
        // await revenueCatService.identifyUser(userId);

        // Update database with subscription status
        await supabase.rpc('update_subscription_status', {
          p_user_id: userId,
          p_subscription_status: 'active',
          p_subscription_plan: plan,
          p_subscription_active: true,
        });

        return true;
      } else {
        // Payment failed - update database to reflect free status
        await supabase.rpc('update_subscription_status', {
          p_user_id: userId,
          p_subscription_status: 'payment_failed',
          p_subscription_plan: 'free',
          p_subscription_active: false,
        });

        console.log('Payment failed:', result.error);
        return false;
      }
    } catch (error: any) {
      // Payment error - update database to reflect free status
      try {
        await supabase.rpc('update_subscription_status', {
          p_user_id: userId,
          p_subscription_status: 'payment_error',
          p_subscription_plan: 'free',
          p_subscription_active: false,
        });
      } catch (dbError) {
        console.error('Error updating database after payment failure:', dbError);
      }

      console.error('Error in handleImmediatePurchase:', error);
      return false;
    }
  };

  // Helper function to show payment retry popup
  const showPaymentRetry = async (userId: string, plan: string): Promise<string> => {
    // In a real app, this would show a modal/popup to retry payment
    // For now, we'll try payment again immediately
    const retrySuccess = await handleImmediatePurchase(userId, plan);

    if (retrySuccess) {
      return '/(tabs)/nutrition';
    } else {
      // Final fallback - show error and go back to welcome
      toast.error('Payment failed. Please try again from the welcome screen.');
      return '/';
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

    console.log('🔐 Starting signup with:', {
      email,
      firstName,
      lastName,
      plan,
      hasOnboardingData: !!onboardingData,
      onboardingData,
    });

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

      console.log('🔐 Signup response:', { data, error });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      if (data.user && data.session) {
        console.log('✅ User created successfully:', data.user.id);

        // Process onboarding data if provided
        if (onboardingData) {
          console.log('📋 Processing onboarding data...');
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

            console.log('📋 RPC params:', rpcParams);

            const { data: rpcData, error: rpcError } = await supabase.rpc(
              'process_onboarding_data',
              rpcParams
            );

            console.log('📋 RPC response:', { rpcData, rpcError });

            if (rpcError) {
              console.error('❌ Onboarding processing failed:', rpcError);
              toast.error(
                'Account created but settings could not be saved. Please update them in Settings.'
              );
            } else {
              console.log('✅ Onboarding processed successfully');
            }
          } catch (error) {
            console.error('❌ Error processing onboarding data:', error);
            toast.error(
              'Account created but settings could not be saved. Please update them in Settings.'
            );
          }
        }

        // New user signing up with a plan
        console.log('🚀 Navigating to post-auth route...');
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

      // Free users go directly to app, bypassing subscription check
      router.replace('/(tabs)/nutrition');
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
        options.data = {
          first_name:
            appleCredential.fullName?.givenName || onboardingData?.name?.split(' ')[0] || '',
          last_name:
            appleCredential.fullName?.familyName ||
            onboardingData?.name?.split(' ').slice(1).join(' ') ||
            '',
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
            const { error } = await supabase.rpc('process_onboarding_data', {
              p_user_id: data.user.id,
              p_onboarding_data: onboardingData,
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

        // Apple authentication - could be new or existing user
        const route = await getPostAuthRoute(data.user.id, plan, true);
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
    setLoading(false);
    if (error) throw error;
    router.replace('/auth?mode=signin');
  };

  const value = {
    session,
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signUpWithEmailFree,
    signInWithApple,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
