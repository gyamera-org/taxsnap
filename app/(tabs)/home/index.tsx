import { useState, useMemo, useCallback } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { HomeHeader, ScanList, type TabType } from '@/components/home';
import { useScans, useToggleFavorite, useDeleteScan, useScansRealtime } from '@/lib/hooks/use-scans';
import { usePendingScan } from '@/context/pending-scan-provider';
import { DEMO_MODE, DEMO_SCANS } from '@/lib/config/demo-data';
import type { ScanResult } from '@/lib/types/scan';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [demoScans, setDemoScans] = useState(DEMO_SCANS);

  // Fetch scans from backend (only when not in demo mode)
  const { data: apiScans = [], isLoading: apiLoading, refetch, isRefetching } = useScans();
  const toggleFavorite = useToggleFavorite();
  const deleteScan = useDeleteScan();
  const { pendingScan } = usePendingScan();

  // Enable realtime updates for scans (invalidates queries on INSERT/UPDATE/DELETE)
  useScansRealtime();

  // Use demo data or real data based on DEMO_MODE
  const scans = DEMO_MODE ? demoScans : apiScans;
  const isLoading = DEMO_MODE ? false : apiLoading;

  // Create a pending scan item for the list if there's an active scan
  const pendingScanItem: ScanResult | null = pendingScan ? {
    id: pendingScan.id,
    user_id: 'pending',
    name: 'Analyzing...',
    image_url: pendingScan.imagePreviewUri,
    status: 'pending',
    summary: '',
    progress: Math.round(pendingScan.progress),
    is_favorite: false,
    scanned_at: pendingScan.createdAt.toISOString(),
    created_at: pendingScan.createdAt.toISOString(),
    updated_at: pendingScan.createdAt.toISOString(),
  } : null;

  // Filter scans based on active tab and search query
  const filteredScans = useMemo(() => {
    const baseScans = scans.filter((scan) => {
      // Skip undefined/null scans
      if (!scan) return false;
      const matchesSearch = scan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const matchesTab = activeTab === 'all' || (activeTab === 'saves' && scan.is_favorite);
      return matchesSearch && matchesTab;
    });

    // Add pending scan at the top if it exists and we're on 'all' tab
    if (pendingScanItem && activeTab === 'all') {
      return [pendingScanItem, ...baseScans];
    }

    return baseScans;
  }, [scans, activeTab, searchQuery, pendingScanItem]);

  const handleScanPress = useCallback((scan: ScanResult) => {
    // Don't navigate for pending scans
    if (scan.status === 'pending') return;
    router.push(`/scan/${scan.id}`);
  }, [router]);

  const handleToggleFavorite = useCallback((scan: ScanResult) => {
    if (DEMO_MODE) {
      // Toggle favorite in demo mode locally
      setDemoScans((prev) =>
        prev.map((s) =>
          s.id === scan.id ? { ...s, is_favorite: !s.is_favorite } : s
        )
      );
    } else {
      toggleFavorite.mutate(scan);
    }
  }, [toggleFavorite]);

  const handleRefresh = useCallback(() => {
    if (!DEMO_MODE) {
      refetch();
    }
  }, [refetch]);

  const handleDeleteScan = useCallback((scan: ScanResult) => {
    if (DEMO_MODE) {
      // Delete in demo mode locally
      setDemoScans((prev) => prev.filter((s) => s.id !== scan.id));
    } else {
      deleteScan.mutate(scan.id);
    }
  }, [deleteScan]);

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs for liquid effect */}
      <Animated.View
        entering={FadeIn.delay(100).duration(1000)}
        style={[styles.orb, styles.orb1]}
      />
      <Animated.View
        entering={FadeIn.delay(200).duration(1000)}
        style={[styles.orb, styles.orb2]}
      />
      <Animated.View
        entering={FadeIn.delay(300).duration(1000)}
        style={[styles.orb, styles.orb3]}
      />

      <StatusBar barStyle="dark-content" />

      <HomeHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ScanList
        scans={filteredScans}
        isLoading={isLoading}
        isRefreshing={DEMO_MODE ? false : isRefetching}
        onRefresh={handleRefresh}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onScanPress={handleScanPress}
        onToggleFavorite={handleToggleFavorite}
        onDeleteScan={handleDeleteScan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    bottom: 200,
    left: -40,
  },
  orb3: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(94, 234, 212, 0.1)',
    top: '40%',
    right: -20,
  },
});
