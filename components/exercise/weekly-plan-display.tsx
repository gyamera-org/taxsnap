import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Clock, Flame, Heart, X, Calendar, Target, TrendingUp, Dumbbell } from 'lucide-react-native';

interface WeeklyPlanProps {
  plan: {
    plan_name: string;
    plan_description: string;
    days: Array<{
      date: string;
      day_name: string;
      is_rest_day: boolean;
      workout_type: string;
      duration_minutes: number;
      intensity: 'low' | 'moderate' | 'high';
      exercises: Array<{
        name: string;
        category: string;
        duration_minutes: number;
        sets: number;
        reps: string;
        calories_estimate: number;
        instructions: string;
      }>;
      rest_day_activities: string[];
      daily_tips: string[];
    }>;
    weekly_goals: {
      total_workouts: number;
      total_minutes: number;
      estimated_calories: number;
      focus_areas: string[];
    };
    safety_reminders: string[];
  };
  onClose: () => void;
}

export function WeeklyPlanDisplay({ plan, onClose }: WeeklyPlanProps) {
  const handleDayPress = (day: any) => {
    if (day.is_rest_day) {
      alert('🛌 Rest Day\n\nTake a break today! Your body needs recovery.');
    } else if (day.exercises.length === 0) {
      alert('💪 No workout planned\n\nThis day is free - consider light activity or rest.');
    } else {
      // Show workout details
      const exerciseList = day.exercises
        .map((ex: any) => `• ${ex.name} (${ex.duration_minutes}min)`)
        .join('\n');
      alert(
        `🏋️ ${day.workout_type}\n\n${exerciseList}\n\nDuration: ${day.duration_minutes} minutes`
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-purple-500 pt-12 pb-6 px-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">7-Day Plan</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Weekly Summary */}
        <View className="my-6 p-4 bg-purple-50 rounded-2xl">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-purple-600 text-xs uppercase">Workouts</Text>
              <Text className="text-purple-900 text-xl font-bold">
                {plan.weekly_goals.total_workouts}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-purple-600 text-xs uppercase">Minutes</Text>
              <Text className="text-purple-900 text-xl font-bold">
                {plan.weekly_goals.total_minutes}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-purple-600 text-xs uppercase">Calories</Text>
              <Text className="text-purple-900 text-xl font-bold">
                {plan.weekly_goals.estimated_calories}
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Plans - Simple Grid */}
        {plan.days.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDayPress(day)}
            className="mb-3 p-4 bg-gray-50 rounded-2xl"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 font-bold">{day.day_name}</Text>
                <Text className="text-gray-600 text-sm">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              <View className="flex-row items-center">
                {day.is_rest_day ? (
                  <>
                    <Heart size={16} color="#10B981" />
                    <Text className="text-green-700 text-sm ml-1">Rest</Text>
                  </>
                ) : day.exercises.length > 0 ? (
                  <>
                    <Clock size={16} color="#8B5CF6" />
                    <Text className="text-purple-700 text-sm ml-1">{day.duration_minutes}min</Text>
                    <Text className="text-gray-600 text-sm ml-2">{day.workout_type}</Text>
                  </>
                ) : (
                  <Text className="text-gray-400 text-sm">Free day</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
