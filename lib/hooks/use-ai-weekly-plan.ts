// React Hook for AI Weekly Plan with Realtime Updates

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';

export interface AIWeeklyPlan {
  plan_id: string;
  user_id: string;
  week_start_date: string;
  exercise_plan: any;
  nutrition_plan: any;
  daily_insights: any[];
  generation_context: any;
  adaptation_history?: any[];
  created_at: string;
  updated_at: string;
}

export function useAIWeeklyPlan() {
  const queryClient = useQueryClient();

  // Set up realtime subscription for plan updates
  useEffect(() => {
    const channel = supabase
      .channel('ai-plans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_weekly_plans',
        },
        (payload) => {
          // Invalidate and refetch the plan
          queryClient.invalidateQueries({ queryKey: ['ai-weekly-plan'] });

          // Show user notification
          if (payload.eventType === 'UPDATE') {
            const adaptations = payload.new?.adaptation_history || [];
            const latestAdaptation = adaptations[adaptations.length - 1];

            if (latestAdaptation) {
              toast.success('Plan Updated', {
                description: `Your plan has been adapted: ${latestAdaptation.reason}`,
                duration: 5000,
              });
            }
          } else if (payload.eventType === 'INSERT') {
            toast.success('New Plan Ready!', {
              description: 'Your AI coach has created your weekly plan',
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['ai-weekly-plan'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const response = await fetch('/api/ai-weekly-planner?action=get_current_plan', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI plan');
      }

      const result = await response.json();
      return result.plan as AIWeeklyPlan;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useGenerateAIWeeklyPlan() {
  const queryClient = useQueryClient();

  return async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Show loading toast
    toast.loading('Generating your AI weekly plan...', { id: 'plan-generation' });

    try {
      const response = await fetch('/api/ai-weekly-planner?action=generate_weekly_plan', {
        method: 'GET', // Changed to GET for simplicity
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI plan');
      }

      const result = await response.json();

      // Success feedback
      toast.success('Your AI weekly plan is ready!', {
        id: 'plan-generation',
        description: 'Plan created based on your cycle and fitness data',
      });

      // Invalidate existing plan to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['ai-weekly-plan'] });

      return result;
    } catch (error) {
      toast.error('Failed to generate plan', {
        id: 'plan-generation',
        description: 'Please try again in a moment',
      });
      throw error;
    }
  };
}

export function useAIDailyInsight(date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['ai-daily-insight', targetDate],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const response = await fetch(
        `/api/ai-weekly-planner?action=generate_daily_insight&date=${targetDate}`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch daily insight');
      }

      const result = await response.json();
      return result.insights;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!targetDate,
  });
}
