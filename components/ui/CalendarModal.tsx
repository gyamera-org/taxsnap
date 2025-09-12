import React from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { isSameDay, isToday } from '@/lib/utils/date-helpers';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  hasLoggedData: (date: Date) => boolean;
  title?: string;
  selectedColor?: string;
  todayColor?: string;
  loggedColor?: string;
}

export function CalendarModal({
  visible,
  onClose,
  selectedDate,
  onDateSelect,
  hasLoggedData,
  title = 'Select Date',
  selectedColor = 'bg-green-500',
  todayColor = 'bg-green-100',
  loggedColor = 'bg-orange-100',
}: CalendarModalProps) {
  const [currentViewDate, setCurrentViewDate] = React.useState(selectedDate);
  const themed = useThemedStyles();
  const colors = useThemedColors();

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the first day of the week containing the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // End at the last day of the week containing the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentViewDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className={themed("bg-white rounded-t-3xl p-6 max-h-[80%]", "bg-gray-800 rounded-t-3xl p-6 max-h-[80%]")}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className={themed("text-xl font-bold text-gray-900", "text-xl font-bold text-white")}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => navigateMonth('prev')} className="p-2">
              <ChevronLeft size={20} color={colors.gray[500]} />
            </TouchableOpacity>

            <Text className={themed("text-lg font-semibold text-gray-900", "text-lg font-semibold text-white")}>
              {currentViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>

            <TouchableOpacity onPress={() => navigateMonth('next')} className="p-2">
              <ChevronRight size={20} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View className="flex-row mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <View key={index} className="flex-1 items-center">
                <Text className={themed("text-gray-500 text-sm font-medium", "text-gray-400 text-sm font-medium")}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap">
              {generateCalendarDays().map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentViewDate.getMonth();
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);
                const hasLogs = hasLoggedData(date);

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDateSelect(date)}
                    className="w-[14.28%] aspect-square items-center justify-center relative"
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isSelected
                          ? selectedColor
                          : isTodayDate
                          ? todayColor
                          : hasLogs && isCurrentMonth
                          ? loggedColor
                          : ''
                      }`}
                    >
                      <Text
                        className={themed(`text-sm ${
                          isCurrentMonth
                            ? isSelected
                              ? 'text-white font-bold'
                              : isTodayDate
                              ? 'text-green-700 font-bold'
                              : hasLogs
                              ? 'text-orange-700 font-medium'
                              : 'text-gray-900'
                            : 'text-gray-300'
                        }`, `text-sm ${
                          isCurrentMonth
                            ? isSelected
                              ? 'text-white font-bold'
                              : isTodayDate
                              ? 'text-green-400 font-bold'
                              : hasLogs
                              ? 'text-orange-400 font-medium'
                              : 'text-gray-100'
                            : 'text-gray-600'
                        }`)}
                      >
                        {date.getDate()}
                      </Text>
                    </View>

                    {/* Indicator dot */}
                    {hasLogs && isCurrentMonth && (
                      <View className="absolute bottom-1">
                        <View className="w-1 h-1 bg-green-500 rounded-full" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Legend */}
          <View className="flex-row justify-center mt-4 gap-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-1" />
              <Text className={themed("text-xs text-gray-600", "text-xs text-gray-400")}>Selected</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-100 rounded-full mr-1" />
              <Text className={themed("text-xs text-gray-600", "text-xs text-gray-400")}>Today</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-orange-100 rounded-full mr-1" />
              <Text className={themed("text-xs text-gray-600", "text-xs text-gray-400")}>Logged</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
