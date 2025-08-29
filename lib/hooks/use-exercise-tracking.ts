import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner-native';

// Helper function to determine stale time based on date
function getStaleTimeForDate(date: string): number {
  const selectedDate = new Date(date);
  const today = new Date();
  const todayString =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0');

  if (date < todayString) {
    // Historical data: cache for 24 hours (rarely changes)
    return 24 * 60 * 60 * 1000;
  } else if (date === todayString) {
    // Today's data: cache for 15 minutes (actively changing)
    return 15 * 60 * 1000;
  } else {
    // Future data: cache for 2 hours (plans may change)
    return 2 * 60 * 60 * 1000;
  }
}

export interface ExerciseEntry {
  id: string;
  user_id: string;
  exercise_name: string;
  exercise_type: string; // Can be any exercise type from the exercises database
  duration_minutes: number;
  calories_burned: number;
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
  logged_date: string;
  logged_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExerciseEntryData {
  exercise_name: string;
  exercise_type: string; // Can be any exercise type from the exercises database
  duration_minutes: number;
  calories_burned?: number;
  intensity?: 'low' | 'moderate' | 'high';
  notes?: string;
  logged_date?: string;
  logged_time?: string;
  share_with_community?: boolean;
}

export interface DailyExerciseSummary {
  total_workouts: number;
  total_minutes: number;
  total_calories: number;
  workout_types: Record<string, number>; // e.g., { strength: 2, cardio: 1 }
  logged_date: string;
}

/**
 * Hook to get exercise entries for a specific date
 */
export function useExerciseEntries(date: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.exerciseEntries, date],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercise_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('logged_date', date)
        .order('logged_time', { ascending: true });

      if (error) throw error;
      return data as ExerciseEntry[];
    },
    staleTime: getStaleTimeForDate(date),
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to get exercise entries for a date range
 */
export function useExerciseEntriesRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.exerciseEntries, 'range', startDate, endDate],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercise_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('logged_date', startDate)
        .lte('logged_date', endDate)
        .order('logged_date', { ascending: false })
        .order('logged_time', { ascending: true });

      if (error) throw error;
      return data as ExerciseEntry[];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours for range queries
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to create a new exercise entry
 */
export function useCreateExerciseEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExerciseEntryData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('exercise_entries')
        .insert({
          user_id: user.user.id,
          exercise_name: data.exercise_name,
          exercise_type: data.exercise_type,
          duration_minutes: data.duration_minutes,
          calories_burned: data.calories_burned || 0,
          intensity: data.intensity || 'moderate',
          notes: data.notes,
          logged_date:
            data.logged_date ||
            (() => {
              const today = new Date();
              return (
                today.getFullYear() +
                '-' +
                String(today.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(today.getDate()).padStart(2, '0')
              );
            })(),
          logged_time: data.logged_time || new Date().toTimeString().split(' ')[0],
        })
        .select()
        .single();

      if (error) throw error;

      // If user wants to share with community, invoke AI moderation
      if (data.share_with_community) {
        try {
          await supabase.functions.invoke('ai-exercise-moderator', {
            body: {
              exercise_entry_id: result.id,
              exercise_data: {
                name: data.exercise_name,
                category: data.exercise_type,
                duration_minutes: data.duration_minutes,
                calories_burned: data.calories_burned || 0,
                intensity: data.intensity || 'moderate',
                notes: data.notes,
              },
              user_id: user.user.id,
            },
          });
        } catch (moderationError) {
          console.error('AI moderation failed:', moderationError);
          // Don't fail the main operation if moderation fails
        }
      }

      return result as ExerciseEntry;
    },
    onSuccess: (data) => {
      // Invalidate all exercise-related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.exerciseEntries],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.dailyExercise],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.exerciseProgress],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.exerciseStreak],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.loggedDates],
      });
    },
    onError: (error) => {
      console.error('Failed to create exercise entry:', error);
      toast.error('Failed to log exercise');
    },
  });
}

/**
 * Hook to update an exercise entry
 */
export function useUpdateExerciseEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateExerciseEntryData> }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('exercise_entries')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return result as ExerciseEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.exerciseEntries] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.dailyExercise] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.exerciseProgress] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.exerciseStreak] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.loggedDates] });
    },
    onError: (error) => {
      console.error('Failed to update exercise entry:', error);
      toast.error('Failed to update exercise');
    },
  });
}

/**
 * Hook to delete an exercise entry
 */
export function useDeleteExerciseEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('exercise_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.exerciseEntries] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.dailyExercise] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.exerciseProgress] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.exerciseStreak] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.logs.loggedDates] });
    },
    onError: (error) => {
      console.error('Failed to delete exercise entry:', error);
      toast.error('Failed to delete exercise');
    },
  });
}
