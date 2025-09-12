import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/context/theme-provider';

// Cycle-Aware Plan Skeleton
export const CycleAwarePlanSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <View className="mx-4 mb-6">
      <View className={`rounded-3xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Skeleton width={48} height={48} borderRadius={16} className="mr-3" />
          <View className="flex-1">
            <Skeleton width={160} height={20} borderRadius={4} className="mb-2" />
            <Skeleton width={120} height={16} borderRadius={4} />
          </View>
        </View>

        {/* Description */}
        <Skeleton width={300} height={16} borderRadius={4} className="mb-2" />
        <Skeleton width={240} height={16} borderRadius={4} className="mb-4" />

        {/* Exercise recommendations */}
        <View className="flex-row gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl px-4 py-3 flex-1 items-center`}>
              <Skeleton width={32} height={32} borderRadius={16} className="mb-1" />
              <Skeleton width={60} height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Weekly Plan Section Skeleton
export const WeeklyPlanSectionSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <View className="mx-4 mb-6">
      {/* Current Plan Display */}
      <View className={`rounded-3xl p-6 mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        {/* Header with gradient background */}
        <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-2xl p-4 mb-4`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Skeleton width={140} height={24} borderRadius={6} className="mb-2" />
              <Skeleton width={100} height={14} borderRadius={4} />
            </View>
            <Skeleton width={24} height={24} borderRadius={12} />
          </View>
        </View>

        {/* Plan details */}
        <View className="flex-row justify-between mb-4">
          <View className="items-center">
            <Skeleton width={40} height={12} borderRadius={4} className="mb-1" />
            <Skeleton width={20} height={20} borderRadius={4} />
          </View>
          <View className="items-center">
            <Skeleton width={50} height={12} borderRadius={4} className="mb-1" />
            <Skeleton width={30} height={20} borderRadius={4} />
          </View>
          <View className="items-center">
            <Skeleton width={45} height={12} borderRadius={4} className="mb-1" />
            <Skeleton width={25} height={20} borderRadius={4} />
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <Skeleton width={150} height={44} borderRadius={22} />
          <Skeleton width={150} height={44} borderRadius={22} />
        </View>
      </View>

      {/* Generate new plan section */}
      <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-50'} rounded-2xl p-6 shadow-sm border`}>
        <View className="flex-row items-center mb-4">
          <Skeleton width={32} height={32} borderRadius={16} className="mr-3" />
          <View className="flex-1">
            <Skeleton width={140} height={18} borderRadius={4} className="mb-1" />
            <Skeleton width={200} height={14} borderRadius={4} />
          </View>
        </View>
        <Skeleton width={300} height={44} borderRadius={22} />
      </View>
    </View>
  );
};

// Complete Exercise Page Skeleton
export const ExercisePageSkeleton = () => (
  <View className="flex-1">
    <CycleAwarePlanSkeleton />
    <WeeklyPlanSectionSkeleton />
  </View>
);
