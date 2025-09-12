import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/context/theme-provider';

interface ThemeWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that applies dark mode class to NativeWind
 */
export function ThemeWrapper({ children, className = '' }: ThemeWrapperProps) {
  const { isDark } = useTheme();
  
  const themeClass = isDark ? 'dark' : '';
  const combinedClassName = `${themeClass} ${className}`.trim();
  
  return (
    <View className={combinedClassName} style={{ flex: 1 }}>
      {children}
    </View>
  );
}