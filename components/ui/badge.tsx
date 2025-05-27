import { Text, View } from 'react-native';

type BadgeProps = {
  children: React.ReactNode;
};

export function Badge({ children }: BadgeProps) {
  return (
    <View className="bg-gray-100 px-3 py-1 rounded-full">
      <Text className="text-xs font-medium text-gray-800">{children}</Text>
    </View>
  );
}
