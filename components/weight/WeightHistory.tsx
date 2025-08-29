import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { History, Plus, TrendingDown, TrendingUp } from 'lucide-react-native';
import { type WeightEntry } from '@/lib/hooks/use-weight-tracking';

interface WeightHistoryProps {
  weightHistory: WeightEntry[];
  onShowAllEntries: () => void;
  onShowAddEntry: () => void;
}

export function WeightHistory({
  weightHistory,
  onShowAllEntries,
  onShowAddEntry,
}: WeightHistoryProps) {
  return (
    <View className="px-4 mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xl font-bold text-gray-900">Recent Entries</Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={onShowAllEntries}
            className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2"
          >
            <History size={14} color="#6b7280" />
            <Text className="text-gray-700 font-medium ml-1">See All</Text>
          </Pressable>
          <Pressable
            onPress={onShowAddEntry}
            className="flex-row items-center bg-pink-500 rounded-xl px-3 py-2"
          >
            <Plus size={14} color="white" />
            <Text className="text-white font-medium ml-1">Add</Text>
          </Pressable>
        </View>
      </View>

      <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {weightHistory && weightHistory.length > 0 ? (
          weightHistory.slice(-4).map((entry, index) => (
            <View key={entry.id} className={`p-4 ${index < 3 ? 'border-b border-gray-100' : ''}`}>
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {entry.weight} {entry.units}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {new Date(entry.measured_at).toLocaleDateString()}
                  </Text>
                  {entry.note && <Text className="text-xs text-gray-400 mt-1">{entry.note}</Text>}
                </View>

                {index < 3 && weightHistory.length > index + 1 && (
                  <View className="ml-4">
                    {entry.weight < weightHistory[index + 1].weight ? (
                      <View className="bg-green-100 p-2 rounded-full">
                        <TrendingDown size={14} color="#22c55e" />
                      </View>
                    ) : entry.weight > weightHistory[index + 1].weight ? (
                      <View className="bg-red-100 p-2 rounded-full">
                        <TrendingUp size={14} color="#ef4444" />
                      </View>
                    ) : (
                      <View className="bg-gray-100 p-2 rounded-full">
                        <View className="w-3 h-0.5 bg-gray-400 rounded" />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View className="p-8">
            <Text className="text-gray-500 text-center">No weight entries yet</Text>
            <Text className="text-sm text-gray-400 text-center mt-1">
              Add your first weight entry to start tracking
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
