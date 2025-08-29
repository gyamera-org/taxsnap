import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { type WeightEntry, type BodyMeasurements } from '@/lib/hooks/use-weight-tracking';

interface WeightChartProps {
  weightHistory: WeightEntry[];
  bodyMeasurements: BodyMeasurements | null;
}

export function WeightChart({ weightHistory, bodyMeasurements }: WeightChartProps) {
  if (!weightHistory || weightHistory.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
        <Text className="text-xl font-bold text-gray-900 mb-3">Weight Trend</Text>
        <Text className="text-gray-500 text-center py-8">No weight data available</Text>
      </View>
    );
  }

  const recentHistory = weightHistory.slice(-8).reverse(); // Reverse to show chronological order (oldest to newest)
  const maxWeight = Math.max(...recentHistory.map((entry) => entry.weight));
  const minWeight = Math.min(...recentHistory.map((entry) => entry.weight));
  const range = maxWeight - minWeight || 1;

  const chartWidth = 350;
  const chartHeight = 120;
  const padding = 20;

  // Create smooth curve path
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (i === 1) {
        // For the first curve, use quadratic
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y;
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
      } else {
        // For smooth curves, use cubic bezier
        const prev2 = points[i - 2];
        const cp1x = prev.x + (curr.x - prev2.x) * 0.2;
        const cp1y = prev.y;
        const cp2x = curr.x - (curr.x - prev.x) * 0.2;
        const cp2y = curr.y;
        path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
      }
    }

    return path;
  };

  // Calculate points for the line
  const points = recentHistory.map((entry, index) => {
    const x =
      padding + (index * (chartWidth - 2 * padding)) / Math.max(1, recentHistory.length - 1);
    const y =
      chartHeight - padding - ((entry.weight - minWeight) / range) * (chartHeight - 2 * padding);
    return { x, y, weight: entry.weight, date: entry.measured_at };
  });

  const pathData = createSmoothPath(points);

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900">Weight Trend</Text>
        <Text className="text-sm text-gray-500">Last {recentHistory.length} entries</Text>
      </View>

      <View className="h-40 mb-2">
        <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, index) => (
            <Line
              key={`grid-${index}`}
              x1={padding}
              y1={padding + ratio * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={padding + ratio * (chartHeight - 2 * padding)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Main curve */}
          {pathData && (
            <Path
              d={pathData}
              stroke="#ec4899"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {points.map((point, index) => {
            const isLatest = index === points.length - 1;
            return (
              <Circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r={isLatest ? 5 : 3}
                fill={isLatest ? '#ec4899' : '#ffffff'}
                stroke={isLatest ? '#ec4899' : '#3b82f6'}
                strokeWidth="2"
              />
            );
          })}
        </Svg>

        {/* X-axis labels - positioned to avoid overlap */}
        <View className="flex-row justify-between px-5 mt-3 mb-4">
          {recentHistory.map((entry, index) => (
            <View key={entry.measured_at} className="items-center" style={{ flex: 1 }}>
              <Text className="text-xs text-gray-400">
                {new Date(entry.measured_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weight range indicators */}
      <View className="flex-row justify-between">
        <Text className="text-xs text-gray-500">
          High: {maxWeight.toFixed(1)} {bodyMeasurements?.units || 'kg'}
        </Text>
        <Text className="text-xs text-gray-500">
          Low: {minWeight.toFixed(1)} {bodyMeasurements?.units || 'kg'}
        </Text>
      </View>
    </View>
  );
}
