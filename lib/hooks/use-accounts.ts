import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export interface Account {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  date_of_birth: string | null;
  // Subscription
  subscription_status: string;
  subscription_plan: string;
  subscription_platform: string;
  subscription_expires_at: string | null;
  subscription_billing: string | null;
  // Free usage tracking
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
