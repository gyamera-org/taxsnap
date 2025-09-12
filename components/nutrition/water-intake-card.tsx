import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { GlassWater, Plus } from 'lucide-react-native';
import { getAccurateCircularProgressStyles } from '@/lib/utils/progress-circle';
import { useThemedStyles } from '@/lib/utils/theme';

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
  const progressStyles = getAccurateCircularProgressStyles(
    waterData.consumed,
    waterData.goal,
    '#3B82F6'
  );

  return (
    <View className="px-4 mb-3">
      <View className={themed("bg-white rounded-2xl p-4 shadow-sm border border-gray-50", "bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-700")}>
        <View className="flex-row items-center justify-between">
          {/* Left side - Text content */}
          <View className="flex-1">
            <Text className={themed("text-lg font-bold text-gray-900 mb-1", "text-lg font-bold text-white mb-1")}>Water</Text>
            <Text className={themed("text-3xl font-bold text-gray-900 mb-1", "text-3xl font-bold text-white mb-1")}>{waterData.consumed}ml</Text>
            <Text className={themed("text-sm text-gray-500", "text-sm text-gray-400")}>of {waterData.goal}ml</Text>
          </View>

          {/* Right side - Circular progress with plus button */}
          <View className="items-center">
            <View className="relative w-20 h-20 items-center justify-center">
              {/* Background circle - always visible */}
              <View className="absolute rounded-full" style={progressStyles.backgroundCircle} />

              {/* Progress circle - partial progress */}
              {progressStyles.progressCircle && (
                <View className="absolute rounded-full" style={progressStyles.progressCircle} />
              )}

              {/* Complete circle when 100% or more */}
              {progressStyles.fullCircle && (
                <View className="absolute rounded-full" style={progressStyles.fullCircle} />
              )}

              {/* Center icon - positioned in the center */}
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <GlassWater size={22} color="#3B82F6" />
              </View>
            </View>

            {/* Plus button */}
            <TouchableOpacity
              onPress={onQuickAdd}
              className="bg-blue-500 rounded-full w-10 h-10 items-center justify-center mt-2"
              style={{
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
