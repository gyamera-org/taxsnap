import { View, Text, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { cn } from '@/lib/utils';

type ProductListItemProps = {
  name: string;
  type: string;
  brand?: string;
  onPress?: () => void;
};

export default function ProductListItem({ name, type, brand, onPress }: ProductListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl mb-3"
    >
      <View className="flex-1 mr-4">
        <Text numberOfLines={1} className="text-lg font-medium text-black mb-1">
          {name}
        </Text>

        <View className="flex-row items-center">
          <View className={cn('px-2 py-1 rounded-xl bg-slate-200')}>
            <Text className="text-sm font-medium">{type}</Text>
          </View>

          {brand && (
            <Text numberOfLines={1} className="text-gray-600 ml-2">
              {brand}
            </Text>
          )}
        </View>
      </View>

      <View className="bg-black/90 rounded-full p-2">
        <Plus size={18} color="white" />
      </View>
    </Pressable>
  );
}
