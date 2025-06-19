import { View, Text } from 'react-native';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
  bgColor: string;
}

export function StatCard({ icon: Icon, title, value, color, bgColor }: StatCardProps) {
  return (
    <View
      className="p-4 rounded-2xl items-center justify-center min-h-[100px]"
      style={{ backgroundColor: bgColor }}
    >
      <Icon size={24} color={color} />
      <Text className="text-xs text-gray-600 mt-2 mb-1 text-center leading-tight">{title}</Text>
      <Text className="font-bold text-black text-center text-sm" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}
