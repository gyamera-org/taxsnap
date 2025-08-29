import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { DailyExerciseSummary } from '@/lib/hooks/use-exercise-tracking';

interface ExerciseSummaryCardProps {
  dailySummary?: DailyExerciseSummary;
  isLoading?: boolean;
}

export function ExerciseSummaryCard({ dailySummary, isLoading }: ExerciseSummaryCardProps) {
  if (isLoading) {
    return <ExerciseSummaryCardSkeleton />;
  }

  const totalMinutes = dailySummary?.total_minutes || 0;
  const totalCalories = dailySummary?.total_calories || 0;
  const totalWorkouts = dailySummary?.total_workouts || 0;

  // Daily goals instead of weekly
  const dailyMinutesTarget = 30; // 30 minutes per day is a good daily goal
  const currentStreak = 5; // This would come from a streak calculation hook

  const minutesProgress = Math.min((totalMinutes / dailyMinutesTarget) * 100, 100);

  return (
    <View className="mx-4 mb-6">
      <View
        className="rounded-3xl p-6 shadow-lg"
        style={{
          backgroundColor: 'white',
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <View className="flex-row items-baseline">
              <Text className="text-purple-600 text-6xl font-bold mb-1">{totalMinutes}</Text>
              <Text className="text-gray-500 text-lg font-medium ml-2">minutes</Text>
            </View>
          </View>

          {/* Circular Progress Ring */}
          <View className="relative w-24 h-24">
            <View className="absolute inset-0 items-center justify-center">
              {/* Background Circle */}
              <View
                className="w-20 h-20 rounded-full border-4"
                style={{ borderColor: '#F3F4F6' }}
              />

              {/* Progress Circle */}
              <View
                className="absolute w-20 h-20 rounded-full border-4"
                style={{
                  borderColor: 'transparent',
                  borderTopColor: '#8B5CF6',
                  borderRightColor: minutesProgress > 25 ? '#8B5CF6' : 'transparent',
                  borderBottomColor: minutesProgress > 50 ? '#8B5CF6' : 'transparent',
                  borderLeftColor: minutesProgress > 75 ? '#8B5CF6' : 'transparent',
                  transform: [{ rotate: `${-90 + minutesProgress * 3.6}deg` }],
                }}
              />
            </View>

            {/* Center Content */}
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-purple-600 text-lg font-bold">
                {Math.round(minutesProgress)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between pt-4 border-t border-gray-100">
          <View className="items-center">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              Daily Goal
            </Text>
            <Text className="text-gray-900 text-lg font-bold mt-1">{dailyMinutesTarget}min</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              Workouts
            </Text>
            <Text className="text-gray-900 text-lg font-bold mt-1">{totalWorkouts}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              Calories
            </Text>
            <Text className="text-gray-900 text-lg font-bold mt-1">{totalCalories}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ExerciseSummaryCardSkeleton() {
  return (
    <View className="mx-4 mb-6">
      <View
        className="rounded-3xl p-6 shadow-lg"
        style={{
          backgroundColor: 'white',
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Header Skeleton */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <View className="flex-row items-baseline">
              <View className="w-20 h-16 bg-gray-200 rounded mb-1" />
              <View className="w-16 h-5 bg-gray-200 rounded ml-2" />
            </View>
          </View>

          {/* Circular Progress Ring Skeleton */}
          <View className="relative w-24 h-24">
            <View className="w-20 h-20 rounded-full border-4 border-gray-200 items-center justify-center">
              <View className="w-8 h-4 bg-gray-200 rounded" />
            </View>
          </View>
        </View>

        {/* Stats Row Skeleton */}
        <View className="flex-row justify-between pt-4 border-t border-gray-100">
          <View className="items-center">
            <View className="w-16 h-3 bg-gray-200 rounded mb-1" />
            <View className="w-10 h-5 bg-gray-200 rounded" />
          </View>
          <View className="items-center">
            <View className="w-16 h-3 bg-gray-200 rounded mb-1" />
            <View className="w-4 h-5 bg-gray-200 rounded" />
          </View>
          <View className="items-center">
            <View className="w-16 h-3 bg-gray-200 rounded mb-1" />
            <View className="w-8 h-5 bg-gray-200 rounded" />
          </View>
        </View>
      </View>
    </View>
  );
}
