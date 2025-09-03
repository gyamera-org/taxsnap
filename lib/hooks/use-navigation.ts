import { useRouter, usePathname } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Simplified back navigation - prefer native router.back()
  const goBackWithFallback = () => {
    try {
      // Special handling for nested settings pages
      if (pathname.includes('settings') && 
          (pathname.includes('/fitness-goals') || 
           pathname.includes('/weight') || 
           pathname.includes('/nutrition-goals') || 
           pathname.includes('/personal-details') ||
           pathname.includes('/reminder-settings') ||
           pathname.includes('/supplements'))) {
        // For nested settings pages, explicitly navigate to settings index
        router.push('/(tabs)/settings' as any);
        return;
      }

      // For other pages, try router.back() first
      router.back();
    } catch (error) {
      console.warn('Navigation failed, using fallback route:', error);
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

    // Settings screens - handle nested pages properly
    if (currentPath.includes('settings')) {
      // If we're on a nested settings page, go back to settings index
      if (
        currentPath.includes('/fitness-goals') ||
        currentPath.includes('/weight') ||
        currentPath.includes('/nutrition-goals') ||
        currentPath.includes('/personal-details')
      ) {
        return '/(tabs)/settings';
      }
      // If we're already on settings index, stay there
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
    goBack: goBackWithFallback, // Export as goBack for compatibility
    goBackWithFallback,
    safeNavigate,
    router,
    pathname,
  };
}
