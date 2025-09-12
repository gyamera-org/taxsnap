import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Utensils } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';

export const EmptyMealsState = ({ onAddMealPress }: { onAddMealPress?: () => void }) => {
  const themed = useThemedStyles();
  
  return (
    <View className={themed("bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-50", "bg-gray-800 rounded-2xl p-8 items-center shadow-sm border border-gray-700")}>
      <View className={themed("w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4", "w-16 h-16 bg-gray-700 rounded-full items-center justify-center mb-4")}>
        <Utensils size={24} color="#9CA3AF" />
      </View>
      <Text className={themed("text-gray-500 text-center mb-2", "text-gray-400 text-center mb-2")}>No meals logged today</Text>
      <TouchableOpacity onPress={onAddMealPress} className="bg-green-500 px-4 py-2 rounded-xl">
        <Text className="text-white font-medium">Log Your First Meal</Text>
      </TouchableOpacity>
    </View>
  );
};
