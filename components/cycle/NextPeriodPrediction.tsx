import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

interface NextPeriodPredictionProps {
  daysUntilNext: number | null;
  nextPeriodDate: string | null;
}

export const NextPeriodPrediction = ({
  daysUntilNext,
  nextPeriodDate,
}: NextPeriodPredictionProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      onPress={() => router.push('/period-tracker')}
      className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-pink-100 items-center justify-center mr-3">
            <Calendar size={20} color="#EC4899" />
          </View>
          <View>
            <Text className="text-lg font-bold text-black">Next Period</Text>
            {nextPeriodDate && (
              <Text className="text-gray-500 text-sm">{formatDate(nextPeriodDate)}</Text>
            )}
          </View>
        </View>
        {daysUntilNext !== null && (
          <View className="items-end">
            <Text className="text-lg font-bold text-pink-600">
              {daysUntilNext > 0 ? daysUntilNext : 0} days
            </Text>
            <Text className="text-gray-500 text-xs">to go</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};


