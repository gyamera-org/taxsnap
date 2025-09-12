import { View, Dimensions } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/context/theme-provider';

const { width } = Dimensions.get('window');

// Calories Summary Card Skeleton
export const CaloriesSummaryCardSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <View className="px-4 mb-6">
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm ${isDark ? 'border border-gray-700' : 'border border-gray-100'}`}>
        {/* Main content */}
        <View className="flex-row items-center justify-between mb-4">
          {/* Left side - Large number and text */}
          <View className="flex-1">
            <Skeleton width={180} height={72} borderRadius={12} className="mb-1" />
            <View className="flex-row items-center">
              <Skeleton width={120} height={18} borderRadius={4} />
              <View className="flex-row items-center ml-3">
                <Skeleton width={16} height={16} borderRadius={8} className="mr-1" />
                <Skeleton width={90} height={14} borderRadius={4} />
              </View>
            </View>
          </View>

          {/* Right side - Circular progress */}
          <View className="relative w-20 h-20">
            <Skeleton width={80} height={80} borderRadius={40} />
            {/* Center icon placeholder */}
            <View className="absolute inset-0 items-center justify-center">
              <Skeleton width={32} height={32} borderRadius={16} />
            </View>
          </View>
        </View>

        {/* Meal Breakdown */}
        <View className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} pt-4`}>
          <View className="flex-row justify-between">
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} className="items-center">
                <Skeleton width={32} height={32} borderRadius={16} className="mb-1" />
                <Skeleton width={30} height={12} borderRadius={4} className="mb-1" />
                <Skeleton width={40} height={12} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// Individual Macro Card Skeleton (matches new UI design)
const IndividualMacroCardSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-50'} rounded-2xl p-5 shadow-sm border mb-4`}>
      <View className="flex-row items-center justify-between">
        {/* Left side - Value and label */}
        <View className="flex-1">
          {/* Large number (e.g., "109g") */}
          <Skeleton width={120} height={40} borderRadius={8} className="mb-2" />
          {/* Label (e.g., "Protein left") */}
          <Skeleton width={80} height={16} borderRadius={4} />
        </View>

        {/* Right side - Circular progress indicator */}
        <View className="relative w-16 h-16">
          {/* Outer circle */}
          <Skeleton width={64} height={64} borderRadius={32} />
          {/* Inner icon placeholder */}
          <View className="absolute inset-0 items-center justify-center">
            <Skeleton width={24} height={24} borderRadius={12} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Macro Breakdown Skeleton (updated to match new vertical layout)
export const MacroBreakdownSkeleton = () => (
  <View className="px-4 mb-6">
    {/* Three individual macro cards stacked vertically */}
    <IndividualMacroCardSkeleton />
    <IndividualMacroCardSkeleton />
    <IndividualMacroCardSkeleton />
  </View>
);

// Water Intake Card Skeleton
export const WaterIntakeCardSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <View className="px-4 mb-6">
      <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-50'} rounded-2xl p-5 shadow-sm border`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Skeleton width={32} height={32} borderRadius={16} className="mr-3" />
            <Skeleton width={60} height={20} borderRadius={4} />
          </View>
          <Skeleton width={80} height={16} borderRadius={4} />
        </View>

        <View className="flex-row items-baseline mb-4">
          <Skeleton width={80} height={32} borderRadius={6} />
          <Skeleton width={60} height={16} borderRadius={4} className="ml-2" />
        </View>

        <Skeleton width={width - 80} height={8} borderRadius={4} />
      </View>
    </View>
  );
};

// Meal Card Skeleton
const MealCardSkeleton = ({ isAnalyzing = false }: { isAnalyzing?: boolean }) => {
  const { isDark } = useTheme();
  
  return (
    <View className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-50'} rounded-2xl p-4 mb-3 shadow-sm border`}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Skeleton width={48} height={48} borderRadius={12} className="mr-3" />

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Skeleton width={60} height={16} borderRadius={4} />
              <Skeleton width={40} height={12} borderRadius={4} />
            </View>
            <Skeleton width={140} height={18} borderRadius={4} className="mb-2" />
            <Skeleton width={80} height={14} borderRadius={4} />
          </View>
        </View>

        <Skeleton width={16} height={16} borderRadius={2} />
      </View>

      {/* Nutrition breakdown - always show for regular meals */}
      <View className={`flex-row justify-between items-center pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-50'}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} className="items-center">
            <Skeleton width={35} height={12} borderRadius={4} className="mb-1" />
            <Skeleton width={25} height={16} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Analyzing state banner */}
      {isAnalyzing && (
        <View className={`mt-3 ${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-xl p-3 border`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Skeleton width={16} height={16} borderRadius={8} className="mr-2" />
              <Skeleton width={120} height={16} borderRadius={4} />
            </View>
            <Skeleton width={80} height={28} borderRadius={14} />
          </View>
        </View>
      )}
    </View>
  );
};

// Meals Section Skeleton
export const MealsSectionSkeleton = () => (
  <View className="px-4 mb-6">
    <View className="flex-row items-center justify-between mb-4">
      <Skeleton width={120} height={24} borderRadius={6} />
      <Skeleton width={100} height={36} borderRadius={18} />
    </View>

    {/* Show a realistic mix of meal cards */}
    <MealCardSkeleton />
    <MealCardSkeleton />
    <MealCardSkeleton isAnalyzing={false} />
  </View>
);

// Weekly Calendar Skeleton
export const WeeklyCalendarSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <View className="mx-4 mb-8">
      <View className={`${isDark ? 'bg-gray-800/80 border-gray-600/60' : 'bg-white/95 border-gray-300/70'} rounded-2xl px-5 py-4 shadow-sm border`}>
        <View className="flex-row justify-between">
          {Array.from({ length: 7 }).map((_, index) => (
            <View key={index} className="items-center flex-1">
              {/* Day letter */}
              <Skeleton width={8} height={12} borderRadius={2} className="mb-3" />

              {/* Date container */}
              <View className="relative">
                <View className={`w-12 h-12 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} items-center justify-center`}>
                  <Skeleton width={16} height={16} borderRadius={4} />
                </View>

                {/* Activity indicator dot (show on some days) */}
                {index % 3 === 0 && (
                  <View className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <Skeleton width={6} height={6} borderRadius={3} />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Streak Display Skeleton (for header)
export const StreakDisplaySkeleton = () => (
  <View className="flex-row items-center">
    <View className="flex-row items-center mr-3">
      <Skeleton width={20} height={20} borderRadius={10} className="mr-2" />
      <Skeleton width={40} height={16} borderRadius={4} />
    </View>
    <Skeleton width={80} height={32} borderRadius={16} />
  </View>
);

// Full Page Skeleton
export const NutritionPageSkeleton = () => (
  <View className="flex-1">
    <WeeklyCalendarSkeleton />
    <CaloriesSummaryCardSkeleton />
    <MacroBreakdownSkeleton />
    <WaterIntakeCardSkeleton />
    <MealsSectionSkeleton />
  </View>
);
