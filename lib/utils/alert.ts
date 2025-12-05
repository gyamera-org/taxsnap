import { Alert, AlertButton, AlertOptions } from 'react-native';

interface LightAlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
}

/**
 * Light themed alert utility
 * Uses userInterfaceStyle: 'light' to ensure consistent light appearance
 */
export function showAlert({
  title,
  message,
  buttons = [{ text: 'OK' }],
  options,
}: LightAlertOptions) {
  Alert.alert(title, message, buttons, {
    ...options,
    userInterfaceStyle: 'light',
  });
}

/**
 * Confirmation alert with Cancel and Confirm buttons
 */
export function showConfirmAlert({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  destructive = false,
}: {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  showAlert({
    title,
    message,
    buttons: [
      { text: cancelText, style: 'cancel' },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ],
  });
}

/**
 * Settings redirect alert for permissions
 */
export function showSettingsAlert({
  title,
  message,
  onOpenSettings,
}: {
  title: string;
  message: string;
  onOpenSettings: () => void;
}) {
  showAlert({
    title,
    message,
    buttons: [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: onOpenSettings },
    ],
  });
}
