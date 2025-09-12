import { Text, View } from 'react-native';
import { useThemedStyles } from '@/lib/utils/theme';

type BadgeProps = {
  children: React.ReactNode;
};

export function Badge({ children }: BadgeProps) {
  const themed = useThemedStyles();

  return (
    <View className={themed("bg-gray-100 px-3 py-1 rounded-full", "bg-gray-800 px-3 py-1 rounded-full")}>
      <Text className={themed("text-xs font-medium text-gray-800", "text-xs font-medium text-gray-200")}>{children}</Text>
    </View>
  );
}
