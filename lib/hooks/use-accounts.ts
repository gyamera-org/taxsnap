import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export interface OnboardingPreferences {
  primary_goal: string | null;
  symptoms: string[];
  daily_struggles: string[];
  food_relationship: string | null;
  favorite_foods: string[];
  activity_level: string | null;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  date_of_birth: string | null;
  // Onboarding preferences
  onboarding_preferences: OnboardingPreferences | null;
  // Subscription
  subscription_status: string;
  subscription_plan: string;
  subscription_platform: string;
  subscription_expires_at: string | null;
  subscription_billing: string | null;
  // Free scan tracking
  free_scans_used: number;
  created_at: string;
  updated_at: string;
}

export function useAccount(
  options?: Omit<UseQueryOptions<Account | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data as Account;
    },
    ...options,
  });
}

interface UpdateAccountPayload {
  name?: string;
  username?: string;
  onboarding_completed?: boolean;
  date_of_birth?: string;
  avatar_url?: string | null;
  onboarding_preferences?: OnboardingPreferences;
}

export function useUpdateAccount() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAccountPayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If updating username, check if it's unique
      if (payload.username) {
        const { data: existing } = await supabase
          .from('accounts')
          .select('id')
          .eq('username', payload.username)
          .neq('id', user.id)
          .single();

        if (existing) {
          throw new Error('Username is already taken');
        }
      }

      const { data, error } = await supabase
        .from('accounts')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
    },
    onError: (err: any) => handleError(err, 'Failed to update account'),
  });
}

export function useSaveOnboardingPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: OnboardingPreferences) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('accounts')
        .update({
          onboarding_preferences: preferences,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
    },
    onError: (err: any) => handleError(err, 'Failed to save preferences'),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (feedback?: { reason: string; additional_comments?: string }) => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      // Call the delete account edge function
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: feedback || {},
      });

      if (error) throw new Error(error.message || 'Failed to delete account');
      if (data?.error) throw new Error(data.error);

      // Sign out locally
      await supabase.auth.signOut();

      return data;
    },
    onSuccess: () => {
      qc.clear();
      router.replace('/auth?mode=signup');
    },
    onError: (err: any) => handleError(err, 'Failed to delete account'),
  });
}

export interface Subscription {
  status: string;
  plan: string;
  platform: string;
  expires_at: string | null;
  billing: string | null;
}

export function useSubscription(
  options?: Omit<UseQueryOptions<Subscription | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.accounts.subscription(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('accounts')
        .select('subscription_status, subscription_plan, subscription_platform, subscription_expires_at, subscription_billing')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        status: data.subscription_status,
        plan: data.subscription_plan,
        platform: data.subscription_platform,
        expires_at: data.subscription_expires_at,
        billing: data.subscription_billing,
      };
    },
    ...options,
  });
}

// ============================================
// ONBOARDING PROFILE HOOKS
// ============================================

export interface OnboardingProfile {
  id: string;
  user_id: string;
  primary_goal: string | null;
  symptoms: string[];
  daily_struggles: string[];
  food_relationship: string | null;
  feel_good_foods: string[];
  guilt_foods: string[];
  activity_level: string | null;
  referral_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingProfileInput {
  primary_goal?: string | null;
  symptoms?: string[];
  daily_struggles?: string[];
  food_relationship?: string | null;
  feel_good_foods?: string[];
  guilt_foods?: string[];
  activity_level?: string | null;
  referral_source?: string | null;
}

export function useOnboardingProfile(
  options?: Omit<UseQueryOptions<OnboardingProfile | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.accounts.onboardingProfile(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('onboarding_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data as OnboardingProfile;
    },
    ...options,
  });
}

export function useSaveOnboardingProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (profile: OnboardingProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if profile already exists
      const { data: existing } = await supabase
        .from('onboarding_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;

      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from('onboarding_profiles')
          .update(profile)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from('onboarding_profiles')
          .insert({
            user_id: user.id,
            ...profile,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Also mark onboarding as completed in accounts table
      await supabase
        .from('accounts')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      return result as OnboardingProfile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.onboardingProfile() });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
    },
    onError: (err: any) => handleError(err, 'Failed to save onboarding profile'),
  });
}

export function useUpdateOnboardingProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (profile: OnboardingProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('onboarding_profiles')
        .update(profile)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as OnboardingProfile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.onboardingProfile() });
    },
    onError: (err: any) => handleError(err, 'Failed to update profile'),
  });
}
