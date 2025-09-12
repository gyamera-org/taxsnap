import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import {  Beef, Wheat } from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';
import { MacroBreakdownSkeleton } from './nutrition-skeleton';
import { getAccurateCircularProgressStyles } from '@/lib/utils/progress-circle';
import { useThemedStyles } from '@/lib/utils/theme';

interface MacroBreakdownProps {
  macroData: {
    calories: { consumed: number; target: number };
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fat: { consumed: number; target: number };
  };
  isLoading?: boolean;
}

const MacroCard = ({
  title,
  consumed,
  target,
  unit,
  color,
  icon,
}: {
  title: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ElementType;
}) => {
  const themed = useThemedStyles();
  const remaining = target - consumed;
  const progressStyles = getAccurateCircularProgressStyles(consumed, target, color);

  return (
    <View className={themed("bg-white rounded-2xl p-4 border border-gray-50 shadow-sm", "bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-sm")}>
      <View className="flex-row items-center justify-between">
        {/* Left side - Large number and text */}
        <View className="flex-1">
          <Text className={themed("text-4xl font-bold text-gray-900 mb-1", "text-4xl font-bold text-white mb-1")}>
            {remaining}
            {unit}
          </Text>
          <Text className={themed("text-gray-600 font-medium", "text-gray-300 font-medium")}>{title} left</Text>
        </View>

        {/* Right side - Circular progress */}
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
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon === OliveOilIcon ? (
              <OliveOilIcon size={22} color={color} />
            ) : (
              React.createElement(icon, { size: 22, color })
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default function MacroBreakdown({ macroData, isLoading = false }: MacroBreakdownProps) {
  // Show skeleton only when loading
  if (isLoading) {
    return <MacroBreakdownSkeleton />;
  }

  // Check if we have valid targets
  const hasValidTargets =
    macroData.protein.target > 0 && macroData.carbs.target > 0 && macroData.fat.target > 0;

  // Use default targets when no valid targets are set
  const getDisplayData = (macro: { consumed: number; target: number }, defaultTarget: number) => ({
    consumed: hasValidTargets ? macro.consumed : 0,
    target: hasValidTargets ? macro.target : defaultTarget,
  });

  return (
    <View className="px-4 mb-6">
      {/* Single column layout for better readability */}
      <View>
        <View className="mb-3">
          <MacroCard
            title="Protein"
            consumed={getDisplayData(macroData.protein, 150).consumed}
            target={getDisplayData(macroData.protein, 150).target}
            unit="g"
            color="#EF4444"
            icon={Beef}
          />
        </View>

        <View className="mb-3">
          <MacroCard
            title="Carbs"
            consumed={getDisplayData(macroData.carbs, 250).consumed}
            target={getDisplayData(macroData.carbs, 250).target}
            unit="g"
            color="#F59E0B"
            icon={Wheat}
          />
        </View>

        <MacroCard
          title="Fat"
          consumed={getDisplayData(macroData.fat, 67).consumed}
          target={getDisplayData(macroData.fat, 67).target}
          unit="g"
          color="#8B5CF6"
          icon={OliveOilIcon}
        />
      </View>
    </View>
  );
}
