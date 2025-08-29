import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';

interface DropdownFieldProps {
  label: string;
  value: string | string[];
  onSelect: (value: any) => void;
  options: string[];
  placeholder: string;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  isMultiSelect?: boolean;
  selectedValues?: string[];
  renderValue?: (value: any) => string;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  value,
  onSelect,
  options,
  placeholder,
  isVisible,
  setIsVisible,
  isMultiSelect = false,
  selectedValues = [],
  renderValue,
}) => {
  const displayValue = renderValue
    ? renderValue(value)
    : isMultiSelect
      ? selectedValues.length > 0
        ? `${selectedValues.length} selected`
        : placeholder
      : value
        ? String(value)
            .replace('_', ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : placeholder;

  return (
    <View className="mb-4 relative">
      <Text className="text-base font-medium text-black mb-2">{label}</Text>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex-row items-center justify-between"
      >
        <Text
          className={`text-base ${value || selectedValues.length > 0 ? 'text-black' : 'text-gray-500'}`}
        >
          {displayValue}
        </Text>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>

      {isVisible && (
        <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-48 z-50 shadow-lg">
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  if (isMultiSelect) {
                    const newSelection = selectedValues.includes(option)
                      ? selectedValues.filter((item) => item !== option)
                      : [...selectedValues, option];
                    onSelect(newSelection);
                  } else {
                    onSelect(option);
                    setIsVisible(false);
                  }
                }}
                className={`p-3 border-b border-gray-100 flex-row items-center justify-between ${
                  isMultiSelect && selectedValues.includes(option) ? 'bg-blue-50' : ''
                } ${!isMultiSelect && value === option ? 'bg-blue-50' : ''}`}
              >
                <Text
                  className={`text-base ${
                    (isMultiSelect && selectedValues.includes(option)) || value === option
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {option.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
                {((isMultiSelect && selectedValues.includes(option)) || value === option) && (
                  <Text className="text-blue-600">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
