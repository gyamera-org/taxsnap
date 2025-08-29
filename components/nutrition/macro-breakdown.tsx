import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Flame, Heart, Wheat, Droplets } from 'lucide-react-native';
import { MacroBreakdownSkeleton } from './nutrition-skeleton';

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
  const calculateProgress = (consumed: number, target: number) => {
    return Math.min(100, (consumed / target) * 100);
  };

  const progress = calculateProgress(consumed, target);
  const remaining = target - consumed;

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      <View className="flex-row items-center justify-between">
        {/* Left side - Large number and text */}
        <View className="flex-1">
          <Text className="text-4xl font-bold text-gray-900 mb-1">
            {remaining}
            {unit}
          </Text>
          <Text className="text-gray-600 font-medium">{title} left</Text>
        </View>

        {/* Right side - Circular progress */}
        <View className="relative w-20 h-20">
          {/* Background circle */}
          <View
            className="absolute inset-0 rounded-full border-8"
            style={{ borderColor: '#F3F4F6' }}
          />

          {/* Progress circle */}
          <View
            className="absolute inset-0 rounded-full border-8"
            style={{
              borderColor: 'transparent',
              borderTopColor: progress > 12.5 ? color : 'transparent',
              borderRightColor: progress > 37.5 ? color : 'transparent',
              borderBottomColor: progress > 62.5 ? color : 'transparent',
              borderLeftColor: progress > 87.5 ? color : 'transparent',
              transform: [{ rotate: `${-90 + progress * 3.6}deg` }],
            }}
          />

          {/* Center icon */}
          <View className="absolute inset-0 items-center justify-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              {React.createElement(icon, { size: 20, color })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function MacroBreakdown({ macroData, isLoading = false }: MacroBreakdownProps) {
  // Check if we have valid targets (same logic as calories summary)
  const hasValidTargets =
    !isLoading &&
    macroData.protein.target > 0 &&
    macroData.carbs.target > 0 &&
    macroData.fat.target > 0;

  // Show skeleton when loading or no valid targets (same behavior as calories summary)
  if (isLoading || !hasValidTargets) {
    return <MacroBreakdownSkeleton />;
  }

  return (
    <View className="px-4 mb-6">
      {/* Single column layout for better readability */}
      <View>
        <View className="mb-3">
          <MacroCard
            title="Protein"
            consumed={macroData.protein.consumed}
            target={macroData.protein.target}
            unit="g"
            color="#EF4444"
            icon={Heart}
          />
        </View>

        <View className="mb-3">
          <MacroCard
            title="Carbs"
            consumed={macroData.carbs.consumed}
            target={macroData.carbs.target}
            unit="g"
            color="#F59E0B"
            icon={Wheat}
          />
        </View>

        <MacroCard
          title="Fat"
          consumed={macroData.fat.consumed}
          target={macroData.fat.target}
          unit="g"
          color="#3B82F6"
          icon={Droplets}
        />
      </View>
    </View>
  );
}
