import React from 'react';
import { View } from 'react-native';

// Shimmer animation placeholder
const SkeletonBox = ({
  width: boxWidth,
  height,
  radius = 8,
  className = '',
}: {
  width: number | string;
  height: number;
  radius?: number;
  className?: string;
}) => (
  <View
    className={`bg-gray-200 ${className}`}
    style={{
      width: typeof boxWidth === 'string' ? (boxWidth as any) : boxWidth,
      height,
      borderRadius: radius,
    }}
  />
);

// Cycle-Aware Plan Skeleton
export const CycleAwarePlanSkeleton = () => (
  <View className="mx-4 mb-6">
    <View className="rounded-3xl p-6 shadow-lg bg-white">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <SkeletonBox width={48} height={48} radius={16} className="mr-3" />
        <View className="flex-1">
          <SkeletonBox width={160} height={20} radius={4} className="mb-2" />
          <SkeletonBox width={120} height={16} radius={4} />
        </View>
      </View>

      {/* Description */}
      <SkeletonBox width="100%" height={16} radius={4} className="mb-2" />
      <SkeletonBox width="80%" height={16} radius={4} className="mb-4" />

      {/* Exercise recommendations */}
      <View className="flex-row gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} className="bg-gray-50 rounded-2xl px-4 py-3 flex-1 items-center">
            <SkeletonBox width={32} height={32} radius={16} className="mb-1" />
            <SkeletonBox width={60} height={14} radius={4} />
          </View>
        ))}
      </View>
    </View>
  </View>
);

// Weekly Plan Section Skeleton
export const WeeklyPlanSectionSkeleton = () => (
  <View className="mx-4 mb-6">
    {/* Current Plan Display */}
    <View className="rounded-3xl p-6 mb-4 bg-white shadow-lg">
      {/* Header with gradient background */}
      <View className="bg-gray-200 rounded-2xl p-4 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <SkeletonBox width={140} height={24} radius={6} className="mb-2" />
            <SkeletonBox width={100} height={14} radius={4} />
          </View>
          <SkeletonBox width={24} height={24} radius={12} />
        </View>
      </View>

      {/* Plan details */}
      <View className="flex-row justify-between mb-4">
        <View className="items-center">
          <SkeletonBox width={40} height={12} radius={4} className="mb-1" />
          <SkeletonBox width={20} height={20} radius={4} />
        </View>
        <View className="items-center">
          <SkeletonBox width={50} height={12} radius={4} className="mb-1" />
          <SkeletonBox width={30} height={20} radius={4} />
        </View>
        <View className="items-center">
          <SkeletonBox width={45} height={12} radius={4} className="mb-1" />
          <SkeletonBox width={25} height={20} radius={4} />
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <SkeletonBox width="50%" height={44} radius={22} />
        <SkeletonBox width="50%" height={44} radius={22} />
      </View>
    </View>

    {/* Generate new plan section */}
    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
      <View className="flex-row items-center mb-4">
        <SkeletonBox width={32} height={32} radius={16} className="mr-3" />
        <View className="flex-1">
          <SkeletonBox width={140} height={18} radius={4} className="mb-1" />
          <SkeletonBox width={200} height={14} radius={4} />
        </View>
      </View>
      <SkeletonBox width="100%" height={44} radius={22} />
    </View>
  </View>
);

// Complete Exercise Page Skeleton
export const ExercisePageSkeleton = () => (
  <View className="flex-1">
    <CycleAwarePlanSkeleton />
    <WeeklyPlanSectionSkeleton />
  </View>
);
