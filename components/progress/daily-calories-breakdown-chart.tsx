import { View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Beef, Wheat, ChartArea } from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';

const colorMap: Record<string, string> = {
  protein: '#ffa2a2', // Red
  carbs: '#fee685', // Orange
  fat: '#b8e6fe', // Blue
  calories: '#000000', // Black
};

interface NutrientProgressData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Props {
  nutrientData: NutrientProgressData[];
  weeklyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const DailyBreakdownChart = ({ nutrientData, weeklyTotals }: Props) => {
  const maxCalories =
    nutrientData.length > 0 ? Math.max(...nutrientData.map((d) => d.calories)) : 0;
  const chartHeight = 300;

  // Y-axis labels (calorie values)
  const yAxisSteps = 5;
  const yAxisMax = nutrientData.length === 0 ? 2000 : Math.ceil(maxCalories / 500) * 500; // Default to 2000 for empty state
  const yAxisStep = yAxisMax / yAxisSteps;

  const hasNoData = nutrientData.length === 0;

  return (
    <View className="bg-white rounded-3xl p-6 mx-4 mb-4">
      <Text className="text-2xl font-bold mb-2">Total Calories</Text>
      <View className="mb-6 flex flex-row gap-2 items-center">
        <Text className="text-4xl font-bold">{weeklyTotals.calories.toLocaleString()}</Text>
        <Text className="text-gray-500">cals</Text>
      </View>

      {/* Chart Container */}
      <View className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y-axis grid lines and labels */}
        {!hasNoData &&
          Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
            const value = yAxisMax - i * yAxisStep;
            const yPosition = (i / yAxisSteps) * chartHeight;
            return (
              <View
                key={i}
                className="absolute left-0 flex-row items-center w-full"
                style={{ top: yPosition }}
              >
                <Text className="text-xs text-gray-400 w-12 text-right mr-2">
                  {value.toLocaleString()}
                </Text>
                <View className="flex-1 h-[1px] bg-gray-100" />
              </View>
            );
          })}

        {/* Chart bars */}
        {!hasNoData && (
          <View
            className="absolute flex-row justify-between items-end"
            style={{
              top: 0,
              left: 56, // Account for y-axis labels
              right: 0,
              height: chartHeight,
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
              // Find data for this day of week
              const dayData = nutrientData.find((d) => {
                const date = new Date(d.date + 'T00:00:00');
                return date.getDay() === index;
              });

              const totalCalories = dayData?.calories || 0;
              const protein = dayData?.protein || 0;
              const carbs = dayData?.carbs || 0;
              const fat = dayData?.fat || 0;

              // Calculate calories from each macro (protein=4cal/g, carbs=4cal/g, fat=9cal/g)
              const proteinCalories = protein * 4;
              const carbCalories = carbs * 4;
              const fatCalories = fat * 9;

              const barHeight = yAxisMax > 0 ? (totalCalories / yAxisMax) * chartHeight : 0;

              // Calculate proportional heights for each macro
              const totalMacroCalories = proteinCalories + carbCalories + fatCalories;
              const proteinHeight =
                totalMacroCalories > 0 ? (proteinCalories / totalMacroCalories) * barHeight : 0;
              const carbHeight =
                totalMacroCalories > 0 ? (carbCalories / totalMacroCalories) * barHeight : 0;
              const fatHeight =
                totalMacroCalories > 0 ? (fatCalories / totalMacroCalories) * barHeight : 0;

              return (
                <View key={day} className="flex-1 items-center">
                  <View
                    className="items-center justify-end"
                    style={{ height: chartHeight, marginBottom: 8 }}
                  >
                    {totalCalories > 0 && (
                      <View
                        className="w-8 rounded-sm overflow-hidden"
                        style={{ height: Math.max(4, barHeight) }}
                      >
                        {/* Protein (top - red) */}
                        {proteinHeight > 0 && (
                          <View
                            className="w-full"
                            style={{ height: proteinHeight, backgroundColor: colorMap.protein }}
                          />
                        )}
                        {/* Carbs (middle - orange) */}
                        {carbHeight > 0 && (
                          <View
                            className="w-full"
                            style={{ height: carbHeight, backgroundColor: colorMap.carbs }}
                          />
                        )}
                        {/* Fat (bottom - blue) */}
                        {fatHeight > 0 && (
                          <View
                            className="w-full bg-[#3b82f6]"
                            style={{ height: fatHeight, backgroundColor: colorMap.fat }}
                          />
                        )}
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-600">{day}</Text>
                </View>
              );
            })}
          </View>
        )}

        {hasNoData && (
          <View className="flex flex-col items-center justify-center h-full px-6">
            <View className="rounded-xl bg-slate-100 p-4 flex items-center justify-center mb-4">
              <ChartArea size={24} />
            </View>
            <Text className="text-2xl font-bold mb-4 text-center" font-bold>
              No data available
            </Text>
            <Text className="text-lg text-center">Log your meals to track your progress</Text>
          </View>
        )}
      </View>

      {/* Legend */}
      {!hasNoData && (
        <View className="flex-row justify-center gap-4 ">
          <View className="flex-row items-center gap-2">
            <View className="bg-red-100 p-1 rounded-full">
              <Beef size={10} color={colorMap.protein} />
            </View>
            <Text className="text-sm">Protein</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="bg-amber-100 p-1 rounded-full">
              <Wheat size={10} color={colorMap.carbs} />
            </View>
            <Text className="text-sm">Carbs</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="bg-blue-100 p-1 rounded-full">
              <OliveOilIcon size={10} color={colorMap.fat} />
            </View>
            <Text className="text-sm">Fat</Text>
          </View>
        </View>
      )}
    </View>
  );
};
