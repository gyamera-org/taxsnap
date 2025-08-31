import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui';
import SubPageLayout from '@/components/layouts/sub-page';
import { ReminderSettingsCard } from '@/components/reminders/ReminderSettingsCard';
import { useRouter } from 'expo-router';
import { useReminderSettings } from '@/lib/hooks/use-reminder-settings';
import { REMINDER_TYPES } from '@/lib/types/reminder-settings';
import { Bell } from 'lucide-react-native';

function ReminderSettingsSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <View className="px-4 py-6">
        <View className="flex-row items-center mb-4">
          <Skeleton width={48} height={48} className="rounded-xl mr-3" />
          <View className="flex-1">
            <Skeleton width={150} height={20} className="mb-2" />
            <Skeleton width={200} height={14} />
          </View>
        </View>
      </View>

      {/* Reminder Cards Skeleton */}
      <View className="px-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <Skeleton width={48} height={48} className="rounded-xl mr-3" />
                <View className="flex-1">
                  <Skeleton width={120} height={18} className="mb-2" />
                  <Skeleton width={80} height={14} />
                </View>
              </View>
              <Skeleton width={50} height={30} className="rounded-full" />
            </View>
          </View>
        ))}
      </View>

      {/* Tips Section Skeleton */}
      <View className="px-4 pb-6">
        <View className="bg-blue-50 rounded-2xl p-4">
          <Skeleton width={120} height={16} className="mb-2" />
          <Skeleton width={300} height={14} className="mb-1" />
          <Skeleton width={270} height={14} className="mb-1" />
          <Skeleton width={240} height={14} className="mb-1" />
          <Skeleton width={255} height={14} />
        </View>
      </View>
    </>
  );
}

export default function ReminderSettingsScreen() {
  const router = useRouter();
  const { data: reminderSettings, isLoading, error } = useReminderSettings();

  if (isLoading) {
    return (
      <SubPageLayout title="Reminder Settings">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <ReminderSettingsSkeleton />
        </ScrollView>
      </SubPageLayout>
    );
  }

  if (error) {
    return (
      <SubPageLayout title="Reminder Settings">
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center">
            Failed to load reminder settings. Please try again.
          </Text>
        </View>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Reminder Settings">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-6">
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-100 w-12 h-12 rounded-xl items-center justify-center mr-3">
              <Bell size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">Daily Reminders</Text>
              <Text className="text-sm text-gray-500">
                Set up notifications to help you stay on track with your health goals
              </Text>
            </View>
          </View>
        </View>

        {/* Reminder Settings */}
        <View className="px-4 mb-6">
          {REMINDER_TYPES.map((reminderType) => {
            const setting = reminderSettings?.[reminderType.type];

            return (
              <ReminderSettingsCard
                key={reminderType.type}
                reminderSetting={setting}
                label={reminderType.label}
                icon={reminderType.type}
              />
            );
          })}
        </View>
      </ScrollView>
    </SubPageLayout>
  );
}
