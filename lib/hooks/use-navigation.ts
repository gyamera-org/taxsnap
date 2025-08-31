import { useRouter, usePathname } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const goBack = () => {
    // Always use the fallback route approach since router.canGoBack() is unreliable
    const fallbackRoute = getFallbackRoute(pathname);

    try {
      router.replace(fallbackRoute as any);
    } catch (error) {
      console.warn('Navigation error, using default fallback:', error);
      router.replace('/(tabs)/nutrition' as any);
    }
  };

  const getFallbackRoute = (currentPath: string): string => {
    // Exercise related screens
    if (currentPath.includes('/log-exercise') || currentPath.includes('exercise')) {
      return '/(tabs)/exercise';
    }

    // Cycle related screens (including beauty/skincare scanning)
    if (
      currentPath.includes('/log-mood') ||
      currentPath.includes('/log-symptoms') ||
      currentPath.includes('/period-tracker') ||
      currentPath.includes('/edit-period') ||
      currentPath.includes('/cycle-history') ||
      currentPath.includes('/scan-beauty') ||
      currentPath.includes('cycle')
    ) {
      return '/(tabs)/cycle';
    }

    // Settings screens
    if (currentPath.includes('settings')) {
      return '/(tabs)/settings';
    }

    // Food/nutrition related screens
    if (
      currentPath.includes('/log-meal') ||
      currentPath.includes('/log-water') ||
      currentPath.includes('/scan-food') ||
      currentPath.includes('/log-supplements') ||
      currentPath.includes('nutrition')
    ) {
      return '/(tabs)/nutrition';
    }

    // Default fallback
    return '/(tabs)/nutrition';
  };

  return {
    goBack,
    router,
    pathname,
  };
}
