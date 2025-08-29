import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';

export interface DatabaseExercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string;
  difficulty: string;
  instructions: string;
  calories_per_minute: number;
  source: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to search exercises in the community database
 */
export function useExerciseSearch(searchQuery: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.exercise.search, searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        // Return popular exercises when no search query
        const { data, error } = await supabase
          .from('exercise_database')
          .select('*')
          .eq('verified', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return data as DatabaseExercise[];
      }

      // Search by name, category, muscle groups, or equipment
      const { data, error } = await supabase
        .from('exercise_database')
        .select('*')
        .eq('verified', true)
        .or(
          `name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,equipment.ilike.%${searchQuery}%`
        )
        .order('name')
        .limit(50);

      if (error) throw error;
      return data as DatabaseExercise[];
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get exercises by category
 */
export function useExercisesByCategory(category: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.exercise.byCategory, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_database')
        .select('*')
        .eq('verified', true)
        .eq('category', category.toLowerCase())
        .order('name')
        .limit(30);

      if (error) throw error;
      return data as DatabaseExercise[];
    },
    enabled: enabled && !!category,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to get exercises by muscle group
 */
export function useExercisesByMuscleGroup(muscleGroup: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.exercise.byMuscleGroup, muscleGroup],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_database')
        .select('*')
        .eq('verified', true)
        .contains('muscle_groups', [muscleGroup])
        .order('name')
        .limit(30);

      if (error) throw error;
      return data as DatabaseExercise[];
    },
    enabled: enabled && !!muscleGroup,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to get popular/featured exercises
 */
export function usePopularExercises() {
  return useQuery({
    queryKey: queryKeys.exercise.popular,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_database')
        .select('*')
        .eq('verified', true)
        .in('category', ['cardio', 'strength', 'flexibility', 'sports'])
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      return data as DatabaseExercise[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

/**
 * Hook to get exercises by equipment
 */
export function useExercisesByEquipment(equipment: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.exercise.byEquipment, equipment],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_database')
        .select('*')
        .eq('verified', true)
        .eq('equipment', equipment.toLowerCase())
        .order('name')
        .limit(30);

      if (error) throw error;
      return data as DatabaseExercise[];
    },
    enabled: enabled && !!equipment,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Convert DatabaseExercise to Exercise format for backward compatibility
 */
export function convertToExercise(dbExercise: DatabaseExercise) {
  return {
    id: dbExercise.id,
    name: dbExercise.name,
    category: dbExercise.category,
    icon: getExerciseIcon(dbExercise.category, dbExercise.name),
    color: getExerciseColor(dbExercise.category),
    metrics: getExerciseMetrics(dbExercise.category, dbExercise.name),
    description: dbExercise.instructions,
    muscleGroups: dbExercise.muscle_groups,
    equipment: dbExercise.equipment,
    difficulty: dbExercise.difficulty,
    caloriesPerMinute: dbExercise.calories_per_minute,
  };
}

// Helper functions for backward compatibility
function getExerciseIcon(category: string, name: string): string {
  const nameL = name.toLowerCase();

  if (nameL.includes('running') || nameL.includes('sprint')) return 'Footprints';
  if (nameL.includes('cycling') || nameL.includes('bike')) return 'Bike';
  if (nameL.includes('swimming')) return 'Waves';
  if (nameL.includes('yoga')) return 'User';
  if (nameL.includes('weight') || nameL.includes('dumbbell')) return 'Dumbbell';
  if (nameL.includes('pushup') || nameL.includes('push-up')) return 'User';

  // Category defaults
  switch (category.toLowerCase()) {
    case 'cardio':
      return 'Heart';
    case 'strength':
      return 'Dumbbell';
    case 'flexibility':
      return 'User';
    case 'sports':
      return 'Trophy';
    case 'balance':
      return 'User';
    default:
      return 'Activity';
  }
}

function getExerciseColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'cardio':
      return '#3B82F6';
    case 'strength':
      return '#EF4444';
    case 'flexibility':
      return '#10B981';
    case 'sports':
      return '#F59E0B';
    case 'balance':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
}

function getExerciseMetrics(category: string, name: string) {
  const nameL = name.toLowerCase();

  // Distance-based exercises
  if (nameL.includes('running') || nameL.includes('walking') || nameL.includes('cycling')) {
    return {
      primary: 'distance' as const,
      secondary: 'time' as const,
      units: {
        primary: 'km',
        secondary: 'min',
      },
    };
  }

  // Rep-based exercises
  if (
    category.toLowerCase() === 'strength' ||
    nameL.includes('pushup') ||
    nameL.includes('squat')
  ) {
    return {
      primary: 'reps' as const,
      secondary: 'time' as const,
      units: {
        primary: 'reps',
        secondary: 'min',
      },
    };
  }

  // Time-based exercises (default)
  return {
    primary: 'time' as const,
    units: {
      primary: 'min',
    },
  };
}
