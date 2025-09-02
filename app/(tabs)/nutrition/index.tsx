import { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
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

import { CalendarModal } from '@/components/ui/CalendarModal';
import { getLocalDateString } from '@/lib/utils/date-helpers';

import { useMealProcessing } from '@/lib/hooks/use-meal-processing';
import { useDateRange } from '@/lib/hooks/use-date-range';
import { useMealActions } from '@/lib/hooks/use-meal-actions';
import { useMealCleanup } from '@/lib/hooks/use-meal-cleanup';
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
import MealEditModal from '@/components/nutrition/meal-edit-modal';
import { EmptyGoalsState } from '@/components/nutrition/empty-goals-state';
import { AnalyzedFoodModal } from '@/components/food/analyzed-food-modal';

export default function NutritionScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const { startDate, endDate } = useDateRange();
  const {
    editingMeal,
    viewingAnalyzedFood,
    forceUpdateKey,
    handleMealEdit,
    handleMealSave,
    handleMealDelete,
    handleSavePendingFood,
    handleDiscardPendingFood,
    setEditingMeal,
    setViewingAnalyzedFood,
    forceUpdate,
  } = useMealActions();
  const { cleanupStuckAnalyzingMeals } = useMealCleanup();

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
        ) : isLoading || goalsDataLoading ? (
          <NutritionPageSkeleton />
        ) : (
          <>
            <CaloriesSummaryCard
              macroData={macroData}
              dailySummary={dailySummary}
              isLoading={isLoading}
            />

            <MacroBreakdown macroData={macroData} isLoading={isLoading} />

            <WaterIntakeCard
              waterData={waterData}
              onAddWaterPress={() => router.push('/log-water')}
              onQuickAdd={() => quickAddWater.mutate({ date: dateString })}
            />

            {/* Temporary debug button - remove after fixing */}
            {__DEV__ && (
              <TouchableOpacity
                onPress={() => cleanupStuckAnalyzingMeals(dailySummary)}
                className="mx-4 mb-4 bg-red-500 py-3 rounded-xl"
              >
                <Text className="text-white text-center font-medium">
                  🧹 Clean Up Stuck Analyzing Meals
                </Text>
              </TouchableOpacity>
            )}

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

      <MealEditModal
        isVisible={!!editingMeal}
        meal={editingMeal}
        onClose={() => setEditingMeal(null)}
        onSave={handleMealSave}
        onDelete={handleMealDelete}
      />

      <AnalyzedFoodModal
        visible={!!viewingAnalyzedFood}
        meal={viewingAnalyzedFood}
        onClose={() => setViewingAnalyzedFood(null)}
        onEdit={(meal) => {
          setViewingAnalyzedFood(null);
          setEditingMeal(meal);
        }}
        onDelete={handleMealDelete}
        onSave={(updatedMeal) => {
          handleMealSave(updatedMeal.id, {
            food_items: updatedMeal.food_items,
          });
        }}
      />
    </PageLayout>
  );
}
