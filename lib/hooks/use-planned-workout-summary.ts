import { useMemo } from 'react';

// Helper function for timezone-safe date formatting
function formatDateString(date: Date): string {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
}

export interface PlannedWorkoutSummary {
  total_minutes: number;
  total_calories: number;
  total_workouts: number;
  completedExercises: number;
  totalExercises: number;
  completionPercentage: number;
  workout_types: { [key: string]: number };
  logged_date: string;
}

export function usePlannedWorkoutSummary(
  currentWeeklyPlan: any,
  selectedDate: Date
): PlannedWorkoutSummary {
  return useMemo(() => {
    if (!currentWeeklyPlan?.plan_data?.days) {
      return {
        total_minutes: 0,
        total_calories: 0,
        total_workouts: 0,
        completedExercises: 0,
        totalExercises: 0,
        completionPercentage: 0,
        workout_types: {},
        logged_date: formatDateString(selectedDate),
      };
    }

    const todayString = formatDateString(selectedDate);
    const todaysWorkout = currentWeeklyPlan.plan_data.days.find(
      (day: any) => day.date === todayString
    );

    if (!todaysWorkout || todaysWorkout.is_rest_day || !todaysWorkout.exercises) {
      return {
        total_minutes: 0,
        total_calories: 0,
        total_workouts: 0,
        completedExercises: 0,
        totalExercises: 0,
        completionPercentage: 0,
        workout_types: {},
        logged_date: formatDateString(selectedDate),
      };
    }

    const exercises = todaysWorkout.exercises;
    const completedExercises = exercises.filter((ex: any) => ex.completed).length;
    const totalExercises = exercises.length;

    // Calculate completed minutes and calories
    const completedMinutes = exercises
      .filter((ex: any) => ex.completed)
      .reduce((sum: number, ex: any) => sum + (ex.duration_minutes || 0), 0);

    const completedCalories = exercises
      .filter((ex: any) => ex.completed)
      .reduce((sum: number, ex: any) => sum + (ex.calories_estimate || 0), 0);

    const completionPercentage =
      totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

    return {
      total_minutes: completedMinutes,
      total_calories: completedCalories,
      total_workouts: completedExercises > 0 ? 1 : 0,
      completedExercises,
      totalExercises,
      completionPercentage,
      workout_types: completedExercises > 0 ? { [todaysWorkout.workout_type]: 1 } : {},
      logged_date: selectedDate.toISOString().split('T')[0],
    };
  }, [currentWeeklyPlan, selectedDate]);
}
