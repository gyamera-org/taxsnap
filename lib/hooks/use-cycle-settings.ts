import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';

export interface CycleSettings {
  id: string;
  user_id: string;
  cycle_length: number;
  period_length: number;
  last_period_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CyclePhase {
  name: string;
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  day_in_cycle: number;
  days_remaining: number;
  energy_level: 'low' | 'medium' | 'high';
  recommended_exercises: string[];
}

/**
 * Hook to get user's cycle settings
 */
export function useCycleSettings() {
  return useQuery({
    queryKey: [...queryKeys.settings.all, 'cycle-settings'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cycle_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data as CycleSettings | null;
    },
  });
}

/**
 * Hook to get current cycle phase with exercise recommendations
 */
export function useCurrentCyclePhase() {
  const { data: cycleSettings, isLoading } = useCycleSettings();

  return useQuery({
    queryKey: [...queryKeys.settings.all, 'current-cycle-phase', cycleSettings?.last_period_date],
    queryFn: async (): Promise<CyclePhase | null> => {
      if (!cycleSettings || !cycleSettings.last_period_date) {
        return null;
      }

      const today = new Date();
      const lastPeriod = new Date(cycleSettings.last_period_date);
      const daysSinceLastPeriod = Math.floor(
        (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate current day in cycle (1-based)
      const dayInCycle = ((daysSinceLastPeriod % cycleSettings.cycle_length) + 1);
      
      // Determine phase based on day in cycle
      let phase: CyclePhase['phase'];
      let name: string;
      let energy_level: CyclePhase['energy_level'];
      let recommended_exercises: string[];
      let days_remaining: number;

      if (dayInCycle <= 5) {
        phase = 'menstrual';
        name = 'Menstrual Phase';
        energy_level = 'low';
        recommended_exercises = [
          'Gentle yoga',
          'Light walking',
          'Stretching',
          'Meditation',
          'Restorative yoga'
        ];
        days_remaining = 6 - dayInCycle;
      } else if (dayInCycle <= 13) {
        phase = 'follicular';
        name = 'Follicular Phase';
        energy_level = 'high';
        recommended_exercises = [
          'Cardio workouts',
          'Strength training',
          'High-intensity workouts',
          'Running',
          'Weight lifting',
          'New activities'
        ];
        days_remaining = 14 - dayInCycle;
      } else if (dayInCycle <= 16) {
        phase = 'ovulatory';
        name = 'Ovulatory Phase';
        energy_level = 'high';
        recommended_exercises = [
          'High-intensity training',
          'Group fitness',
          'Challenging workouts',
          'Outdoor activities',
          'Competitive sports',
          'Dance classes'
        ];
        days_remaining = 17 - dayInCycle;
      } else {
        phase = 'luteal';
        name = 'Luteal Phase';
        energy_level = 'medium';
        recommended_exercises = [
          'Moderate strength training',
          'Pilates',
          'Swimming',
          'Yoga',
          'Walking',
          'Low-intensity cardio'
        ];
        days_remaining = cycleSettings.cycle_length - dayInCycle + 1;
      }

      return {
        name,
        phase,
        day_in_cycle: dayInCycle,
        days_remaining,
        energy_level,
        recommended_exercises,
      };
    },
    enabled: !isLoading && !!cycleSettings,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
