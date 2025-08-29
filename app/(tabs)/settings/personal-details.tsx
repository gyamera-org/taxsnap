import { useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar } from 'react-native-calendars';
import SettingsDetailItem from '@/components/settings-detail-item';
import { PersonalDetailsSkeleton } from '@/components/ui';
import SubPageLayout from '@/components/layouts/sub-page';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { toast } from 'sonner-native';
import { useRouter } from 'expo-router';

export default function PersonalDetailsScreen() {
  const router = useRouter();
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

  const handleDateSelect = async (day: { dateString: string }) => {
    try {
      // Update account
      updateAccount({ date_of_birth: day.dateString });
      setShowCalendar(false);
    } catch (error) {
      toast.error('Failed to update date of birth. Please try again.');
    }
  };

  const handleGoBack = () => {
    router.back();
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
      <View className="bg-white mx-4 p-6 rounded-2xl shadow mb-4">
        <Text className="text-lg font-semibold mb-4 text-center">Profile Photo</Text>
        <View className="items-center">
          <AvatarUpload size={100} showActions={true} />
        </View>
      </View>

      {/* Personal Information */}
      <View className="bg-white mx-4 p-4 rounded-2xl shadow flex flex-col gap-4">
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

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select Date of Birth</Text>
              <Pressable onPress={() => setShowCalendar(false)} className="px-4 py-2">
                <Text className="text-blue-500 font-medium">Cancel</Text>
              </Pressable>
            </View>

            <Calendar
              current={details.date_of_birth.toISOString().split('T')[0]}
              onDayPress={handleDateSelect}
              maxDate={new Date().toISOString().split('T')[0]} // Can't select future dates
              minDate="1900-01-01"
              theme={{
                selectedDayBackgroundColor: '#000',
                selectedDayTextColor: '#fff',
                todayTextColor: '#000',
                dayTextColor: '#000',
                textDisabledColor: '#ccc',
                dotColor: '#000',
                selectedDotColor: '#fff',
                arrowColor: '#000',
                disabledArrowColor: '#ccc',
                monthTextColor: '#000',
                indicatorColor: '#000',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '400',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={{
                borderRadius: 12,
              }}
            />
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
