import { useWindowDimensions, Platform } from 'react-native';

// Device breakpoints
const TABLET_MIN_WIDTH = 768;
const TABLET_CONTENT_MAX_WIDTH = 600;
const PHONE_FRAME_MAX_WIDTH = 280;
const TAB_BAR_PHONE_WIDTH = 320;
const TAB_BAR_TABLET_WIDTH = 400;

export interface ResponsiveValues {
  isTablet: boolean;
  screenWidth: number;
  screenHeight: number;
  // Content max width for centering on tablets
  contentMaxWidth: number;
  // Horizontal padding based on device
  horizontalPadding: number;
  // Phone frame dimensions for paywall
  phoneFrameWidth: number;
  phoneFrameHeight: number;
  // Tab bar width
  tabBarWidth: number;
  // Scale factor for responsive sizing
  scale: number;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  // Consider tablet if width >= 768 (iPad mini is 768 points wide)
  const isTablet = width >= TABLET_MIN_WIDTH;

  // Scale factor for proportional sizing (base: iPhone 390 width)
  const scale = Math.min(width / 390, 1.3);

  return {
    isTablet,
    screenWidth: width,
    screenHeight: height,
    // Constrain content width on tablets for better readability
    contentMaxWidth: isTablet ? TABLET_CONTENT_MAX_WIDTH : width,
    // More padding on tablets
    horizontalPadding: isTablet ? 32 : 20,
    // Phone frame scales on tablets to prevent overlap
    phoneFrameWidth: isTablet ? Math.min(width * 0.4, 320) : Math.min(width * 0.75, 300),
    phoneFrameHeight: isTablet ? Math.min(height * 0.35, 360) : 340,
    // Tab bar wider on tablets
    tabBarWidth: isTablet ? TAB_BAR_TABLET_WIDTH : TAB_BAR_PHONE_WIDTH,
    scale,
  };
}

// Helper to get responsive font size
export function responsiveFontSize(baseSize: number, scale: number): number {
  return Math.round(baseSize * Math.min(scale, 1.2));
}

// Helper to get responsive spacing
export function responsiveSpacing(baseSpacing: number, isTablet: boolean): number {
  return isTablet ? baseSpacing * 1.25 : baseSpacing;
}
