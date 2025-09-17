import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Droplets, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/theme-provider';
import { FlowIcon, FlowLevels, type FlowLevel } from '@/components/icons/flow-icons';

interface TodaysFlowProps {
  selectedDate: Date;
  flowData?: {
    flow_level: FlowLevel;
    notes?: string;
  };
  isLoading?: boolean;
  isOnPeriod?: boolean; // New prop to determine if user is on period
}

export function TodaysFlow({
  selectedDate,
  flowData,
  isLoading,
  isOnPeriod = false,
}: TodaysFlowProps) {
  const { isDark } = useTheme();
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date() && !isToday;

  // Only show flow tracking if user is on their period
  if (!isOnPeriod) {
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
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View
                className={`w-10 h-10 rounded-2xl ${
                  isDark ? 'bg-pink-900' : 'bg-red-100'
                } items-center justify-center mr-3`}
              >
                <Droplets size={20} color={isDark ? '#EC4899' : '#DC2626'} />
              </View>
              <Text className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-black'}`}>
                Flow
              </Text>
            </View>
          </View>
          <View className="animate-pulse">
            <View className={`h-4 ${isDark ? 'bg-pink-800' : 'bg-gray-200'} rounded w-1/2 mb-2`} />
            <View className={`h-3 ${isDark ? 'bg-pink-700' : 'bg-gray-200'} rounded w-1/3`} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <View
        className={`${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl p-4 border`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View
              className={`w-10 h-10 rounded-2xl ${
                isDark ? 'bg-pink-900' : 'bg-red-100'
              } items-center justify-center mr-3`}
            >
              <Droplets size={20} color={isDark ? '#EC4899' : '#DC2626'} />
            </View>
            <Text className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-black'}`}>
              Flow
            </Text>
          </View>
          {!isFuture && (
            <TouchableOpacity
              onPress={() =>
                router.push(`/log-flow?date=${selectedDate.toISOString().split('T')[0]}`)
              }
              className={`w-8 h-8 rounded-full ${
                isDark ? 'bg-pink-900' : 'bg-red-100'
              } items-center justify-center`}
            >
              <Plus size={16} color={isDark ? '#EC4899' : '#DC2626'} />
            </TouchableOpacity>
          )}
        </View>

        {flowData?.flow_level ? (
          <View className="flex">
            {/* Flow Level Card */}
            <View
              className={`${isDark ? 'bg-pink-900/30' : 'bg-red-50'} rounded-2xl p-4`}
              style={{
                shadowColor: isDark ? '#EC4899' : '#DC2626',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="flex flex-col items-center">
                {/* Flow Icon */}
                <View className="rounded-2xl items-center justify-center my-8">
                  <FlowIcon level={flowData.flow_level} size={40} />
                </View>

                {/* Flow Info */}
                <View>
                  <Text
                    className={`${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    } text-2xl font-bold text-center`}
                  >
                    {FlowLevels[flowData.flow_level]} Flow
                  </Text>
                </View>
              </View>
            </View>

            {/* Notes Section - if available */}
            {flowData.notes && (
              <View className={`mt-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4`}>
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-1 h-4 rounded-full mr-2"
                    style={{ backgroundColor: '#DC2626' }}
                  />
                  <Text
                    className={`text-xs font-semibold ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    } uppercase tracking-wider`}
                  >
                    Notes
                  </Text>
                </View>
                <Text
                  className={`${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  } text-sm leading-relaxed pl-3`}
                >
                  {flowData.notes}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View className="items-center py-6">
            {/* Empty State Icon */}
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{
                backgroundColor: isDark ? '#1F2937' : '#FEF2F2',
                borderWidth: 2,
                borderColor: isDark ? '#BE185D' : '#FCA5A5',
                borderStyle: 'dashed',
              }}
            >
              <Droplets size={24} color={isDark ? '#EC4899' : '#DC2626'} />
            </View>

            {/* Empty State Text */}
            <Text
              className={`${
                isDark ? 'text-gray-200' : 'text-gray-800'
              } text-center text-base font-semibold mb-2`}
            >
              No flow logged
            </Text>
            <Text
              className={`${
                isDark ? 'text-gray-400' : 'text-gray-500'
              } text-center text-sm mb-5 px-6 leading-relaxed`}
            >
              Track your flow intensity to better understand your period patterns
            </Text>

            {/* Action Button */}
            {!isFuture && (
              <TouchableOpacity
                onPress={() =>
                  router.push(`/log-flow?date=${selectedDate.toISOString().split('T')[0]}`)
                }
                className={`rounded-xl px-6 py-3 flex-row items-center ${
                  isDark ? 'bg-pink-600' : 'bg-red-500'
                }`}
              >
                <Plus size={16} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white font-semibold text-sm">Log Flow</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
