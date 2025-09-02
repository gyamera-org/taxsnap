/**
 * Daily supplement tracking hooks
 * This system allows users to:
 * 1. Add supplements to their list (one-time setup)
 * 2. Mark supplements as taken/not taken each day
 * 3. View daily progress and history
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { getTodayDateString } from '@/lib/utils/date-helpers';

// Types
export interface UserSupplement {
  id: string;
  name: string;
  default_dosage: string;
  frequency: 'Daily' | '3x/week' | '2x/week' | 'Weekly';
  days_of_week: string[];
  importance: 'high' | 'medium' | 'low';
  reminder_time?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DailySupplementEntry {
  id?: string;
  user_id: string;
  supplement_id: string;
  supplement_name: string;
  date: string; // YYYY-MM-DD format
  taken: boolean;
  time_taken?: string; // HH:MM:SS format
  dosage_taken?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailySupplementStatus {
  supplement: UserSupplement;
  entry?: DailySupplementEntry;
  taken: boolean;
  scheduled: boolean; // Is this supplement scheduled for this day?
}

// Query keys
export const dailySupplementQueryKeys = {
  all: ['daily-supplements'] as const,
  userSupplements: () => [...dailySupplementQueryKeys.all, 'user-supplements'] as const,
  dailyEntries: (date: string) => [...dailySupplementQueryKeys.all, 'daily-entries', date] as const,
  dailyStatus: (date: string) => [...dailySupplementQueryKeys.all, 'daily-status', date] as const,
  history: (startDate: string, endDate: string) =>
    [...dailySupplementQueryKeys.all, 'history', { startDate, endDate }] as const,
};

/**
 * Get user's supplement list (their configured supplements)
 */
export function useUserSupplements() {
  return useQuery({
    queryKey: dailySupplementQueryKeys.userSupplements(),
    queryFn: async (): Promise<UserSupplement[]> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_supplements')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('importance', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get daily supplement entries for a specific date
 */
export function useDailySupplementEntries(date: string) {
  return useQuery({
    queryKey: dailySupplementQueryKeys.dailyEntries(date),
    queryFn: async (): Promise<DailySupplementEntry[]> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_supplement_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get combined daily supplement status (supplements + entries)
 * This is the main hook for displaying daily supplement progress
 */
export function useDailySupplementStatus(date: string = getTodayDateString()) {
  const { data: userSupplements = [] } = useUserSupplements();
  const { data: dailyEntries = [] } = useDailySupplementEntries(date);

  return useQuery({
    queryKey: dailySupplementQueryKeys.dailyStatus(date),
    queryFn: (): DailySupplementStatus[] => {
      return userSupplements
        .map((supplement) => {
          // Check if this supplement is scheduled for the given date
          const scheduled = isSupplementScheduledForDate(supplement, date);

          // Find the daily entry for this supplement
          const entry = dailyEntries.find((e) => e.supplement_id === supplement.id);

          // Handle boolean properly - entry.taken can be false (not falsy)
          const taken = entry?.taken ?? false;

          return {
            supplement,
            entry,
            taken,
            scheduled,
          };
        })
        .filter((status) => status.scheduled); // Only return scheduled supplements
    },
    enabled: userSupplements.length > 0,
    staleTime: 30 * 1000,
  });
}

/**
 * Check if a supplement is scheduled for a specific date
 */
function isSupplementScheduledForDate(supplement: UserSupplement, date: string): boolean {
  if (supplement.frequency === 'Daily') return true;

  const targetDate = new Date(date);
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

  return supplement.days_of_week.includes(dayName);
}

/**
 * Toggle a supplement's taken status for a specific date
 */
export function useToggleSupplementTaken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      supplementId: string;
      supplementName: string;
      date: string;
      taken: boolean;
      dosage?: string;
      notes?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { supplementId, supplementName, date, taken, dosage, notes } = params;

      // Upsert the daily entry
      const entryData = {
        user_id: user.user.id,
        supplement_id: supplementId,
        supplement_name: supplementName,
        date,
        taken,
        time_taken: taken ? new Date().toTimeString().slice(0, 8) : null,
        dosage_taken: dosage,
        notes,
      };

      const { data, error } = await supabase
        .from('daily_supplement_entries')
        .upsert(entryData, {
          onConflict: 'user_id,supplement_id,date',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic updates for instant UI feedback
    onMutate: async (variables) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: dailySupplementQueryKeys.dailyStatus(variables.date),
      });
      await queryClient.cancelQueries({
        queryKey: dailySupplementQueryKeys.dailyEntries(variables.date),
      });

      // Snapshot the previous values
      const previousStatus = queryClient.getQueryData(
        dailySupplementQueryKeys.dailyStatus(variables.date)
      ) as DailySupplementStatus[] | undefined;

      const previousEntries = queryClient.getQueryData(
        dailySupplementQueryKeys.dailyEntries(variables.date)
      ) as DailySupplementEntry[] | undefined;

      // Update daily entries cache first
      queryClient.setQueryData(
        dailySupplementQueryKeys.dailyEntries(variables.date),
        (old: DailySupplementEntry[] | undefined) => {
          if (!old) return old;

          const existingEntryIndex = old.findIndex(
            (e) => e.supplement_id === variables.supplementId
          );
          const updatedEntry: DailySupplementEntry = {
            supplement_id: variables.supplementId,
            supplement_name: variables.supplementName,
            date: variables.date,
            taken: variables.taken,
            time_taken: variables.taken ? new Date().toTimeString().slice(0, 8) : undefined,
            dosage_taken: variables.dosage,
            notes: variables.notes,
            user_id: '', // Will be filled by server
          };

          if (existingEntryIndex >= 0) {
            // Update existing entry
            const newEntries = [...old];
            newEntries[existingEntryIndex] = { ...old[existingEntryIndex], ...updatedEntry };
            return newEntries;
          } else {
            // Add new entry
            return [...old, updatedEntry];
          }
        }
      );

      // Optimistically update the UI
      queryClient.setQueryData(
        dailySupplementQueryKeys.dailyStatus(variables.date),
        (old: DailySupplementStatus[] | undefined) => {
          if (!old) return old;

          const updated = old.map((status) => {
            if (status.supplement.id === variables.supplementId) {
              const newStatus = {
                ...status,
                taken: variables.taken,
                entry: {
                  ...status.entry,
                  supplement_id: variables.supplementId,
                  supplement_name: variables.supplementName,
                  date: variables.date,
                  taken: variables.taken,
                  time_taken: variables.taken ? new Date().toTimeString().slice(0, 8) : undefined,
                  dosage_taken: variables.dosage,
                  notes: variables.notes,
                } as DailySupplementEntry,
              };
              return newStatus;
            }
            return status;
          });

          return updated;
        }
      );

      // Return a context object with the snapshotted values
      return { previousStatus, previousEntries };
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        dailySupplementQueryKeys.dailyStatus(variables.date),
        context?.previousStatus
      );
      queryClient.setQueryData(
        dailySupplementQueryKeys.dailyEntries(variables.date),
        context?.previousEntries
      );

      toast.error('Failed to update supplement', {
        description: error.message,
      });
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: dailySupplementQueryKeys.dailyEntries(variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: dailySupplementQueryKeys.dailyStatus(variables.date),
      });
    },
  });
}

/**
 * Add a new supplement to user's list
 */
export function useAddUserSupplement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      supplement: Omit<UserSupplement, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_supplements')
        .insert({
          ...supplement,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailySupplementQueryKeys.userSupplements() });
    },
    onError: (error: Error) => {
      toast.error('Failed to add supplement', {
        description: error.message,
      });
    },
  });
}

/**
 * Remove a supplement from user's list
 */
export function useRemoveUserSupplement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplementId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_supplements')
        .update({ is_active: false })
        .eq('id', supplementId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailySupplementQueryKeys.userSupplements() });
    },
    onError: (error: Error) => {
      toast.error('Failed to remove supplement', {
        description: error.message,
      });
    },
  });
}
