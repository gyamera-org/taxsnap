import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';

export function useExerciseStreak() {
  return useQuery({
    queryKey: queryKeys.logs.exerciseStreak,
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get all dates where user has logged exercises, ordered by date descending
      const { data: loggedDates, error } = await supabase
        .from('exercise_entries')
        .select('logged_date')
        .eq('user_id', user.user.id)
        .order('logged_date', { ascending: false });

      if (error) throw error;

      if (!loggedDates || loggedDates.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastLoggedDate: null };
      }

      // Get unique dates and sort them
      const uniqueDates = [...new Set(loggedDates.map((entry) => entry.logged_date))].sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if user logged today or yesterday (to account for different time zones)
      const mostRecentDate = new Date(uniqueDates[0]);
      mostRecentDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If last log was today or yesterday, start counting streak
      if (daysDiff <= 1) {
        let streakDate = new Date(mostRecentDate);

        for (const dateString of uniqueDates) {
          const logDate = new Date(dateString);
          logDate.setHours(0, 0, 0, 0);

          // Check if this date matches our expected streak date
          if (logDate.getTime() === streakDate.getTime()) {
            currentStreak++;
            // Move to previous day for next iteration
            streakDate.setDate(streakDate.getDate() - 1);
          } else {
            // Streak is broken
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      let previousDate: Date | null = null;

      for (const dateString of uniqueDates.reverse()) {
        // Reverse to go chronologically
        const currentDate = new Date(dateString);
        currentDate.setHours(0, 0, 0, 0);

        if (previousDate === null) {
          tempStreak = 1;
        } else {
          const daysDiff = Math.floor(
            (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 1) {
            // Consecutive day
            tempStreak++;
          } else {
            // Streak broken, check if it was the longest
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }

        previousDate = currentDate;
      }

      // Check final streak
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        currentStreak,
        longestStreak,
        lastLoggedDate: uniqueDates[0] || null,
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (streaks don't change often)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
