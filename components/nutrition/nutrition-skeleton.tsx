import React from 'react';
import { View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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

// Calories Summary Card Skeleton
export const CaloriesSummaryCardSkeleton = () => (
  <View className="px-4 mb-6">
    <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Main content */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Left side - Large number and text */}
        <View className="flex-1">
          <SkeletonBox width={180} height={72} radius={12} className="mb-1" />
          <View className="flex-row items-center">
            <SkeletonBox width={120} height={18} radius={4} />
            <View className="flex-row items-center ml-3">
              <SkeletonBox width={16} height={16} radius={8} className="mr-1" />
              <SkeletonBox width={90} height={14} radius={4} />
            </View>
          </View>
        </View>

        {/* Right side - Circular progress */}
        <View className="relative w-20 h-20">
          <SkeletonBox width={80} height={80} radius={40} />
          {/* Center icon placeholder */}
          <View className="absolute inset-0 items-center justify-center">
            <SkeletonBox width={32} height={32} radius={16} />
          </View>
        </View>
      </View>

      {/* Meal Breakdown */}
      <View className="border-t border-gray-100 pt-4">
        <View className="flex-row justify-between">
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} className="items-center">
              <SkeletonBox width={32} height={32} radius={16} className="mb-1" />
              <SkeletonBox width={30} height={12} radius={4} className="mb-1" />
              <SkeletonBox width={40} height={12} radius={4} />
            </View>
          ))}
        </View>
      </View>
    </View>
  </View>
);

// Individual Macro Card Skeleton (matches new UI design)
const IndividualMacroCardSkeleton = () => (
  <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 mb-4">
    <View className="flex-row items-center justify-between">
      {/* Left side - Value and label */}
      <View className="flex-1">
        {/* Large number (e.g., "109g") */}
        <SkeletonBox width={120} height={40} radius={8} className="mb-2" />
        {/* Label (e.g., "Protein left") */}
        <SkeletonBox width={80} height={16} radius={4} />
      </View>

      {/* Right side - Circular progress indicator */}
      <View className="relative w-16 h-16">
        {/* Outer circle */}
        <SkeletonBox width={64} height={64} radius={32} />
        {/* Inner icon placeholder */}
        <View className="absolute inset-0 items-center justify-center">
          <SkeletonBox width={24} height={24} radius={12} />
        </View>
      </View>
    </View>
  </View>
);

// Macro Breakdown Skeleton (updated to match new vertical layout)
export const MacroBreakdownSkeleton = () => (
  <View className="px-4 mb-6">
    {/* Three individual macro cards stacked vertically */}
    <IndividualMacroCardSkeleton />
    <IndividualMacroCardSkeleton />
    <IndividualMacroCardSkeleton />
  </View>
);

// Water Intake Card Skeleton
export const WaterIntakeCardSkeleton = () => (
  <View className="px-4 mb-6">
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <SkeletonBox width={32} height={32} radius={16} className="mr-3" />
          <SkeletonBox width={60} height={20} radius={4} />
        </View>
        <SkeletonBox width={80} height={16} radius={4} />
      </View>

      <View className="flex-row items-baseline mb-4">
        <SkeletonBox width={80} height={32} radius={6} />
        <SkeletonBox width={60} height={16} radius={4} className="ml-2" />
      </View>

      <SkeletonBox width="100%" height={8} radius={4} />
    </View>
  </View>
);

// Meal Card Skeleton
const MealCardSkeleton = ({ isAnalyzing = false }: { isAnalyzing?: boolean }) => (
  <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-50">
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center flex-1">
        <SkeletonBox width={48} height={48} radius={12} className="mr-3" />

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <SkeletonBox width={60} height={16} radius={4} />
            <SkeletonBox width={40} height={12} radius={4} />
          </View>
          <SkeletonBox width={140} height={18} radius={4} className="mb-2" />
          <SkeletonBox width={80} height={14} radius={4} />
        </View>
      </View>

      <SkeletonBox width={16} height={16} radius={2} />
    </View>

    {/* Nutrition breakdown - always show for regular meals */}
    <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} className="items-center">
          <SkeletonBox width={35} height={12} radius={4} className="mb-1" />
          <SkeletonBox width={25} height={16} radius={4} />
        </View>
      ))}
    </View>

    {/* Analyzing state banner */}
    {isAnalyzing && (
      <View className="mt-3 bg-blue-50 rounded-xl p-3 border border-blue-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <SkeletonBox width={16} height={16} radius={8} className="mr-2" />
            <SkeletonBox width={120} height={16} radius={4} />
          </View>
          <SkeletonBox width={80} height={28} radius={14} />
        </View>
      </View>
    )}
  </View>
);

// Meals Section Skeleton
export const MealsSectionSkeleton = () => (
  <View className="px-4 mb-6">
    <View className="flex-row items-center justify-between mb-4">
      <SkeletonBox width={120} height={24} radius={6} />
      <SkeletonBox width={100} height={36} radius={18} />
    </View>

    {/* Show a realistic mix of meal cards */}
    <MealCardSkeleton />
    <MealCardSkeleton />
    <MealCardSkeleton isAnalyzing={false} />
  </View>
);

// Weekly Calendar Skeleton
export const WeeklyCalendarSkeleton = () => (
  <View className="mx-4 mb-8">
    <View className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-50">
      <View className="flex-row justify-between">
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={index} className="items-center flex-1">
            {/* Day letter */}
            <SkeletonBox width={8} height={12} radius={2} className="mb-3" />

            {/* Date container */}
            <View className="relative">
              <View className="w-12 h-12 rounded-xl bg-gray-50 items-center justify-center">
                <SkeletonBox width={16} height={16} radius={4} />
              </View>

              {/* Activity indicator dot (show on some days) */}
              {index % 3 === 0 && (
                <View className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <SkeletonBox width={6} height={6} radius={3} />
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  </View>
);

// Streak Display Skeleton (for header)
export const StreakDisplaySkeleton = () => (
  <View className="flex-row items-center">
    <View className="flex-row items-center mr-3">
      <SkeletonBox width={20} height={20} radius={10} className="mr-2" />
      <SkeletonBox width={40} height={16} radius={4} />
    </View>
    <SkeletonBox width={80} height={32} radius={16} />
  </View>
);

// Full Page Skeleton
export const NutritionPageSkeleton = () => (
  <View className="flex-1">
    <WeeklyCalendarSkeleton />
    <CaloriesSummaryCardSkeleton />
    <MacroBreakdownSkeleton />
    <WaterIntakeCardSkeleton />
    <MealsSectionSkeleton />
  </View>
);
