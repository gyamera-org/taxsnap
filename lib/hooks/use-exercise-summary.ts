import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useExerciseEntries, DailyExerciseSummary } from './use-exercise-tracking';

// Helper function to determine stale time for summary based on date
function getStaleTimeForSummary(date: string): number {
  const selectedDate = new Date(date);
  const today = new Date();
  const todayString =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0');

  if (date < todayString) {
    // Historical summaries: cache for 24 hours
    return 24 * 60 * 60 * 1000;
  } else if (date === todayString) {
    // Today's summary: cache for 15 minutes
    return 15 * 60 * 1000;
  } else {
    // Future summaries: cache for 2 hours
    return 2 * 60 * 60 * 1000;
  }
}

/**
 * Hook to get daily exercise summary
 */
export function useDailyExerciseSummary(date: string) {
  const { data: exerciseEntries, isLoading: entriesLoading } = useExerciseEntries(date);

  return useQuery({
    queryKey: [...queryKeys.logs.dailyExercise, date, exerciseEntries?.length],
    queryFn: async (): Promise<DailyExerciseSummary> => {
      if (!exerciseEntries || exerciseEntries.length === 0) {
        return {
          total_workouts: 0,
          total_minutes: 0,
          total_calories: 0,
          workout_types: {},
          logged_date: date,
        };
      }

      const total_workouts = exerciseEntries.length;
      const total_minutes = exerciseEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
      const total_calories = exerciseEntries.reduce((sum, entry) => sum + entry.calories_burned, 0);

      // Count workout types
      const workout_types: Record<string, number> = {};
      exerciseEntries.forEach((entry) => {
        workout_types[entry.exercise_type] = (workout_types[entry.exercise_type] || 0) + 1;
      });

      const summary = {
        total_workouts,
        total_minutes,
        total_calories,
        workout_types,
        logged_date: date,
      };

      return summary;
    },
    enabled: !entriesLoading,
    staleTime: getStaleTimeForSummary(date),
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to get exercise progress against goals
 */
export function useExerciseProgress(date: string) {
  const { data: dailySummary, isLoading: summaryLoading } = useDailyExerciseSummary(date);

  return useQuery({
    queryKey: [
      ...queryKeys.logs.exerciseProgress,
      date,
      dailySummary?.total_minutes,
      dailySummary?.total_workouts,
    ],
    queryFn: async () => {
      if (!dailySummary) {
        return {
          workouts_progress: 0,
          minutes_progress: 0,
          workouts_target: 4, // Weekly target
          minutes_target: 150, // Weekly target in minutes
          calories_burned_today: 0,
        };
      }

      // These would ideally come from user goals
      const weekly_workouts_target = 4;
      const weekly_minutes_target = 150;

      return {
        workouts_progress: (dailySummary.total_workouts / weekly_workouts_target) * 100,
        minutes_progress: (dailySummary.total_minutes / weekly_minutes_target) * 100,
        workouts_target: weekly_workouts_target,
        minutes_target: weekly_minutes_target,
        calories_burned_today: dailySummary.total_calories,
      };
    },
    enabled: !summaryLoading,
    staleTime: getStaleTimeForSummary(date),
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
