import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, Clock, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

interface CycleAveragesProps {
  averageData?: {
    average_cycle_length: number;
    average_period_length: number;
    cycle_count: number;
    last_updated?: string;
  };
  isLoading?: boolean;
}

export function CycleAverages({ averageData, isLoading }: CycleAveragesProps) {
  const { isDark } = useTheme();

  // Don't show if no data or not enough cycles
  if (!averageData || averageData.cycle_count < 2) {
    return null;
  }

  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View
          className={`${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          } rounded-2xl p-4 border`}
        >
          <View className="flex-row items-center mb-4">
            <View
              className={`w-10 h-10 rounded-2xl ${
                isDark ? 'bg-pink-900' : 'bg-blue-100'
              } items-center justify-center mr-3`}
            >
              <TrendingUp size={20} color={isDark ? '#EC4899' : '#3B82F6'} />
            </View>
            <Text className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-black'}`}>
              Cycle Averages
            </Text>
          </View>
          <View className="animate-pulse">
            <View className={`h-4 ${isDark ? 'bg-pink-800' : 'bg-gray-200'} rounded w-full mb-2`} />
            <View className={`h-4 ${isDark ? 'bg-pink-700' : 'bg-gray-200'} rounded w-3/4 mb-2`} />
            <View className={`h-3 ${isDark ? 'bg-pink-600' : 'bg-gray-200'} rounded w-1/2`} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      {/* Two Column Layout */}
      <View className="flex-row gap-3">
        {/* Average Cycle Length */}
        <View
          className={`flex-1 ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          } rounded-2xl p-4 border`}
          style={{
            shadowColor: isDark ? '#EC4899' : '#3B82F6',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="items-center">
            <View
              className={`w-10 h-10 rounded-full ${
                isDark ? 'bg-pink-800' : 'bg-blue-100'
              } items-center justify-center mb-3`}
            >
              <Calendar size={18} color={isDark ? '#EC4899' : '#3B82F6'} />
            </View>
            <Text
              className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-1`}
            >
              {averageData.average_cycle_length}
            </Text>
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm text-center`}>
              Cycle Length
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs`}>days</Text>
          </View>
        </View>

        {/* Average Period Length */}
        <View
          className={`flex-1 ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          } rounded-2xl p-4 border`}
          style={{
            shadowColor: isDark ? '#EC4899' : '#DC2626',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="items-center">
            <View
              className={`w-10 h-10 rounded-full ${
                isDark ? 'bg-pink-800' : 'bg-red-100'
              } items-center justify-center mb-3`}
            >
              <Clock size={18} color={isDark ? '#EC4899' : '#DC2626'} />
            </View>
            <Text
              className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-1`}
            >
              {averageData.average_period_length}
            </Text>
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm text-center`}>
              Period Length
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs`}>days</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
