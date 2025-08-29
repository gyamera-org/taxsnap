import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Text } from '@/components/ui/text';

import PageLayout from '@/components/layouts/page-layout';
import { router } from 'expo-router';
import {
  Activity,
  Plus,
  Sparkles,
  Calendar,
  Timer,
  Flame,
  Dumbbell,
  TrendingUp,
  Zap,
  Heart,
  CheckCircle,
  Edit3,
  Eye,
  X,
  Save,
  Clock,
  Zap as ZapIcon,
} from 'lucide-react-native';
import WeeklyCalendar from '@/components/nutrition/weekly-calendar';
import { ExerciseSummaryCard } from '@/components/exercise/exercise-summary-card';
import { WeeklyPlanDisplay } from '@/components/exercise/weekly-plan-display';
import {
  CycleAwarePlanSkeleton,
  WeeklyPlanSectionSkeleton,
} from '@/components/exercise/exercise-skeleton';
import { useDailyExerciseSummary } from '@/lib/hooks/use-exercise-summary';
import { usePlannedWorkoutSummary } from '@/lib/hooks/use-planned-workout-summary';
import { useExerciseEntries, useCreateExerciseEntry } from '@/lib/hooks/use-exercise-tracking';
import { useExerciseStreak } from '@/lib/hooks/use-exercise-streak';
import { useExerciseLoggedDates } from '@/lib/hooks/use-exercise-logged-dates';
import { useFitnessGoals } from '@/lib/hooks/use-fitness-goals';
import { useBodyMeasurements } from '@/lib/hooks/use-weight-tracking';
import { useCurrentCyclePhase } from '@/lib/hooks/use-cycle-settings';
import {
  useGenerateWeeklyExercisePlan,
  useCurrentWeeklyPlan,
} from '@/lib/hooks/use-weekly-exercise-planner';
import { useQueryClient } from '@tanstack/react-query';

export default function ExerciseScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const queryClient = useQueryClient();

  // Format date for API calls (avoid timezone issues)
  const dateString =
    selectedDate.getFullYear() +
    '-' +
    String(selectedDate.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(selectedDate.getDate()).padStart(2, '0');

  // Data fetching hooks
  const { data: dailySummary, isLoading: summaryLoading } = useDailyExerciseSummary(dateString);
  const { data: exerciseEntries, isLoading: entriesLoading } = useExerciseEntries(dateString);
  const { data: exerciseStreak } = useExerciseStreak();
  const { data: loggedDates } = useExerciseLoggedDates();
  const { data: fitnessGoals } = useFitnessGoals();
  const { data: bodyMeasurements } = useBodyMeasurements();
  const { data: currentCyclePhase } = useCurrentCyclePhase();
  const { data: currentWeeklyPlan } = useCurrentWeeklyPlan();

  const plannedSummary = usePlannedWorkoutSummary(currentWeeklyPlan, selectedDate);

  const isLoading = summaryLoading || entriesLoading;

  const handleDateSelect = (date: Date) => {
    if (date.toDateString() === selectedDate.toDateString()) {
      return;
    }
    setSelectedDate(date);
  };

  // Get logged dates for calendar indicators
  const getLoggedDates = (): string[] => {
    return loggedDates || [];
  };

  return (
    <PageLayout
      title="Exercise"
      btn={
        <View className="flex-row items-center">
          {/* Streak Display */}
          <View className="flex-row items-center mr-3">
            <View className="w-8 h-8 rounded-full items-center justify-center bg-orange-100 mr-2">
              <Flame size={16} color="#F59E0B" />
            </View>
            <Text className="text-gray-700 text-sm font-semibold">
              {exerciseStreak?.currentStreak || 0}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/log-exercise')}
            className="bg-purple-500 w-10 h-10 rounded-full items-center justify-center"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      }
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Weekly Calendar */}
        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          loggedDates={getLoggedDates()}
          theme="exercise"
        />

        {/* Exercise Summary Card */}
        <ExerciseSummaryCard dailySummary={plannedSummary} isLoading={isLoading} />

        {/* Workout Section */}
        <WorkoutSection
          dailySummary={dailySummary}
          isLoading={isLoading}
          currentWeeklyPlan={currentWeeklyPlan}
          selectedDate={selectedDate}
        />

        {/* Today's Plan Section */}
        {isLoading ? (
          <CycleAwarePlanSkeleton />
        ) : (
          currentCyclePhase && (
            <CycleAwarePlan cyclePhase={currentCyclePhase} fitnessGoals={fitnessGoals} />
          )
        )}

        {/* Weekly Plan Section */}
        {isLoading ? (
          <WeeklyPlanSectionSkeleton />
        ) : (
          <WeeklyPlanSection
            fitnessGoals={fitnessGoals}
            bodyMeasurements={bodyMeasurements}
            currentCyclePhase={currentCyclePhase}
            currentWeeklyPlan={currentWeeklyPlan}
            onShowPlan={(plan) => {
              setGeneratedPlan(plan);
              setShowWeeklyPlan(true);
              // Refresh the current weekly plan data
              queryClient.invalidateQueries({ queryKey: ['weeklyExercisePlans', 'current'] });
            }}
          />
        )}
      </ScrollView>

      {/* Weekly Plan Modal */}
      <Modal visible={showWeeklyPlan} animationType="slide" presentationStyle="pageSheet">
        {generatedPlan && (
          <WeeklyPlanDisplay
            plan={generatedPlan}
            onClose={() => {
              setShowWeeklyPlan(false);
              setGeneratedPlan(null);
            }}
          />
        )}
      </Modal>
    </PageLayout>
  );
}

// Cycle-Aware Plan Component
function CycleAwarePlan({ cyclePhase, fitnessGoals }: { cyclePhase: any; fitnessGoals: any }) {
  const getPhaseColor = () => {
    switch (cyclePhase.phase) {
      case 'menstrual':
        return '#DC2626';
      case 'follicular':
        return '#059669';
      case 'ovulatory':
        return '#F59E0B';
      case 'luteal':
        return '#8B5CF6';
      default:
        return '#8B5CF6';
    }
  };

  const getPhaseEmojis = () => {
    switch (cyclePhase.phase) {
      case 'menstrual':
        return ['🧘‍♀️', '🚶‍♀️', '🛁'];
      case 'follicular':
        return ['💪', '🏃‍♀️', '🏋️‍♀️'];
      case 'ovulatory':
        return ['🔥', '🤸‍♀️', '🏃‍♀️'];
      case 'luteal':
        return ['🧘‍♀️', '🏊‍♀️', '🚴‍♀️'];
      default:
        return ['💪', '🏃‍♀️', '🧘‍♀️'];
    }
  };

  return (
    <View className="mx-4 mb-6">
      <View
        className="rounded-3xl p-6 shadow-lg"
        style={{
          backgroundColor: 'white',
          shadowColor: getPhaseColor(),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center mb-4">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: `${getPhaseColor()}20` }}
          >
            <Calendar size={24} color={getPhaseColor()} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {cyclePhase.name} - Day {cyclePhase.day_in_cycle}
            </Text>
            <Text className="text-sm font-medium" style={{ color: getPhaseColor() }}>
              {cyclePhase.energy_level === 'high'
                ? 'High Energy Period'
                : cyclePhase.energy_level === 'medium'
                  ? 'Moderate Energy'
                  : 'Rest & Recovery'}
            </Text>
          </View>
        </View>

        <Text className="text-gray-700 mb-4 leading-relaxed">
          {cyclePhase.energy_level === 'high'
            ? 'Perfect time for challenging workouts! Your energy and strength are naturally high.'
            : cyclePhase.energy_level === 'medium'
              ? 'Good time for moderate workouts and strength training.'
              : 'Focus on gentle movement and recovery. Listen to your body.'}
        </Text>

        <View className="flex-row gap-3">
          {getPhaseEmojis().map((emoji, index) => (
            <View key={index} className="bg-gray-50 rounded-2xl px-4 py-3 flex-1 items-center">
              <Text className="text-2xl mb-1">{emoji}</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {cyclePhase.recommended_exercises[index] || 'Exercise'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Weekly Plan Section Component
function WeeklyPlanSection({
  fitnessGoals,
  bodyMeasurements,
  currentCyclePhase,
  currentWeeklyPlan,
  onShowPlan,
}: {
  fitnessGoals: any;
  bodyMeasurements: any;
  currentCyclePhase: any;
  currentWeeklyPlan: any;
  onShowPlan: (plan: any) => void;
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
    generateWeeklyPlan.mutate(
      {
        user_id: '', // Will be set by the hook
        fitness_goals: fitnessGoals,
        body_measurements: bodyMeasurements,
        current_cycle_phase: currentCyclePhase,
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
              <Text className="text-purple-900 text-2xl font-bold">
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
              <Text className="text-blue-900 text-2xl font-bold">
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
              <Text className="text-orange-900 text-2xl font-bold">
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
                  ? 'AI is creating your personalized workout plan...'
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

// Workout Component
function WorkoutSection({
  dailySummary,
  isLoading,
  currentWeeklyPlan,
  selectedDate,
}: {
  dailySummary?: any;
  isLoading: boolean;
  currentWeeklyPlan?: any;
  selectedDate: Date;
}) {
  // Get today's workout from weekly plan
  const getTodaysWorkoutFromPlan = () => {
    if (!currentWeeklyPlan?.plan_data?.days) return null;

    const todayString =
      selectedDate.getFullYear() +
      '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(selectedDate.getDate()).padStart(2, '0');
    const todaysWorkout = currentWeeklyPlan.plan_data.days.find(
      (day: any) => day.date === todayString
    );

    return todaysWorkout;
  };

  const getWorkoutTypeDisplay = () => {
    if (!dailySummary?.workout_types || Object.keys(dailySummary.workout_types).length === 0) {
      return [];
    }

    return Object.entries(dailySummary.workout_types).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: count as number,
    }));
  };

  const todaysPlannedWorkout = getTodaysWorkoutFromPlan();

  if (isLoading) {
    return (
      <View className="mx-4 mb-6">
        <View className="h-6 bg-gray-200 rounded w-40 mb-4" />
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          {/* Workout header skeleton */}
          <View className="bg-gray-100 rounded-2xl p-4 mb-4">
            <View className="h-6 bg-gray-200 rounded w-32 mb-2" />
            <View className="h-4 bg-gray-200 rounded w-48" />
          </View>

          {/* Exercise items skeleton */}
          <View className="gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} className="bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="h-4 bg-gray-200 rounded w-24 mb-1" />
                    <View className="h-3 bg-gray-200 rounded w-16" />
                  </View>
                  <View className="h-6 w-6 bg-gray-200 rounded" />
                </View>
              </View>
            ))}
          </View>

          {/* Log Exercise button skeleton */}
          <View className="h-12 bg-gray-200 rounded-2xl" />
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {selectedDate.toDateString() === new Date().toDateString()
          ? "Today's Workout"
          : `${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Workout`}
      </Text>

      {todaysPlannedWorkout ? (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 w-full">
          {todaysPlannedWorkout.is_rest_day ? (
            <View className="items-center">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-3">
                <Heart size={24} color="#10B981" />
              </View>
              <Text className="text-green-700 text-lg font-semibold mb-2">Rest Day</Text>
              <Text className="text-gray-600 text-center">
                Take a break and let your body recover
              </Text>
            </View>
          ) : (
            <View className="w-full">
              {/* Today's Time Display */}
              <View className="bg-purple-50 rounded-2xl p-4 mb-4 w-full">
                <Text className="text-purple-900 text-xl font-bold">
                  {todaysPlannedWorkout.workout_type}
                </Text>
                <Text className="text-purple-700 text-sm mt-1">
                  {todaysPlannedWorkout.exercises?.length || 0} exercises •{' '}
                  {todaysPlannedWorkout.duration_minutes} min total
                </Text>
              </View>

              {/* Planned Workout Array */}
              <View className="flex-col w-full">
                {todaysPlannedWorkout.exercises?.length > 0 && (
                  <View style={{ gap: 8, marginBottom: 16 }}>
                    {todaysPlannedWorkout.exercises.map((exercise: any, index: number) => (
                      <PlannedExerciseItem
                        key={index}
                        exercise={exercise}
                        planId={currentWeeklyPlan?.id || ''}
                        selectedDate={selectedDate}
                      />
                    ))}
                  </View>
                )}

                {/* Add More Workout Button */}
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/logger')}
                  className="bg-purple-500 py-4 rounded-2xl w-full"
                >
                  <Text className="text-white font-semibold text-center">Log Exercise</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <Text className="text-gray-500 text-center text-lg font-medium">--</Text>
          <Text className="text-gray-400 text-center text-sm mt-1">
            No planned workout for this day
          </Text>
        </View>
      )}
    </View>
  );
}

// Planned Exercise Item Component
function PlannedExerciseItem({
  exercise,
  planId,
  selectedDate,
}: {
  exercise: any;
  planId: string;
  selectedDate: Date;
}) {
  const [isCompleted, setIsCompleted] = useState(exercise.completed || false);

  // Update completion state when exercise data changes
  React.useEffect(() => {
    setIsCompleted(exercise.completed || false);
  }, [exercise.completed]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    duration_minutes: exercise.duration_minutes.toString(),
    calories_estimate: (exercise.calories_estimate || 0).toString(),
  });

  const createExerciseEntry = useCreateExerciseEntry();

  const handleMarkDone = () => {
    // Prepare exercise data for logging
    const exerciseData = {
      exercise_name: exercise.name,
      exercise_type: exercise.category || 'General',
      duration_minutes: parseInt(editData.duration_minutes) || exercise.duration_minutes,
      calories_burned: parseInt(editData.calories_estimate) || exercise.calories_estimate || 0,
      intensity: 'moderate' as const,
      notes: `Completed from weekly plan: ${exercise.instructions}`,
      logged_date:
        new Date().getFullYear() +
        '-' +
        String(new Date().getMonth() + 1).padStart(2, '0') +
        '-' +
        String(new Date().getDate()).padStart(2, '0'),
      logged_time: new Date().toTimeString().split(' ')[0],
    };

    // Log the exercise directly to the database
    createExerciseEntry.mutate(exerciseData, {
      onSuccess: () => {
        setIsCompleted(true);
        // Mark the exercise as completed in the plan data locally
        exercise.completed = true;
      },
      onError: (error) => {
        console.error('Failed to log exercise:', error);
        Alert.alert('Error', 'Failed to log exercise. Please try again.');
      },
    });
  };

  const handleSaveEdit = () => {
    const duration = parseInt(editData.duration_minutes);
    const calories = parseInt(editData.calories_estimate);

    if (duration < 1 || duration > 180) {
      Alert.alert('Invalid Duration', 'Duration must be between 1 and 180 minutes');
      return;
    }

    if (calories < 0 || calories > 1000) {
      Alert.alert('Invalid Calories', 'Calories must be between 0 and 1000');
      return;
    }

    // Update the exercise data locally
    exercise.duration_minutes = duration;
    exercise.calories_estimate = calories;

    setShowEditModal(false);
    Alert.alert('Updated!', 'Exercise details have been updated');
  };

  return (
    <>
      <View
        className={`rounded-2xl border shadow-sm ${
          isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
        }`}
      >
        {/* Exercise Info */}
        <View className="p-4">
          {/* Exercise Name & Type */}
          <View className="flex-row items-start justify-between mb-3">
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text
                className={`text-lg font-bold ${
                  isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                }`}
                numberOfLines={1}
              >
                {exercise.name}
              </Text>
              <Text className="text-purple-600 text-sm font-medium" numberOfLines={1}>
                {exercise.category || 'Exercise'}
              </Text>
            </View>

            {/* Status Badge */}
            {isCompleted && (
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-800 text-xs font-semibold">Completed</Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center" style={{ gap: 16 }}>
            <View className="flex-row items-center">
              <Clock size={14} color="#8B5CF6" />
              <Text className="text-gray-700 text-sm font-medium ml-1">
                {exercise.duration_minutes} min
              </Text>
            </View>
            {exercise.calories_estimate > 0 && (
              <View className="flex-row items-center">
                <Flame size={14} color="#F59E0B" />
                <Text className="text-gray-700 text-sm font-medium ml-1">
                  {exercise.calories_estimate} cal
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center" style={{ gap: 12 }}>
            {!isCompleted && (
              <>
                {/* View Details Button */}
                <TouchableOpacity
                  onPress={() => setShowViewModal(true)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                >
                  <Eye size={16} color="#6B7280" />
                  <Text className="text-gray-700 font-medium ml-2">View</Text>
                </TouchableOpacity>

                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => setShowEditModal(true)}
                  className="flex-1 bg-blue-50 py-3 rounded-xl flex-row items-center justify-center"
                >
                  <Edit3 size={16} color="#3B82F6" />
                  <Text className="text-blue-600 font-medium ml-2">Edit</Text>
                </TouchableOpacity>

                {/* Mark Done Button */}
                <TouchableOpacity
                  onPress={handleMarkDone}
                  disabled={createExerciseEntry.isPending}
                  className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                    createExerciseEntry.isPending ? 'bg-gray-400' : 'bg-purple-500'
                  }`}
                >
                  <CheckCircle size={16} color="white" />
                  <Text className="text-white font-medium ml-2">
                    {createExerciseEntry.isPending ? 'Logging...' : 'Done'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {isCompleted && (
              <View className="flex-1 bg-green-100 py-3 rounded-xl flex-row items-center justify-center">
                <CheckCircle size={16} color="#10B981" />
                <Text className="text-green-700 font-medium ml-2">Completed</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* View Details Modal */}
      <Modal visible={showViewModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Exercise Details</Text>
              <TouchableOpacity onPress={() => setShowViewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="bg-purple-50 rounded-2xl p-4 mb-4">
                <Text className="text-purple-900 text-lg font-bold">{exercise.name}</Text>
                <Text className="text-purple-700 text-sm mt-1">{exercise.category}</Text>
              </View>

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1 bg-gray-50 rounded-xl p-3">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">Duration</Text>
                  <Text className="text-gray-900 text-lg font-bold">
                    {exercise.duration_minutes} min
                  </Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-xl p-3">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">Calories</Text>
                  <Text className="text-gray-900 text-lg font-bold">
                    {exercise.calories_estimate || 0}
                  </Text>
                </View>
              </View>

              {exercise.instructions && (
                <View className="bg-blue-50 rounded-xl p-4">
                  <Text className="text-blue-900 font-semibold mb-2">Instructions</Text>
                  <Text className="text-blue-800 leading-relaxed">{exercise.instructions}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Edit Exercise</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Duration (minutes)</Text>
              <TextInput
                value={editData.duration_minutes}
                onChangeText={(text) => setEditData({ ...editData, duration_minutes: text })}
                placeholder="Enter duration"
                keyboardType="numeric"
                className="bg-gray-50 rounded-xl p-4 text-gray-900 text-lg"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Estimated Calories</Text>
              <TextInput
                value={editData.calories_estimate}
                onChangeText={(text) => setEditData({ ...editData, calories_estimate: text })}
                placeholder="Enter calories"
                keyboardType="numeric"
                className="bg-gray-50 rounded-xl p-4 text-gray-900 text-lg"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="flex-1 bg-purple-500 py-4 rounded-xl flex-row items-center justify-center"
              >
                <Save size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
