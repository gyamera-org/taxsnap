import { useEffect } from 'react';
import { FlatList, View, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { ScanCard } from './scan-card';
import { EmptyState } from './empty-state';
import type { ScanResult } from '@/lib/types/scan';
import type { TabType } from './home-header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

// Skeleton card component with shimmer effect
function SkeletonCard({ index }: { index: number }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
  }));

  return (
    <Animated.View style={[styles.skeletonWrapper, { opacity: 1 - index * 0.15 }]}>
      <View style={styles.skeletonContainer}>
        {/* Image skeleton */}
        <Animated.View style={[styles.skeletonImage, shimmerStyle]} />

        {/* Content skeleton */}
        <View style={styles.skeletonContent}>
          {/* Title row */}
          <View style={styles.skeletonTitleRow}>
            <Animated.View style={[styles.skeletonTitle, shimmerStyle]} />
            <Animated.View style={[styles.skeletonTime, shimmerStyle]} />
          </View>

          {/* Status badge */}
          <Animated.View style={[styles.skeletonBadge, shimmerStyle]} />

          {/* Indicators row */}
          <View style={styles.skeletonIndicators}>
            {[1, 2, 3, 4].map((i) => (
              <Animated.View key={i} style={[styles.skeletonIndicator, shimmerStyle]} />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// Skeleton list for loading state
function SkeletonList() {
  return (
    <View style={styles.skeletonListContainer}>
      {[0, 1, 2, 3, 4].map((index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </View>
  );
}

interface ScanListProps {
  scans: ScanResult[];
  isLoading: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  activeTab: TabType;
  searchQuery: string;
  onScanPress?: (scan: ScanResult) => void;
  onToggleFavorite?: (scan: ScanResult) => void;
  onDeleteScan?: (scan: ScanResult) => void;
}

export function ScanList({
  scans,
  isLoading,
  isRefreshing = false,
  onRefresh,
  activeTab,
  searchQuery,
  onScanPress,
  onToggleFavorite,
  onDeleteScan,
}: ScanListProps) {
  if (isLoading) {
    return <SkeletonList />;
  }

  if (scans.length === 0) {
    const emptyType = searchQuery ? 'search' : activeTab;
    return <EmptyState type={emptyType} searchQuery={searchQuery} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
        data={scans}
        keyExtractor={(item, index) => item?.id ?? `fallback-${index}`}
        renderItem={({ item, index }) => {
          // Skip rendering if item is undefined
          if (!item) return null;
          return (
            <ScanCard
              scan={item}
              index={index}
              onPress={() => onScanPress?.(item)}
              onToggleFavorite={() => onToggleFavorite?.(item)}
              onDelete={() => onDeleteScan?.(item)}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#0D9488"
              colors={['#0D9488']}
            />
          ) : undefined
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  // Skeleton styles
  skeletonListContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  skeletonWrapper: {
    width: CARD_WIDTH,
    marginBottom: 12,
    alignSelf: 'center',
  },
  skeletonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  skeletonImage: {
    width: 110,
    height: 110,
    backgroundColor: '#D1D5DB',
    borderRadius: 16,
    margin: 8,
  },
  skeletonContent: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 6,
    justifyContent: 'center',
  },
  skeletonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skeletonTitle: {
    height: 18,
    width: '60%',
    backgroundColor: '#D1D5DB',
    borderRadius: 9,
  },
  skeletonTime: {
    height: 14,
    width: 50,
    backgroundColor: '#D1D5DB',
    borderRadius: 7,
  },
  skeletonBadge: {
    height: 24,
    width: 70,
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 10,
  },
  skeletonIndicators: {
    flexDirection: 'row',
    gap: 6,
  },
  skeletonIndicator: {
    width: 28,
    height: 28,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
  },
});
