import { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Check } from 'lucide-react-native';
import { getIconComponent } from '@/lib/utils/get-icon-component';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

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

interface IconDropdownProps {
  label?: string;
  value: string;
  onSelect: (iconName: string) => void;
  disabled?: boolean;
}

export function IconDropdown({
  label = 'Icon',
  value,
  onSelect,
  disabled = false,
}: IconDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const themed = useThemedStyles();
  const colors = useThemedColors();

  const SelectedIcon = getIconComponent(value);

  return (
    <View className="mb-4">
      {label && <Text className={themed("text-base font-medium text-black mb-2", "text-base font-medium text-white mb-2")}>{label}</Text>}

      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={themed(`
          bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
          ${disabled ? 'opacity-50' : ''}
        `, `
          bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-sm
          ${disabled ? 'opacity-50' : ''}
        `)}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center">
          <SelectedIcon size={22} color={colors.isDark ? '#F472B6' : '#EC4899'} />
          <Text className={themed("text-base text-black ml-3 font-medium", "text-base text-white ml-3 font-medium")}>{value}</Text>
        </View>
      </TouchableOpacity>

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
              <Text className={themed("text-xl font-bold text-black", "text-xl font-bold text-white")}>Select Icon</Text>
            </View>

            <FlatList
              data={AVAILABLE_ICONS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              numColumns={3}
              style={{ maxHeight: 280 }}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => {
                const IconComponent = getIconComponent(item);
                const isSelected = value === item;

                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                    className={themed(`
                      flex-1 p-4 m-2 rounded-2xl items-center justify-center min-h-20
                      ${isSelected ? 'bg-pink-50 border-2 border-pink-300' : 'bg-gray-50'}
                    `, `
                      flex-1 p-4 m-2 rounded-2xl items-center justify-center min-h-20
                      ${isSelected ? 'bg-pink-900/20 border-2 border-pink-600' : 'bg-gray-700'}
                    `)}
                    style={{
                      shadowColor: isSelected ? '#EC4899' : '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.2 : 0.05,
                      shadowRadius: 4,
                      elevation: isSelected ? 4 : 1,
                    }}
                  >
                    <IconComponent size={26} color={isSelected ? (colors.isDark ? '#F472B6' : '#EC4899') : colors.gray[500]} />
                    <Text
                      className={themed(`text-xs mt-2 text-center font-medium ${
                        isSelected ? 'text-pink-600' : 'text-gray-600'
                      }`, `text-xs mt-2 text-center font-medium ${
                        isSelected ? 'text-pink-400' : 'text-gray-300'
                      }`)}
                      numberOfLines={1}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <View className="absolute -top-1 -right-1">
                        <View className={themed("bg-pink-500 rounded-full w-5 h-5 items-center justify-center", "bg-pink-600 rounded-full w-5 h-5 items-center justify-center")}>
                          <Check size={12} color="#FFFFFF" />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
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
                <Text className="text-white font-bold text-base">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
