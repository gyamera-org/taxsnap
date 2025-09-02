import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonBox = ({
  width,
  height,
  className,
}: {
  width: number | string;
  height: number;
  className?: string;
}) => <Skeleton width={width} height={height} className={className} />;

// Weekly Calendar Skeleton
export const WeeklyCalendarSkeleton = () => (
  <View className="px-4 mb-6">
    <View className="flex-row justify-between items-center">
      {Array.from({ length: 7 }).map((_, index) => (
        <View key={index} className="items-center">
          <SkeletonBox width={32} height={32} className="rounded-full mb-2" />
          <SkeletonBox width={20} height={12} className="rounded" />
        </View>
      ))}
    </View>
  </View>
);

// Cycle Phase Card Skeleton
export const CyclePhaseSkeleton = () => (
  <View className="mx-4 mb-6">
    <View className="bg-white rounded-3xl p-6 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <SkeletonBox width={120} height={24} className="rounded" />
        <SkeletonBox width={24} height={24} className="rounded-full" />
      </View>

      <View className="mb-4">
        <SkeletonBox width="100%" height={16} className="rounded mb-2" />
        <SkeletonBox width="80%" height={16} className="rounded" />
      </View>

      <View className="flex-row justify-between">
        <View className="items-center">
          <SkeletonBox width={60} height={14} className="rounded mb-1" />
          <SkeletonBox width={40} height={20} className="rounded" />
        </View>
        <View className="items-center">
          <SkeletonBox width={80} height={14} className="rounded mb-1" />
          <SkeletonBox width={50} height={20} className="rounded" />
        </View>
      </View>
    </View>
  </View>
);

// Today's Mood Skeleton
export const TodaysMoodSkeleton = () => (
  <View className="mx-4 mb-6">
    <View className="bg-white rounded-3xl p-6 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <SkeletonBox width={100} height={20} className="rounded" />
        <SkeletonBox width={60} height={16} className="rounded" />
      </View>

      <View className="flex-row justify-between">
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} className="items-center">
            <SkeletonBox width={40} height={40} className="rounded-full mb-2" />
            <SkeletonBox width={30} height={12} className="rounded" />
          </View>
        ))}
      </View>
    </View>
  </View>
);

// Today's Supplements Skeleton
export const TodaysSupplementsSkeleton = () => (
  <View className="mx-4 mb-6">
    <View className="bg-white rounded-3xl p-6 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <SkeletonBox width={140} height={20} className="rounded" />
        <SkeletonBox width={60} height={32} className="rounded-full" />
      </View>

      <View className="flex-row items-center mb-4">
        <SkeletonBox width={80} height={80} className="rounded-full mr-4" />
        <View className="flex-1">
          <SkeletonBox width="60%" height={16} className="rounded mb-2" />
          <SkeletonBox width="40%" height={14} className="rounded" />
        </View>
      </View>

      <View className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <View className="flex-row items-center">
              <SkeletonBox width={24} height={24} className="rounded-full mr-3" />
              <SkeletonBox width={80} height={16} className="rounded" />
            </View>
            <SkeletonBox width={60} height={16} className="rounded" />
          </View>
        ))}
      </View>
    </View>
  </View>
);

// Today's Symptoms Skeleton
export const TodaysSymptomsSkeleton = () => (
  <View className="mx-4 mb-6">
    <View className="bg-white rounded-3xl p-6 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <SkeletonBox width={120} height={20} className="rounded" />
        <SkeletonBox width={60} height={16} className="rounded" />
      </View>

      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBox key={index} width={80} height={32} className="rounded-full" />
        ))}
      </View>
    </View>
  </View>
);

// Complete Cycle Page Skeleton
export const CyclePageSkeleton = () => (
  <View className="flex-1 bg-gray-50">
    <WeeklyCalendarSkeleton />
    <CyclePhaseSkeleton />
    <TodaysMoodSkeleton />
    <TodaysSupplementsSkeleton />
    <TodaysSymptomsSkeleton />
  </View>
);
