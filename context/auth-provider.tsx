import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { router } from 'expo-router';
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
  // Temporarily disabled subscription features
  isSubscribed: boolean;
  subscriptionPlan: 'free' | 'pro' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Temporarily set subscription to defaults
  const [isSubscribed] = useState(false);
  const [subscriptionPlan] = useState<'free' | 'pro' | null>('free');

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
      router.replace('/(tabs)/explore');
    }
    setLoading(false);
    if (error) throw error;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    if (data.user) {
      router.replace('/(tabs)/explore');
    }
    setLoading(false);
    if (error) throw error;

    if (!data.session) {
      toast.success('Check your email to verify your account');
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
    signOut,
    isSubscribed,
    subscriptionPlan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
