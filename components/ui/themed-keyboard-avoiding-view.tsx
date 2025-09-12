import React from 'react';
import { KeyboardAvoidingView, Platform, View, ViewProps } from 'react-native';
import { useTheme } from '@/context/theme-provider';

interface ThemedKeyboardAvoidingViewProps extends ViewProps {
  children: React.ReactNode;
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
  className?: string;
}

export function ThemedKeyboardAvoidingView({
  children,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
  className = '',
  ...props
}: ThemedKeyboardAvoidingViewProps) {
  const { isDark } = useTheme();

  return (
    <View 
      className={`flex-1 ${isDark ? 'bg-[#0B0F14]' : 'bg-white'} ${className}`}
      {...props}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={behavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}