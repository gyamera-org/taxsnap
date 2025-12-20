import { useState, useEffect } from 'react';
import { View, Text, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { FormPage, ToggleField } from '@/components/ui/form-page';
import { showSettingsAlert } from '@/lib/utils/alert';
import { toast } from 'sonner-native';
import { useThemedColors } from '@/lib/utils/theme';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
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
        toast.success(t('notifications.enabled'));
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        setPushEnabled(true);
        toast.success(t('notifications.enabled'));
      } else {
        showSettingsAlert({
          title: t('notifications.disabledTitle'),
          message: t('notifications.disabledMessage'),
          onOpenSettings: () => Linking.openSettings(),
        });
      }
    } else {
      showSettingsAlert({
        title: t('notifications.disableTitle'),
        message: t('notifications.disableMessage'),
        onOpenSettings: () => Linking.openSettings(),
      });
    }
  };

  return (
    <FormPage title={t('notifications.title')} isLoading={isLoading} skeletonFields={1}>
      <ToggleField
        label={t('notifications.pushNotifications')}
        description={t('notifications.pushDescription')}
        value={pushEnabled}
        onValueChange={handleTogglePush}
      />

      <View className="mt-4 px-1">
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          {t('notifications.helpText')}
        </Text>
      </View>
    </FormPage>
  );
}
