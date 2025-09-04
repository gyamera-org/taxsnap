import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';

// Types for Flo-style period cycles
export interface PeriodCycle {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  predicted_end_date: string | null; // New field for Flo-style predictions
  cycle_length: number | null;
  period_length: number | null;
  flow_intensity?: 'light' | 'moderate' | 'heavy';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface NextPeriodPrediction {
  start_date: string;
  end_date: string;
  days_until: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface CurrentCycleInfo {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  name: string;
  day_in_cycle: number;
  days_remaining: number;
  energy_level: 'low' | 'building' | 'high' | 'declining';
  description: string;
  recommended_exercises: string[];
  pregnancy_chances: {
    level: string;
    color: string;
    description: string;
  };
  next_period_prediction?: NextPeriodPrediction;
  has_active_cycle: boolean;
  current_cycle?: {
    id: string;
    start_date: string;
    end_date: string | null;
    predicted_end_date: string | null;
    can_edit_start: boolean;
    can_edit_end: boolean;
  };
}

// Query keys for Flo-style cycle tracking
export const floStyleQueryKeys = {
  all: ['flo-cycle'] as const,
  currentInfo: (date?: string) => [...floStyleQueryKeys.all, 'current-info', date] as const,
  cycles: () => [...floStyleQueryKeys.all, 'cycles'] as const,
  settings: () => [...floStyleQueryKeys.all, 'settings'] as const,
};

// Edge function helper
async function callFloStyleCycleFunction(endpoint: string, options?: RequestInit) {
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

// MAIN HOOK: Get current cycle info with Flo-style predictions
export function useCurrentCycleInfo(selectedDate?: string) {
  return useQuery({
    queryKey: floStyleQueryKeys.currentInfo(selectedDate),
    queryFn: () => {
      const params = selectedDate ? `?date=${selectedDate}` : '';
      return callFloStyleCycleFunction(`current-info${params}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get period cycles
export function usePeriodCycles(limit = 10) {
  return useQuery({
    queryKey: floStyleQueryKeys.cycles(),
    queryFn: () => callFloStyleCycleFunction(`cycles?limit=${limit}`),
    staleTime: 5 * 60 * 1000,
  });
}

// Get cycle settings
export function useCycleSettings() {
  return useQuery({
    queryKey: floStyleQueryKeys.settings(),
    queryFn: () => callFloStyleCycleFunction('settings'),
    staleTime: 10 * 60 * 1000,
  });
}

// FLO-STYLE: Start period with immediate predictions
export function useStartPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (periodData: {
      start_date: string;
      flow_intensity?: 'light' | 'moderate' | 'heavy';
      notes?: string;
    }) =>
      callFloStyleCycleFunction('start-period', {
        method: 'POST',
        body: JSON.stringify(periodData),
      }),
    onSuccess: (data) => {
      // Invalidate all cycle queries
      queryClient.invalidateQueries({ queryKey: floStyleQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to start period', {
        description: error.message,
      });
    },
  });
}

// FLO-STYLE: Update cycle dates (start and/or end)
export function useUpdateCycleDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData: {
      cycle_id: string;
      start_date?: string;
      end_date?: string | null;
      predicted_end_date?: string | null;
    }) =>
      callFloStyleCycleFunction('update-cycle-dates', {
        method: 'POST',
        body: JSON.stringify(updateData),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: floStyleQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to update cycle dates', {
        description: error.message,
      });
    },
  });
}

// End current period
export function useEndPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (endData: { end_date: string }) =>
      callFloStyleCycleFunction('end-period', {
        method: 'POST',
        body: JSON.stringify(endData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: floStyleQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to end period', {
        description: error.message,
      });
    },
  });
}

// Delete a period cycle
export function useDeletePeriodCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycleId: string) =>
      callFloStyleCycleFunction('cycle', {
        method: 'DELETE',
        body: JSON.stringify({ id: cycleId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: floStyleQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete period cycle', {
        description: error.message,
      });
    },
  });
}

// Update cycle settings
export function useUpdateCycleSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: any) =>
      callFloStyleCycleFunction('settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: floStyleQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error('Failed to update settings', {
        description: error.message,
      });
    },
  });
}

// Convenience hooks for common UI patterns

// Check if user has ongoing period
export function useHasOngoingPeriod() {
  const { data: cycles = [] } = usePeriodCycles(1);

  return cycles.length > 0 && cycles[0].end_date === null;
}

// Get today's cycle info specifically
export function useTodaysCycleInfo() {
  const today = new Date().toISOString().split('T')[0];
  return useCurrentCycleInfo(today);
}

// Get current cycle for editing
export function useCurrentCycleForEditing() {
  const { data: cycleInfo } = useCurrentCycleInfo();

  return {
    currentCycle: cycleInfo?.current_cycle,
    canEdit: cycleInfo?.has_active_cycle && cycleInfo?.current_cycle,
    updateDates: useUpdateCycleDates(),
    endPeriod: useEndPeriod(),
  };
}

// Helper hook for period predictions
export function usePeriodPredictions() {
  const { data: cycleInfo } = useCurrentCycleInfo();

  return {
    nextPeriod: cycleInfo?.next_period_prediction,
    hasActiveCycle: cycleInfo?.has_active_cycle,
    cycleDay: cycleInfo?.day_in_cycle,
    currentPhase: cycleInfo?.phase,
  };
}
