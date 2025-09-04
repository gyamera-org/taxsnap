import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, X } from 'lucide-react-native';
import { MonthlyCalendar } from '@/components/cycle/MonthlyCalendar';
import { formatSelectedDate, type NextPeriodPrediction } from '@/lib/utils/cycle-utils';
import type { CurrentCycleInfo } from '@/lib/hooks/use-cycle-flo-style';

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
  onStartPeriod: (date: Date) => void;
  onEndPeriod: (date: Date) => void;
  hasOngoingPeriod?: boolean;
  currentCycleInfo?: CurrentCycleInfo | null;
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
  onStartPeriod,
  onEndPeriod,
  hasOngoingPeriod,
  currentCycleInfo,
}: FullCalendarModalProps) {
  // Check if End Period should be enabled
  const canEndPeriod = () => {
    if (!hasOngoingPeriod || !currentCycleInfo?.current_cycle) return false;

    const startDate = new Date(currentCycleInfo.current_cycle.start_date);
    const selectedDay = new Date(selectedDate);

    // Normalize to avoid time issues
    startDate.setHours(0, 0, 0, 0);
    selectedDay.setHours(0, 0, 0, 0);

    // Selected date must be >= start date
    return selectedDay >= startDate;
  };

  // Check if Start Period should be enabled
  const canStartPeriod = () => {
    // Always allow starting a new period (this will replace existing ongoing period)
    return true;
  };
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

          {/* Action Buttons */}
          <View className="px-6 pb-6 pt-4 border-t border-gray-100">
            <View className="flex flex-col gap-2">
              {/* Start Period Button */}
              <TouchableOpacity
                onPress={() => onStartPeriod(selectedDate)}
                disabled={!canStartPeriod()}
                className={`py-4 rounded-2xl flex-row items-center justify-center ${
                  canStartPeriod() ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <Calendar size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-lg ml-2">
                  {hasOngoingPeriod ? 'Change Start Date' : 'Start Period'}
                </Text>
              </TouchableOpacity>

              {/* End Period Button */}
              <TouchableOpacity
                onPress={() => onEndPeriod(selectedDate)}
                disabled={!canEndPeriod()}
                className={`py-4 rounded-2xl flex-row items-center justify-center ${
                  canEndPeriod() ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <Calendar size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-lg ml-2">End Period</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
