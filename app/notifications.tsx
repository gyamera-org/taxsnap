import { useState, useEffect } from 'react';
import { View, Text, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { FormPage, ToggleField } from '@/components/ui/form-page';
import { showSettingsAlert } from '@/lib/utils/alert';
import { toast } from 'sonner-native';

export default function NotificationsScreen() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPushEnabled(status === 'granted');
    } catch (error) {
      console.error('Error checking notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePush = async (value: boolean) => {
    if (value) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus === 'granted') {
        setPushEnabled(true);
        toast.success('Push notifications enabled');
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        setPushEnabled(true);
        toast.success('Push notifications enabled');
      } else {
        showSettingsAlert({
          title: 'Notifications Disabled',
          message: 'To enable push notifications, please go to your device settings and allow notifications for Debt Free.',
          onOpenSettings: () => Linking.openSettings(),
        });
      }
    } else {
      showSettingsAlert({
        title: 'Disable Notifications',
        message: 'To disable push notifications, please go to your device settings.',
        onOpenSettings: () => Linking.openSettings(),
      });
    }
  };

  return (
    <FormPage title="Notifications" isLoading={isLoading} skeletonFields={1}>
      <ToggleField
        label="Push Notifications"
        description="Receive reminders about your debt payments and progress updates"
        value={pushEnabled}
        onValueChange={handleTogglePush}
      />

      <View className="mt-4 px-1">
        <Text className="text-gray-500 text-sm">
          When enabled, you'll receive helpful reminders to stay on track with your debt-free journey.
        </Text>
      </View>
    </FormPage>
  );
}
