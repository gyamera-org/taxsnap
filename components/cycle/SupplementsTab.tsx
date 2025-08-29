import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Pill, Heart, Plus, Calendar, Check, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';

interface Supplement {
  name: string;
  frequency: string;
  time: string;
  importance: 'high' | 'medium' | 'low';
  days?: string[]; // ['Monday', 'Wednesday', 'Friday'] or ['Daily']
  reminderTime?: string; // '09:00'
}

interface SupplementLog {
  date: string;
  supplementName: string;
  taken: boolean;
  timeLogged?: string;
}

interface SupplementsTabProps {
  supplementLogs: Supplement[];
  fertilityWindow?: {
    isInWindow: boolean;
  } | null;
}

export const SupplementsTab = ({ supplementLogs, fertilityWindow }: SupplementsTabProps) => {
  const [dailyLogs, setDailyLogs] = useState<SupplementLog[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const isSupplementScheduledToday = (supplement: Supplement) => {
    if (supplement.frequency === 'Daily') return true;

    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    return supplement.days?.includes(dayName) || false;
  };

  const isSupplementTaken = (supplementName: string) => {
    return dailyLogs.some(
      (log) => log.date === today && log.supplementName === supplementName && log.taken
    );
  };

  const toggleSupplement = (supplementName: string) => {
    const existingLog = dailyLogs.find(
      (log) => log.date === today && log.supplementName === supplementName
    );

    if (existingLog) {
      setDailyLogs((prev) =>
        prev.map((log) =>
          log.date === today && log.supplementName === supplementName
            ? { ...log, taken: !log.taken, timeLogged: new Date().toLocaleTimeString() }
            : log
        )
      );
    } else {
      setDailyLogs((prev) => [
        ...prev,
        {
          date: today,
          supplementName,
          taken: true,
          timeLogged: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const todaysSupplements = supplementLogs.filter(isSupplementScheduledToday);

  return (
    <>
      {/* Calendar-Based Supplements Tracker */}
      <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Calendar size={16} color="#EC4899" />
            <Text className="text-lg font-semibold text-black ml-2">Today's Supplements</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings/reminders')}
            className="bg-blue-100 px-3 py-1 rounded-lg"
          >
            <View className="flex-row items-center">
              <Clock size={12} color="#3B82F6" />
              <Text className="text-blue-600 text-xs font-medium ml-1">Reminders</Text>
            </View>
          </TouchableOpacity>
        </View>

        {todaysSupplements.length === 0 ? (
          <View className="items-center py-6">
            <Text className="text-gray-500 text-sm">No supplements scheduled for today</Text>
          </View>
        ) : (
          <View className="gap-3">
            {todaysSupplements.map((supplement, index) => {
              const taken = isSupplementTaken(supplement.name);

              return (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3 px-2 bg-gray-50 rounded-xl"
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor:
                          supplement.importance === 'high'
                            ? '#FEE2E2'
                            : supplement.importance === 'medium'
                              ? '#FEF3C7'
                              : '#F3F4F6',
                      }}
                    >
                      <Pill
                        size={16}
                        color={
                          supplement.importance === 'high'
                            ? '#EF4444'
                            : supplement.importance === 'medium'
                              ? '#F59E0B'
                              : '#6B7280'
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base font-medium ${taken ? 'text-green-600' : 'text-black'}`}
                      >
                        {supplement.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500">
                          {supplement.reminderTime
                            ? `Reminder: ${supplement.reminderTime}`
                            : supplement.time}
                        </Text>
                        {taken && (
                          <View className="flex-row items-center ml-2">
                            <Check size={10} color="#10B981" />
                            <Text className="text-xs text-green-600 ml-1">Taken</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleSupplement(supplement.name)}
                    className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
                      taken ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {taken && <Check size={16} color="white" />}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Supplement Recommendations */}
      <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-4">
          <Heart size={16} color="#10B981" />
          <Text className="text-lg font-semibold text-black ml-2">Recommended</Text>
        </View>

        <View className="gap-3">
          <View className="bg-green-50 border border-green-200 rounded-xl p-3">
            <Text className="font-medium text-green-800 mb-1">For Cycle Health</Text>
            <Text className="text-green-700 text-sm">
              • Folic Acid: Supports reproductive health
            </Text>
            <Text className="text-green-700 text-sm">• Iron: Reduces menstrual fatigue</Text>
            <Text className="text-green-700 text-sm">• Magnesium: Helps with cramps</Text>
          </View>

          {fertilityWindow?.isInWindow && (
            <View className="bg-pink-50 border border-pink-200 rounded-xl p-3">
              <Text className="font-medium text-pink-800 mb-1">Fertility Window</Text>
              <Text className="text-pink-700 text-sm">• CoQ10: Supports egg quality</Text>
              <Text className="text-pink-700 text-sm">• Vitamin E: Antioxidant support</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Add Supplements */}
      <TouchableOpacity
        onPress={() => router.push('/log-supplements')}
        className="bg-pink-50 border-2 border-dashed border-pink-300 rounded-2xl p-4 items-center"
      >
        <Plus size={24} color="#EC4899" />
        <Text className="text-pink-600 font-medium mt-2">Add Supplements</Text>
      </TouchableOpacity>
    </>
  );
};
