import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export interface FitnessGoals {
  id: string;
  user_id: string;
  primary_goal: string;
  workout_frequency: string;
  experience_level: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateFitnessGoalsData {
  primary_goal?: string;
  workout_frequency?: string;
  experience_level?: string;
}

/**
 * Hook to get user's fitness goals
 */
export function useFitnessGoals() {
  return useQuery({
    queryKey: queryKeys.settings.fitnessGoals(),
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data as FitnessGoals | null;
    },
  });
}

/**
 * Hook to update fitness goals
 */
export function useUpdateFitnessGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (goalsData: UpdateFitnessGoalsData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // First check if user already has fitness goals
      const { data: existingGoals } = await supabase
        .from('fitness_goals')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      let data, error;

      if (existingGoals) {
        // Update existing goals
        const result = await supabase
          .from('fitness_goals')
          .update({
            primary_goal: goalsData.primary_goal,
            workout_frequency: goalsData.workout_frequency,
            experience_level: goalsData.experience_level,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.user.id)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Create new goals
        const result = await supabase
          .from('fitness_goals')
          .insert({
            user_id: user.user.id,
            primary_goal: goalsData.primary_goal,
            workout_frequency: goalsData.workout_frequency,
            experience_level: goalsData.experience_level,
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
      qc.invalidateQueries({ queryKey: queryKeys.settings.fitnessGoals() });
    },
    onError: (err: any) => handleError(err, 'Failed to update fitness goals'),
  });
}

/**
 * Hook to delete fitness goals
 */
export function useDeleteFitnessGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase.from('fitness_goals').delete().eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.fitnessGoals() });
    },
    onError: (err: any) => handleError(err, 'Failed to delete fitness goals'),
  });
}
