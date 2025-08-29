import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';

export function useExerciseLoggedDates(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.loggedDates, 'exercise', startDate, endDate],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      let query = supabase
        .from('exercise_entries')
        .select('logged_date')
        .eq('user_id', user.user.id);

      // Add date range filters if provided
      if (startDate) {
        query = query.gte('logged_date', startDate);
      }
      if (endDate) {
        query = query.lte('logged_date', endDate);
      }

      const { data: loggedDates, error } = await query.order('logged_date', { ascending: false });

      if (error) throw error;

      // Return unique dates as strings
      const uniqueDates = [...new Set(loggedDates?.map((entry) => entry.logged_date) || [])];
      return uniqueDates;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (logged dates don't change frequently)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: true, // Always enabled to get exercise dates
  });
}
