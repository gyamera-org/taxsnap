import React from 'react';
import { View } from 'react-native';

export function FitnessGoalsSkeleton() {
  return (
    <>
      {/* Primary Goal skeleton */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
            <View className="w-6 h-6 bg-gray-200 rounded" />
          </View>
          <View className="flex-1">
            <View className="h-4 bg-gray-200 rounded mb-2 w-24" />
            <View className="h-3 bg-gray-200 rounded w-32" />
          </View>
        </View>
        <View className="h-9 bg-gray-200 rounded w-28" />
      </View>

      {/* Workout Frequency skeleton */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
            <View className="w-6 h-6 bg-gray-200 rounded" />
          </View>
          <View className="flex-1">
            <View className="h-4 bg-gray-200 rounded mb-2 w-32" />
            <View className="h-3 bg-gray-200 rounded w-28" />
          </View>
        </View>
        <View className="h-9 bg-gray-200 rounded w-40" />
      </View>

      {/* Experience Level skeleton */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
            <View className="w-6 h-6 bg-gray-200 rounded" />
          </View>
          <View className="flex-1">
            <View className="h-4 bg-gray-200 rounded mb-2 w-28" />
            <View className="h-3 bg-gray-200 rounded w-36" />
          </View>
        </View>
        <View className="h-9 bg-gray-200 rounded w-24" />
      </View>
    </>
  );
}
