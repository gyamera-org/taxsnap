import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';

interface PeriodLog {
  date: string;
  isStartDay: boolean;
  symptoms: string[];
  flow?: string;
}

interface MonthlyCalendarProps {
  periodLogs: PeriodLog[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export const MonthlyCalendar = ({
  periodLogs,
  currentMonth,
  onMonthChange,
}: MonthlyCalendarProps) => {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const generateCalendarDays = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }

    return days;
  };

  const getDayInfo = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const log = periodLogs.find((log) => log.date === dateString);
    const isCurrentMonth = date.getMonth() === month;
    const isToday = date.toDateString() === today.toDateString();

    return {
      log,
      isCurrentMonth,
      isToday,
      hasSymptoms: log && log.symptoms.length > 0,
      isStartDay: log?.isStartDay || false,
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    onMonthChange(newMonth);
  };

  const canNavigateNext = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth <= today;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const days = generateCalendarDays();

  return (
    <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Calendar size={16} color="#EC4899" />
          <Text className="text-lg font-semibold text-black ml-2">Period Calendar</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/period-tracker')}
          className="bg-pink-100 px-3 py-1 rounded-lg"
        >
          <Text className="text-pink-600 text-sm font-medium">Log Period</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => navigateMonth('prev')} className="p-2">
          <ChevronLeft size={20} color="#6B7280" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-black">{formatMonth(currentMonth)}</Text>

        <TouchableOpacity
          onPress={() => navigateMonth('next')}
          disabled={!canNavigateNext()}
          className="p-2"
        >
          <ChevronRight size={20} color={canNavigateNext() ? '#6B7280' : '#E5E7EB'} />
        </TouchableOpacity>
      </View>

      {/* Days of Week */}
      <View className="flex-row mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <View key={index} className="flex-1 items-center">
            <Text className="text-gray-500 text-sm font-medium">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap">
        {days.map((date, index) => {
          const dayInfo = getDayInfo(date);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => router.push('/period-tracker')}
              className="w-[14.28%] aspect-square items-center justify-center p-1"
            >
              <View
                className={`w-8 h-8 items-center justify-center ${
                  dayInfo.isToday
                    ? 'border-2 border-pink-500 rounded-full'
                    : dayInfo.isStartDay
                      ? 'bg-pink-500 rounded-full'
                      : dayInfo.hasSymptoms
                        ? 'bg-orange-100 rounded-full'
                        : ''
                }`}
              >
                {/* Day Number */}
                <Text
                  className={`text-sm ${
                    dayInfo.isCurrentMonth
                      ? dayInfo.isStartDay
                        ? 'text-white font-bold'
                        : dayInfo.isToday
                          ? 'text-pink-500 font-bold'
                          : dayInfo.hasSymptoms
                            ? 'text-orange-600 font-medium'
                            : 'text-black'
                      : 'text-gray-300'
                  }`}
                >
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row justify-center mt-4 gap-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-pink-500 rounded-full mr-1" />
          <Text className="text-xs text-gray-600">Period</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-orange-100 rounded-full mr-1" />
          <Text className="text-xs text-gray-600">Symptoms</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 border-2 border-pink-500 rounded-full mr-1" />
          <Text className="text-xs text-gray-600">Today</Text>
        </View>
      </View>
    </View>
  );
};
