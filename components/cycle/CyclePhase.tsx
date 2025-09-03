import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, Plus } from 'lucide-react-native';
import { useCycleDay } from '@/lib/hooks/use-cycle-day';
import type { PeriodLog } from '@/lib/utils/cycle-utils';
import { getPhaseData } from '@/lib/utils/cycle-phase-data';

interface CyclePhaseProps {
  selectedDate: Date;
  periodStartDate?: Date;
  onLogPeriod?: () => void;
  nextPeriodPrediction?: {
    daysUntil: number;
    date: string;
  } | null;
  pregnancyChances?: {
    level: string;
    color: string;
    description: string;
  };
  periodLogs?: PeriodLog[];
  cycleSettings?: { cycle_length?: number; period_length?: number } | null | undefined;
}

// Circular Progress Component using CSS/Style approach
const CircularProgress = ({ progress, size = 180 }: { progress: number; size?: number }) => {
  // More granular progress calculation
  const getSegmentColor = (segmentProgress: number) => {
    return progress >= segmentProgress ? '#EC4899' : 'transparent';
  };

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <View
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          borderWidth: 8,
          borderColor: '#F3E8FF',
        }}
      />
      {/* Progress circles - multiple layers for smoother progress */}
      {[0, 25, 50, 75].map((segmentStart, index) => (
        <View
          key={index}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            borderWidth: 8,
            borderColor: 'transparent',
            borderTopColor: index === 0 ? getSegmentColor(segmentStart) : 'transparent',
            borderRightColor: index === 1 ? getSegmentColor(segmentStart) : 'transparent',
            borderBottomColor: index === 2 ? getSegmentColor(segmentStart) : 'transparent',
            borderLeftColor: index === 3 ? getSegmentColor(segmentStart) : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
      ))}
    </View>
  );
};

// Phase indicator component
const PhaseIndicator = ({ phase, isActive }: { phase: string; isActive: boolean }) => {
  const getPhaseColor = (phaseName: string) => {
    switch (phaseName.toLowerCase()) {
      case 'period':
        return '#EC4899'; // Pink for period phase
      case 'fertile window':
        return '#10B981'; // Light green for fertile window
      case 'menstrual':
        return '#EC4899'; // Pink
      case 'follicular':
        return '#10B981'; // Green
      case 'ovulatory':
        return '#3B82F6'; // Blue
      case 'luteal':
        return '#8B5CF6'; // Purple
      default:
        return '#6B7280';
    }
  };

  return (
    <View className="flex-row items-center mr-4">
      <View
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: getPhaseColor(phase) }}
      />
      <Text className={`text-xs ${isActive ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
        {phase} phase
      </Text>
    </View>
  );
};

export function CyclePhase({
  selectedDate,
  periodStartDate,
  onLogPeriod,
  nextPeriodPrediction,
  pregnancyChances,
  periodLogs = [],
  cycleSettings,
}: CyclePhaseProps) {
  // If no period data, show tracking encouragement
  if (!periodStartDate) {
    return (
      <View className="px-4 mb-6">
        <View className="bg-white rounded-3xl p-6 border border-gray-100 items-center">
          <View className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 items-center justify-center mb-4">
            <Calendar size={32} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold text-gray-900 text-center mb-2">
            Start tracking your cycle
          </Text>
          <Text className="text-gray-500 text-center text-sm mb-4 px-4">
            Get personalized insights about your cycle phases and health
          </Text>
          <TouchableOpacity className="bg-pink-500 px-6 py-3 rounded-full" onPress={onLogPeriod}>
            <Text className="text-white font-semibold">Log Period</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Use centralized cycle day calculation
  const { cycleDay } = useCycleDay({
    selectedDate,
    periodLogs,
    cycleSettings: cycleSettings || null,
  });
  const phaseData = getPhaseData(cycleDay);

  // Calculate progress percentage (assuming 28-day cycle)
  const progressPercentage = (cycleDay / 28) * 100;

  return (
    <View className="px-4 mb-6">
      <View className="bg-white rounded-3xl p-6 border border-gray-100">
        {/* Circular Progress Section */}
        <View className="items-center mb-6">
          <View className="relative items-center justify-center">
            <CircularProgress progress={progressPercentage} />
            <View className="absolute items-center justify-center">
              <Text className="text-3xl font-bold text-gray-900">Day {cycleDay}</Text>
              <Text className="text-sm text-gray-600 capitalize">{phaseData.phase} Phase</Text>
            </View>
          </View>
        </View>

        {/* Phase Indicators */}
        <View className="flex-row justify-center mb-6 flex-wrap">
          <PhaseIndicator phase="Period" isActive={phaseData.phase === 'Menstrual'} />
          <PhaseIndicator phase="Fertile window" isActive={phaseData.phase === 'Ovulatory'} />
        </View>

        {/* Log Period Button */}
        <TouchableOpacity
          className="bg-pink-500 rounded-2xl py-4 items-center mb-4"
          onPress={onLogPeriod}
        >
          <View className="flex-row items-center">
            <Text className="text-white font-medium mr-2">Log Period</Text>
            <Plus size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Chances of Pregnancy */}
        {pregnancyChances && (
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Calendar size={16} color="#6B7280" />
                <Text className="text-gray-700 ml-2 text-sm">Chances of Pregnancy</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: pregnancyChances.color }}
                />
                <Text className="text-sm font-medium text-gray-900">{pregnancyChances.level}</Text>
              </View>
            </View>
            {pregnancyChances.description && (
              <Text className="text-xs text-gray-500 mt-2 ml-6">
                {pregnancyChances.description}
              </Text>
            )}
          </View>
        )}

        {/* Next Period */}
        {nextPeriodPrediction && (
          <View className="bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Calendar size={16} color="#6B7280" />
                <Text className="text-gray-700 ml-2 text-sm">Next Period</Text>
              </View>
              <Text className="text-sm font-medium text-gray-900">
                {nextPeriodPrediction.daysUntil > 0
                  ? `in ${nextPeriodPrediction.daysUntil} days`
                  : nextPeriodPrediction.daysUntil === 0
                    ? 'today'
                    : 'overdue'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
