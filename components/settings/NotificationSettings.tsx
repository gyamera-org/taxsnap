import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import {
  Bell,
  Pill,
  Droplets,
  Activity,
  UtensilsCrossed,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { useState } from 'react';

interface NotificationSetting {
  type: 'supplements' | 'water' | 'exercise' | 'meals';
  enabled: boolean;
  time: string;
  title: string;
  icon: any;
  color: string;
}

export const NotificationSettings = () => {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState('');

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      type: 'supplements',
      enabled: true,
      time: '08:00',
      title: 'Daily Supplements',
      icon: Pill,
      color: '#EC4899',
    },
    {
      type: 'water',
      enabled: true,
      time: '09:00',
      title: 'Water Intake',
      icon: Droplets,
      color: '#3B82F6',
    },
    {
      type: 'exercise',
      enabled: false,
      time: '18:00',
      title: 'Exercise Reminder',
      icon: Activity,
      color: '#10B981',
    },
    {
      type: 'meals',
      enabled: true,
      time: '12:00',
      title: 'Meal Logging',
      icon: UtensilsCrossed,
      color: '#F59E0B',
    },
  ]);

  const toggleNotification = (type: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.type === type ? { ...notif, enabled: !notif.enabled } : notif))
    );
  };

  const openTimeModal = (type: string, currentTime: string) => {
    setEditingType(type);
    setTempTime(currentTime);
    setShowTimeModal(true);
  };

  const saveTime = () => {
    if (editingType) {
      setNotifications((prev) =>
        prev.map((notif) => (notif.type === editingType ? { ...notif, time: tempTime } : notif))
      );
    }
    setShowTimeModal(false);
    setEditingType(null);
  };

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-4">
        <Bell size={16} color="#6B7280" />
        <Text className="text-lg font-semibold text-black ml-2">Reminder Notifications</Text>
      </View>

      <View className="gap-3">
        {notifications.map((notification, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-3 px-2 bg-gray-50 rounded-xl"
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${notification.color}20` }}
              >
                <notification.icon size={20} color={notification.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-black">{notification.title}</Text>
                <Text className="text-xs text-gray-500">
                  {notification.enabled ? `Daily at ${notification.time}` : 'Disabled'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              {notification.enabled && (
                <TouchableOpacity
                  onPress={() => openTimeModal(notification.type, notification.time)}
                  className="bg-blue-100 px-3 py-1 rounded-lg flex-row items-center"
                >
                  <Clock size={12} color="#3B82F6" />
                  <Text className="text-blue-600 text-xs font-medium ml-1">
                    {notification.time}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => toggleNotification(notification.type)}
                className={`w-12 h-6 rounded-full p-1 ${
                  notification.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <View
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    notification.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-4 p-3 bg-blue-50 rounded-xl">
        <Text className="text-blue-800 text-sm font-medium mb-1">About Notifications</Text>
        <Text className="text-blue-700 text-xs">
          Enable reminders to help maintain healthy habits. Notifications will be sent at your
          chosen times.
        </Text>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-black">Set Reminder Time</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">Time (24-hour format)</Text>
              <TextInput
                value={tempTime}
                onChangeText={setTempTime}
                placeholder="08:00"
                className="border border-gray-300 rounded-lg p-3"
              />
            </View>

            <View className="flex-row gap-3">
              <Button variant="outline" onPress={() => setShowTimeModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onPress={saveTime} className="flex-1">
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


