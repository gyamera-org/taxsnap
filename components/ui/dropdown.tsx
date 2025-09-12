import { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Check } from 'lucide-react-native';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string | string[];
  onSelect: (value: string | string[]) => void;
  multiSelect?: boolean;
  disabled?: boolean;
  error?: string;
}

export function Dropdown({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onSelect,
  multiSelect = false,
  disabled = false,
  error,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const themed = useThemedStyles();
  const colors = useThemedColors();

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (multiSelect) {
      if (selectedValues.length === 1) {
        const option = options.find((opt) => opt.value === selectedValues[0]);
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length} selected`;
    }

    const option = options.find((opt) => opt.value === selectedValues[0]);
    return option?.label || selectedValues[0];
  };

  const handleOptionPress = (optionValue: string) => {
    if (multiSelect) {
      const newSelection = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onSelect(newSelection);
    } else {
      onSelect(optionValue);
      setIsOpen(false);
    }
  };

  const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

  return (
    <View className="mb-4">
      {label && <Text className={themed("text-base font-medium text-black mb-2", "text-base font-medium text-white mb-2")}>{label}</Text>}

      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={themed(`
          bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
          ${disabled ? 'opacity-50' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `, `
          bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-sm
          ${disabled ? 'opacity-50' : ''}
          ${error ? 'border-red-500 bg-red-900/20' : ''}
        `)}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text
          className={themed(`text-base ${
            selectedValues.length > 0 ? 'text-black font-medium' : 'text-gray-400'
          }`, `text-base ${
            selectedValues.length > 0 ? 'text-white font-medium' : 'text-gray-400'
          }`)}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
      </TouchableOpacity>

      {error && <Text className={themed("text-red-500 text-sm mt-1", "text-red-400 text-sm mt-1")}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center px-6"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            className={themed("bg-white rounded-3xl mx-4 max-h-96 min-w-80", "bg-gray-800 rounded-3xl mx-4 max-h-96 min-w-80")}
            style={{
              shadowColor: '#EC4899',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <View className={themed("p-6 border-b border-gray-50", "p-6 border-b border-gray-700")}>
              <Text className={themed("text-xl font-bold text-black", "text-xl font-bold text-white")}>{label || 'Select Options'}</Text>
              {multiSelect && (
                <Text className={themed("text-sm text-pink-500 mt-2 font-medium", "text-sm text-pink-400 mt-2 font-medium")}>
                  {selectedValues.length} selected
                </Text>
              )}
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 280 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleOptionPress(item.value)}
                  className={themed(`
                    p-5 border-b border-gray-50 flex-row items-center justify-between
                    ${isSelected(item.value) ? 'bg-pink-50' : 'bg-white'}
                  `, `
                    p-5 border-b border-gray-700 flex-row items-center justify-between
                    ${isSelected(item.value) ? 'bg-pink-900/20' : 'bg-gray-800'}
                  `)}
                >
                  <Text
                    className={themed(`text-base flex-1 ${
                      isSelected(item.value) ? 'text-pink-600 font-semibold' : 'text-gray-900'
                    }`, `text-base flex-1 ${
                      isSelected(item.value) ? 'text-pink-400 font-semibold' : 'text-gray-100'
                    }`)}
                  >
                    {item.label}
                  </Text>
                  {isSelected(item.value) && <Check size={20} color={colors.isDark ? '#F472B6' : '#EC4899'} />}
                </TouchableOpacity>
              )}
            />

            <View className="p-6">
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className={themed("bg-pink-500 rounded-2xl p-4 items-center", "bg-pink-600 rounded-2xl p-4 items-center")}
                style={{
                  shadowColor: '#EC4899',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text className="text-white font-bold text-base">
                  {multiSelect ? 'Done' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
