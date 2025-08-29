import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Target, Flame, Heart, Wheat, Droplets, GlassWater, Edit3 } from 'lucide-react-native';
import { NutritionGoals } from '@/lib/hooks/use-nutrition-goals';
import { formatGoal, formatActivityLevel } from '@/constants/nutrition-questionnaire';

interface GoalCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
}

const GoalCard = ({ icon, title, value, subtitle }: GoalCardProps) => (
  <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
    <View className="flex-row items-center mb-4">
      <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
        {React.createElement(icon, { size: 24, color: '#374151' })}
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500">{subtitle}</Text>
      </View>
    </View>

    <Text className="text-3xl font-bold text-gray-900">{value}</Text>
  </View>
);

interface NutritionGoalsEmptyStateProps {
  nutritionGoals: NutritionGoals | null;
  hasOnboardingData: boolean;
}

export function NutritionGoalsEmptyState({
  nutritionGoals,
  hasOnboardingData,
}: NutritionGoalsEmptyStateProps) {
  return (
    <>
      {/* Show nutrition placeholders when no goals set - SAME UI as calculated */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Your Personalized Plan</Text>
        <View className="flex flex-col gap-4">
          {/* Calories placeholder */}
          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View className="bg-orange-100 p-3 rounded-full">
                <Flame size={28} color="#ea580c" />
              </View>
              <View className="ml-4">
                <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Calories
                </Text>
                <Text className="text-3xl font-bold text-gray-400">--</Text>
              </View>
            </View>
            <TouchableOpacity disabled className="bg-white p-3 rounded-full shadow-sm opacity-50">
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Protein placeholder */}
          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View className="bg-red-100 p-3 rounded-full">
                <Heart size={28} color="#dc2626" />
              </View>
              <View className="ml-4">
                <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Protein
                </Text>
                <Text className="text-3xl font-bold text-gray-400">--</Text>
              </View>
            </View>
            <TouchableOpacity disabled className="bg-white p-3 rounded-full shadow-sm opacity-50">
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Carbs placeholder */}
          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-3 rounded-full">
                <Wheat size={28} color="#d97706" />
              </View>
              <View className="ml-4">
                <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Carbs
                </Text>
                <Text className="text-3xl font-bold text-gray-400">--</Text>
              </View>
            </View>
            <TouchableOpacity disabled className="bg-white p-3 rounded-full shadow-sm opacity-50">
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Fat placeholder */}
          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-full">
                <Droplets size={28} color="#2563eb" />
              </View>
              <View className="ml-4">
                <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Fat
                </Text>
                <Text className="text-3xl font-bold text-gray-400">--</Text>
              </View>
            </View>
            <TouchableOpacity disabled className="bg-white p-3 rounded-full shadow-sm opacity-50">
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Water placeholder */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
          <View className="flex-row items-center">
            <View className="bg-cyan-100 p-3 rounded-full">
              <GlassWater size={28} color="#0891b2" />
            </View>
            <View className="ml-4">
              <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Water per day
              </Text>
              <Text className="text-3xl font-bold text-gray-400">--ml</Text>
            </View>
          </View>
          <TouchableOpacity disabled className="bg-white p-3 rounded-full shadow-sm opacity-50">
            <Edit3 size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Goal placeholder or onboarding info */}
      {hasOnboardingData ? (
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
              <Target size={24} color="#374151" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">Your Preferences</Text>
              <Text className="text-sm text-gray-500">From your onboarding</Text>
            </View>
          </View>

          <View className="flex flex-col gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Goal:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatGoal(nutritionGoals?.primary_goal || '')}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Activity Level:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatActivityLevel(nutritionGoals?.activity_level || '')}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Experience:</Text>
              <Text className="text-sm font-medium text-gray-900 capitalize">
                {nutritionGoals?.tracking_experience || ''}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <GoalCard
          icon={Target}
          title="Your Goal"
          value="--"
          subtitle="Set your nutrition goals to get started"
        />
      )}
    </>
  );
}
