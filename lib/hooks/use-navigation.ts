import { useRouter, usePathname } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Simplified back navigation - prefer native router.back()
  const goBackWithFallback = () => {
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      // Fallback to intelligent routing if no back history
      const fallbackRoute = getFallbackRoute(pathname);
      router.replace(fallbackRoute as any);
    } catch (error) {
      console.warn('Navigation error, using default fallback:', error);
      const fallbackRoute = getFallbackRoute(pathname);
      router.replace(fallbackRoute as any);
    }
  };

  const safeNavigate = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.warn('Navigation error:', error);
      // Try replace as fallback
      try {
        router.replace(route as any);
      } catch (replaceError) {
        console.error('Replace navigation failed:', replaceError);
        // Go to safe default
        router.replace('/(tabs)/nutrition' as any);
      }
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

    // Scan food should go back to log meal if user came from there
    if (currentPath.includes('/scan-food')) {
      return '/log-meal';
    }

    // Other food/nutrition related screens
    if (
      currentPath.includes('/log-meal') ||
      currentPath.includes('/log-water') ||
      currentPath.includes('/log-supplements') ||
      currentPath.includes('nutrition')
    ) {
      return '/(tabs)/nutrition';
    }

    // Default fallback
    return '/(tabs)/nutrition';
  };

  return {
    goBackWithFallback,
    safeNavigate,
    router,
    pathname,
  };
}
