import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/context/theme-provider';

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
export const CyclePhaseSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <View className="px-4 mb-6">
      <View
        className={`${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        } rounded-3xl p-6 border`}
      >
        {/* Circular Progress Section */}
        <View className="items-center mb-8">
          <View className="relative items-center justify-center">
            {/* Circular Progress Placeholder */}
            <SkeletonBox width={180} height={180} className="rounded-full" />
            <View className="absolute items-center justify-center">
              <SkeletonBox width={80} height={36} className="rounded mb-2" />
              <SkeletonBox width={100} height={16} className="rounded" />
            </View>
          </View>
        </View>

        {/* Two Column Layout - Side by Side */}
        <View className="flex-row justify-between gap-3">
          <View className={`flex-1 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl p-4`}>
            <View className="items-center">
              <View className="flex-row items-center mb-2">
                <SkeletonBox width={16} height={16} className="rounded mr-2" />
                <SkeletonBox width={60} height={16} className="rounded" />
              </View>
              <SkeletonBox width={40} height={12} className="rounded" />
            </View>
          </View>
          <View className={`flex-1 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl p-4`}>
            <View className="items-center">
              <View className="flex-row items-center mb-2">
                <SkeletonBox width={16} height={16} className="rounded mr-2" />
                <SkeletonBox width={80} height={16} className="rounded" />
              </View>
              <SkeletonBox width={60} height={12} className="rounded" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// Today's Mood Skeleton
export const TodaysMoodSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <View className="px-4 mb-6">
      <View
        className={`${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl p-4 border`}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <SkeletonBox width={40} height={40} className="rounded-2xl mr-3" />
            <SkeletonBox width={80} height={20} className="rounded" />
          </View>
          <SkeletonBox width={32} height={32} className="rounded-full" />
        </View>

        {/* Mood Content */}
        <View className={`${isDark ? 'bg-pink-900/30' : 'bg-purple-50'} rounded-2xl p-4`}>
          <View className="items-center">
            <SkeletonBox width={60} height={60} className="rounded-full mb-4" />
            <SkeletonBox width={120} height={24} className="rounded mb-2" />
            <SkeletonBox width={80} height={16} className="rounded" />
          </View>
        </View>
      </View>
    </View>
  );
};

// Today's Supplements Skeleton
export const TodaysSupplementsSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <View className="mx-4 mb-6">
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm`}>
        <View className="flex-row items-center justify-between mb-4">
          <SkeletonBox width={140} height={20} className="rounded" />
          <SkeletonBox width={60} height={32} className="rounded-full" />
        </View>

        <View className="flex-row items-center mb-4">
          <SkeletonBox width={80} height={80} className="rounded-full mr-4" />
          <View className="flex-1">
            <SkeletonBox width={180} height={16} className="rounded mb-2" />
            <SkeletonBox width={120} height={14} className="rounded" />
          </View>
        </View>

        <View className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <View
              key={index}
              className={`flex-row items-center justify-between p-3 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              } rounded-xl`}
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
};

// Today's Symptoms Skeleton
export const TodaysSymptomsSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <View className="px-4 mb-6">
      <View
        className={`${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl p-4 border`}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <SkeletonBox width={40} height={40} className="rounded-2xl mr-3" />
            <SkeletonBox width={100} height={20} className="rounded" />
          </View>
          <SkeletonBox width={32} height={32} className="rounded-full" />
        </View>

        {/* Symptoms Grid */}
        <View className="flex-row flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              className={`${
                isDark ? 'bg-pink-900/30' : 'bg-purple-50'
              } rounded-2xl p-3 items-center`}
              style={{ width: '30%' }}
            >
              <SkeletonBox width={28} height={28} className="rounded mb-2" />
              <SkeletonBox width={60} height={12} className="rounded" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Period Prediction Button Skeleton
export const PeriodPredictionButtonSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <View className="mx-4 mb-6">
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-4 shadow-sm`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <SkeletonBox width={180} height={16} className="rounded mb-2" />
            <SkeletonBox width={120} height={14} className="rounded" />
          </View>
          <SkeletonBox width={80} height={32} className="rounded-full" />
        </View>
      </View>
    </View>
  );
};

// Cycle Averages Skeleton
export const CycleAveragesSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <View className="px-4 mb-6">
      {/* Two Column Layout */}
      <View className="flex-row gap-3">
        {/* First Column - Cycle Length */}
        <View
          className={`flex-1 ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          } rounded-2xl p-4 border`}
        >
          <View className="items-center">
            <SkeletonBox width={40} height={40} className="rounded-full mb-3" />
            <SkeletonBox width={32} height={32} className="rounded mb-1" />
            <SkeletonBox width={80} height={14} className="rounded mb-1" />
            <SkeletonBox width={30} height={12} className="rounded" />
          </View>
        </View>

        {/* Second Column - Period Length */}
        <View
          className={`flex-1 ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          } rounded-2xl p-4 border`}
        >
          <View className="items-center">
            <SkeletonBox width={40} height={40} className="rounded-full mb-3" />
            <SkeletonBox width={32} height={32} className="rounded mb-1" />
            <SkeletonBox width={90} height={14} className="rounded mb-1" />
            <SkeletonBox width={30} height={12} className="rounded" />
          </View>
        </View>
      </View>
    </View>
  );
};

// Today's Flow Skeleton
export const TodaysFlowSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <View className="px-4 mb-6">
      <View
        className={`${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl p-4 border`}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <SkeletonBox width={40} height={40} className="rounded-2xl mr-3" />
            <SkeletonBox width={60} height={20} className="rounded" />
          </View>
          <SkeletonBox width={32} height={32} className="rounded-full" />
        </View>

        {/* Flow Content */}
        <View className={`${isDark ? 'bg-pink-900/30' : 'bg-purple-50'} rounded-2xl p-4`}>
          <View className="items-center">
            <View className="rounded-2xl items-center justify-center my-8">
              <SkeletonBox width={40} height={40} className="rounded" />
            </View>
            <SkeletonBox width={120} height={24} className="rounded" />
          </View>
        </View>
      </View>
    </View>
  );
};

// Complete Cycle Page Skeleton - Updated to match current structure
export const CyclePageSkeleton = () => {
  return (
    <>
      {/* <PeriodPredictionButtonSkeleton /> */}
      <CyclePhaseSkeleton />
      <CycleAveragesSkeleton />
      <TodaysFlowSkeleton />
      <TodaysSymptomsSkeleton />
      <TodaysMoodSkeleton />
    </>
  );
};
