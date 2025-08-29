export type ReminderType =
  | 'daily_supplements'
  | 'water_intake'
  | 'exercise_reminder'
  | 'meal_logging';

export interface ReminderSetting {
  id: string;
  user_id: string;
  reminder_type: ReminderType;
  is_enabled: boolean;
  reminder_time: string | null; // Time in HH:MM format
  created_at: string;
  updated_at: string;
}

export interface UpdateReminderSettingData {
  is_enabled?: boolean;
  reminder_time?: string;
}

export interface ReminderSettingsMap {
  daily_supplements: ReminderSetting;
  water_intake: ReminderSetting;
  exercise_reminder: ReminderSetting;
  meal_logging: ReminderSetting;
}

export const REMINDER_TYPES: {
  type: ReminderType;
  label: string;
  icon: string;
  defaultTime: string;
}[] = [
  {
    type: 'daily_supplements',
    label: 'Daily Supplements',
    icon: 'Pill',
    defaultTime: '08:00',
  },
  {
    type: 'water_intake',
    label: 'Water Intake',
    icon: 'Droplets',
    defaultTime: '09:00',
  },
  {
    type: 'exercise_reminder',
    label: 'Exercise Reminder',
    icon: 'Activity',
    defaultTime: '18:00',
  },
  {
    type: 'meal_logging',
    label: 'Meal Logging',
    icon: 'Utensils',
    defaultTime: '12:00',
  },
];
