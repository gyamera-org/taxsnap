import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  units: string;
  note?: string;
  measured_at: string;
  created_at: string;
  updated_at: string;
}

export interface BodyMeasurements {
  id: string;
  user_id: string;
  height?: number;
  current_weight?: number;
  goal_weight?: number;
  units: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWeightEntryData {
  weight: number;
  units: string;
  measured_at?: string;
  note?: string;
}

export interface UpdateBodyMeasurementsData {
  height?: number;
  current_weight?: number;
  goal_weight?: number;
  units?: string;
}

/**
 * Hook to get user's body measurements
 */
export function useBodyMeasurements() {
  return useQuery({
    queryKey: queryKeys.settings.weightGoals(),
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as BodyMeasurements | null;
    },
  });
}

/**
 * Hook to get user's weight history
 */
export function useWeightHistory(limit?: number) {
  return useQuery({
    queryKey: queryKeys.logs.weightEntries(limit),
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('weight_history')
        .select('*')
        .eq('user_id', user.user.id)
        .order('measured_at', { ascending: false })
        .limit(limit || 50);

      if (error) throw error;
      return data as WeightEntry[];
    },
  });
}

/**
 * Hook to add a weight entry
 */
export function useAddWeightEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entryData: CreateWeightEntryData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('weight_history')
        .insert({
          user_id: user.user.id,
          weight: entryData.weight,
          units: entryData.units || 'kg',
          measured_at: entryData.measured_at || new Date().toISOString(),
          note: entryData.note,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.logs.weightEntries() });
      qc.invalidateQueries({ queryKey: queryKeys.settings.weightGoals() });
    },
    onError: (err: any) => handleError(err, 'Failed to add weight entry'),
  });
}

/**
 * Hook to update body measurements
 */
export function useUpdateBodyMeasurements() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (measurementsData: UpdateBodyMeasurementsData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // First check if user already has body measurements
      const { data: existingMeasurements } = await supabase
        .from('body_measurements')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      let data, error;

      if (existingMeasurements) {
        // Update existing measurements
        const result = await supabase
          .from('body_measurements')
          .update({
            height: measurementsData.height,
            current_weight: measurementsData.current_weight,
            goal_weight: measurementsData.goal_weight,
            units: measurementsData.units || 'kg',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.user.id)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Create new measurements
        const result = await supabase
          .from('body_measurements')
          .insert({
            user_id: user.user.id,
            height: measurementsData.height,
            current_weight: measurementsData.current_weight,
            goal_weight: measurementsData.goal_weight,
            units: measurementsData.units || 'kg',
          })
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.weightGoals() });
    },
    onError: (err: any) => handleError(err, 'Failed to update body measurements'),
  });
}

/**
 * Hook to delete a weight entry
 */
export function useDeleteWeightEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('weight_history')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.logs.weightEntries() });
    },
    onError: (err: any) => handleError(err, 'Failed to delete weight entry'),
  });
}
