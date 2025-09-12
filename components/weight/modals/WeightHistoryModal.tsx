import React from 'react';
import { View, Text, Modal, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { X, TrendingDown, TrendingUp } from 'lucide-react-native';
import { type WeightEntry } from '@/lib/hooks/use-weight-tracking';
import { useTheme } from '@/context/theme-provider';

interface WeightHistoryModalProps {
  visible: boolean;
  weightHistory: WeightEntry[];
  onClose: () => void;
}

export function WeightHistoryModal({ visible, weightHistory, onClose }: WeightHistoryModalProps) {
  const { isDark } = useTheme();

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <View className={`px-4 py-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <View className="flex-row items-center justify-between">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Weight History</Text>
            <Pressable onPress={onClose} className="p-2">
              <X size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>
          </View>
          <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {weightHistory?.length || 0} total entries
          </Text>
        </View>

        <ScrollView className="flex-1 px-4">
          {weightHistory && weightHistory.length > 0 ? (
            weightHistory
              .slice()
              .reverse()
              .map((entry, index) => {
                const reversedIndex = weightHistory.length - 1 - index;
                const prevEntry =
                  reversedIndex < weightHistory.length - 1
                    ? weightHistory[reversedIndex + 1]
                    : null;
                const change = prevEntry ? entry.weight - prevEntry.weight : 0;

                return (
                  <View key={entry.id} className={`rounded-xl p-4 mb-3 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {entry.weight} {entry.units}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(entry.measured_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                        {entry.note && (
                          <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{entry.note}</Text>
                        )}
                      </View>

                      {change !== 0 && (
                        <View className="flex-row items-center">
                          <Text
                            className={`text-sm font-medium mr-2 ${
                              change < 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {change > 0 ? '+' : ''}
                            {change.toFixed(1)} {entry.units}
                          </Text>
                          <View
                            className={`p-1 rounded-full ${
                              change < 0 
                                ? (isDark ? 'bg-green-900' : 'bg-green-100') 
                                : (isDark ? 'bg-red-900' : 'bg-red-100')
                            }`}
                          >
                            {change < 0 ? (
                              <TrendingDown size={14} color="#22c55e" />
                            ) : (
                              <TrendingUp size={14} color="#ef4444" />
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
          ) : (
            <View className="py-8">
              <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No weight entries found</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
