import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner-native';
import { WaterEntry, CreateWaterEntryData } from '@/lib/types/nutrition-tracking';

/**
 * Get optimal cache time based on date
 */
function getStaleTimeForDate(date: string): number {
  const today = new Date().toISOString().split('T')[0];
  const targetDate = new Date(date + 'T00:00:00').getTime();
  const todayTime = new Date(today + 'T00:00:00').getTime();

  if (targetDate < todayTime) {
    // Historical data - cache for 24 hours (rarely changes)
    return 24 * 60 * 60 * 1000;
  } else if (targetDate === todayTime) {
    // Today's data - cache for 10 minutes (might change)
    return 10 * 60 * 1000;
  } else {
    // Future data - cache for 1 hour (shouldn't exist)
    return 60 * 60 * 1000;
  }
}

/**
 * Hook to get water entries for a specific date
 */
export function useWaterEntries(date: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.waterEntries, date],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('water_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('logged_date', date)
        .order('logged_time', { ascending: true });

      if (error) throw error;
      return data as WaterEntry[];
    },
    staleTime: getStaleTimeForDate(date),
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
}

/**
 * Hook to get water entries for a date range
 */
export function useWaterEntriesRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.waterEntries, 'range', startDate, endDate],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('water_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('logged_date', startDate)
        .lte('logged_date', endDate)
        .order('logged_date', { ascending: false })
        .order('logged_time', { ascending: true });

      if (error) throw error;
      return data as WaterEntry[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get daily water total for a specific date
 */
export function useDailyWaterTotal(date: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.waterEntries, 'total', date],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('water_entries')
        .select('amount_ml')
        .eq('user_id', user.user.id)
        .eq('logged_date', date);

      if (error) throw error;

      const total = data.reduce((sum, entry) => sum + entry.amount_ml, 0);
      return total;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new water entry
 */
export function useCreateWaterEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWaterEntryData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('water_entries')
        .insert({
          user_id: user.user.id,
          amount_ml: data.amount_ml,
          drink_type: data.drink_type || 'water',
          notes: data.notes,
          logged_date: data.logged_date || new Date().toISOString().split('T')[0],
          logged_time: data.logged_time || new Date().toTimeString().split(' ')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return result as WaterEntry;
    },
    onSuccess: (data) => {
      // Invalidate water entries queries
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.waterEntries],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.dailyNutrition],
      });
    },
    onError: (error) => {
      console.error('Failed to create water entry:', error);
      toast.error('Failed to log water intake');
    },
  });
}

/**
 * Hook to update a water entry
 */
export function useUpdateWaterEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateWaterEntryData> }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('water_entries')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return result as WaterEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.waterEntries],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.dailyNutrition],
      });
    },
    onError: (error) => {
      console.error('Failed to update water entry:', error);
      toast.error('Failed to update water entry');
    },
  });
}

/**
 * Hook to delete a water entry
 */
export function useDeleteWaterEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('water_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.waterEntries],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.logs.dailyNutrition],
      });
    },
    onError: (error) => {
      console.error('Failed to delete water entry:', error);
      toast.error('Failed to delete water entry');
    },
  });
}

/**
 * Hook to quickly add common water amounts
 */
export function useQuickAddWater() {
  const createWaterEntry = useCreateWaterEntry();

  return {
    addGlass: (ml: number = 250) => createWaterEntry.mutate({ amount_ml: ml }),
    addBottle: (ml: number = 500) => createWaterEntry.mutate({ amount_ml: ml }),
    addLargeBottle: (ml: number = 750) => createWaterEntry.mutate({ amount_ml: ml }),
    addCup: (ml: number = 200, drinkType: string = 'water') =>
      createWaterEntry.mutate({ amount_ml: ml, drink_type: drinkType }),
    isLoading: createWaterEntry.isPending,
  };
}
