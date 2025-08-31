import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Pill, Plus, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';

interface TodaysSupplementsProps {
  selectedDate: Date;
  supplementData?: Array<{
    supplement_name: string;
    taken: boolean;
    dosage?: string;
  }>;
  isLoading?: boolean;
}

export function TodaysSupplements({
  selectedDate,
  supplementData = [],
  isLoading,
}: TodaysSupplementsProps) {
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const takenSupplements = supplementData.filter((s) => s.taken);
  const totalSupplements = supplementData.length;

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

        {supplementData.length > 0 ? (
          <>
            {/* Progress Summary */}
            <View className="bg-green-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-green-900 text-lg font-bold">
                    {takenSupplements.length} of {totalSupplements}
                  </Text>
                  <Text className="text-green-700 text-sm">
                    {takenSupplements.length === totalSupplements
                      ? 'All supplements taken!'
                      : 'supplements completed'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Supplement List */}
            <View className="gap-3">
              {supplementData.map((supplement, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {supplement.supplement_name || 'Vitamin D3'}
                    </Text>
                    {supplement.dosage && (
                      <Text className="text-gray-500 text-sm">{supplement.dosage}</Text>
                    )}
                  </View>
                  <View className="ml-3">
                    {supplement.taken ? (
                      <View className="flex-row items-center">
                        <CheckCircle size={16} color="#10B981" />
                        <Text className="text-green-600 text-xs ml-1 font-medium">Taken</Text>
                      </View>
                    ) : (
                      <View className="w-4 h-4 rounded-full border border-gray-300" />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
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
        )}
      </View>
    </View>
  );
}
