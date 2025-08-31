import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';

// Types
interface CycleSettings {
  cycle_length: number;
  period_length: number;
  last_period_date: string | null;
}

interface PeriodLog {
  date: string;
  is_start_day?: boolean;
  flow_intensity?: 'light' | 'moderate' | 'heavy';
  mood?: 'happy' | 'normal' | 'sad' | 'irritable' | 'anxious';
  symptoms?: string[];
  notes?: string;
}

interface CurrentCyclePhase {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  name: string;
  day_in_cycle: number;
  days_remaining: number;
  energy_level: 'low' | 'building' | 'high' | 'declining';
  description: string;
  recommended_exercises: string[];
}

// Query keys
export const cycleQueryKeys = {
  all: ['cycle'] as const,
  settings: () => [...cycleQueryKeys.all, 'settings'] as const,
  currentPhase: () => [...cycleQueryKeys.all, 'current-phase'] as const,
  stats: () => [...cycleQueryKeys.all, 'stats'] as const,
  logs: (startDate?: string, endDate?: string) =>
    [...cycleQueryKeys.all, 'logs', { startDate, endDate }] as const,
  cycles: () => [...cycleQueryKeys.all, 'cycles'] as const,
};

// Edge function helper
async function callCycleFunction(endpoint: string, options?: RequestInit) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/cycle-manager/${endpoint}`,
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
    throw new Error(error.error || 'Failed to call cycle function');
  }

  return response.json();
}

// Hooks
export function useCycleSettings() {
  return useQuery({
    queryKey: cycleQueryKeys.settings(),
    queryFn: () => callCycleFunction('settings'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurrentCyclePhase() {
  return useQuery({
    queryKey: cycleQueryKeys.currentPhase(),
    queryFn: () => callCycleFunction('current-phase'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useCycleStats() {
  return useQuery({
    queryKey: cycleQueryKeys.stats(),
    queryFn: () => callCycleFunction('stats'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function usePeriodLogs(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: cycleQueryKeys.logs(startDate, endDate),
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      return callCycleFunction(`logs?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePeriodCycles() {
  return useQuery({
    queryKey: cycleQueryKeys.cycles(),
    queryFn: () => callCycleFunction('cycles'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Real-time period logs hook with Supabase realtime
export function usePeriodLogsRealtime(startDate?: string, endDate?: string) {
  const queryClient = useQueryClient();
  const query = usePeriodLogs(startDate, endDate);

  useEffect(() => {
    let channel: any;

    const setupRealtimeSubscription = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) return;

      // Subscribe to period_logs changes
      channel = supabase
        .channel('period_logs_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'period_logs',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            console.log('Period logs changed:', payload);
            // Invalidate all cycle-related queries to refresh predictions
            queryClient.invalidateQueries({ queryKey: cycleQueryKeys.all });
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  return query;
}

// Mutations
export function useUpdateCycleSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: CycleSettings) =>
      callCycleFunction('settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to update settings', {
        description: error.message,
      });
    },
  });
}

export function useLogPeriodData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: PeriodLog) =>
      callCycleFunction('log', {
        method: 'POST',
        body: JSON.stringify(log),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to log period data', {
        description: error.message,
      });
    },
  });
}

export function useDeletePeriodLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date: string) =>
      callCycleFunction('log', {
        method: 'DELETE',
        body: JSON.stringify({ date }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete period log', {
        description: error.message,
      });
    },
  });
}

// Helper hook to get today's existing period log data
export function useTodaysPeriodLog() {
  const today = new Date().toISOString().split('T')[0];
  const { data: periodLogs = [] } = usePeriodLogs(today, today);

  // Return today's log if it exists
  return periodLogs.find((log: PeriodLog) => log.date === today) || null;
}
