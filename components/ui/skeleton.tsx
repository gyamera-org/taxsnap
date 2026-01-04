import { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/theme-provider';

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
  const { isDark } = useTheme();

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
    outputRange: isDark 
      ? ['#374151', '#4B5563'] // Dark mode colors
      : ['#f1f5f9', '#e2e8f0'], // Light mode colors
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
  const { isDark } = useTheme();
  
  return (
    <View className={`p-4 rounded-xl shadow-sm mb-3 mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
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
  const { isDark } = useTheme();
  
  return (
    <View className={`p-4 rounded-xl shadow-sm mb-3 mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
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
  const { isDark } = useTheme();
  
  return (
    <View className={`mx-4 p-4 rounded-2xl shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
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
  const { isDark } = useTheme();
  
  return (
    <View className={`mx-4 p-4 rounded-2xl shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
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

export function ReceiptListItemSkeleton() {
  const { isDark } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 110,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderWidth: isDark ? 1 : 0,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
      }}
    >
      {/* Image skeleton */}
      <Skeleton width={110} height={110} borderRadius={0} />

      {/* Content skeleton */}
      <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, gap: 8 }}>
        {/* Vendor & time row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width={140} height={16} borderRadius={4} />
          <Skeleton width={50} height={12} borderRadius={4} />
        </View>

        {/* Amount */}
        <Skeleton width={80} height={22} borderRadius={4} />

        {/* Meta row */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Skeleton width={60} height={14} borderRadius={4} />
          <Skeleton width={50} height={14} borderRadius={4} />
          <Skeleton width={50} height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

export function ReceiptListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, index) => (
        <ReceiptListItemSkeleton key={index} />
      ))}
    </View>
  );
}

export function CategoryFilterSkeleton() {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8 }}>
      <Skeleton width={50} height={36} borderRadius={20} />
      <Skeleton width={80} height={36} borderRadius={20} />
      <Skeleton width={90} height={36} borderRadius={20} />
      <Skeleton width={70} height={36} borderRadius={20} />
      <Skeleton width={85} height={36} borderRadius={20} />
    </View>
  );
}

export function SummaryCardsSkeleton() {
  const { isDark } = useTheme();

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12 }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            borderRadius: 16,
            borderWidth: 1,
            padding: 16,
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}
        >
          <Skeleton width={32} height={32} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width={60} height={18} borderRadius={4} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={11} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

export function ReceiptsPageSkeleton() {
  return (
    <View style={{ flex: 1, gap: 16 }}>
      <CategoryFilterSkeleton />
      <SummaryCardsSkeleton />
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <ReceiptListSkeleton count={4} />
      </View>
    </View>
  );
}

export function PreferencesStepSkeleton() {
  return (
    <View className="flex-1 bg-teal-50">
      {/* Header with back button and progress bar */}
      <View className="flex-row items-center py-4 px-6 mt-14">
        <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />
        <View className="flex-1">
          <Skeleton width="100%" height={6} borderRadius={3} />
        </View>
      </View>

      {/* Title */}
      <View className="px-6 mb-6 mt-2">
        <Skeleton width={250} height={28} className="mb-2" />
        <Skeleton width={180} height={16} />
      </View>

      {/* Option cards */}
      <View className="px-6 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            width="100%"
            height={56}
            borderRadius={16}
            style={{ opacity: 1 - index * 0.1 }}
          />
        ))}
      </View>

      {/* Bottom button */}
      <View className="absolute bottom-10 left-6 right-6">
        <Skeleton width="100%" height={56} borderRadius={16} />
      </View>
    </View>
  );
}