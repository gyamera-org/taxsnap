import { View, Text, Pressable, Modal, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string;
};

type SelectButtonProps = {
  value: string;
  onSelect: (value: string) => void;
  options: Option[];
  placeholder?: string;
};

export function SelectButton({
  value,
  onSelect,
  options,
  placeholder = 'Select an option',
}: SelectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between border border-gray-200 px-4 py-3.5 rounded-2xl"
      >
        <Text className={cn('text-base', selectedOption ? 'text-gray-900' : 'text-gray-500')}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          className="flex-1 bg-black/20 justify-center px-4"
        >
          <View className="bg-white rounded-2xl overflow-hidden max-h-[70%]">
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'px-5 py-4 border-b border-gray-100',
                  value === option.value && 'bg-gray-50'
                )}
              >
                <Text
                  className={cn(
                    'text-base',
                    value === option.value ? 'text-black font-medium' : 'text-gray-700'
                  )}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
