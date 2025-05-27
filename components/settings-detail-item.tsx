import { View, Text, TextInput, Pressable } from 'react-native';
import { Pencil, Check } from 'lucide-react-native';

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
  return (
    <View
      className={`flex-row justify-between items-center bg-slate-100 rounded-2xl p-4 ${!isLast && 'border-b border-gray-100 pb-4'}`}
    >
      <Text className="text-base font-medium text-black">{label}</Text>
      <View className="flex-row items-center">
        {isEditing && label.toLowerCase().includes('date') ? null : isEditing ? (
          <>
            <TextInput
              value={tempValue}
              onChangeText={onChangeText}
              className="text-base mr-3 border-b border-gray-400 px-1 py-0 w-[100px]"
              autoFocus
            />
            <Pressable onPress={onSave} className="w-8 h-8 items-center justify-center">
              <Check size={20} color="#666" />
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-base text-gray-700 mr-3">
              {typeof value === 'string' ? value : value.toLocaleDateString()}
            </Text>
            <Pressable onPress={onEdit} className="w-8 h-8 items-center justify-center">
              <Pencil size={20} color="#666" />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

export default SettingsDetailItem;
