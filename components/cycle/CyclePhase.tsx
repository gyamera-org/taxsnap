import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Calendar, Baby, Droplets } from 'lucide-react-native';
import type { CurrentCycleInfo } from '@/lib/hooks/use-cycle-flo-style';
import { useTheme } from '@/context/theme-provider';

interface CyclePhaseProps {
  currentCycleInfo: CurrentCycleInfo | null;
  onLogPeriod?: () => void;
  isLoading?: boolean;
  selectedDate?: Date;
}

// Circular Progress Component with dashed circle design
const CircularProgress = ({
  progress,
  size = 180,
  isDark = false,
}: {
  progress: number;
  size?: number;
  isDark?: boolean;
}) => {
  const progressAngle = (progress / 100) * 360;
  const dashCount = 40; // Number of dashes around the circle
  const dashLength = 8;
  const gapLength = 4;

  // Create array of dashes based on progress
  const renderDashes = () => {
    const dashes = [];
    const progressDashes = Math.floor((progress / 100) * dashCount);

    for (let i = 0; i < dashCount; i++) {
      const angle = (i * 360) / dashCount;
      const isActive = i < progressDashes;

      // Alternate between pink and purple for active dashes
      const color = isActive
        ? i % 2 === 0
          ? '#EC4899'
          : '#A855F7'
        : isDark
        ? 'rgba(75, 85, 99, 0.4)'
        : 'rgba(229, 231, 235, 0.6)';

      dashes.push(
        <View
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: dashLength,
            backgroundColor: color,
            borderRadius: 2,
            top: size / 2 - dashLength / 2,
            left: size / 2 - 2,
            transformOrigin: `2px ${size / 2}px`,
            transform: [{ translateY: -(size / 2 - 16) }, { rotate: `${angle}deg` }],
          }}
        />
      );
    }
    return dashes;
  };

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer shadow for depth */}
      <View
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: 'transparent',
          shadowColor: isDark ? '#EC4899' : '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}
      />

      {/* Background bubble container */}
      {/* <View
        className="absolute rounded-full"
        style={{
          width: size - 20,
          height: size - 20,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)',
          shadowColor: isDark ? '#EC4899' : '#A855F7',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      /> */}

      {/* Dashed circle progress */}
      <View style={{ width: size, height: size }}>{renderDashes()}</View>

      {/* Inner glass highlight */}
      {/* <View
        className="absolute rounded-full"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          top: size * 0.2,
          left: size * 0.25,
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.3)',
          borderRadius: (size * 0.25) / 2,
        }}
      /> */}

      {/* Inner glow */}
      {/* <View
        className="absolute rounded-full"
        style={{
          width: size - 60,
          height: size - 60,
          backgroundColor: isDark ? 'rgba(168, 85, 247, 0.06)' : 'rgba(236, 72, 153, 0.04)',
          borderRadius: (size - 60) / 2,
        }}
      /> */}
    </View>
  );
};

// Phase indicator component
const PhaseIndicator = ({
  phase,
  isActive,
  isDark = false,
}: {
  phase: string;
  isActive: boolean;
  isDark?: boolean;
}) => {
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
      <Text
        className={`text-xs ${
          isActive
            ? `font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`
            : `${isDark ? 'text-gray-400' : 'text-gray-500'}`
        }`}
      >
        {phase} phase
      </Text>
    </View>
  );
};

export function CyclePhase({
  currentCycleInfo,
  onLogPeriod,
  isLoading = false,
  selectedDate,
}: CyclePhaseProps) {
  const { isDark } = useTheme();
  // Calculate days until next period based on selected date
  const getDaysUntilNextPeriod = () => {
    if (!currentCycleInfo?.next_period_prediction || !selectedDate) {
      return currentCycleInfo?.next_period_prediction?.days_until || 0;
    }

    const nextPeriodDate = new Date(currentCycleInfo.next_period_prediction.start_date);
    const compareDate = new Date(selectedDate);

    // Reset time to avoid timezone issues
    nextPeriodDate.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);

    const diffInMs = nextPeriodDate.getTime() - compareDate.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
  };
  // Loading state
  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View
          className={`${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          } rounded-3xl p-6 border items-center`}
        >
          <View
            className={`w-32 h-32 rounded-full ${
              isDark ? 'bg-pink-800' : 'bg-gray-100'
            } items-center justify-center mb-4`}
          >
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Loading...</Text>
          </View>
        </View>
      </View>
    );
  }

  // No cycle data - show tracking encouragement
  if (!currentCycleInfo || !currentCycleInfo.has_active_cycle) {
    return (
      <View className="px-4 mb-6">
        <View
          className={`${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          } rounded-3xl p-6 border items-center`}
        >
          <View
            className={`w-32 h-32 rounded-full border-4 border-dashed ${
              isDark ? 'border-pink-600' : 'border-gray-200'
            } items-center justify-center mb-4`}
          >
            <Calendar size={32} color={isDark ? '#EC4899' : '#9CA3AF'} />
          </View>
          <Text
            className={`text-lg font-bold ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            } text-center mb-2`}
          >
            {currentCycleInfo?.name || 'Start tracking your cycle'}
          </Text>
          <Text
            className={`${
              isDark ? 'text-gray-400' : 'text-gray-500'
            } text-center text-sm mb-4 px-4`}
          >
            {currentCycleInfo?.description ||
              'Get personalized insights about your cycle phases and health'}
          </Text>
          <TouchableOpacity
            className={`${isDark ? 'bg-pink-600' : 'bg-pink-500'} px-6 py-3 rounded-full`}
            onPress={onLogPeriod}
          >
            <Text className="text-white font-semibold">Log Period</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active cycle data
  const cycleDay = currentCycleInfo.day_in_cycle;
  const phase = currentCycleInfo.phase;
  const progressPercentage = (cycleDay / 28) * 100; // Default to 28-day visual

  return (
    <View className="px-4 mb-6">
      <View
        className={`${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        } rounded-3xl p-6 border`}
      >
        {/* Circular Progress Section */}
        <View className="items-center mb-8">
          <View className="relative items-center justify-center">
            <CircularProgress progress={progressPercentage} isDark={isDark} />
            <View className="absolute items-center justify-center">
              <Text className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Day {cycleDay}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} capitalize`}>
                {currentCycleInfo.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Pregnancy Chances & Next Period - Side by Side */}
        <View className="flex-row justify-between gap-3">
          {/* Chances of Pregnancy */}
          <View
            className={`flex-1 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl p-4`}
            style={{
              shadowColor: isDark ? '#EC4899' : '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.1 : 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="items-center">
              <View className="flex-row items-center mb-2">
                <Baby
                  size={16}
                  color={currentCycleInfo.pregnancy_chances.color}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  {currentCycleInfo.pregnancy_chances.level}
                </Text>
              </View>
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                Pregnancy
              </Text>
            </View>
          </View>

          {/* Next Period */}
          {currentCycleInfo.next_period_prediction && (
            <View
              className={`flex-1 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-2xl p-4`}
              style={{
                shadowColor: isDark ? '#EC4899' : '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.1 : 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="items-center">
                <View className="flex-row items-center mb-2">
                  <Droplets size={16} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text
                    className={`text-sm font-semibold ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {(() => {
                      const daysUntil = getDaysUntilNextPeriod();
                      return daysUntil > 0
                        ? `${daysUntil} days`
                        : daysUntil === 0
                        ? 'Today'
                        : 'Overdue';
                    })()}
                  </Text>
                </View>
                <Text
                  className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}
                >
                  Next Period
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
