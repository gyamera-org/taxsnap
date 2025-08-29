import { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({
  width = 100,
  height = 20,
  borderRadius = 4,
  className,
  style,
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f1f5f9', '#e2e8f0'],
  });

  return (
    <Animated.View
      className={cn('', className)}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

export function ProductItemSkeleton() {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 mx-4">
      <View className="flex-row items-center">
        <Skeleton width={60} height={60} borderRadius={8} className="mr-3" />
        <View className="flex-1">
          <Skeleton width={200} height={16} className="mb-2" />
          <Skeleton width={120} height={14} className="mb-2" />
          <View className="flex-row mt-2">
            <Skeleton width={60} height={20} borderRadius={10} className="mr-2" />
            <Skeleton width={80} height={20} borderRadius={10} />
          </View>
        </View>
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function SettingsItemSkeleton() {
  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 mx-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Skeleton width={20} height={20} className="mr-3" />
          <Skeleton width={150} height={16} />
        </View>
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
}

export function HairGoalsSkeleton() {
  return (
    <View className="bg-white mx-4 p-4 rounded-2xl shadow">
      <View className="gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} className="flex-row justify-between items-center py-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={100} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function PersonalDetailsSkeleton() {
  return (
    <View className="bg-white mx-4 p-4 rounded-2xl shadow">
      <View className="gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <View key={index} className="flex-row justify-between items-center py-3">
            <Skeleton width={80} height={16} />
            <Skeleton width={120} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="px-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductItemSkeleton key={index} />
      ))}
    </View>
  );
}
