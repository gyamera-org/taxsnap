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
 * Hook to get user's weight history for a specific date range using RPC
 */
export function useWeightHistoryRange(
  startDate: string,
  endDate: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.logs.weightEntries(), 'range', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_weight_history_range', {
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;
      return data as WeightEntry[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to add a weight entry
 */
export function useAddWeightEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entryData: CreateWeightEntryData) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        // Validate and prepare data
        const weight = parseFloat(entryData.weight?.toString() || '0');
        if (!weight || weight <= 0 || isNaN(weight)) {
          throw new Error('Invalid weight value. Must be a positive number.');
        }

        // Convert units to database format: 'metric' or 'imperial' (as per constraint)
        let units = entryData.units?.toString() || 'metric';
        if (units === 'kg') {
          units = 'metric';
        } else if (units === 'lbs') {
          units = 'imperial';
        }
        // Validate that units is now one of the accepted values
        if (units !== 'metric' && units !== 'imperial') {
          units = 'metric'; // Default fallback
        }
        const measuredAt = entryData.measured_at || new Date().toISOString();
        const note = entryData.note?.toString() || null;

        const insertData = {
          user_id: user.user.id,
          weight: weight,
          units: units,
          measured_at: measuredAt,
          note: note,
        };

        const { data, error } = await supabase
          .from('weight_history')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('❌ Weight entry database error details:', {
            error: error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            insertData: insertData,
          });

          // Provide user-friendly error messages
          let userMessage = 'Something went wrong while saving your weight. Please try again.';

          if (error.code === '23514' && error.message.includes('units_check')) {
            userMessage = 'There was an issue with the weight units. Please try again.';
          } else if (error.code === '23505') {
            userMessage =
              'A weight entry for this time already exists. Please try a different time.';
          } else if (error.code === '23502') {
            userMessage = 'Some required information is missing. Please fill out all fields.';
          }

          throw new Error(userMessage);
        }

        return data;
      } catch (error) {
        console.error('❌ Weight entry creation error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Something went wrong while saving your weight. Please try again.');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.logs.weightEntries() });
      qc.invalidateQueries({ queryKey: queryKeys.settings.weightGoals() });
    },
    onError: (err: any) => {
      let message = 'Failed to add weight entry';

      if (err?.code === '23514' || err?.message?.includes('constraint')) {
        message = 'You already have a weight entry for today.';
      } else if (err?.code === '23505' || err?.message?.includes('duplicate')) {
        message = 'You already have a weight entry for today.';
      } else if (
        err?.message?.includes('authentication') ||
        err?.message?.includes('unauthorized')
      ) {
        message = 'Please sign in to add weight entries.';
      }

      handleError(err, message);
    },
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
