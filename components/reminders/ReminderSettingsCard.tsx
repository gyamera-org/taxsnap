import React, { useState } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { Clock, Pill, Droplets, Activity, Utensils } from 'lucide-react-native';
import { TimePicker } from './TimePicker';
import { ReminderSetting, ReminderType } from '@/lib/types/reminder-settings';
import { useToggleReminder, useUpdateReminderTime } from '@/lib/hooks/use-reminder-settings';

interface ReminderSettingsCardProps {
  reminderSetting: ReminderSetting | undefined;
  label: string;
  icon: ReminderType;
}

const iconMap = {
  daily_supplements: Pill,
  water_intake: Droplets,
  exercise_reminder: Activity,
  meal_logging: Utensils,
};

const iconColors = {
  daily_supplements: '#ec4899',
  water_intake: '#06b6d4',
  exercise_reminder: '#10b981',
  meal_logging: '#f59e0b',
};

export function ReminderSettingsCard({ reminderSetting, label, icon }: ReminderSettingsCardProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleReminder = useToggleReminder();
  const updateReminderTime = useUpdateReminderTime();

  const IconComponent = iconMap[icon];
  const iconColor = iconColors[icon];

  const handleToggleForEmpty = async (value: boolean) => {
    try {
      await toggleReminder.mutateAsync({
        reminderType: icon,
        isEnabled: value,
      });
    } catch (error) {
      console.error('Failed to create/toggle reminder:', error);
    }
  };

  // If no reminder setting exists, show a card that can be enabled
  if (!reminderSetting) {
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <IconComponent size={24} color={iconColor} />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">{label}</Text>
              <Text className="text-sm text-gray-500">--</Text>
            </View>
          </View>

          <Switch
            value={false}
            onValueChange={handleToggleForEmpty}
            trackColor={{ false: '#f3f4f6', true: `${iconColor}40` }}
            thumbColor="#ffffff"
            disabled={toggleReminder.isPending}
          />
        </View>
      </View>
    );
  }

  const handleToggle = async (value: boolean) => {
    try {
      await toggleReminder.mutateAsync({
        reminderType: reminderSetting.reminder_type,
        isEnabled: value,
      });
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
    }
  };

  const handleTimeSelect = async (time: string) => {
    try {
      await updateReminderTime.mutateAsync({
        reminderType: reminderSetting.reminder_type,
        time,
      });
    } catch (error) {
      console.error('Failed to update reminder time:', error);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '08:00';

    // Handle both HH:MM and HH:MM:SS formats
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <IconComponent size={24} color={iconColor} />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">{label}</Text>

              {reminderSetting.is_enabled && (
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  className="flex-row items-center mt-1"
                >
                  <Clock size={14} color="#6b7280" />
                  <Text className="text-sm text-gray-500 ml-1">Reminder Time</Text>
                  <Text className="text-sm text-gray-900 font-medium ml-2">
                    {formatTime(reminderSetting.reminder_time)}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <Switch
            value={reminderSetting.is_enabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#f3f4f6', true: `${iconColor}40` }}
            thumbColor={reminderSetting.is_enabled ? iconColor : '#ffffff'}
            disabled={toggleReminder.isPending}
          />
        </View>
      </View>

      <TimePicker
        visible={showTimePicker}
        currentTime={formatTime(reminderSetting.reminder_time)}
        onClose={() => setShowTimePicker(false)}
        onTimeSelect={handleTimeSelect}
      />
    </>
  );
}
