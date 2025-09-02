import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

import { Sparkles, Timer, Flame, Dumbbell, TrendingUp } from 'lucide-react-native';
import { useGenerateWeeklyExercisePlan } from '@/lib/hooks/use-weekly-exercise-planner';

export function WeeklyPlanSection({
  currentWeeklyPlan,
  planGenerationData,
  onShowPlan,
  fitnessGoals,
  bodyMeasurements,
  currentCyclePhase,
}: {
  currentWeeklyPlan: any;
  planGenerationData: any;
  onShowPlan: (plan: any) => void;
  fitnessGoals?: any;
  bodyMeasurements?: any;
  currentCyclePhase?: any;
}) {
  const generateWeeklyPlan = useGenerateWeeklyExercisePlan();

  // Check if we should show the generate button (only on day before plan ends)
  const shouldShowGenerateButton = () => {
    if (!currentWeeklyPlan) return true; // No plan exists, always show

    const today = new Date();
    const planEndDate = new Date(currentWeeklyPlan.end_date);

    // Normalize dates to compare just the date part (ignore time)
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const planEndDateOnly = new Date(
      planEndDate.getFullYear(),
      planEndDate.getMonth(),
      planEndDate.getDate()
    );

    // Calculate the day before plan ends
    const dayBeforePlanEnds = new Date(planEndDateOnly);
    dayBeforePlanEnds.setDate(planEndDateOnly.getDate() - 1);

    // Show button only if today is the day before the plan ends
    return todayDateOnly.getTime() === dayBeforePlanEnds.getTime();
  };

  const handleGeneratePlan = () => {
    // Start new plan from the day after current plan ends (or tomorrow if no current plan)
    let startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Default to tomorrow

    if (currentWeeklyPlan) {
      // Start from the day after current plan ends
      const planEndDate = new Date(currentWeeklyPlan.end_date);
      startDate = new Date(planEndDate);
      startDate.setDate(planEndDate.getDate() + 1);
    }

    // Start the generation process (non-blocking)
    console.log('Plan generation data:', planGenerationData);
    generateWeeklyPlan.mutate(
      {
        plan_data: planGenerationData,
        start_date: startDate.toISOString(),
      },
      {
        onSuccess: (result) => {
          onShowPlan(result.plan);
        },
        onError: (error) => {
          console.error('Failed to generate weekly plan:', error);
          alert(
            `❌ Failed to generate weekly plan\n\n${error instanceof Error ? error.message : 'Please try again later'}`
          );
        },
      }
    );
  };

  const handleViewCurrentPlan = () => {
    if (currentWeeklyPlan?.plan_data) {
      onShowPlan(currentWeeklyPlan.plan_data);
    }
  };

  return (
    <View className="mx-4 mb-6">
      {/* Current Plan Display */}
      {currentWeeklyPlan && (
        <View
          className="rounded-3xl p-6 mb-4"
          style={{
            backgroundColor: 'white',
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          {/* Header with gradient background */}
          <View
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: '#8B5CF6',
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {currentWeeklyPlan.plan_name}
                </Text>
                <Text className="text-sm mt-1" style={{ color: '#E9D5FF' }}>
                  {new Date(currentWeeklyPlan.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(currentWeeklyPlan.end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleViewCurrentPlan}
                className="px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Text className="font-semibold" style={{ color: '#FFFFFF' }}>
                  View Plan
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Stats Grid */}
          <View className="flex-row justify-between">
            <View className="flex-1 bg-purple-50 rounded-2xl p-4 mr-2">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                  <Dumbbell size={16} color="#8B5CF6" />
                </View>
              </View>
              <Text className="text-purple-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Workouts
              </Text>
              <Text className="text-purple-900 text-lg font-bold" numberOfLines={1}>
                {currentWeeklyPlan.plan_data?.weekly_goals?.total_workouts || 0}
              </Text>
            </View>

            <View className="flex-1 bg-blue-50 rounded-2xl p-4 mx-1">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                  <Timer size={16} color="#3B82F6" />
                </View>
              </View>
              <Text className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Duration
              </Text>
              <Text className="text-blue-900 text-lg font-bold" numberOfLines={1}>
                {currentWeeklyPlan.total_duration_minutes}min
              </Text>
            </View>

            <View className="flex-1 bg-orange-50 rounded-2xl p-4 ml-2">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                  <Flame size={16} color="#F59E0B" />
                </View>
              </View>
              <Text className="text-orange-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Calories
              </Text>
              <Text className="text-orange-900 text-lg font-bold" numberOfLines={1}>
                {currentWeeklyPlan.estimated_calories}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Generate New Plan Button - Only show on last day of current plan */}
      {shouldShowGenerateButton() && (
        <TouchableOpacity
          onPress={handleGeneratePlan}
          disabled={generateWeeklyPlan.isPending}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: generateWeeklyPlan.isPending ? '#9CA3AF' : '#8B5CF6',
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Sparkles size={20} color="white" />
                <Text className="text-lg font-bold ml-3" style={{ color: '#FFFFFF' }}>
                  {generateWeeklyPlan.isPending
                    ? 'Creating Your Plan...'
                    : 'Generate New Weekly Plan'}
                </Text>
              </View>

              <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {generateWeeklyPlan.isPending
                  ? 'We are creating your personalized workout plan...'
                  : 'Get a personalized 7-day workout plan tailored to your goals, cycle phase, and fitness level'}
              </Text>
            </View>

            <View className="ml-4">
              {generateWeeklyPlan.isPending ? (
                <View className="animate-spin">
                  <Timer size={24} color="white" />
                </View>
              ) : (
                <TrendingUp size={24} color="white" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
