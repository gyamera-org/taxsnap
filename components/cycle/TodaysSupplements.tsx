import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Pill, Plus, CheckCircle } from 'lucide-react-native';
import { getLocalDateString } from '@/lib/utils/date-helpers';
import {
  useDailySupplementStatus,
  useToggleSupplementTaken,
  DailySupplementStatus,
} from '@/lib/hooks/use-daily-supplement-tracking';
import { useRouter } from 'expo-router';

interface TodaysSupplementsProps {
  selectedDate: Date;
}

export function TodaysSupplements({ selectedDate }: TodaysSupplementsProps) {
  const dateString = getLocalDateString(selectedDate);

  const router = useRouter();

  const { data: supplementStatus = [], isLoading, error } = useDailySupplementStatus(dateString);
  const toggleSupplementTaken = useToggleSupplementTaken();

  const handleToggleSupplement = (status: DailySupplementStatus) => {
    toggleSupplementTaken.mutate({
      supplementId: status.supplement.id,
      supplementName: status.supplement.name,
      date: dateString,
      taken: !status.taken,
      dosage: status.supplement.default_dosage,
    });
  };

  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
                <Pill size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-black">Supplements</Text>
            </View>
          </View>
          <View className="animate-pulse">
            <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <View className="h-3 bg-gray-200 rounded w-1/3" />
          </View>
        </View>
      </View>
    );
  }

  // Handle error state gracefully
  if (error) {
    console.warn('Supplement data error:', error);
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
                <Pill size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-black">Supplements</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/log-supplements')}
              className="w-8 h-8 rounded-full bg-green-50 items-center justify-center"
            >
              <Plus size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-500 text-sm">Unable to load supplements data</Text>
        </View>
      </View>
    );
  }

  // Don't render anything if no supplements
  if (!supplementStatus || supplementStatus.length === 0) {
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
                <Pill size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-black">Supplements</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/log-supplements')}
              className="w-8 h-8 rounded-full bg-green-50 items-center justify-center"
            >
              <Plus size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
          <View className="items-center py-8">
            <View className="w-16 h-16 rounded-2xl bg-green-50 items-center justify-center mb-3">
              <Pill size={24} color="#10B981" />
            </View>
            <Text className="text-gray-600 text-center mb-3">No supplements tracked yet</Text>
            <TouchableOpacity
              onPress={() => router.push('/log-supplements')}
              className="bg-green-500 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-medium">Add Your First Supplement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
              <Pill size={20} color="#10B981" />
            </View>
            <Text className="text-lg font-semibold text-black">Supplements</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push('/log-supplements')}
              className="w-8 h-8 rounded-full bg-green-50 items-center justify-center"
            >
              <Plus size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Supplement List */}
        <View className="gap-3">
          {supplementStatus.map((status, index) => (
            <TouchableOpacity
              key={status.supplement.id}
              onPress={() => handleToggleSupplement(status)}
              className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                status.taken ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center flex-1">
                {/* Supplement Icon */}
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${
                    status.taken ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  <Pill size={18} color={status.taken ? '#10B981' : '#6B7280'} />
                </View>

                <View className="flex-1">
                  <Text
                    className={`font-semibold ${status.taken ? 'text-green-900' : 'text-gray-900'}`}
                  >
                    {status.supplement.name}
                  </Text>
                  <Text className={`text-sm ${status.taken ? 'text-green-600' : 'text-gray-500'}`}>
                    {status.supplement.default_dosage}
                  </Text>
                  {status.entry?.time_taken && (
                    <Text className="text-xs text-green-500">
                      Taken at {status.entry.time_taken}
                    </Text>
                  )}
                </View>
              </View>

              {/* Status Indicator */}
              <View className="ml-3">
                {status.taken ? (
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                      <CheckCircle size={14} color="white" />
                    </View>
                    <Text className="text-green-600 text-xs ml-2 font-medium">Taken</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    <Text className="text-gray-400 text-xs ml-2">Tap to mark taken</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
