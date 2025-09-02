import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, X } from 'lucide-react-native';
import { MonthlyCalendar } from '@/components/cycle/MonthlyCalendar';
import { formatSelectedDate, type NextPeriodPrediction } from '@/lib/utils/cycle-utils';

interface FullCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  loggedDates: string[];
  startDates: string[];
  endDates: string[];
  predictedDates: string[];
  nextPeriodPrediction: NextPeriodPrediction | null;
  onDatePress: (date: Date) => void;
  onLogPeriodPress: () => void;
}

export function FullCalendarModal({
  visible,
  onClose,
  selectedDate,
  onDateSelect,
  loggedDates,
  startDates,
  endDates,
  predictedDates,
  nextPeriodPrediction,
  onDatePress,
  onLogPeriodPress,
}: FullCalendarModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/30">
        <View className="flex-1 mt-16 bg-white rounded-t-3xl shadow-2xl">
          {/* Modal Header */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-2xl font-bold text-gray-900">Period Calendar</Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-600 text-sm">Track your cycle and log period days</Text>
          </View>

          {/* Calendar Content */}
          <View className="flex-1 px-4">
            <MonthlyCalendar
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              loggedDates={loggedDates}
              startDates={startDates}
              endDates={endDates}
              predictedDates={predictedDates}
              onDatePress={onDatePress}
            />
          </View>

          {/* Log Period Button */}
          <View className="px-6 pb-6 pt-4 border-t border-gray-100">
            <TouchableOpacity
              onPress={onLogPeriodPress}
              className={`py-4 rounded-2xl flex-row items-center justify-center ${
                selectedDate > new Date() &&
                selectedDate.toDateString() !== new Date().toDateString()
                  ? 'bg-gray-300'
                  : (() => {
                      // Check if today is a predicted period day
                      const today = new Date();
                      const todayString = today.toISOString().split('T')[0];
                      const isPredictedDay =
                        nextPeriodPrediction?.predictedPeriodDates?.includes(todayString);
                      const isSelectedDateToday =
                        selectedDate.toDateString() === today.toDateString();

                      return isPredictedDay && isSelectedDateToday ? 'bg-pink-600' : 'bg-pink-500';
                    })()
              }`}
              disabled={
                selectedDate > new Date() &&
                selectedDate.toDateString() !== new Date().toDateString()
              }
            >
              <Calendar size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-lg ml-2">
                {(() => {
                  const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                  const isLoggedDate = loggedDates.includes(dateString);
                  const isToday = selectedDate.toDateString() === new Date().toDateString();
                  const today = new Date();
                  const todayString = today.toISOString().split('T')[0];
                  const isPredictedDay =
                    nextPeriodPrediction?.predictedPeriodDates?.includes(todayString);

                  if (isLoggedDate) {
                    return `Edit Period (${isToday ? 'Today' : formatSelectedDate(selectedDate)})`;
                  } else if (
                    isPredictedDay &&
                    isToday &&
                    selectedDate.toDateString() === today.toDateString()
                  ) {
                    return `Start Period (Today)`;
                  } else {
                    return `Log Period (${isToday ? 'Today' : formatSelectedDate(selectedDate)})`;
                  }
                })()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
