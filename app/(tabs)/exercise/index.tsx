import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

import PageLayout from '@/components/layouts/page-layout';
import { router } from 'expo-router';
import { StreakDisplayWithChat } from '@/components/ui/streak-display-with-chat';
import { getLocalDateString } from '@/lib/utils/date-helpers';

import { ExerciseSummaryCard } from '@/components/exercise/exercise-summary-card';
import { WeeklyPlanDisplay } from '@/components/exercise/weekly-plan-display';
import { WeeklyPlanSectionSkeleton } from '@/components/exercise/exercise-skeleton';
import { useDailyExerciseSummary } from '@/lib/hooks/use-exercise-summary';
import { useExerciseEntries } from '@/lib/hooks/use-exercise-tracking';
import { useExerciseStreak } from '@/lib/hooks/use-exercise-streak';
import { useExerciseLoggedDates } from '@/lib/hooks/use-exercise-logged-dates';
import {
  useGenerateWeeklyExercisePlan,
  useCurrentWeeklyPlan,
} from '@/lib/hooks/use-weekly-exercise-planner';
import { useQueryClient } from '@tanstack/react-query';
import { useExercisePlanData } from '@/lib/hooks/use-exercise-plan-data';

// Import new components
import { WorkoutsSection } from '@/components/exercise/workouts-section';
import { WeeklyPlanSection } from '@/components/exercise/weekly-plan-section';
import { WorkoutFocusSelector } from '@/components/exercise/workout-focus-selector';

export default function ExerciseScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [showFocusSelectorForRegenerate, setShowFocusSelectorForRegenerate] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['exerciseEntries'] });
      queryClient.invalidateQueries({ queryKey: ['dailyExerciseSummary'] });
    }, 5000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const dateString = getLocalDateString(selectedDate);

  const { data: dailySummary, isLoading: summaryLoading } = useDailyExerciseSummary(dateString);
  const { data: exerciseEntries, isLoading: entriesLoading } = useExerciseEntries(dateString);
  const { data: exerciseStreak } = useExerciseStreak();
  const { data: loggedDates } = useExerciseLoggedDates();
  const { data: currentWeeklyPlan } = useCurrentWeeklyPlan();
  const generateWeeklyPlan = useGenerateWeeklyExercisePlan();

  const { planGenerationData, fitnessGoals, bodyMeasurements, currentCyclePhase } =
    useExercisePlanData();

  const isLoading = summaryLoading || entriesLoading;

  const handleDateSelect = (date: Date) => {
    if (date.toDateString() === selectedDate.toDateString()) {
      return;
    }

    // Don't allow future dates - clamp to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);

    if (selectedDay > today) {
      setSelectedDate(today);
    } else {
      setSelectedDate(date);
    }
  };

  const getLoggedDates = (): string[] => {
    return loggedDates || [];
  };

  const handleSavePlan = async (plan: any) => {
    try {
      await generateWeeklyPlan.mutateAsync({
        plan_data: planGenerationData,
        start_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

  const handleRegeneratePlan = async (context: string) => {
    // Show focus selector instead of directly regenerating
    setShowFocusSelectorForRegenerate(true);
  };

  const handleRegenerateFocusConfirm = async (data: { focusAreas: string[]; locations: string[] }) => {
    try {
      const enhancedPlanData = {
        ...planGenerationData,
        focus_areas: data.focusAreas,
        workout_locations: data.locations,
      };

      setShowFocusSelectorForRegenerate(false);

      const result = await generateWeeklyPlan.mutateAsync({
        plan_data: enhancedPlanData,
        start_date: new Date().toISOString(),
      });

      if (result?.plan) {
        setGeneratedPlan(result.plan);
        setShowWeeklyPlan(true);
      }
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
    }
  };

  return (
    <PageLayout
      title="Workouts"
      theme="exercise"
      selectedDate={selectedDate}
      onDateSelect={handleDateSelect}
      loggedDates={getLoggedDates()}
      btn={
        <StreakDisplayWithChat
          currentStreak={exerciseStreak?.currentStreak || 0}
          context="exercise"
          streakColor="#F59E0B"
          buttonColor="#8b5cf6"
        />
      }
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <ExerciseSummaryCard dailySummary={dailySummary} isLoading={isLoading} />

        {isLoading ? (
          <WeeklyPlanSectionSkeleton />
        ) : (
          <WeeklyPlanSection
            fitnessGoals={fitnessGoals}
            bodyMeasurements={bodyMeasurements}
            currentCyclePhase={currentCyclePhase}
            currentWeeklyPlan={currentWeeklyPlan}
            planGenerationData={planGenerationData}
            onShowPlan={(plan) => {
              setGeneratedPlan(plan);
              setShowWeeklyPlan(true);
              queryClient.invalidateQueries({ queryKey: ['weeklyExercisePlans', 'current'] });
            }}
          />
        )}

        <WorkoutsSection
          exerciseEntries={exerciseEntries}
          currentWeeklyPlan={currentWeeklyPlan}
          isLoading={isLoading}
          selectedDate={selectedDate}
          onNavigateToLogExercise={() => router.push(`/log-exercise?date=${getLocalDateString(selectedDate)}`)}
        />
      </ScrollView>

      {generatedPlan && (
        <WeeklyPlanDisplay
          plan={generatedPlan}
          onClose={() => {
            setShowWeeklyPlan(false);
            setGeneratedPlan(null);
          }}
          onSave={handleSavePlan}
          onRegenerate={handleRegeneratePlan}
        />
      )}

      {/* Focus Area Selector for Regeneration */}
      <WorkoutFocusSelector
        visible={showFocusSelectorForRegenerate}
        onClose={() => setShowFocusSelectorForRegenerate(false)}
        onConfirm={handleRegenerateFocusConfirm}
        isGenerating={generateWeeklyPlan.isPending}
      />
    </PageLayout>
  );
}
