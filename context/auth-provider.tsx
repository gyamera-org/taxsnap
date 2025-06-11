import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { apiClient, api } from '@/lib/api';
import { SubscriptionResponse } from '@/lib/api/types';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from 'sonner-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  isSubscribed: boolean;
  subscriptionPlan: 'free' | 'pro' | null;
  checkOnboardingAndRedirect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'pro' | null>(null);

  // Enhanced session restoration with retry logic
  const restoreSession = async (retries = 3) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Session restoration error:', error);
        if (retries > 0) {
          // Retry after a short delay
          setTimeout(() => restoreSession(retries - 1), 1000);
          return;
        }
        // If all retries failed, clear any corrupt session data
        await supabase.auth.signOut();
        return;
      }

      if (session) {
        setSession(session);
        setUser(session.user);

        if (session.access_token) {
          apiClient.setToken(session.access_token);
          // Check subscription status for existing sessions
          await checkSubscriptionStatus();
        }
      } else {
        setSession(null);
        setUser(null);
        apiClient.setToken(null);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      if (retries > 0) {
        setTimeout(() => restoreSession(retries - 1), 1000);
      } else {
        // Clear session on final failure
        setSession(null);
        setUser(null);
        apiClient.setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial session restoration
    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        'Auth state change:',
        event,
        session ? `User: ${session.user?.email}` : 'No session'
      );

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.access_token) {
        apiClient.setToken(session.access_token);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkSubscriptionStatus();
          if (event === 'SIGNED_IN') {
            await ensureBackendAccount(session.user);
          }
        }
      } else {
        apiClient.setToken(null);
        setIsSubscribed(false);
        setSubscriptionPlan(null);
      }

      if (event === 'SIGNED_OUT') {
        setIsSubscribed(false);
        setSubscriptionPlan(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await apiClient.get<SubscriptionResponse>('/accounts/subscription');
      setIsSubscribed(response.isActive || false);
      setSubscriptionPlan(response.plan || 'free');
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      setIsSubscribed(false);
      setSubscriptionPlan('free');
    }
  };

  // Single function to ensure backend account exists
  const ensureBackendAccount = async (user: User) => {
    try {
      // Try to get existing account first
      await api.accounts.getAccount();
      router.replace('/(tabs)/products');
    } catch (error: any) {
      if (error?.status === 404) {
        // Account doesn't exist, create it
        await createBackendAccount(user);
      } else {
        // Other error, just proceed to products
        router.replace('/(tabs)/products');
      }
    }
  };

  const createBackendAccount = async (user: User) => {
    try {
      const name =
        `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
        user.email?.split('@')[0] ||
        'User';

      // Create basic account
      await api.accounts.createAccount({
        id: user.id,
        name,
      });

      const onboardingDataStr = await AsyncStorage.getItem('onboarding_data');
      if (onboardingDataStr) {
        const onboardingData = JSON.parse(onboardingDataStr);
        await completeOnboarding(user.id, onboardingData);
        await AsyncStorage.removeItem('onboarding_data');
      } else {
        await api.accounts.updateAccount({ onboardingCompleted: true });
      }

      router.replace('/(tabs)/products');
    } catch (error: any) {
      console.error('Failed to create backend account:', error);

      if (error.status === 409 || error.message?.includes('already exists')) {
        router.replace('/(tabs)/products');
      } else {
        toast.error('Failed to set up your account. Please try again.');
        router.replace('/(tabs)/products');
      }
    }
  };

  const completeOnboarding = async (accountId: string, onboardingData: any) => {
    const surveyResponses = {
      givingUpResponse: onboardingData.givingUpResponse,
      hardestPartResponse: onboardingData.hardestPartResponse,
      ingredientCheckResponse: onboardingData.ingredientCheckResponse,
      productSelectionResponse: onboardingData.productSelectionResponse,
      porosityTestResponse: onboardingData.porosityTestResponse,
      hairCareFrequencyResponse: onboardingData.hairCareFrequencyResponse,
      moistureRetentionResponse: onboardingData.moistureRetentionResponse,
      skinSensitivityResponse: onboardingData.skinSensitivityResponse,
      chemicalProcessingResponse: onboardingData.chemicalProcessingResponse,
      referralSource: onboardingData.referralSource,
    };

    const hairProfile = {
      hairTexture: onboardingData.hairTexture || '4A',
      hairPorosity: onboardingData.hairPorosity || 'normal',
      hairDensity: onboardingData.hairDensity || 'medium',
      scalpType: onboardingData.scalpType || 'normal',
      hairLength: onboardingData.hairLength || 'medium',
      chemicallyTreated: onboardingData.chemicallyTreated || false,
      treatmentTypes: onboardingData.treatmentTypes || [],
      concerns: onboardingData.concerns || [],
      goals: onboardingData.goals || [],
      allergies: onboardingData.allergies || [],
      preferences: onboardingData.preferences || {},
    };

    await api.onboarding.completeOnboarding({
      accountId,
      surveyResponses,
      hairProfile,
    });
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      apiClient.setToken(null);
      setIsSubscribed(false);
      setSubscriptionPlan(null);
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      // Ensure session is properly set
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        apiClient.setToken(data.session.access_token);
      }

      // Auth state change will handle the rest
    } catch (error: any) {
      console.error('Sign in failed:', error);
      // Don't clear existing session on network errors
      if (error.message?.includes('network') || error.message?.includes('timeout')) {
        toast.error('Network error. Please check your connection and try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        // User is signed up and signed in, create backend account
        await createBackendAccount(data.user);
      } else if (data.user && !data.session) {
        toast.success('Please check your email to verify your account');
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkOnboardingAndRedirect = async () => {
    if (!user) return;

    try {
      // Check if user has completed onboarding
      const account = await api.accounts.getAccount();

      if (account.onboardingCompleted) {
        router.replace('/(tabs)/products');
      } else {
        router.replace('/onboarding');
      }
    } catch (error: any) {
      console.error('Failed to check onboarding status:', error);
      // If there's an error, assume they need to complete onboarding
      router.replace('/onboarding');
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isSubscribed,
    subscriptionPlan,
    checkOnboardingAndRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
