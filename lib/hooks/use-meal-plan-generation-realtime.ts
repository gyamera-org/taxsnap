import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { queryKeys } from './query-keys';

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, any> | null;
  old: Record<string, any> | null;
}

interface MealPlanGenerationRealtimeHookProps {
  onGenerationComplete?: (mealPlan: any) => void;
  onGenerationFailed?: (mealPlan: any) => void;
  onGenerationProgress?: (mealPlan: any) => void;
}

export function useMealPlanGenerationRealtime({
  onGenerationComplete,
  onGenerationFailed,
  onGenerationProgress,
}: MealPlanGenerationRealtimeHookProps = {}) {
  const queryClient = useQueryClient();
  const pollIntervalRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastToastShownRef = useRef<{ [key: string]: number }>({});

  const handleRealtimeEvent = useCallback(
    (payload: RealtimePayload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      // Handle meal plan updates for generation status changes
      if (eventType === 'UPDATE' && newRecord) {
        const mealPlan = newRecord;
        const oldMealPlan = oldRecord;

        // Check if generation status OR progress changed
        const statusChanged = oldMealPlan?.generation_status !== mealPlan?.generation_status;
        const progressChanged = oldMealPlan?.generation_progress !== mealPlan?.generation_progress;
        const stageChanged = oldMealPlan?.generation_stage !== mealPlan?.generation_stage;

        if (statusChanged || progressChanged || stageChanged) {
          // Invalidate queries to refresh UI
          queryClient.invalidateQueries({
            queryKey: queryKeys.nutrition.mealPlans,
          });

          // Handle different status changes
          switch (mealPlan.generation_status) {
            case 'completed':
              onGenerationComplete?.(mealPlan);

              // Deduplicate toast notifications (prevent showing same toast within 10 seconds)
              const completedKey = `completed_${mealPlan.id}`;
              const now = Date.now();
              const lastShown = lastToastShownRef.current[completedKey] || 0;

              if (now - lastShown > 10000) {
                // 10 seconds
                lastToastShownRef.current[completedKey] = now;
                toast.success('🍽️ Meal plan ready!', {
                  description: 'Your personalized meal plan and grocery list have been generated.',
                  duration: 5000,
                });
              }
              break;

            case 'failed':
              onGenerationFailed?.(mealPlan);

              // Deduplicate failed toast notifications
              const failedKey = `failed_${mealPlan.id}`;
              const failedNow = Date.now();
              const failedLastShown = lastToastShownRef.current[failedKey] || 0;

              if (failedNow - failedLastShown > 10000) {
                // 10 seconds
                lastToastShownRef.current[failedKey] = failedNow;
                toast.error('❌ Failed to generate meal plan', {
                  description: 'There was an error generating your meal plan. Please try again.',
                  duration: 8000,
                });
              }
              break;

            case 'generating':
              onGenerationProgress?.(mealPlan);
              break;
          }
        }

        // Also handle progress updates regardless of status change
        if (progressChanged || stageChanged) {
          onGenerationProgress?.(mealPlan);

          // Immediately update the query data to show progress
          queryClient.setQueryData(queryKeys.nutrition.mealPlans, (oldData: any) => {
            if (!oldData) return oldData;

            return oldData.map((plan: any) =>
              plan.id === mealPlan.id
                ? {
                    ...plan,
                    generation_progress: mealPlan.generation_progress,
                    generation_stage: mealPlan.generation_stage,
                    generation_status: mealPlan.generation_status,
                    // If completed, update with full plan data
                    ...(mealPlan.generation_status === 'completed' && {
                      meals_data: mealPlan.meals_data,
                      grocery_list: mealPlan.grocery_list,
                      estimated_cost: mealPlan.estimated_cost,
                      nutrition_summary: mealPlan.nutrition_summary,
                    }),
                  }
                : plan
            );
          });
        }
      }

      // Handle new generating entries
      else if (eventType === 'INSERT' && newRecord?.generation_status === 'generating') {
        const mealPlan = newRecord;

        onGenerationProgress?.(mealPlan);

        // Invalidate queries to show the new generating entry
        queryClient.invalidateQueries({
          queryKey: queryKeys.nutrition.mealPlans,
        });
      }
    },
    [queryClient, onGenerationComplete, onGenerationFailed, onGenerationProgress]
  );

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const channelName = `meal_plan_generation_user_${user.id}`;

      const subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'meal_plans',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            handleRealtimeEvent(payload);
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('🔴 Meal plan generation realtime subscription error:', err);
          }

          switch (status) {
            case 'SUBSCRIBED':
              break;
            case 'CHANNEL_ERROR':
              console.error('🔴 Meal plan generation channel error');
              break;
            case 'TIMED_OUT':
              console.error('🔴 Meal plan generation subscription timed out');
              break;
            case 'CLOSED':
              break;
          }
        });

      return () => {
        subscription.unsubscribe();
      };
    };

    setupRealtimeSubscription();
  }, [handleRealtimeEvent]);

  // Add a polling fallback for generating meal plans to ensure we don't miss updates
  useEffect(() => {
    const pollGeneratingPlans = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data: generatingPlans, error } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', user.user.id)
          .in('generation_status', ['generating', 'pending'])
          .not('generation_status', 'is', null);

        if (error) {
          console.error('Failed to poll generating meal plans:', error);
          return;
        }

        if (generatingPlans && generatingPlans.length > 0) {
          // Force refresh the meal plans query
          queryClient.invalidateQueries({
            queryKey: queryKeys.nutrition.mealPlans,
          });

          // Continue polling more frequently for generating plans
          pollIntervalRef.current = setTimeout(pollGeneratingPlans, 1000);
        } else {
          // No more generating plans, stop polling
        }
      } catch (error) {
        console.error('Error polling generating meal plans:', error);
      }
    };

    // Start polling immediately when there might be generating plans
    pollIntervalRef.current = setTimeout(pollGeneratingPlans, 500);

    return () => {
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
      }
    };
  }, [queryClient]);

  return {
    // Return utility functions for manual progress updates if needed
    updateGenerationProgress: useCallback(
      async (
        mealPlanId: string,
        progress: number,
        stage?: 'planning' | 'generating' | 'finalizing'
      ) => {
        const { error } = await supabase.rpc('update_meal_plan_generation_progress', {
          meal_plan_id: mealPlanId,
          progress,
          stage,
        });

        if (error) {
          console.error('Failed to update generation progress:', error);
        }
      },
      []
    ),

    markGenerationComplete: useCallback(async (mealPlanId: string) => {
      const { error } = await supabase.rpc('update_meal_plan_generation_progress', {
        meal_plan_id: mealPlanId,
        status: 'completed',
        progress: 100,
        stage: null,
      });

      if (error) {
        console.error('Failed to mark generation complete:', error);
      }
    }, []),

    markGenerationFailed: useCallback(async (mealPlanId: string) => {
      const { error } = await supabase.rpc('update_meal_plan_generation_progress', {
        meal_plan_id: mealPlanId,
        status: 'failed',
        progress: 0,
        stage: null,
      });

      if (error) {
        console.error('Failed to mark generation failed:', error);
      }
    }, []),
  };
}
