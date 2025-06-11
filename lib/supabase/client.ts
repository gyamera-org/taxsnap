import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
  );
}

// Custom storage implementation using Expo SecureStore for better persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto refresh with longer intervals
    autoRefreshToken: true,
    // Persist session in secure storage
    persistSession: true,
    // Use SecureStore for better persistence
    storage: ExpoSecureStoreAdapter,
    // Enable Apple and Google OAuth
    detectSessionInUrl: false,
    // Set longer session duration (7 days)
    flowType: 'pkce',
  },
});

// Utility function to check session status for debugging
export const checkSessionStatus = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    console.log('Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      error: error?.message,
    });
    return session;
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
};
