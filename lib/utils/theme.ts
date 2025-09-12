import { useTheme } from '@/context/theme-provider';

/**
 * Hook to get theme-aware class names
 * Usage: const themed = useThemedStyles(); themed('bg-white', 'dark:bg-gray-900')
 */
export function useThemedStyles() {
  const { isDark } = useTheme();
  
  return (lightClass: string, darkClass: string = '') => {
    if (!darkClass) {
      return lightClass;
    }
    return isDark ? darkClass.replace('dark:', '') : lightClass;
  };
}

/**
 * Get theme-specific color values
 */
export function useThemedColors() {
  const { isDark } = useTheme();
  
  return {
    background: isDark ? '#0F0F0F' : '#FFFFFF',
    foreground: isDark ? '#F9FAFB' : '#0D0D0D',
    muted: isDark ? '#1F2937' : '#F3F4F6',
    border: isDark ? '#374151' : '#E5E7EB',
    card: isDark ? '#1F2937' : '#FFFFFF',
    gray: {
      50: isDark ? '#F9FAFB' : '#F9FAFB',
      100: isDark ? '#F3F4F6' : '#F3F4F6', 
      200: isDark ? '#E5E7EB' : '#E5E7EB',
      300: isDark ? '#D1D5DB' : '#D1D5DB',
      400: isDark ? '#9CA3AF' : '#9CA3AF',
      500: isDark ? '#6B7280' : '#6B7280',
      600: isDark ? '#4B5563' : '#4B5563',
      700: isDark ? '#374151' : '#374151',
      800: isDark ? '#1F2937' : '#1F2937',
      900: isDark ? '#111827' : '#111827',
    },
  };
}