import { useState } from 'react';
import { View, Pressable, Modal, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import DateTimePicker from '@react-native-community/datetimepicker';
import SettingsDetailItem from '@/components/settings-detail-item';
import { PersonalDetailsSkeleton } from '@/components/ui';
import SubPageLayout from '@/components/layouts/sub-page';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { toast } from 'sonner-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/theme-provider';

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { data: account, isLoading } = useAccount();
  const { mutate: updateAccount } = useUpdateAccount();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const details = {
    name: account?.name || '',
    date_of_birth: account?.date_of_birth
      ? new Date(account.date_of_birth)
      : new Date('1999-05-22'),
  };

  const handleEdit = (field: string, value: string | Date) => {
    if (field === 'date_of_birth') {
      setShowCalendar(true);
    } else {
      setEditingField(field);
      setTempValue(typeof value === 'string' ? value : value.toLocaleDateString());
    }
  };

  const handleSave = async (field: string) => {
    if (field === 'date_of_birth') return;

    try {
      if (field === 'name') {
        // Update account
        updateAccount({ name: tempValue });
      }
      setEditingField(null);
    } catch (error) {
      toast.error('Failed to update your information. Please try again.');
    }
  };

  const handleDateChange = async (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowCalendar(false);
    }

    if (selectedDate) {
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        updateAccount({ date_of_birth: dateString });
        if (Platform.OS === 'ios') {
          setShowCalendar(false);
        }
      } catch (error) {
        toast.error('Failed to update date of birth. Please try again.');
      }
    }
  };

  const handleGoBack = () => {
    router.push('/settings');
  };

  if (isLoading) {
    return (
      <SubPageLayout title="Personal Details" onBack={handleGoBack}>
        <PersonalDetailsSkeleton />
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Personal Details" onBack={handleGoBack}>
      {/* Avatar Section */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 p-6 rounded-2xl shadow mb-4`}>
        <View className="items-center">
          <AvatarUpload size={100} showActions={true} />
        </View>
      </View>

      {/* Personal Information */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} mx-4 p-4 rounded-2xl shadow flex flex-col gap-4`}>
        {Object.entries(details).map(([field, value], index) => (
          <SettingsDetailItem
            key={field}
            label={
              field.charAt(0).toUpperCase() +
              field
                .slice(1)
                .replace(/([A-Z])/g, ' $1')
                .replace('_', ' ')
            }
            value={value instanceof Date ? value.toLocaleDateString() : value}
            isEditing={editingField === field}
            tempValue={tempValue}
            onEdit={() => handleEdit(field, value)}
            onSave={() => handleSave(field)}
            onChangeText={setTempValue}
            isLast={index === Object.entries(details).length - 1}
          />
        ))}
      </View>

      {/* Date Picker */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showCalendar} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-t-3xl`}>
              <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                <Pressable onPress={() => setShowCalendar(false)}>
                  <Text className="text-pink-600 font-medium">Cancel</Text>
                </Pressable>
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Date of Birth</Text>
                <Pressable onPress={() => setShowCalendar(false)}>
                  <Text className="text-pink-600 font-medium">Done</Text>
                </Pressable>
              </View>
              <View className="pb-8">
                <DateTimePicker
                  value={details.date_of_birth}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  style={{ height: 200 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showCalendar && (
          <DateTimePicker
            value={details.date_of_birth}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}
    </SubPageLayout>
  );
}
