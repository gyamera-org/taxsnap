import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';

interface DateInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  onSubmit?: () => void;
  questionId?: string; // To determine date type
}

export function DateInput({ 
  value, 
  onChangeText, 
  placeholder = "MM/DD/YY", 
  error,
  onSubmit,
  questionId
}: DateInputProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();

  const formatDateInput = (text: string) => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, '');
    
    // Format as MM/DD/YY
    let formatted = '';
    if (digits.length >= 1) {
      formatted += digits.slice(0, 2);
    }
    if (digits.length >= 3) {
      formatted += '/' + digits.slice(2, 4);
    }
    if (digits.length >= 5) {
      formatted += '/' + digits.slice(4, 6);
    }
    
    return formatted;
  };

  const handleTextChange = (text: string) => {
    const formatted = formatDateInput(text);
    onChangeText(formatted);
  };

  const validateAndSubmit = () => {
    // Determine date type based on questionId
    const dateType = questionId === 'birthday' ? 'birthday' : 'period';
    
    // Always submit - let the validation happen in the chat handler
    // This ensures the user gets proper validation feedback through chat
    if (onSubmit) {
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
          keyboardType="numeric"
          keyboardAppearance="dark"
          maxLength={8} // MM/DD/YY = 8 characters
          className={themed(
            'flex-1 text-base text-gray-900',
            'flex-1 text-base text-white'
          )}
          onSubmitEditing={validateAndSubmit}
          returnKeyType="done"
        />
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-2 px-2">
          {error}
        </Text>
      )}
    </View>
  );
}

export function isValidMMDDYY(dateStr: string, dateType: 'birthday' | 'period' = 'birthday'): boolean {
  // Check format MM/DD/YY
  const pattern = /^(\d{2})\/(\d{2})\/(\d{2})$/;
  const match = dateStr.match(pattern);
  
  if (!match) return false;
  
  const month = parseInt(match[1]);
  const day = parseInt(match[2]);
  const year = parseInt(match[3]);
  
  // Convert YY to full year (assume 2000+ for years 00-30, 1900+ for 31-99)
  const fullYear = year <= 30 ? 2000 + year : 1900 + year;
  
  // Basic validation
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Create date and check if it's valid
  const date = new Date(fullYear, month - 1, day);
  const now = new Date();
  
  // Date must be valid (correct day/month/year combination)
  if (date.getFullYear() !== fullYear || 
      date.getMonth() !== month - 1 || 
      date.getDate() !== day) {
    return false;
  }
  
  if (dateType === 'birthday') {
    // Birthday validation: must be at least 16 years ago, not more than 120 years ago
    const sixteenYearsAgo = new Date(now.getFullYear() - 16, now.getMonth(), now.getDate());
    const hundredTwentyYearsAgo = new Date(now.getFullYear() - 120, 0, 1);
    
    return date <= sixteenYearsAgo && date >= hundredTwentyYearsAgo;
  } else if (dateType === 'period') {
    // Period date validation: can't be in the future, not more than 1 year ago
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    return date <= now && date >= oneYearAgo;
  }
  
  return false;
}