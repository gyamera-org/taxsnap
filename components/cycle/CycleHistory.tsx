import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

interface PeriodLog {
  date: string;
  isStartDay: boolean;
  symptoms: string[];
  flow?: string;
}

interface CycleHistoryProps {
  periodLogs: PeriodLog[];
}

export const CycleHistory = ({ periodLogs }: CycleHistoryProps) => {
  const recentPeriods = periodLogs
    .filter((log) => log.isStartDay)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getFlowColor = (flow?: string) => {
    switch (flow) {
      case 'heavy':
        return '#EF4444';
      case 'moderate':
        return '#F59E0B';
      case 'light':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Calendar size={16} color="#EC4899" />
          <Text className="text-lg font-semibold text-black ml-2">Recent Periods</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/period-tracker')}
          className="flex-row items-center"
        >
          <Text className="text-pink-600 text-sm mr-1">View All</Text>
          <ChevronRight size={16} color="#EC4899" />
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        {recentPeriods.map((period, index) => (
          <View key={index} className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center flex-1">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: getFlowColor(period.flow) }}
              />
              <View className="flex-1">
                <Text className="text-base font-medium text-black">{formatDate(period.date)}</Text>
                <Text className="text-xs text-gray-500 capitalize">
                  {period.flow || 'No data'} flow • {period.symptoms.length} symptoms
                </Text>
              </View>
            </View>
          </View>
        ))}

        {recentPeriods.length === 0 && (
          <View className="items-center py-4">
            <Text className="text-gray-500 text-sm">No period data logged yet</Text>
            <TouchableOpacity onPress={() => router.push('/period-tracker')} className="mt-2">
              <Text className="text-pink-600 text-sm">Start tracking</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};


