import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner-native';

interface DailyWaterIntake {
  id: string;
  user_id: string;
  date: string;
  total_ml: number;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to get daily water intake for a specific date
 */
export function useDailyWaterIntake(date: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.waterIntake, date],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_water_intake')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as DailyWaterIntake | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update water intake (sets total for the day)
 */
export function useAddWaterIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount_ml, date }: { amount_ml: number; date?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const targetDate = date || new Date().toISOString().split('T')[0];

      // Use upsert to set the total amount for the day
      const { data, error } = await supabase
        .from('daily_water_intake')
        .upsert(
          {
            user_id: user.user.id,
            date: targetDate,
            total_ml: amount_ml,
          },
          {
            onConflict: 'user_id,date',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data as DailyWaterIntake;
    },
    onSuccess: (data, variables) => {
      // Invalidate water intake queries
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.waterIntake],
      });
    },
    onError: (error) => {
      console.error('Failed to update water intake:', error);
      toast.error('Failed to update water intake');
    },
  });
}

/**
 * Hook to get water progress for a date
 */
export function useWaterProgress(date: string, goalMl: number = 2000) {
  const { data: waterIntake } = useDailyWaterIntake(date);

  return {
    consumed: waterIntake?.total_ml || 0,
    goal: goalMl,
    remaining: Math.max(0, goalMl - (waterIntake?.total_ml || 0)),
    percentage: Math.min(100, ((waterIntake?.total_ml || 0) / goalMl) * 100),
    glasses: Math.round((waterIntake?.total_ml || 0) / 250), // 250ml per glass
    totalGlasses: Math.round(goalMl / 250),
  };
}
