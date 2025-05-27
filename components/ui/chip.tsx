import { View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

type ChipProps = {
  label: string;
  onRemove: () => void;
};

export function Chip({ label, onRemove }: ChipProps) {
  return (
    <View className="bg-slate-100 flex-row items-center px-3 py-2 rounded-full mr-2 mb-2">
      <Text className="text-gray-900 mr-2">{label}</Text>
      <Pressable onPress={onRemove} hitSlop={8}>
        <X size={16} color="#4B5563" />
      </Pressable>
    </View>
  );
}
