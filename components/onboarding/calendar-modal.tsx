import React from 'react';
import { View, Modal, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarType, OnboardingStep } from '@/types/onboarding';

interface CalendarModalProps {
  visible: boolean;
  calendarType: CalendarType;
  currentStepData: OnboardingStep;
  selectedDate: Date;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onClose: () => void;
  onConfirm?: () => void;
}

export const CalendarModal = ({
  visible,
  calendarType,
  currentStepData,
  selectedDate,
  onDateChange,
  onClose,
  onConfirm,
}: CalendarModalProps) => {
  const getMaximumDate = () => {
    if (calendarType === 'birthday') {
      // Maximum date for birthday (minimum age 12)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - 12);
      return maxDate;
    }
    return new Date(); // For other dates, can be today
  };

  const getMinimumDate = () => {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100); // 100 years ago
    return minDate;
  };

  return (
    <>
      {Platform.OS === 'ios' ? (
        <Modal visible={visible} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <TouchableOpacity onPress={onClose}>
                  <Text className="font-medium" style={{ color: currentStepData.color }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-black">
                  {calendarType === 'birthday' ? 'Select Birthday' : 'Select Date'}
                </Text>
                <TouchableOpacity onPress={onConfirm || onClose}>
                  <Text className="font-medium" style={{ color: currentStepData.color }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="pb-8">
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={getMaximumDate()}
                  minimumDate={getMinimumDate()}
                  style={{ height: 200 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        visible && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={getMaximumDate()}
            minimumDate={getMinimumDate()}
          />
        )
      )}
    </>
  );
};
