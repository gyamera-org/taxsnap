import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { handleError } from './utils';
import { OnboardingData } from '@/types/onboarding';

export interface UserSettings {
  user_id: string;
  personal: {
    display_name: string;
    date_of_birth: string;
    avatar_url?: string;
    onboarding_completed: boolean;
  };
  fitness: {
    goal: string;
    frequency: string;
    experience: string;
  };
  nutrition: {
    goal: string;
    activity_level: string;
    experience: string;
  };
  body: {
    height: number;
    current_weight: number;
    goal_weight: number;
    units: string;
  };
}

export interface WeightEntry {
  id: string;
  weight: number;
  units: string;
  note?: string;
  measured_at: string;
  created_at: string;
}

/**
 * Hook to get complete user settings
 */
export function useUserSettings(
  options?: Omit<UseQueryOptions<UserSettings, Error, UserSettings>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_complete_settings', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
      return data as UserSettings;
    },
    ...options,
  });
}

/**
 * Hook to process complete onboarding data
 */
export function useProcessOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Call RPC function to process onboarding transactionally
      const { data, error } = await supabase.rpc('process_onboarding_data', {
        p_user_id: user.user.id,
        p_name: onboardingData.name,
        p_date_of_birth: onboardingData.dateOfBirth,
        p_fitness_goal: onboardingData.fitnessGoal,
        p_fitness_frequency: onboardingData.fitnessFrequency,
        p_fitness_experience: onboardingData.fitnessExperience,
        p_nutrition_goal: onboardingData.nutritionGoal,
        p_activity_level: onboardingData.activityLevel,
        p_nutrition_experience: onboardingData.nutritionExperience,
        p_height: onboardingData.height,
        p_weight: onboardingData.weight,
        p_weight_goal: onboardingData.weightGoal,
        p_units: onboardingData.units === 'metric' ? 'kg' : 'lbs',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all relevant caches
      qc.invalidateQueries({ queryKey: queryKeys.settings.detail() });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
      qc.invalidateQueries({ queryKey: queryKeys.settings.fitnessGoals() });
      qc.invalidateQueries({ queryKey: queryKeys.settings.nutritionGoals() });
      qc.invalidateQueries({ queryKey: queryKeys.settings.weightGoals() });
      qc.invalidateQueries({ queryKey: queryKeys.settings.weightHistory() });
      qc.invalidateQueries({ queryKey: queryKeys.settings.reminderSettings });
      toast.success('Welcome! Your profile has been set up successfully.');
    },
    onError: (err: any) => handleError(err, 'Failed to process onboarding'),
  });
}

/**
 * Hook to update specific user settings
 */
export function useUpdateUserSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      settingType: 'fitness' | 'nutrition' | 'body' | 'profile';
      settingData: any;
    }) => {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('update_user_setting', {
        p_user_id: user.user.id,
        p_setting_type: payload.settingType,
        p_setting_data: payload.settingData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.detail() });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
    },
    onError: (err: any) => handleError(err, 'Failed to update settings'),
  });
}

/**
 * Hook to get weight history
 */
export function useWeightHistory(
  limit: number = 30,
  options?: Omit<UseQueryOptions<WeightEntry[], Error, WeightEntry[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.settings.weightHistory(limit),
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_weight_history', {
        p_user_id: user.user.id,
        p_limit: limit,
      });

      if (error) throw error;
      return data || [];
    },
    ...options,
  });
}

/**
 * Hook to add weight entry
 */
export function useAddWeightEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      weight: number;
      units?: string;
      note?: string;
      measuredAt?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('add_weight_entry', {
        p_user_id: user.user.id,
        p_weight: payload.weight,
        p_units: payload.units || 'metric',
        p_note: payload.note,
        p_measured_at: payload.measuredAt || new Date().toISOString().split('T')[0],
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.weightHistory() });
      qc.invalidateQueries({ queryKey: queryKeys.settings.detail() });
    },
    onError: (err: any) => handleError(err, 'Failed to add weight entry'),
  });
}

/**
 * Hook to update fitness goals
 */
export function useUpdateFitnessGoals() {
  const updateSetting = useUpdateUserSetting();

  return useMutation({
    mutationFn: async (data: {
      primary_goal?: string;
      workout_frequency?: string;
      experience_level?: string;
    }) => {
      return updateSetting.mutateAsync({
        settingType: 'fitness',
        settingData: data,
      });
    },
    onSuccess: () => {},
  });
}

/**
 * Hook to update nutrition goals
 */
export function useUpdateNutritionGoals() {
  const updateSetting = useUpdateUserSetting();

  return useMutation({
    mutationFn: async (data: {
      primary_goal?: string;
      activity_level?: string;
      tracking_experience?: string;
    }) => {
      return updateSetting.mutateAsync({
        settingType: 'nutrition',
        settingData: data,
      });
    },
    onSuccess: () => {},
  });
}

/**
 * Hook to update body measurements
 */
export function useUpdateBodyMeasurements() {
  const updateSetting = useUpdateUserSetting();

  return useMutation({
    mutationFn: async (data: {
      height?: number;
      current_weight?: number;
      goal_weight?: number;
      units?: string;
    }) => {
      return updateSetting.mutateAsync({
        settingType: 'body',
        settingData: data,
      });
    },
    onSuccess: () => {},
  });
}
