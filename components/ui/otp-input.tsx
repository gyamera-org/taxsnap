import React, { useState, useRef } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useTheme } from '@/context/theme-provider';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OTPInput({ value, onChange, length = 6, disabled = false }: OTPInputProps) {
  const { isDark } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    
    // Remove any characters beyond the current position
    const finalValue = newValue.slice(0, length).join('').replace(/[^0-9]/g, '');
    onChange(finalValue);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  return (
    <View className="flex-row justify-center gap-3">
      {Array.from({ length }, (_, index) => (
        <Pressable
          key={index}
          onPress={() => handlePress(index)}
          className={`w-12 h-12 rounded-lg border-2 ${
            isDark 
              ? 'border-slate-600 bg-slate-800' 
              : 'border-slate-300 bg-white'
          } ${
            value[index] 
              ? 'border-pink-500' 
              : isDark 
                ? 'border-slate-600' 
                : 'border-slate-300'
          }`}
        >
          <TextInput
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={value[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="numeric"
            keyboardAppearance="dark"
            maxLength={1}
            textAlign="center"
            editable={!disabled}
            className={`flex-1 text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            style={{ textAlign: 'center' }}
          />
        </Pressable>
      ))}
    </View>
  );
}