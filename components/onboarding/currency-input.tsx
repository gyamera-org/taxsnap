import { useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface CurrencyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  autoFocus?: boolean;
  hint?: string;
  animationDelay?: number;
}

export function CurrencyInput({
  value,
  onChangeText,
  prefix = '$',
  suffix,
  placeholder = '0',
  autoFocus = false,
  hint,
  animationDelay = 300,
}: CurrencyInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      // Delay focus until slide animation (300ms) completes to prevent jarring transition
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <Animated.View
      entering={FadeInUp.delay(animationDelay).duration(500)}
      className="items-center"
    >
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="flex-row items-center justify-center"
      >
        {prefix && (
          <Text className="text-white font-black" style={{ fontSize: 48, lineHeight: 60 }}>
            {prefix}
          </Text>
        )}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#4B5563"
          keyboardType="number-pad"
          keyboardAppearance="dark"
          className="text-white font-black text-center"
          style={{ fontSize: 48, lineHeight: 60, minWidth: 120 }}
        />
        {suffix && (
          <Text className="text-white font-black" style={{ fontSize: 48, lineHeight: 60 }}>
            {suffix}
          </Text>
        )}
      </Pressable>
      {hint && <Text className="text-gray-500 text-sm mt-2">{hint}</Text>}
    </Animated.View>
  );
}

interface PercentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  hint?: string;
  animationDelay?: number;
}

export function PercentInput({
  value,
  onChangeText,
  placeholder = '0',
  autoFocus = false,
  hint,
  animationDelay = 300,
}: PercentInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      // Delay focus until slide animation (300ms) completes to prevent jarring transition
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <Animated.View
      entering={FadeInUp.delay(animationDelay).duration(500)}
      className="items-center"
    >
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="flex-row items-center justify-center"
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#4B5563"
          keyboardType="decimal-pad"
          keyboardAppearance="dark"
          className="text-white font-black text-center"
          style={{ fontSize: 48, lineHeight: 60, minWidth: 80 }}
        />
        <Text className="text-white font-black" style={{ fontSize: 48, lineHeight: 60 }}>
          %
        </Text>
      </Pressable>
      {hint && <Text className="text-gray-500 text-sm mt-4">{hint}</Text>}
    </Animated.View>
  );
}
