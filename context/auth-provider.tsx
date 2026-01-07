import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { DEV_MODE_CONFIG, isBypassActive } from '@/lib/config/dev-mode';
import { getOnboardingData, getUserName, clearOnboardingData } from '@/lib/utils/onboarding-storage';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithApple: () => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (reason: string, additionalComments?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a mock user for dev mode
const createMockUser = (): User => ({
  id: DEV_MODE_CONFIG.MOCK_USER.id,
  email: DEV_MODE_CONFIG.MOCK_USER.email,
  app_metadata: {},
  user_metadata: { full_name: DEV_MODE_CONFIG.MOCK_USER.name },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const isAuthBypassed = isBypassActive('AUTH');

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(isAuthBypassed ? createMockUser() : null);
  const [loading, setLoading] = useState(!isAuthBypassed);

  // Helper function to ensure account exists in database
  const ensureAccountExists = async (
    userId: string,
    userEmail?: string,
    userName?: string
  ): Promise<void> => {
    try {
      const { data: existing } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existing) {
        // Get onboarding data from AsyncStorage
        const onboardingData = await getOnboardingData();
        const storedName = await getUserName();

        // Generate username from email (before @)
        const username = userEmail?.split('@')[0] || '';

        const { error } = await supabase.from('accounts').insert({
          id: userId,
          name: storedName || userName || '',
          email: userEmail || '',
          username: username,
          onboarding_completed: !!onboardingData,
          // Save onboarding questionnaire data
          onboarding_income: onboardingData?.income || null,
          onboarding_work_type: onboardingData?.workType || null,
          onboarding_current_tracking: onboardingData?.currentTracking || null,
          onboarding_monthly_expenses: onboardingData?.monthlyExpenses || null,
          onboarding_expense_categories: onboardingData?.expenseCategories || [],
          onboarding_estimated_savings: onboardingData?.estimatedSavings || null,
          onboarding_estimated_missed_deductions: onboardingData?.estimatedMissedDeductions || null,
        });

        if (error) {
          console.error('Error creating account:', error);
        } else {
          // Clear local storage after saving to DB
          await clearOnboardingData();
        }
      }
    } catch (error) {
      console.error('Error ensuring account exists:', error);
    }
  };

  // Handle deep link for OAuth callback
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (url.includes('auth/callback')) {
        // Extract tokens from URL
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast.error('Sign in failed');
          }
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Listen for auth state changes (skip in dev mode with auth bypass)
  useEffect(() => {
    if (isAuthBypassed) {
      console.log('🔧 Auth bypassed - using mock user:', DEV_MODE_CONFIG.MOCK_USER.email);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth event:', event);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession?.user) {
        const userEmail = newSession.user.email || '';
        const userName =
          newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name || '';
        await ensureAccountExists(newSession.user.id, userEmail, userName);
      }

      // Handle token refresh failure - user needs to sign in again
      if (event === 'TOKEN_REFRESHED' && !newSession) {
        console.log('Token refresh failed, clearing session');
        setSession(null);
        setUser(null);
      }
    });

    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session: restored },
          error,
        } = await supabase.auth.getSession();

        // Handle invalid refresh token error
        if (error?.message?.includes('Refresh Token')) {
          console.log('Invalid refresh token, signing out');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }

        setSession(restored);
        setUser(restored?.user ?? null);
      } catch (err: any) {
        console.error('Session restore error:', err);
        // If it's a refresh token error, clear the session
        if (err?.message?.includes('Refresh Token')) {
          await supabase.auth.signOut();
        }
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    return () => subscription.unsubscribe();
  }, [isAuthBypassed]);

  const signInWithApple = async (): Promise<boolean> => {
    // In dev mode, skip Apple auth and go directly to home
    if (isAuthBypassed) {
      console.log('🔧 Bypassing Apple sign-in, navigating to home');
      router.replace('/(tabs)/home');
      return true;
    }

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

      const options: any = {};
      if (appleCredential.fullName?.givenName || appleCredential.fullName?.familyName) {
        const fullName = [appleCredential.fullName?.givenName, appleCredential.fullName?.familyName]
          .filter(Boolean)
          .join(' ');

        options.data = {
          full_name: fullName,
        };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleCredential.identityToken!,
        nonce,
        options,
      });

      if (error) throw error;

      // Ensure account exists in database
      if (data.user) {
        await ensureAccountExists(data.user.id, data.user.email, options.data?.full_name);
      }

      // Navigation is handled by index.tsx based on subscription status
      // It will route to paywall if not subscribed, or home if subscribed
      router.replace('/');
      return true;
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return false; // Cancelled
      }
      console.error('Apple sign-in error:', error);
      toast.error(error.message || 'Apple sign in failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // In dev mode, skip Google auth and go directly to home
    if (isAuthBypassed) {
      console.log('🔧 Bypassing Google sign-in, navigating to home');
      router.replace('/(tabs)/home');
      return;
    }

    setLoading(true);
    try {
      // Create redirect URI for OAuth
      const redirectUri = makeRedirectUri({
        scheme: 'YOUR_APP_SCHEME',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data.url) {
        // Open browser for OAuth
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

        if (result.type === 'success' && result.url) {
          // Extract tokens from callback URL
          const params = new URLSearchParams(
            result.url.split('#')[1] || result.url.split('?')[1] || ''
          );
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;
          }
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      router.replace('/auth');
      // toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (reason: string, additionalComments?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { reason, additional_comments: additionalComments },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSession(null);
      setUser(null);
      toast.success('Account deleted successfully');
      router.replace('/auth');
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signInWithApple,
    signInWithGoogle,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
