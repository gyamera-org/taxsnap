import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Heart, Plus } from 'lucide-react-native';
import { router } from 'expo-router';

interface TodaysMoodProps {
  selectedDate: Date;
  moodData?: {
    mood: string;
    energy_level: string;
    notes?: string;
  };
  isLoading?: boolean;
}

export function TodaysMood({ selectedDate, moodData, isLoading }: TodaysMoodProps) {
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date() && !isToday;

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy':
        return '😊';
      case 'normal':
        return '😐';
      case 'sad':
        return '😢';
      case 'irritable':
        return '😤';
      case 'anxious':
        return '😰';
      default:
        return '😐';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getEnergyLabel = (energy: string) => {
    switch (energy) {
      case 'high':
        return 'High Energy';
      case 'medium':
        return 'Medium Energy';
      case 'low':
        return 'Low Energy';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-purple-100 items-center justify-center mr-3">
                <Heart size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-black">Mood</Text>
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
            <View className="w-10 h-10 rounded-2xl bg-purple-100 items-center justify-center mr-3">
              <Heart size={20} color="#8B5CF6" />
            </View>
            <Text className="text-lg font-semibold text-black">Mood</Text>
          </View>
          {!isFuture && (
            <TouchableOpacity
              onPress={() => router.push('/log-mood')}
              className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center"
            >
              <Plus size={16} color="#8B5CF6" />
            </TouchableOpacity>
          )}
        </View>

        {moodData ? (
          <>
            {/* Mood Display */}
            <View className="bg-purple-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">{getMoodEmoji(moodData.mood)}</Text>
                <View>
                  <Text className="text-purple-900 text-lg font-bold capitalize">
                    {moodData.mood}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: getEnergyColor(moodData.energy_level) }}
                    />
                    <Text className="text-purple-700 text-sm">
                      {getEnergyLabel(moodData.energy_level)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {moodData.notes && (
              <View className="bg-gray-50 rounded-xl p-3">
                <Text className="text-gray-700 text-sm">{moodData.notes}</Text>
              </View>
            )}
          </>
        ) : (
          <View className="items-center py-8">
            <View className="w-16 h-16 rounded-2xl bg-purple-50 items-center justify-center mb-3">
              <Heart size={24} color="#8B5CF6" />
            </View>
            <Text className="text-gray-600 text-center mb-3">No mood logged yet</Text>
            {!isFuture && (
              <TouchableOpacity
                onPress={() => router.push('/log-mood')}
                className="bg-purple-500 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-medium">Log Your Mood</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
