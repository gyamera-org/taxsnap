import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import {
  ReminderSetting,
  ReminderType,
  UpdateReminderSettingData,
  ReminderSettingsMap,
} from '@/lib/types/reminder-settings';
import { queryKeys } from './query-keys';

/**
 * Hook to get all reminder settings for the current user
 */
export function useReminderSettings() {
  return useQuery({
    queryKey: queryKeys.settings.reminderSettings,
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .order('reminder_type');

      if (error) {
        // If table doesn't exist or other error, return empty map
        console.warn('Error fetching reminder settings:', error);
        return {} as Partial<ReminderSettingsMap>;
      }

      // Convert array to map for easier access
      const settingsMap: Partial<ReminderSettingsMap> = {};
      data?.forEach((setting) => {
        settingsMap[setting.reminder_type as ReminderType] = setting as ReminderSetting;
      });

      return settingsMap as Partial<ReminderSettingsMap>;
    },
    retry: 1, // Only retry once
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}

/**
 * Hook to get a specific reminder setting
 */
export function useReminderSetting(reminderType: ReminderType) {
  return useQuery({
    queryKey: [...queryKeys.settings.reminderSettings, reminderType],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('reminder_type', reminderType)
        .single();

      if (error) throw error;
      return data as ReminderSetting;
    },
  });
}

/**
 * Hook to create a new reminder setting
 */
export function useCreateReminderSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reminderType,
      isEnabled = false,
      reminderTime = '08:00:00',
    }: {
      reminderType: ReminderType;
      isEnabled?: boolean;
      reminderTime?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminder_settings')
        .insert({
          user_id: user.user.id,
          reminder_type: reminderType,
          is_enabled: isEnabled,
          reminder_time: reminderTime,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReminderSetting;
    },
    onSuccess: (data) => {
      // Invalidate and refetch reminder settings
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.reminderSettings });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.settings.reminderSettings, data.reminder_type],
      });
    },
    onError: (error) => {
      console.error('Failed to create reminder setting:', error);
      toast.error('Failed to create reminder setting');
    },
  });
}

/**
 * Hook to update a reminder setting
 */
export function useUpdateReminderSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reminderType,
      updates,
    }: {
      reminderType: ReminderType;
      updates: UpdateReminderSettingData;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminder_settings')
        .update(updates)
        .eq('user_id', user.user.id)
        .eq('reminder_type', reminderType)
        .select()
        .single();

      if (error) throw error;
      return data as ReminderSetting;
    },
    onSuccess: (data) => {
      // Invalidate and refetch reminder settings
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.reminderSettings });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.settings.reminderSettings, data.reminder_type],
      });

      // toast.success('Reminder setting updated');
    },
    onError: (error) => {
      console.error('Failed to update reminder setting:', error);
      toast.error('Failed to update reminder setting');
    },
  });
}

/**
 * Hook to toggle a reminder on/off
 */
export function useToggleReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reminderType,
      isEnabled,
    }: {
      reminderType: ReminderType;
      isEnabled: boolean;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // First check if the setting exists
      const { data: existing } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('reminder_type', reminderType)
        .single();

      if (existing) {
        // Update existing setting (only change is_enabled)
        const { data, error } = await supabase
          .from('reminder_settings')
          .update({ is_enabled: isEnabled })
          .eq('user_id', user.user.id)
          .eq('reminder_type', reminderType)
          .select()
          .single();

        if (error) throw error;
        return data as ReminderSetting;
      } else {
        // Create new setting with default time
        const { data, error } = await supabase
          .from('reminder_settings')
          .insert({
            user_id: user.user.id,
            reminder_type: reminderType,
            is_enabled: isEnabled,
            reminder_time: getDefaultTime(reminderType),
          })
          .select()
          .single();

        if (error) throw error;
        return data as ReminderSetting;
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch reminder settings
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.reminderSettings });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.settings.reminderSettings, data.reminder_type],
      });

      const action = data.is_enabled ? 'enabled' : 'disabled';
      // toast.success(`Reminder ${action}`);
    },
    onError: (error) => {
      console.error('Failed to toggle reminder:', error);
      toast.error('Failed to toggle reminder');
    },
  });
}

// Helper function to get default times for different reminder types
function getDefaultTime(reminderType: ReminderType): string {
  const defaultTimes = {
    daily_supplements: '08:00:00',
    water_intake: '09:00:00',
    exercise_reminder: '18:00:00',
    meal_logging: '12:00:00',
  };
  return defaultTimes[reminderType];
}

/**
 * Hook to update reminder time
 */
export function useUpdateReminderTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reminderType, time }: { reminderType: ReminderType; time: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Use upsert to handle both create and update
      const { data, error } = await supabase
        .from('reminder_settings')
        .upsert(
          {
            user_id: user.user.id,
            reminder_type: reminderType,
            reminder_time: time,
            is_enabled: true, // Default to enabled when setting time
          },
          {
            onConflict: 'user_id,reminder_type',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data as ReminderSetting;
    },
    onSuccess: (data) => {
      // Invalidate and refetch reminder settings
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.reminderSettings });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.settings.reminderSettings, data.reminder_type],
      });
      // toast.success('Reminder time updated');
    },
    onError: (error) => {
      console.error('Failed to update reminder time:', error);
      toast.error('Failed to update reminder time');
    },
  });
}

/**
 * Hook to bulk update multiple reminder settings
 */
export function useBulkUpdateReminderSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Array<{
        reminderType: ReminderType;
        updates: UpdateReminderSettingData;
      }>
    ) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const promises = updates.map(({ reminderType, updates: settingUpdates }) =>
        supabase
          .from('reminder_settings')
          .update(settingUpdates)
          .eq('user_id', user.user.id)
          .eq('reminder_type', reminderType)
          .select()
          .single()
      );

      const results = await Promise.all(promises);

      // Check for errors
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to update some reminder settings');
      }

      return results.map((result) => result.data as ReminderSetting);
    },
    onSuccess: () => {
      // Invalidate all reminder settings queries
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.reminderSettings });
      // toast.success('Reminder settings updated');
    },
    onError: (error) => {
      console.error('Failed to update reminder settings:', error);
      toast.error('Failed to update reminder settings');
    },
  });
}
