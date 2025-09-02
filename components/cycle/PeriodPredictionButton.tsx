import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar } from 'lucide-react-native';
import { type NextPeriodPrediction } from '@/lib/utils/cycle-utils';
import { getTodayDateString } from '@/lib/utils/date-helpers';

interface PeriodPredictionButtonProps {
  nextPeriodPrediction: NextPeriodPrediction | null;
  onPress: () => void;
}

export function PeriodPredictionButton({
  nextPeriodPrediction,
  onPress,
}: PeriodPredictionButtonProps) {
  // Early return if no prediction data
  if (!nextPeriodPrediction) {
    return null;
  }

  const todayString = getTodayDateString();
  const isPredictedToday = nextPeriodPrediction.predictedPeriodDates?.includes(todayString);
  const daysUntilPeriod = nextPeriodPrediction.daysUntil || 0;

  // Only show button if period is predicted today or within 2 days
  const shouldShowButton = isPredictedToday || (daysUntilPeriod >= 0 && daysUntilPeriod <= 2);

  if (!shouldShowButton) {
    return null;
  }

  const getButtonText = () => {
    if (isPredictedToday) {
      return 'Start Period (Today)';
    }

    if (daysUntilPeriod === 0) {
      return 'Period Expected Today';
    }

    const dayText = daysUntilPeriod === 1 ? 'day' : 'days';
    return `Period Expected in ${daysUntilPeriod} ${dayText}`;
  };

  return (
    <View className="mx-4 mb-6">
      <TouchableOpacity
        onPress={onPress}
        className="py-4 rounded-2xl flex-row items-center justify-center bg-pink-500 shadow-lg"
        style={{
          shadowColor: '#EC4899',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Calendar size={20} color="#FFFFFF" />
        <Text className="text-white font-bold text-lg ml-2">{getButtonText()}</Text>
      </TouchableOpacity>
    </View>
  );
}
