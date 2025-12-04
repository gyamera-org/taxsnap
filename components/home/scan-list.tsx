import { FlatList, View, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { ScanCard } from './scan-card';
import { EmptyState } from './empty-state';
import type { ScanResult } from '@/lib/types/scan';
import type { TabType } from './home-header';

interface ScanListProps {
  scans: ScanResult[];
  isLoading: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  activeTab: TabType;
  searchQuery: string;
  onScanPress?: (scan: ScanResult) => void;
  onToggleFavorite?: (scan: ScanResult) => void;
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
}: ScanListProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  if (scans.length === 0) {
    const emptyType = searchQuery ? 'search' : activeTab;
    return <EmptyState type={emptyType} searchQuery={searchQuery} />;
  }

  return (
    <FlatList
      data={scans}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <ScanCard
          scan={item}
          index={index}
          onPress={() => onScanPress?.(item)}
          onToggleFavorite={() => onToggleFavorite?.(item)}
        />
      )}
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
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
});
