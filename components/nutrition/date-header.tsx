import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface DateHeaderProps {
  selectedDate: Date;
  onSelectDatePress?: () => void;
}

export default function DateHeader({ selectedDate, onSelectDatePress }: DateHeaderProps) {
  const getCurrentDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return {
      dayName: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const currentDate = getCurrentDate(selectedDate);

  return (
    <View className="px-4 mb-6">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-semibold text-gray-800">{currentDate.dayName}</Text>
          <Text className="text-gray-500">
            {currentDate.month} {currentDate.date}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSelectDatePress}
          className={`px-3 py-1 rounded-full ${
            isToday(selectedDate) ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`font-medium text-sm ${
              isToday(selectedDate) ? 'text-green-700' : 'text-gray-700'
            }`}
          >
            {isToday(selectedDate) ? 'Today' : 'Select Date'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
