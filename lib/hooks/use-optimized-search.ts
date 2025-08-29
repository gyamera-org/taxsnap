import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';
import { useState, useEffect, useMemo } from 'react';
import { DatabaseFood } from './use-food-database';
import { DatabaseExercise } from './use-exercise-database';

// Constants for pagination
const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Custom hook for debounced search input
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Optimized food search with infinite scroll and debouncing
 */
export function useOptimizedFoodSearch(searchQuery: string) {
  const debouncedQuery = useDebounce(searchQuery.trim(), SEARCH_DEBOUNCE_MS);

  return useInfiniteQuery({
    queryKey: [...queryKeys.food.search, debouncedQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from('food_database').select('*').eq('verified', true).range(from, to);

      if (debouncedQuery) {
        // Advanced search with text search ranking
        query = query
          .or(
            `name.ilike.%${debouncedQuery}%,brand.ilike.%${debouncedQuery}%,category.ilike.%${debouncedQuery}%`
          )
          .order('name');
      } else {
        // Default: show popular/recent foods
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: data as DatabaseFood[],
        nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
        hasMore: data.length === ITEMS_PER_PAGE,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    initialPageParam: 0,
  });
}

/**
 * Optimized exercise search with infinite scroll and debouncing
 */
export function useOptimizedExerciseSearch(searchQuery: string) {
  const debouncedQuery = useDebounce(searchQuery.trim(), SEARCH_DEBOUNCE_MS);

  return useInfiniteQuery({
    queryKey: [...queryKeys.exercise.search, debouncedQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('exercise_database')
        .select('*')
        .eq('verified', true)
        .range(from, to);

      if (debouncedQuery) {
        // Advanced search including muscle groups
        query = query
          .or(
            `name.ilike.%${debouncedQuery}%,category.ilike.%${debouncedQuery}%,equipment.ilike.%${debouncedQuery}%,muscle_groups.cs.{${debouncedQuery}}`
          )
          .order('name');
      } else {
        // Default: show popular/recent exercises
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        items: data as DatabaseExercise[],
        nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
        hasMore: data.length === ITEMS_PER_PAGE,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    initialPageParam: 0,
  });
}

/**
 * Optimized category-based food search with pagination
 */
export function useOptimizedFoodsByCategory(category: string) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.food.byCategory, category],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .eq('verified', true)
        .eq('category', category.toLowerCase())
        .order('name')
        .range(from, to);

      if (error) throw error;

      return {
        items: data as DatabaseFood[],
        nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
        hasMore: data.length === ITEMS_PER_PAGE,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!category,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    initialPageParam: 0,
  });
}

/**
 * Optimized exercise category search with pagination
 */
export function useOptimizedExercisesByCategory(category: string) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.exercise.byCategory, category],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('exercise_database')
        .select('*')
        .eq('verified', true)
        .eq('category', category.toLowerCase())
        .order('name')
        .range(from, to);

      if (error) throw error;

      return {
        items: data as DatabaseExercise[],
        nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
        hasMore: data.length === ITEMS_PER_PAGE,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!category,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    initialPageParam: 0,
  });
}

/**
 * Smart popular content cache - small, static data that rarely changes
 */
export function usePopularFoodsCache() {
  return useQuery({
    queryKey: queryKeys.food.popular,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .eq('verified', true)
        .in('category', ['breakfast', 'lunch', 'dinner', 'fruit', 'protein'])
        .order('created_at', { ascending: false })
        .limit(12); // Smaller limit for quick loading

      if (error) throw error;
      return data as DatabaseFood[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
  });
}

/**
 * Smart popular exercises cache
 */
export function usePopularExercisesCache() {
  return useQuery({
    queryKey: queryKeys.exercise.popular,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_database')
        .select('*')
        .eq('verified', true)
        .in('category', ['cardio', 'strength', 'flexibility'])
        .order('created_at', { ascending: false })
        .limit(12); // Smaller limit for quick loading

      if (error) throw error;
      return data as DatabaseExercise[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
  });
}

/**
 * Helper hook to flatten infinite query results
 */
export function useFlattenedResults<T>(infiniteQueryResult: any): T[] {
  return useMemo(() => {
    if (!infiniteQueryResult.data?.pages) return [];
    return infiniteQueryResult.data.pages.flatMap((page: any) => page.items);
  }, [infiniteQueryResult.data]);
}

/**
 * Helper hook for search state management
 */
export function useSearchState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const clearSearch = () => {
    setSearchQuery('');
    setActiveCategory(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    clearSearch,
    hasActiveSearch: searchQuery.trim().length > 0 || activeCategory !== null,
  };
}
