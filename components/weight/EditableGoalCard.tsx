import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { TrendingDown, TrendingUp, Edit3, Check } from 'lucide-react-native';

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
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-3">
        <View className="bg-gray-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
          {React.createElement(icon, { size: 20, color: '#374151' })}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{title}</Text>
          <Text className="text-xs text-gray-500">{subtitle}</Text>
        </View>
        {trend && (
          <View
            className={`p-1.5 rounded-full mr-2 ${
              trend === 'down' ? 'bg-green-100' : trend === 'up' ? 'bg-red-100' : 'bg-gray-100'
            }`}
          >
            {trend === 'down' && <TrendingDown size={16} color="#22c55e" />}
            {trend === 'up' && <TrendingUp size={16} color="#ef4444" />}
            {trend === 'stable' && <View className="w-4 h-0.5 bg-gray-400 rounded" />}
          </View>
        )}
        <Pressable onPress={() => onEdit(field, value)} className="p-1">
          <Edit3 size={16} color="#6b7280" />
        </Pressable>
      </View>

      {editingField === field ? (
        <View className="flex-row items-center">
          <TextInput
            value={tempValue}
            onChangeText={onTempValueChange}
            className="text-2xl font-bold flex-1 text-gray-900"
            keyboardType="numeric"
            autoFocus
          />
          <Text className="text-lg text-gray-500 ml-2">{units}</Text>
          <Pressable onPress={onSave} className="ml-3 p-1">
            <Check size={18} color="#22c55e" />
          </Pressable>
        </View>
      ) : (
        <Text className="text-2xl font-bold text-gray-900">
          {value} {units}
        </Text>
      )}
    </View>
  );
}
