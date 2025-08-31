import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { AlertCircle, Plus } from 'lucide-react-native';
import { router } from 'expo-router';

interface TodaysSymptomsProps {
  selectedDate: Date;
  symptomData?: {
    symptoms: string[];
    severity?: 'mild' | 'moderate' | 'severe';
    notes?: string;
  };
  isLoading?: boolean;
}

export function TodaysSymptoms({ selectedDate, symptomData, isLoading }: TodaysSymptomsProps) {
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date() && !isToday;

  const getSymptomColor = (symptom: string) => {
    const severityColors = {
      Cramps: '#EF4444',
      Headache: '#F59E0B',
      'Mood swings': '#8B5CF6',
      Bloating: '#06B6D4',
      Fatigue: '#6B7280',
      'Breast tenderness': '#EC4899',
      'Back pain': '#DC2626',
      Nausea: '#10B981',
      Acne: '#F97316',
      'Food cravings': '#84CC16',
      Insomnia: '#3B82F6',
      Anxiety: '#F59E0B',
    };
    return severityColors[symptom as keyof typeof severityColors] || '#6B7280';
  };

  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-orange-100 items-center justify-center mr-3">
                <AlertCircle size={20} color="#F97316" />
              </View>
              <Text className="text-lg font-semibold text-black">Symptoms</Text>
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
            <View className="w-10 h-10 rounded-2xl bg-orange-100 items-center justify-center mr-3">
              <AlertCircle size={20} color="#F97316" />
            </View>
            <Text className="text-lg font-semibold text-black">Symptoms</Text>
          </View>
          {!isFuture && (
            <TouchableOpacity
              onPress={() => router.push('/log-symptoms')}
              className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center"
            >
              <Plus size={16} color="#F97316" />
            </TouchableOpacity>
          )}
        </View>

        {symptomData?.symptoms && symptomData.symptoms.length > 0 ? (
          <>
            {/* Symptoms Summary */}
            <View className="bg-orange-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-orange-900 text-lg font-bold">
                    {symptomData.symptoms.length} Symptoms
                  </Text>
                  <Text className="text-orange-700 text-sm">
                    {symptomData.severity
                      ? `${symptomData.severity} intensity`
                      : 'Tracking your experience'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Symptoms List */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              {symptomData.symptoms.slice(0, 6).map((symptom, index) => (
                <View
                  key={index}
                  className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100"
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Text className="text-sm font-medium text-gray-700 capitalize">{symptom}</Text>
                </View>
              ))}
              {symptomData.symptoms.length > 6 && (
                <View
                  className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100"
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Text className="text-sm font-medium text-gray-600">
                    +{symptomData.symptoms.length - 6} more
                  </Text>
                </View>
              )}
            </View>

            {symptomData.notes && (
              <View className="bg-gray-50 rounded-xl p-3">
                <Text className="text-gray-700 text-sm">{symptomData.notes}</Text>
              </View>
            )}
          </>
        ) : (
          <View className="items-center py-8">
            <View className="w-16 h-16 rounded-2xl bg-orange-50 items-center justify-center mb-3">
              <AlertCircle size={24} color="#F97316" />
            </View>
            <Text className="text-gray-600 text-center mb-3">No symptoms logged yet</Text>
            {!isFuture && (
              <TouchableOpacity
                onPress={() => router.push('/log-symptoms')}
                className="bg-orange-500 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-medium">Log Your Symptoms</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
