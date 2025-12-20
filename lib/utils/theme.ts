import { useTheme } from '@/context/theme-provider';
import { lightColors, darkColors, PRIMARY } from '@/lib/theme/colors';

/**
 * Hook to get theme-aware colors
 * Uses the theme from context to return appropriate color values
 */
export function useThemedColors() {
  const { isDark } = useTheme();
  const colors = isDark ? darkColors : lightColors;

  return {
    // Primary
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryMedium: colors.primaryMedium,

    // Backgrounds
    background: colors.background,
    backgroundSecondary: colors.backgroundSecondary,
    backgroundTertiary: colors.backgroundTertiary,

    // Text
    text: colors.text,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    textInverse: colors.textInverse,

    // Borders
    border: colors.border,
    borderLight: colors.borderLight,

    // Cards
    card: colors.card,
    cardBorder: colors.cardBorder,

    // Inputs
    inputBackground: colors.inputBackground,
    inputBorder: colors.inputBorder,
    inputText: colors.inputText,
    inputPlaceholder: colors.inputPlaceholder,

    // Status
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,

    // Danger
    danger: colors.danger,
    dangerBackground: colors.dangerBackground,
    dangerText: colors.dangerText,

    // Icons
    icon: colors.icon,
    iconBackground: colors.iconBackground,
    iconBackgroundActive: colors.primaryLight,

    // Modal
    modalOverlay: colors.modalOverlay,
    modalBackground: colors.modalBackground,

    // Tab Bar
    tabBar: colors.tabBar,
    tabBarBorder: colors.tabBarBorder,
    tabBarActive: colors.tabBarActive,
    tabBarInactive: colors.tabBarInactive,

    // Shadows
    shadowColor: colors.shadowColor,

    // Divider (alias)
    divider: colors.border,

    // Status bar
    statusBarStyle: isDark ? 'light-content' : 'dark-content',

    // Theme state
    isDark,
  };
}

/**
 * Get the primary color directly (for use outside of components)
 */
export function getPrimaryColor() {
  return PRIMARY;
}

/**
 * Hook to get theme-aware class names (for NativeWind)
 */
export function useThemedStyles() {
  const { isDark } = useTheme();
  return (lightClass: string, darkClass: string = '') => {
    return isDark ? darkClass || lightClass : lightClass;
  };
}
