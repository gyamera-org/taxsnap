import React from 'react';
import { View } from 'react-native';

export function NutritionGoalsSkeleton() {
  return (
    <>
      {/* Skeleton loader matching the data layout */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <View className="h-4 bg-gray-200 rounded mb-4 w-48" />
        <View className="flex flex-col gap-4">
          {/* Calories skeleton */}
          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View className="bg-orange-100 p-3 rounded-full">
                <View className="w-7 h-7 bg-gray-200 rounded" />
              </View>
              <View className="ml-4">
                <View className="h-3 bg-gray-200 rounded mb-2 w-16" />
                <View className="h-8 bg-gray-200 rounded w-20" />
              </View>
            </View>
            <View className="bg-white p-3 rounded-full shadow-sm">
              <View className="w-4 h-4 bg-gray-200 rounded" />
            </View>
          </View>

          {/* Protein skeleton */}
          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View className="bg-red-100 p-3 rounded-full">
                <View className="w-7 h-7 bg-gray-200 rounded" />
              </View>
              <View className="ml-4">
                <View className="h-3 bg-gray-200 rounded mb-2 w-16" />
                <View className="h-8 bg-gray-200 rounded w-20" />
              </View>
            </View>
            <View className="bg-white p-3 rounded-full shadow-sm">
              <View className="w-4 h-4 bg-gray-200 rounded" />
            </View>
          </View>

          {/* Carbs skeleton */}
          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-3 rounded-full">
                <View className="w-7 h-7 bg-gray-200 rounded" />
              </View>
              <View className="ml-4">
                <View className="h-3 bg-gray-200 rounded mb-2 w-16" />
                <View className="h-8 bg-gray-200 rounded w-20" />
              </View>
            </View>
            <View className="bg-white p-3 rounded-full shadow-sm">
              <View className="w-4 h-4 bg-gray-200 rounded" />
            </View>
          </View>

          {/* Fat skeleton */}
          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-full">
                <View className="w-7 h-7 bg-gray-200 rounded" />
              </View>
              <View className="ml-4">
                <View className="h-3 bg-gray-200 rounded mb-2 w-16" />
                <View className="h-8 bg-gray-200 rounded w-20" />
              </View>
            </View>
            <View className="bg-white p-3 rounded-full shadow-sm">
              <View className="w-4 h-4 bg-gray-200 rounded" />
            </View>
          </View>
        </View>
      </View>

      {/* Water skeleton */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
          <View className="flex-row items-center">
            <View className="bg-cyan-100 p-3 rounded-full">
              <View className="w-7 h-7 bg-gray-200 rounded" />
            </View>
            <View className="ml-4">
              <View className="h-3 bg-gray-200 rounded mb-2 w-24" />
              <View className="h-8 bg-gray-200 rounded w-20" />
            </View>
          </View>
          <View className="bg-white p-3 rounded-full shadow-sm">
            <View className="w-4 h-4 bg-gray-200 rounded" />
          </View>
        </View>
      </View>

      {/* Goal skeleton */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
            <View className="w-6 h-6 bg-gray-200 rounded" />
          </View>
          <View className="flex-1">
            <View className="h-4 bg-gray-200 rounded mb-2 w-20" />
            <View className="h-3 bg-gray-200 rounded w-32" />
          </View>
        </View>
        <View className="h-9 bg-gray-200 rounded w-24" />
      </View>
    </>
  );
}
