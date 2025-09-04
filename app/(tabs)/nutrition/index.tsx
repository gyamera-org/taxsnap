import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Sparkles } from 'lucide-react-native';
import PageLayout from '@/components/layouts/page-layout';
import { router } from 'expo-router';
import { useDailyNutritionSummary, useNutritionProgress } from '@/lib/hooks/use-nutrition-summary';
import { useNutritionGoals } from '@/lib/hooks/use-nutrition-goals';
import { useFitnessGoals } from '@/lib/hooks/use-fitness-goals';
import { useBodyMeasurements } from '@/lib/hooks/use-weight-tracking';
import { useWaterProgress, useQuickAddWater } from '@/lib/hooks/use-simple-water-tracking';
import { useNutritionStreak } from '@/lib/hooks/use-nutrition-streak';
import { useLoggedDates } from '@/lib/hooks/use-logged-dates';
import { useMealEntriesRealtime } from '@/lib/hooks/use-meal-tracking';
// SubscriptionGuard removed - subscription check happens in main app index

import { CalendarModal } from '@/components/ui/CalendarModal';
import { getLocalDateString } from '@/lib/utils/date-helpers';

import { useMealProcessing } from '@/lib/hooks/use-meal-processing';
import { useDateRange } from '@/lib/hooks/use-date-range';
import { useMealActions } from '@/lib/hooks/use-meal-actions';
import { useMacroData } from '@/lib/hooks/use-macro-data';

import CaloriesSummaryCard from '@/components/nutrition/calories-summary-card';
import MacroBreakdown from '@/components/nutrition/macro-breakdown';
import WaterIntakeCard from '@/components/nutrition/water-intake-card';
import MealsSection from '@/components/nutrition/meals-section';
import StreakDisplay from '@/components/nutrition/streak-display';
import {
  NutritionPageSkeleton,
  StreakDisplaySkeleton,
} from '@/components/nutrition/nutrition-skeleton';
import { EmptyGoalsState } from '@/components/nutrition/empty-goals-state';
import { GenerateMacrosButton } from '@/components/nutrition/generate-macros-button';
import { FoodDetailsModal } from '@/components/nutrition/food-details-modal';

export default function NutritionScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const { startDate, endDate } = useDateRange();
  const {
    viewingMealDetails,
    forceUpdateKey,
    handleMealEdit,
    handleMealSave,
    handleMealDelete,
    handleMealDone,
    handleSavePendingFood,
    handleDiscardPendingFood,
    handleRetryAnalysis,
    setViewingMealDetails,
    forceUpdate,
  } = useMealActions();

  useMealEntriesRealtime(forceUpdate);

  const dateString = getLocalDateString(selectedDate);

  const { data: dailySummary, isLoading: summaryLoading } = useDailyNutritionSummary(dateString);
  const { data: progress, isLoading: progressLoading } = useNutritionProgress(dateString);
  const { data: nutritionGoals, isLoading: goalsLoading } = useNutritionGoals();
  const { data: fitnessGoals, isLoading: fitnessGoalsLoading } = useFitnessGoals();
  const { data: bodyMeasurements, isLoading: bodyMeasurementsLoading } = useBodyMeasurements();
  const { data: streakData, isLoading: streakLoading } = useNutritionStreak();
  const { data: loggedDates = [] } = useLoggedDates(startDate, endDate);

  const waterProgress = useWaterProgress(dateString, nutritionGoals?.water_ml || 2000);
  const quickAddWater = useQuickAddWater();

  const macroData = useMacroData(progress);
  const todaysMeals = useMealProcessing(dailySummary);

  const waterData = {
    consumed: waterProgress.consumed,
    goal: waterProgress.goal,
    glasses: waterProgress.glasses,
    totalGlasses: waterProgress.totalGlasses,
  };

  const isLoading = summaryLoading || progressLoading;

  const goalsDataLoading = goalsLoading || fitnessGoalsLoading || bodyMeasurementsLoading;

  const hasNutritionGoals = !!nutritionGoals;
  const hasFitnessGoals = !!fitnessGoals;
  const hasBodyMeasurements = !!bodyMeasurements;

  const shouldShowEmptyGoalsState = !goalsLoading && !hasNutritionGoals;
  const shouldShowGenerateMacrosButton = !goalsLoading && hasNutritionGoals && !nutritionGoals?.calories;

  const currentStreak = streakData?.currentStreak || 0;

  const handleDateSelect = (date: Date) => {
    if (date.toDateString() === selectedDate.toDateString()) {
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  };

  const hasLoggedFood = (date: Date) => {
    const dayOfMonth = date.getDate();
    return dayOfMonth % 3 === 0 || dayOfMonth % 7 === 0;
  };

  return (
    <PageLayout
      title="Nutrition"
      theme="nutrition"
      selectedDate={selectedDate}
      onDateSelect={handleDateSelect}
      loggedDates={loggedDates}
      btn={
        streakLoading ? (
          <StreakDisplaySkeleton />
        ) : (
          <StreakDisplay
            currentStreak={currentStreak}
            isLoading={streakLoading}
            onAddMealPress={() => router.push('/log-meal')}
          />
        )
      }
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {shouldShowEmptyGoalsState ? (
          <EmptyGoalsState
            hasNutritionGoals={hasNutritionGoals}
            hasFitnessGoals={hasFitnessGoals}
            hasBodyMeasurements={hasBodyMeasurements}
          />
        ) : shouldShowGenerateMacrosButton ? (
          <View className="px-4 py-8">
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: '#fdf2f8' }}
              >
                <Sparkles size={32} color="#ec4899" />
              </View>
              <Text className="text-gray-900 font-semibold text-xl mb-3">Generate Your Macros</Text>
              <Text className="text-gray-500 text-center mb-8 px-4">
                You've completed your profile! Now let's calculate your personalized macro goals to start tracking your nutrition.
              </Text>
              
              <GenerateMacrosButton 
                variant="primary" 
                onGenerationComplete={() => {
                  // Force refresh of nutrition goals
                  forceUpdate();
                }}
              />
            </View>
          </View>
        ) : isLoading || goalsDataLoading ? (
          <NutritionPageSkeleton />
        ) : (
          <>
            <CaloriesSummaryCard
              key={`calories-${forceUpdateKey}`}
              macroData={macroData}
              dailySummary={dailySummary}
              isLoading={isLoading}
            />

            <MacroBreakdown
              key={`macros-${forceUpdateKey}`}
              macroData={macroData}
              isLoading={isLoading}
            />

            <WaterIntakeCard
              waterData={waterData}
              onAddWaterPress={() => router.push('/log-water')}
              onQuickAdd={() => quickAddWater.mutate({ date: dateString })}
            />

            <MealsSection
              key={`meals-${forceUpdateKey}`}
              meals={todaysMeals}
              onAddMealPress={() => router.push('/log-meal')}
              onMealPress={handleMealEdit}
              onSavePendingFood={handleSavePendingFood}
              onDiscardPendingFood={handleDiscardPendingFood}
            />
          </>
        )}
      </ScrollView>

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        hasLoggedData={hasLoggedFood}
        title="Select Date"
      />

      <FoodDetailsModal
        visible={!!viewingMealDetails}
        meal={viewingMealDetails}
        onClose={() => setViewingMealDetails(null)}
        onSave={handleMealSave}
        onDelete={handleMealDelete}
        onDone={handleMealDone}
        onRetry={handleRetryAnalysis}
      />
    </PageLayout>
  );
}

