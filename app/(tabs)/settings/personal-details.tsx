import { useState } from 'react';
import { View, Pressable, Modal, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import DateTimePicker from '@react-native-community/datetimepicker';
import SettingsDetailItem from '@/components/settings-detail-item';
import { cn } from '@/lib/utils';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SubPageLayout } from '@/components/layouts';

import { useColorScheme } from 'react-native';

export default function PersonalDetailsScreen() {
  const colorScheme = useColorScheme();
  const [details, setDetails] = useState({
    name: 'Josephine',
    dateOfBirth: new Date('1999-05-22'),
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleEdit = (field: string, value: string | Date) => {
    if (field === 'dateOfBirth') {
      showDatepicker();
    } else {
      setEditingField(field);
      setTempValue(typeof value === 'string' ? value : value.toLocaleDateString());
    }
  };

  const handleSave = (field: string) => {
    if (field === 'dateOfBirth') return;

    setDetails((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDetails((prev) => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  const showDatepicker = () => {
    if (Platform.OS === 'android') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <SubPageLayout title="Personal Details">
      <View className="bg-white mx-4 p-4 rounded-2xl shadow flex flex-col gap-4">
        {Object.entries(details).map(([field, value], index) => (
          <SettingsDetailItem
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
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

      {showDatePicker &&
        (Platform.OS === 'ios' ? (
          <Modal visible transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/50 w-full">
              <View
                className={cn(
                  'dark:bg-black bg-black rounded-t-3xl w-full p-4 flex flex-col gap-4 items-center',
                  colorScheme === 'dark' && 'bg-black text-white'
                )}
              >
                <DateTimePicker
                  value={details.dateOfBirth}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                  textColor="#000"
                  style={{ width: '100%' }}
                />
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className={cn(
                    'bg-black m-4 rounded-full py-4 w-full',
                    colorScheme === 'dark' && 'bg-white text-black'
                  )}
                >
                  <Text className="text-white text-center font-medium">Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={details.dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        ))}
    </SubPageLayout>
  );
}
