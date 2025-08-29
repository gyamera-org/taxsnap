import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '@/context/revenuecat-provider';

const DAILY_SCAN_KEY = 'daily_scan_data';
const FREE_DAILY_LIMIT = 1;

interface DailyScanData {
  date: string;
  scanCount: number;
}

export function useDailyScanLimit() {
  const { isSubscribed, isInTrial, customerInfo } = useSubscription();
  const [dailyScanData, setDailyScanData] = useState<DailyScanData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has premium access using RevenueCat best practices
  const hasPremiumAccess = () => {
    // Option 1: Use subscription state from provider (current approach)
    if (isSubscribed || isInTrial) return true;

    // Option 2: Check specific entitlement (for more granular control)
    // if (customerInfo && revenueCatService.hasActiveEntitlement(customerInfo, 'pro')) return true;

    // Option 3: Check premium access across multiple entitlements
    // if (customerInfo && revenueCatService.hasPremiumAccess(customerInfo)) return true;

    return false;
  };

  // Get today's date string (YYYY-MM-DD)
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Load daily scan data from storage
  const loadDailyScanData = async () => {
    try {
      const stored = await AsyncStorage.getItem(DAILY_SCAN_KEY);
      const today = getTodayString();

      if (stored) {
        const data: DailyScanData = JSON.parse(stored);

        // Reset count if it's a new day
        if (data.date !== today) {
          const newData = { date: today, scanCount: 0 };
          await AsyncStorage.setItem(DAILY_SCAN_KEY, JSON.stringify(newData));
          setDailyScanData(newData);
        } else {
          setDailyScanData(data);
        }
      } else {
        // First time user
        const newData = { date: today, scanCount: 0 };
        await AsyncStorage.setItem(DAILY_SCAN_KEY, JSON.stringify(newData));
        setDailyScanData(newData);
      }
    } catch (error) {
      console.error('Failed to load daily scan data:', error);
      // Fallback to default
      const today = getTodayString();
      setDailyScanData({ date: today, scanCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Increment scan count
  const incrementScanCount = async () => {
    if (!dailyScanData) return;

    const today = getTodayString();
    let newData: DailyScanData;

    // Reset if new day
    if (dailyScanData.date !== today) {
      newData = { date: today, scanCount: 1 };
    } else {
      newData = { ...dailyScanData, scanCount: dailyScanData.scanCount + 1 };
    }

    try {
      await AsyncStorage.setItem(DAILY_SCAN_KEY, JSON.stringify(newData));
      setDailyScanData(newData);
    } catch (error) {
      console.error('Failed to update scan count:', error);
    }
  };

  // Check if user can scan
  const canScan = () => {
    // Premium users get unlimited scans
    if (hasPremiumAccess()) {
      return true;
    }

    // Free users are limited
    if (!dailyScanData) return true; // Allow first scan while loading
    return dailyScanData.scanCount < FREE_DAILY_LIMIT;
  };

  // Get remaining scans for free users
  const getRemainingScans = () => {
    if (hasPremiumAccess()) {
      return Infinity; // Unlimited
    }

    if (!dailyScanData) return FREE_DAILY_LIMIT;
    return Math.max(0, FREE_DAILY_LIMIT - dailyScanData.scanCount);
  };

  // Get scans used today
  const getScansUsedToday = () => {
    if (!dailyScanData) return 0;
    return dailyScanData.scanCount;
  };

  // Reset scan count (for testing or admin purposes)
  const resetScanCount = async () => {
    const today = getTodayString();
    const newData = { date: today, scanCount: 0 };

    try {
      await AsyncStorage.setItem(DAILY_SCAN_KEY, JSON.stringify(newData));
      setDailyScanData(newData);
    } catch (error) {
      console.error('Failed to reset scan count:', error);
    }
  };

  useEffect(() => {
    loadDailyScanData();
  }, []);

  return {
    canScan: canScan(),
    remainingScans: getRemainingScans(),
    scansUsedToday: getScansUsedToday(),
    totalDailyLimit: FREE_DAILY_LIMIT,
    incrementScanCount,
    resetScanCount,
    loading,
    isSubscribed: hasPremiumAccess(), // Use the new premium access check
  };
}
