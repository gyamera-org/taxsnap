import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { queryKeys } from './query-keys';
import type { MealEntry } from '@/lib/types/nutrition-tracking';

interface FoodAnalysisRealtimeHookProps {
  onAnalysisComplete?: (mealEntry: MealEntry) => void;
  onAnalysisFailed?: (mealEntry: MealEntry) => void;
  onAnalysisProgress?: (mealEntry: MealEntry) => void;
}

export function useFoodAnalysisRealtime({
  onAnalysisComplete,
  onAnalysisFailed,
  onAnalysisProgress,
}: FoodAnalysisRealtimeHookProps = {}) {
  const queryClient = useQueryClient();

  const handleRealtimeEvent = useCallback(
    (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      // Only handle meal entry updates for analysis status changes
      if (eventType === 'UPDATE' && newRecord) {
        const mealEntry = newRecord as MealEntry;
        const oldMealEntry = oldRecord as MealEntry;

        // Check if analysis status OR progress changed
        const statusChanged = oldMealEntry.analysis_status !== mealEntry.analysis_status;
        const progressChanged = oldMealEntry.analysis_progress !== mealEntry.analysis_progress;
        const stageChanged = oldMealEntry.analysis_stage !== mealEntry.analysis_stage;

        if (statusChanged || progressChanged || stageChanged) {
          console.log('🔄 Food analysis update:', {
            id: mealEntry.id,
            status_from: oldMealEntry.analysis_status,
            status_to: mealEntry.analysis_status,
            progress_from: oldMealEntry.analysis_progress,
            progress_to: mealEntry.analysis_progress,
            stage_from: oldMealEntry.analysis_stage,
            stage_to: mealEntry.analysis_stage,
          });

          // Invalidate queries to refresh UI
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.logs.mealEntries],
          });
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.logs.dailyNutrition],
          });

          // Handle different status changes
          switch (mealEntry.analysis_status) {
            case 'completed':
              onAnalysisComplete?.(mealEntry);

              // Show success notification with food name
              const foodName = mealEntry.food_items?.[0]?.food?.name || 'Food';
              toast.success('✅ Analysis Complete!', {
                description: `${foodName} has been added to your meals`,
                duration: 4000,
              });
              break;

            case 'failed':
              onAnalysisFailed?.(mealEntry);

              // Show error notification
              toast.error('❌ Analysis Failed', {
                description: 'Unable to analyze your food. Please try again.',
                duration: 5000,
              });
              break;

            case 'analyzing':
              onAnalysisProgress?.(mealEntry);

              // Show progress notification (only once when starting)
              if (oldMealEntry.analysis_status !== 'analyzing') {
                toast.success('🔍 Analyzing Food', {
                  description: 'AI is analyzing your food photo...',
                  duration: 2000,
                });
              }
              break;
          }
        }

        // Also handle progress updates regardless of status change
        if (progressChanged || stageChanged) {
          console.log('📊 Analysis progress updated:', {
            id: mealEntry.id,
            progress: mealEntry.analysis_progress,
            stage: mealEntry.analysis_stage,
            status: mealEntry.analysis_status,
          });

          onAnalysisProgress?.(mealEntry);

          // Immediately update the query data to show progress
          const today = new Date().toISOString().split('T')[0];
          queryClient.setQueryData([...queryKeys.logs.mealEntries, today], (oldData: any) => {
            if (!oldData) return oldData;

            return oldData.map((entry: MealEntry) =>
              entry.id === mealEntry.id
                ? {
                    ...entry,
                    analysis_progress: mealEntry.analysis_progress,
                    analysis_stage: mealEntry.analysis_stage,
                    analysis_status: mealEntry.analysis_status,
                    // If completed, update with full meal data
                    ...(mealEntry.analysis_status === 'completed' && {
                      food_items: mealEntry.food_items,
                      total_calories: mealEntry.total_calories,
                      total_protein: mealEntry.total_protein,
                      total_carbs: mealEntry.total_carbs,
                      total_fat: mealEntry.total_fat,
                      notes: mealEntry.notes,
                      image_url: mealEntry.image_url,
                    }),
                  }
                : entry
            );
          });
        }
      }

      // Handle new analyzing entries
      else if (eventType === 'INSERT' && newRecord?.analysis_status === 'analyzing') {
        const mealEntry = newRecord as MealEntry;
        console.log('🆕 New food analysis started:', mealEntry.id);

        onAnalysisProgress?.(mealEntry);

        // Invalidate queries to show the new analyzing entry
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.logs.mealEntries],
        });
      }
    },
    [queryClient, onAnalysisComplete, onAnalysisFailed, onAnalysisProgress]
  );

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const channelName = `food_analysis_user_${user.id}`;
      console.log('🔄 Setting up realtime subscription for user:', user.id);

      const subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'meal_entries',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('🔄 Meal entry real-time event:', payload.eventType, payload);
            handleRealtimeEvent(payload);
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('🔴 Food analysis realtime subscription error:', err);
          }

          switch (status) {
            case 'SUBSCRIBED':
              console.log('✅ Food analysis realtime subscription active');
              break;
            case 'CHANNEL_ERROR':
              console.error('🔴 Food analysis channel error');
              break;
            case 'TIMED_OUT':
              console.error('🔴 Food analysis subscription timed out');
              break;
            case 'CLOSED':
              console.log('📴 Food analysis subscription closed');
              break;
          }
        });

      return () => {
        subscription.unsubscribe();
      };
    };

    setupRealtimeSubscription();
  }, [handleRealtimeEvent]);

  // Add a polling fallback for analyzing meals to ensure we don't miss updates
  useEffect(() => {
    const pollInterval = useRef<NodeJS.Timeout>();

    const pollAnalyzingMeals = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const today = new Date().toISOString().split('T')[0];
        const { data: analyzingMeals, error } = await supabase
          .from('meal_entries')
          .select('*')
          .eq('user_id', user.user.id)
          .eq('logged_date', today)
          .in('analysis_status', ['analyzing', 'pending'])
          .not('analysis_status', 'is', null);

        if (error) {
          console.error('Failed to poll analyzing meals:', error);
          return;
        }

        if (analyzingMeals && analyzingMeals.length > 0) {
          console.log('📊 Polling found analyzing meals:', analyzingMeals.length);

          // Force refresh the meal entries query
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.logs.mealEntries, today],
          });

          // Continue polling
          pollInterval.current = setTimeout(pollAnalyzingMeals, 2000);
        } else {
          // No more analyzing meals, stop polling
          console.log('✅ No more analyzing meals, stopping poll');
        }
      } catch (error) {
        console.error('Error polling analyzing meals:', error);
      }
    };

    // Start polling when there might be analyzing meals
    pollInterval.current = setTimeout(pollAnalyzingMeals, 3000);

    return () => {
      if (pollInterval.current) {
        clearTimeout(pollInterval.current);
      }
    };
  }, [queryClient]);

  return {
    // Return utility functions for manual progress updates if needed
    updateAnalysisProgress: useCallback(
      async (
        mealEntryId: string,
        progress: number,
        stage?: 'uploading' | 'analyzing' | 'processing' | 'finalizing'
      ) => {
        const { error } = await supabase.rpc('update_meal_analysis_progress', {
          meal_entry_id: mealEntryId,
          progress,
          stage,
        });

        if (error) {
          console.error('Failed to update analysis progress:', error);
        }
      },
      []
    ),

    markAnalysisComplete: useCallback(async (mealEntryId: string) => {
      const { error } = await supabase.rpc('update_meal_analysis_progress', {
        meal_entry_id: mealEntryId,
        status: 'completed',
        progress: 100,
        stage: null,
      });

      if (error) {
        console.error('Failed to mark analysis complete:', error);
      }
    }, []),

    markAnalysisFailed: useCallback(async (mealEntryId: string) => {
      const { error } = await supabase.rpc('update_meal_analysis_progress', {
        meal_entry_id: mealEntryId,
        status: 'failed',
        progress: 0,
        stage: null,
      });

      if (error) {
        console.error('Failed to mark analysis failed:', error);
      }
    }, []),
  };
}
