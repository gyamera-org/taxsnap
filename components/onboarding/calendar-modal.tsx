import React from 'react';
import { View, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar } from 'react-native-calendars';
import { CalendarType, OnboardingStep } from '@/types/onboarding';

interface CalendarModalProps {
  visible: boolean;
  calendarType: CalendarType;
  currentStepData: OnboardingStep;
  showYearPicker: boolean;
  selectedYear: number;
  onDateSelect: (day: { dateString: string }) => void;
  onYearSelect: (year: number) => void;
  onOpenYearPicker: () => void;
  onClose: () => void;
}

export const CalendarModal = ({
  visible,
  calendarType,
  currentStepData,
  showYearPicker,
  selectedYear,
  onDateSelect,
  onYearSelect,
  onOpenYearPicker,
  onClose,
}: CalendarModalProps) => {
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 12; year >= currentYear - 100; year--) {
      years.push(year);
    }
    return years;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-4" style={{ maxHeight: '80%' }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">
              {showYearPicker
                ? 'Select Year'
                : calendarType === 'birthday'
                  ? 'Select Birthday'
                  : 'Select Last Period Date'}
            </Text>
            <TouchableOpacity onPress={onClose} className="px-4 py-2">
              <Text className="text-blue-500 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>

          {showYearPicker ? (
            // Year Picker View
            <FlatList
              data={generateYears()}
              keyExtractor={(item) => item.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: year }) => (
                <TouchableOpacity
                  onPress={() => onYearSelect(year)}
                  className={`p-4 border-b border-gray-100 ${
                    year === selectedYear ? 'bg-blue-50' : ''
                  }`}
                >
                  <Text
                    className={`text-center text-lg ${
                      year === selectedYear ? 'text-blue-600 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              )}
              getItemLayout={(data, index) => ({
                length: 56, // Height of each item
                offset: 56 * index,
                index,
              })}
              initialScrollIndex={Math.max(
                0,
                generateYears().findIndex((year) => year === selectedYear)
              )}
            />
          ) : (
            // Calendar View
            <>
              {calendarType === 'birthday' && (
                <View className="flex-row justify-center mb-4">
                  <TouchableOpacity
                    onPress={onOpenYearPicker}
                    className="bg-gray-100 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-gray-700 font-medium">Year: {selectedYear}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Calendar
                onDayPress={onDateSelect}
                maxDate={(() => {
                  if (calendarType === 'birthday') {
                    // Maximum date for birthday (minimum age 12)
                    const maxDate = new Date();
                    maxDate.setFullYear(maxDate.getFullYear() - 12);
                    return maxDate.toISOString().split('T')[0];
                  } else {
                    // For period date, can be today
                    return new Date().toISOString().split('T')[0];
                  }
                })()}
                minDate={(() => {
                  const minDate = new Date();
                  minDate.setFullYear(minDate.getFullYear() - 100); // 100 years ago
                  return minDate.toISOString().split('T')[0];
                })()}
                current={(() => {
                  if (calendarType === 'birthday') {
                    // Use selected year
                    const defaultDate = new Date();
                    defaultDate.setFullYear(selectedYear);
                    return defaultDate.toISOString().split('T')[0];
                  } else {
                    // For period date, start with current month
                    return new Date().toISOString().split('T')[0];
                  }
                })()}
                theme={{
                  selectedDayBackgroundColor: currentStepData.color,
                  selectedDayTextColor: '#fff',
                  todayTextColor: currentStepData.color,
                  dayTextColor: '#000',
                  textDisabledColor: '#ccc',
                  arrowColor: currentStepData.color,
                  monthTextColor: '#000',
                  textDayFontWeight: '400',
                  textMonthFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                }}
                style={{ borderRadius: 12 }}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
