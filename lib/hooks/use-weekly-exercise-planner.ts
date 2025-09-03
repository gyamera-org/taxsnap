import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';

export interface WeeklyExercisePlan {
  id?: string;
  user_id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  total_duration_minutes: number;
  estimated_calories: number;
  plan_data: {
    plan_name: string;
    total_duration_week: number;
    plan_description: string;
    days: WeeklyPlanDay[];
    weekly_goals: {
      total_workouts: number;
      total_minutes: number;
      estimated_calories: number;
      focus_areas: string[];
    };
    progression_notes: string;
    safety_reminders: string[];
  };
  is_active: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyPlanDay {
  date: string;
  day_name: string;
  is_rest_day: boolean;
  workout_type: string;
  duration_minutes: number;
  intensity: 'low' | 'moderate' | 'high';
  exercises: WeeklyPlanExercise[];
  rest_day_activities?: string[];
  cycle_considerations: string;
  daily_tips: string[];
}

export interface WeeklyPlanExercise {
  name: string;
  category: string;
  duration_minutes: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  calories_estimate: number;
  instructions: string;
}

export interface GenerateWeeklyPlanData {
  plan_data: any;
  start_date?: string;
}

// Generate weekly exercise plan using edge function
export function useGenerateWeeklyExercisePlan() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, GenerateWeeklyPlanData>({
    mutationFn: async (data) => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error('❌ No session for plan generation');
        throw new Error('Not authenticated');
      }


      const requestBody = {
        user_id: session.user.id,
        plan_data: data.plan_data,
        start_date: data.start_date || new Date().toISOString(),
      };


      const response = await supabase.functions.invoke('ai-weekly-exercise-planner', {
        body: requestBody,
      });

      if (response.error) {
        console.error('❌ [CLIENT] Function error:', response.error);
        throw new Error(response.error.message || 'Failed to generate weekly plan');
      }

      return response.data;
    },
    onSuccess: async () => {

      // Invalidate all weekly plan queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: queryKeys.logs.weeklyExercisePlans });

      // Force refresh the latest and current plan queries
      await queryClient.refetchQueries({
        queryKey: [...queryKeys.logs.weeklyExercisePlans, 'latest'],
      });
      await queryClient.refetchQueries({
        queryKey: [...queryKeys.logs.weeklyExercisePlans, 'current'],
      });

    },
  });
}

// Get user's weekly exercise plans
export function useWeeklyExercisePlans() {
  return useQuery<WeeklyExercisePlan[], Error>({
    queryKey: queryKeys.logs.weeklyExercisePlans,
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('weekly_exercise_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Get most recently created weekly plan (for newly generated plans)
export function useLatestWeeklyPlan() {
  return useQuery<WeeklyExercisePlan | null, Error>({
    queryKey: [...queryKeys.logs.weeklyExercisePlans, 'latest'],
    queryFn: async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found for latest weekly plan fetch');
        throw new Error('Not authenticated');
      }


      const { data, error } = await supabase
        .from('weekly_exercise_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching latest weekly plan:', error);
        throw error;
      }

      return data || null;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (short stale time for fresh data)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Get current active weekly plan (improved logic)
export function useCurrentWeeklyPlan() {
  const today = new Date().toISOString().split('T')[0];

  return useQuery<WeeklyExercisePlan | null, Error>({
    queryKey: [...queryKeys.logs.weeklyExercisePlans, 'current', today],
    queryFn: async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No session found for weekly plan fetch');
        throw new Error('Not authenticated');
      }


      // First try to get active plan for today's date range
      let { data, error } = await supabase
        .from('weekly_exercise_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no active plan found for current date, get the most recent active plan
      if (!data && (!error || error.code === 'PGRST116')) {
        const { data: recentData, error: recentError } = await supabase
          .from('weekly_exercise_plans')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        data = recentData;
        error = recentError;
      }

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching weekly plan:', error);
        throw error;
      }

      return data || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Update weekly plan completion status
export function useUpdateWeeklyPlanStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    WeeklyExercisePlan,
    Error,
    { planId: string; completed?: boolean; isActive?: boolean }
  >({
    mutationFn: async ({ planId, completed, isActive }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (completed !== undefined) updates.completed = completed;
      if (isActive !== undefined) updates.is_active = isActive;

      const { data, error } = await supabase
        .from('weekly_exercise_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyExercisePlans'] });
      queryClient.invalidateQueries({ queryKey: ['currentWeeklyPlan'] });
    },
  });
}

// Auto-generate weekly plan for current user
export function useAutoGenerateWeeklyPlan() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { triggerType?: 'on-demand' | 'user-specific' }>({
    mutationFn: async ({ triggerType = 'user-specific' }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke(
        `auto-weekly-exercise-planner?trigger=${triggerType}&user_id=${session.user.id}`,
        {
          method: 'GET',
        }
      );

      if (response.error) {
        throw new Error(response.error.message || 'Failed to auto-generate weekly plan');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate all exercise plan queries
      queryClient.invalidateQueries({ queryKey: ['weeklyExercisePlans'] });
      queryClient.invalidateQueries({ queryKey: ['currentWeeklyPlan'] });
    },
  });
}

// Check if user needs a weekly plan
export function useCheckNeedsWeeklyPlan() {
  const today = new Date().toISOString().split('T')[0];

  return useQuery<boolean, Error>({
    queryKey: ['needsWeeklyPlan', today],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return false;

      const { data, error } = await supabase.rpc('user_needs_weekly_plan', {
        target_user_id: session.user.id,
        target_date: today,
      });

      if (error) {
        console.error('Error checking if user needs plan:', error);
        return false;
      }

      return data || false;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });
}

// Mark a planned exercise as completed
export function useMarkPlannedExerciseCompleted() {
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    Error,
    { planId: string; exerciseName: string; exerciseDate: string }
  >({
    mutationFn: async ({ planId, exerciseName, exerciseDate }) => {
      const { data, error } = await supabase.rpc('mark_planned_exercise_completed', {
        plan_id_param: planId,
        exercise_name_param: exerciseName,
        exercise_date_param: exerciseDate,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyExercisePlans'] });
      queryClient.invalidateQueries({ queryKey: ['currentWeeklyPlan'] });
    },
  });
}
