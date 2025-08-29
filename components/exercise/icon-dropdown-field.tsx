import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { getIconComponent } from '@/lib/utils/get-icon-component';

const AVAILABLE_ICONS = [
  'Globe',
  'Activity',
  'Dumbbell',
  'Heart',
  'Zap',
  'Target',
  'Shield',
  'Footprints',
  'Bike',
  'Waves',
  'Anchor',
  'RotateCcw',
  'Move',
  'TrendingUp',
  'User',
  'Brain',
  'Circle',
  'Hexagon',
  'Minus',
  'ArrowUp',
  'Feather',
  'Sword',
  'Music',
  'Volume2',
  'Radio',
  'Mountain',
  'Navigation',
  'Wind',
  'Snowflake',
  'CloudSnow',
  'ArrowUpDown',
];

interface IconDropdownFieldProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

export const IconDropdownField: React.FC<IconDropdownFieldProps> = ({
  selectedIcon,
  onSelect,
  isVisible,
  setIsVisible,
}) => {
  const IconComponent = getIconComponent(selectedIcon);

  return (
    <View className="mb-4 relative">
      <Text className="text-base font-medium text-black mb-2">Icon</Text>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <IconComponent size={20} color="#6B7280" />
          <Text className="text-base text-black ml-2">{selectedIcon}</Text>
        </View>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>

      {isVisible && (
        <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-48 z-50 shadow-lg">
          <ScrollView showsVerticalScrollIndicator={false}>
            {AVAILABLE_ICONS.map((iconName) => {
              const OptionIconComponent = getIconComponent(iconName);
              return (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => {
                    onSelect(iconName);
                    setIsVisible(false);
                  }}
                  className={`p-3 border-b border-gray-100 flex-row items-center justify-between ${
                    selectedIcon === iconName ? 'bg-pink-50' : ''
                  }`}
                >
                  <View className="flex-row items-center">
                    <OptionIconComponent
                      size={18}
                      color={selectedIcon === iconName ? '#EC4899' : '#6B7280'}
                    />
                    <Text
                      className={`text-base ml-2 ${
                        selectedIcon === iconName ? 'text-pink-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {iconName}
                    </Text>
                  </View>
                  {selectedIcon === iconName && <Text className="text-pink-600">✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
