import { View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useThemedStyles, useThemedColors } from '@/lib/utils/theme';

type ChipProps = {
  label: string;
  onRemove: () => void;
};

export function Chip({ label, onRemove }: ChipProps) {
  const themed = useThemedStyles();
  const colors = useThemedColors();

  return (
    <View className={themed("bg-slate-100 flex-row items-center px-3 py-2 rounded-full mr-2 mb-2", "bg-gray-800 flex-row items-center px-3 py-2 rounded-full mr-2 mb-2")}>
      <Text className={themed("text-gray-900 mr-2", "text-gray-100 mr-2")}>{label}</Text>
      <Pressable onPress={onRemove} hitSlop={8}>
        <X size={16} color={colors.gray[400]} />
      </Pressable>
    </View>
  );
}
