import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { getTodayDateString } from '@/lib/utils/date-helpers';

// Types
interface UserSupplement {
  id?: string;
  name: string;
  default_dosage: string;
  frequency: 'Daily' | '3x/week' | '2x/week' | 'Weekly';
  reminder_time?: string;
  importance: 'high' | 'medium' | 'low';
  days_of_week: string[];
  is_active: boolean;
}

interface SupplementLog {
  date: string;
  supplement_name: string;
  dosage?: string;
  taken: boolean;
  time_logged?: string;
}

interface TodaysSupplement extends UserSupplement {
  taken: boolean;
  actual_dosage: string;
  time_logged?: string;
}

interface SupplementRecommendation {
  name: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  dosage: string;
}

// Query keys
export const supplementQueryKeys = {
  all: ['supplements'] as const,
  list: () => [...supplementQueryKeys.all, 'list'] as const,
  logs: (startDate?: string, endDate?: string) =>
    [...supplementQueryKeys.all, 'logs', { startDate, endDate }] as const,
  today: () => [...supplementQueryKeys.all, 'today'] as const,
  recommendations: (cyclePhase: string) =>
    [...supplementQueryKeys.all, 'recommendations', cyclePhase] as const,
  analytics: (days: number) => [...supplementQueryKeys.all, 'analytics', days] as const,
};

// Edge function helper
async function callSupplementFunction(endpoint: string, options?: RequestInit) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/supplement-manager/${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      ...options,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to call supplement function');
  }

  return response.json();
}

// Hooks
export function useUserSupplements() {
  return useQuery({
    queryKey: supplementQueryKeys.list(),
    queryFn: () => callSupplementFunction('supplements'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSupplementLogs(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: supplementQueryKeys.logs(startDate, endDate),
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      return callSupplementFunction(`logs?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTodaysSupplements() {
  const todayString = getTodayDateString();

  return useQuery({
    queryKey: [...supplementQueryKeys.today(), todayString],
    queryFn: async () => {

      const result = await callSupplementFunction(`today?date=${todayString}`);

      return result;
    },
    staleTime: 30 * 1000, // 30 seconds - very frequent for today's data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

export function useSupplementRecommendations(cyclePhase: string) {
  return useQuery({
    queryKey: supplementQueryKeys.recommendations(cyclePhase),
    queryFn: () => callSupplementFunction(`recommendations?cycle_phase=${cyclePhase}`),
    enabled: !!cyclePhase,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useSupplementAnalytics(days = 30) {
  return useQuery({
    queryKey: supplementQueryKeys.analytics(days),
    queryFn: () => callSupplementFunction(`analytics?days=${days}`),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Mutations
export function useAddSupplement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplement: UserSupplement) =>
      callSupplementFunction('supplement', {
        method: 'POST',
        body: JSON.stringify(supplement),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to add supplement', {
        description: error.message,
      });
    },
  });
}

export function useUpdateSupplement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplement: UserSupplement & { id: string }) =>
      callSupplementFunction('supplement', {
        method: 'PUT',
        body: JSON.stringify(supplement),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to update supplement', {
        description: error.message,
      });
    },
  });
}

export function useDeleteSupplement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      callSupplementFunction('supplement', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to remove supplement', {
        description: error.message,
      });
    },
  });
}

export function useLogSupplement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: SupplementLog) =>
      callSupplementFunction('log', {
        method: 'POST',
        body: JSON.stringify(log),
      }),
    onSuccess: (data, variables) => {
      // Invalidate all supplement queries
      queryClient.invalidateQueries({ queryKey: supplementQueryKeys.all });

      // Also specifically invalidate today's supplements query
      const todayString = getTodayDateString();

      queryClient.invalidateQueries({ queryKey: [...supplementQueryKeys.today(), todayString] });
      queryClient.refetchQueries({ queryKey: [...supplementQueryKeys.today(), todayString] });

      // If logging for a different date, invalidate that too
      if (variables.date !== todayString) {
        queryClient.invalidateQueries({
          queryKey: [...supplementQueryKeys.today(), variables.date],
        });
      }

      // Don't show toast for individual supplement logs - too noisy
    },
    onError: (error: Error) => {
      toast.error('Failed to log supplement', {
        description: error.message,
      });
    },
  });
}

export function useBulkLogSupplements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      date,
      supplements,
    }: {
      date: string;
      supplements: Array<{ name: string; taken: boolean; dosage?: string }>;
    }) =>
      callSupplementFunction('bulk-log', {
        method: 'POST',
        body: JSON.stringify({ date, supplements }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to log supplements', {
        description: error.message,
      });
    },
  });
}

// Utility functions
export function isSupplementScheduledToday(supplement: UserSupplement): boolean {
  if (supplement.frequency === 'Daily') return true;

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

  return supplement.days_of_week.includes(dayName) || supplement.days_of_week.includes('Daily');
}

export function getSupplementStatusColor(importance: string, taken: boolean): string {
  if (taken) return '#10B981'; // Green

  switch (importance) {
    case 'high':
      return '#EF4444'; // Red
    case 'medium':
      return '#F59E0B'; // Yellow
    case 'low':
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
}
