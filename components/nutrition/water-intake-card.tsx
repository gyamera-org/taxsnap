import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { GlassWater, Plus } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import CircularProgress from '@/components/CircularProgress';

interface WaterIntakeCardProps {
  waterData: {
    consumed: number;
    goal: number;
    glasses: number;
    totalGlasses: number;
  };
  onAddWaterPress?: () => void;
  onQuickAdd?: () => void;
}

export default function WaterIntakeCard({
  waterData,
  onAddWaterPress,
  onQuickAdd,
}: WaterIntakeCardProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();

  return (
    <View className="px-4 mb-3">
      <View
        className={themed(
          'bg-white rounded-xl p-3 border border-gray-100',
          'bg-gray-900 rounded-xl p-3 border border-gray-700'
        )}
      >
        <View className="flex-row items-center justify-between">
          {/* Left side - Text content */}
          <View className="flex-1">
            <Text
              className={themed(
                'text-base font-bold text-gray-900 mb-1',
                'text-base font-bold text-white mb-1'
              )}
            >
              Water
            </Text>
            <Text
              className={themed(
                'text-2xl font-bold text-gray-900 mb-1',
                'text-2xl font-bold text-white mb-1'
              )}
            >
              {waterData.consumed}ml
            </Text>
            <Text className={themed('text-xs text-gray-500', 'text-xs text-gray-400')}>
              of {waterData.goal}ml • {Math.round((waterData.consumed / waterData.goal) * 100)}%
            </Text>
          </View>

          {/* Right side - Circular progress with plus button */}
          <View className="items-center">
            <CircularProgress
              consumed={waterData.consumed}
              target={waterData.goal}
              size={64}
              strokeWidth={4}
              color="#3B82F6"
              isDark={isDark}
              showCenterText={false}
              animated={true}
              showOverflow={true}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                }}
              >
                <GlassWater size={18} color="#3B82F6" />
              </View>
            </CircularProgress>

            {/* Plus button */}
            <TouchableOpacity
              onPress={onQuickAdd}
              className="bg-blue-500 rounded-full w-8 h-8 items-center justify-center mt-2"
              style={{
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
