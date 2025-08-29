import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from './query-keys';

export interface DatabaseFood {
  id: string;
  name: string;
  brand?: string;
  category: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium_mg: number;
  source: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to search foods in the community database
 */
export function useFoodSearch(searchQuery: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.food.search, searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        // Return recent/popular foods when no search query
        const { data, error } = await supabase
          .from('food_database')
          .select('*')
          .eq('verified', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return data as DatabaseFood[];
      }

      // Search by name, brand, or category
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .eq('verified', true)
        .or(
          `name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
        )
        .order('name')
        .limit(50);

      if (error) throw error;
      return data as DatabaseFood[];
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get foods by category
 */
export function useFoodsByCategory(category: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.food.byCategory, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .eq('verified', true)
        .eq('category', category.toLowerCase())
        .order('name')
        .limit(30);

      if (error) throw error;
      return data as DatabaseFood[];
    },
    enabled: enabled && !!category,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to get popular/featured foods
 */
export function usePopularFoods() {
  return useQuery({
    queryKey: queryKeys.food.popular,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .eq('verified', true)
        .in('category', ['breakfast', 'lunch', 'dinner', 'fruit', 'protein'])
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      return data as DatabaseFood[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

/**
 * Convert DatabaseFood to FoodItem format for backward compatibility
 */
export function convertToFoodItem(dbFood: DatabaseFood) {
  return {
    id: dbFood.id,
    name: dbFood.name,
    brand: dbFood.brand || undefined,
    category: dbFood.category,
    servingSize: dbFood.serving_size,
    nutrition: {
      calories: dbFood.calories,
      protein: dbFood.protein,
      carbs: dbFood.carbs,
      fat: dbFood.fat,
      fiber: dbFood.fiber,
      sugar: dbFood.sugar,
    },
  };
}
