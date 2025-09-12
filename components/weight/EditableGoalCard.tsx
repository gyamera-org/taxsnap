import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { TrendingDown, TrendingUp, Edit3, Check } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

interface EditableGoalCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  subtitle: string;
  trend?: 'up' | 'down' | 'stable';
  field: string;
  units: string;
  editingField: string | null;
  tempValue: string;
  onEdit: (field: string, value: number) => void;
  onSave: () => void;
  onTempValueChange: (value: string) => void;
}

export function EditableGoalCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  field,
  units,
  editingField,
  tempValue,
  onEdit,
  onSave,
  onTempValueChange,
}: EditableGoalCardProps) {
  const { isDark } = useTheme();

  return (
    <View className={`rounded-2xl p-4 mb-3 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <View className="flex-row items-center mb-3">
        <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          {React.createElement(icon, { size: 20, color: isDark ? '#d1d5db' : '#374151' })}
        </View>
        <View className="flex-1">
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</Text>
        </View>
        {trend && (
          <View
            className={`p-1.5 rounded-full mr-2 ${
              trend === 'down' 
                ? (isDark ? 'bg-green-900' : 'bg-green-100') 
                : trend === 'up' 
                ? (isDark ? 'bg-red-900' : 'bg-red-100') 
                : (isDark ? 'bg-gray-700' : 'bg-gray-100')
            }`}
          >
            {trend === 'down' && <TrendingDown size={16} color="#22c55e" />}
            {trend === 'up' && <TrendingUp size={16} color="#ef4444" />}
            {trend === 'stable' && <View className={`w-4 h-0.5 rounded ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`} />}
          </View>
        )}
        <Pressable onPress={() => onEdit(field, value)} className="p-1">
          <Edit3 size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
        </Pressable>
      </View>

      {editingField === field ? (
        <View className="flex-row items-center">
          <TextInput
            value={tempValue}
            onChangeText={onTempValueChange}
            className={`text-2xl font-bold flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
            keyboardType="numeric"
            autoFocus
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          />
          <Text className={`text-lg ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{units}</Text>
          <Pressable onPress={onSave} className="ml-3 p-1">
            <Check size={18} color="#22c55e" />
          </Pressable>
        </View>
      ) : (
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {value} {units}
        </Text>
      )}
    </View>
  );
}
