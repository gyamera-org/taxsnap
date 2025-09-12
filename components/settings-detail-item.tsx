import { View, Text, TextInput, Pressable } from 'react-native';
import { Pencil, Check } from 'lucide-react-native';
import { useTheme } from '@/context/theme-provider';

type SettingsDetailItemProps = {
  label: string;
  value: string | Date;
  isEditing: boolean;
  tempValue: string;
  onEdit: () => void;
  onSave: () => void;
  onChangeText: (text: string) => void;
  isLast?: boolean;
};

const SettingsDetailItem = ({
  label,
  value,
  isEditing,
  tempValue,
  onEdit,
  onSave,
  onChangeText,
  isLast,
}: SettingsDetailItemProps) => {
  const { isDark } = useTheme();
  
  return (
    <View
      className={`flex-row justify-between items-center ${isDark ? 'bg-gray-700' : 'bg-slate-100'} rounded-2xl p-4 ${!isLast && `border-b ${isDark ? 'border-gray-600' : 'border-gray-100'} pb-4`}`}
    >
      <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-black'} flex-shrink-0`}>{label}</Text>
      <View className="flex-row items-center flex-1 justify-end">
        {isEditing && label.toLowerCase().includes('date') ? null : isEditing ? (
          <>
            <TextInput
              value={tempValue}
              onChangeText={onChangeText}
              className={`text-base mr-3 px-2 py-1 flex-1 min-w-[120px] text-right ${isDark ? 'text-white' : 'text-black'}`}
              autoFocus
              multiline={false}
              placeholderTextColor={isDark ? '#9ca3af' : '#999'}
            />
            <Pressable
              onPress={onSave}
              className="w-8 h-8 items-center justify-center flex-shrink-0"
            >
              <Check size={20} color={isDark ? '#9ca3af' : '#666'} />
            </Pressable>
          </>
        ) : (
          <>
            <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'} mr-3 flex-1 text-right`}>
              {typeof value === 'string' ? value : value.toLocaleDateString()}
            </Text>
            <Pressable
              onPress={onEdit}
              className="w-8 h-8 items-center justify-center flex-shrink-0"
            >
              <Pencil size={20} color={isDark ? '#9ca3af' : '#666'} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

export default SettingsDetailItem;
