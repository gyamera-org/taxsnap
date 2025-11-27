import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';

interface NumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  onSubmit?: () => void;
  keyboardType?: 'numeric' | 'decimal-pad';
  suffix?: string; // e.g., "cm", "kg", "lbs"
}

export function NumberInput({ 
  value, 
  onChangeText, 
  placeholder = "Enter number", 
  error,
  onSubmit,
  keyboardType = 'decimal-pad',
  suffix
}: NumberInputProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();

  const handleTextChange = (text: string) => {
    // Allow numbers, decimal points, and common units
    const cleaned = text.replace(/[^\d.,'"ft\s-]/gi, '');
    onChangeText(cleaned);
  };

  const validateAndSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit();
    }
  };

  return (
    <View className="w-full">
      <View
        className={themed(
          'flex-row items-center bg-white rounded-3xl px-5 py-3 border border-gray-200 shadow-sm',
          'flex-row items-center bg-gray-800 rounded-3xl px-5 py-3 border border-gray-600 shadow-lg'
        )}
      >
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          keyboardType={keyboardType}
          keyboardAppearance="dark"
          className={themed(
            'flex-1 text-base text-gray-900',
            'flex-1 text-base text-white'
          )}
          onSubmitEditing={validateAndSubmit}
          returnKeyType="done"
        />
        {suffix && (
          <Text className={themed('text-base text-gray-500 ml-2', 'text-base text-gray-400 ml-2')}>
            {suffix}
          </Text>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-2 px-2">
          {error}
        </Text>
      )}
    </View>
  );
}