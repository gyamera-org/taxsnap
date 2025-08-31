import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import PageLayout from '@/components/layouts/page-layout';
import { router } from 'expo-router';
import { useDailyNutritionSummary, useNutritionProgress } from '@/lib/hooks/use-nutrition-summary';
import { useNutritionGoals } from '@/lib/hooks/use-nutrition-goals';
import { useWaterProgress } from '@/lib/hooks/use-simple-water-tracking';
import { useNutritionStreak } from '@/lib/hooks/use-nutrition-streak';
import { useLoggedDates } from '@/lib/hooks/use-logged-dates';
import { useUpdateMealNutrition } from '@/lib/hooks/use-meal-editing';
import {
  useDeleteMealEntry,
  useCreateMealEntry,
  useMealEntriesRealtime,
} from '@/lib/hooks/use-meal-tracking';

import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';

// Import new components
import WeeklyCalendar from '@/components/nutrition/weekly-calendar';
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

export default function NutritionScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  // Meal editing hooks
  const updateMealNutrition = useUpdateMealNutrition();
  const deleteMealEntry = useDeleteMealEntry();
  const createMealEntry = useCreateMealEntry();

  // Set up real-time subscription for automatic updates
  useMealEntriesRealtime(() => {
    setForceUpdateKey((prev) => {
      const newKey = prev + 1;
      return newKey;
    });
  });

  // Get current date as string for API calls (avoid timezone issues)
  const dateString =
    selectedDate.getFullYear() +
    '-' +
    String(selectedDate.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(selectedDate.getDate()).padStart(2, '0');

  // Calculate date range for weekly calendar (last 5 days + today + next day)
  const getWeekRange = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 5);
    const end = new Date(today);
    end.setDate(today.getDate() + 1);

    const formatDate = (date: Date) =>
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  };

  const { startDate, endDate } = getWeekRange();

  const { data: dailySummary, isLoading: summaryLoading } = useDailyNutritionSummary(dateString);
  const { data: progress, isLoading: progressLoading } = useNutritionProgress(dateString);
  const { data: nutritionGoals, isLoading: goalsLoading } = useNutritionGoals();
  const { data: streakData, isLoading: streakLoading } = useNutritionStreak();
  const { data: loggedDates = [] } = useLoggedDates(startDate, endDate);

  // Get simple water tracking data
  const waterProgress = useWaterProgress(dateString, nutritionGoals?.water_ml || 2000);

  // Use real data if available, otherwise fallback to defaults
  const macroData = progress
    ? {
        calories: {
          consumed: Math.round(progress.calories.consumed),
          target: Math.round(progress.calories.goal),
        },
        protein: {
          consumed: Math.round(progress.protein.consumed),
          target: Math.round(progress.protein.goal),
        },
        carbs: {
          consumed: Math.round(progress.carbs.consumed),
          target: Math.round(progress.carbs.goal),
        },
        fat: { consumed: Math.round(progress.fat.consumed), target: Math.round(progress.fat.goal) },
      }
    : {
        calories: { consumed: 0, target: 0 },
        protein: { consumed: 0, target: 0 },
        carbs: { consumed: 0, target: 0 },
        fat: { consumed: 0, target: 0 },
      };

  const todaysMeals = dailySummary
    ? Object.values(dailySummary.meals_by_type)
        .flat()
        .map((meal) => ({
          id: meal.id,
          type: meal.meal_type,
          name:
            meal.food_items.length > 1
              ? `${meal.food_items[0].food.name} + ${meal.food_items.length - 1} more`
              : meal.food_items[0]?.food.name || 'Mixed meal',
          calories: Math.round(meal.total_calories),
          protein: Math.round(meal.total_protein),
          carbs: Math.round(meal.total_carbs),
          fat: Math.round(meal.total_fat),
          time: meal.logged_time.slice(0, 5), // HH:mm format
          fullTime: meal.logged_time, // Keep full time for sorting
        }))
        .sort((a, b) => b.fullTime.localeCompare(a.fullTime)) // Sort by time descending (latest first)
    : [];

  // Use simple water tracking data
  const waterData = {
    consumed: waterProgress.consumed,
    goal: waterProgress.goal,
    glasses: waterProgress.glasses,
    totalGlasses: waterProgress.totalGlasses,
  };

  // Check if we should show loading state - include all critical loading states
  const isLoading = summaryLoading || progressLoading || goalsLoading;

  // Get current streak value
  const currentStreak = streakData?.currentStreak || 0;

  // Handle date selection - this will automatically update all data
  const handleDateSelect = (date: Date) => {
    // Prevent unnecessary updates if the date is the same
    if (date.toDateString() === selectedDate.toDateString()) {
      return;
    }

    try {
      setSelectedDate(date);
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  };

  // Calendar helper functions
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const hasLoggedFood = (date: Date) => {
    // Simulate some logged days for demo
    const dayOfMonth = date.getDate();
    return dayOfMonth % 3 === 0 || dayOfMonth % 7 === 0;
  };

  // Meal editing handlers
  const handleMealEdit = (meal: any) => {
    setEditingMeal(meal);
  };

  const handleMealSave = async (mealId: string, updates: any) => {
    await updateMealNutrition.mutateAsync({
      mealId,
      nutrition: updates,
    });
  };

  const handleMealDelete = async (mealId: string) => {
    await deleteMealEntry.mutateAsync(mealId);
  };

  return (
    <PageLayout
      title="Nutrition"
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
        {isLoading ? (
          <NutritionPageSkeleton />
        ) : (
          <>
            <WeeklyCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              loggedDates={loggedDates}
            />

            <CaloriesSummaryCard
              macroData={macroData}
              dailySummary={dailySummary}
              isLoading={isLoading}
            />

            <MacroBreakdown macroData={macroData} isLoading={isLoading} />

            <WaterIntakeCard
              waterData={waterData}
              onAddWaterPress={() => router.push('/log-water')}
            />

            <MealsSection
              key={`meals-${forceUpdateKey}`}
              meals={todaysMeals}
              onAddMealPress={() => router.push('/log-meal')}
              onMealPress={handleMealEdit}
            />
          </>
        )}
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2"
              >
                <ChevronLeft size={20} color="#6B7280" />
              </TouchableOpacity>

              <Text className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2"
              >
                <ChevronRight size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Days of Week */}
            <View className="flex-row mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <View key={index} className="flex-1 items-center">
                  <Text className="text-gray-500 text-sm font-medium">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap">
                {generateCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const hasLogs = hasLoggedFood(date);

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      className="w-[14.28%] aspect-square items-center justify-center relative"
                    >
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          isSelected
                            ? 'bg-green-500'
                            : isTodayDate
                              ? 'bg-green-100'
                              : hasLogs && isCurrentMonth
                                ? 'bg-orange-100'
                                : ''
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isCurrentMonth
                              ? isSelected
                                ? 'text-white font-bold'
                                : isTodayDate
                                  ? 'text-green-700 font-bold'
                                  : hasLogs
                                    ? 'text-orange-700 font-medium'
                                    : 'text-gray-900'
                              : 'text-gray-300'
                          }`}
                        >
                          {date.getDate()}
                        </Text>
                      </View>

                      {/* Streak indicator */}
                      {hasLogs && isCurrentMonth && (
                        <View className="absolute bottom-1">
                          <View className="w-1 h-1 bg-green-500 rounded-full" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Legend */}
            <View className="flex-row justify-center mt-4 gap-4">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-1" />
                <Text className="text-xs text-gray-600">Selected</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-100 rounded-full mr-1" />
                <Text className="text-xs text-gray-600">Today</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-orange-100 rounded-full mr-1" />
                <Text className="text-xs text-gray-600">Logged</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Meal Edit Modal */}
      <MealEditModal
        isVisible={!!editingMeal}
        meal={editingMeal}
        onClose={() => setEditingMeal(null)}
        onSave={handleMealSave}
        onDelete={handleMealDelete}
      />
    </PageLayout>
  );
}
