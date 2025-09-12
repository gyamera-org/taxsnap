import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

export function ThemeSelector() {
  const { isDark, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <View className={`mx-4 rounded-2xl shadow mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <Pressable 
        onPress={toggleTheme}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center flex-1">
          {isDark ? (
            <Moon size={20} color={isDark ? '#F9FAFB' : '#374151'} />
          ) : (
            <Sun size={20} color={isDark ? '#F9FAFB' : '#374151'} />
          )}
          <Text className={`text-lg font-medium ml-3 ${isDark ? 'text-white' : 'text-black'}`}>
            {isDark ? 'Dark mode' : 'Light mode'}
          </Text>
        </View>
        
        {/* Toggle Switch */}
        <View className={`w-12 h-6 rounded-full p-1 ${isDark ? 'bg-pink-500' : 'bg-gray-300'}`}>
          <View 
            className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
              isDark ? 'translate-x-6' : 'translate-x-0'
            }`} 
          />
        </View>
      </Pressable>
    </View>
  );
}