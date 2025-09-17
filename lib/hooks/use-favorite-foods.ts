import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';

export interface FavoriteFood {
  id: string;
  user_id: string;
  food_name: string;
  category?: string;
  cuisine_type?: string;
  serving_size?: string;
  nutrition_data?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DietaryPreference {
  id: string;
  user_id: string;
  preference_type: 'restriction' | 'cuisine' | 'cooking_style';
  preference_value: string;
  is_active: boolean;
  created_at: string;
}

export interface ExistingIngredient {
  id: string;
  user_id: string;
  ingredient_name: string;
  quantity?: string;
  expiry_date?: string;
  category?: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Query keys
export const favoriteQueryKeys = {
  all: ['favorites'] as const,
  foods: () => [...favoriteQueryKeys.all, 'foods'] as const,
  preferences: () => [...favoriteQueryKeys.all, 'preferences'] as const,
  ingredients: () => [...favoriteQueryKeys.all, 'ingredients'] as const,
};

// Favorite Foods
export function useFavoriteFoods() {
  return useQuery({
    queryKey: favoriteQueryKeys.foods(),
    queryFn: async (): Promise<FavoriteFood[]> => {
      const { data, error } = await supabase
        .from('user_favorite_foods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddFavoriteFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      food_name,
      category,
      cuisine_type,
      serving_size,
      nutrition_data,
    }: {
      food_name: string;
      category?: string;
      cuisine_type?: string;
      serving_size?: string;
      nutrition_data?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
      };
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorite_foods')
        .insert({
          user_id: user.user.id,
          food_name: food_name.trim(),
          category,
          cuisine_type,
          serving_size: serving_size || '1 serving',
          nutrition_data,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.foods() });
    },
    onError: (error: any) => {
      console.error('Error adding favorite food:', error);
      if (error.code === '23505') {
        // Unique constraint violation
        toast.error('This food is already in your favorites');
      } else {
        toast.error('Failed to add favorite food');
      }
    },
  });
}

export function useRemoveFavoriteFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorite_foods')
        .update({ is_active: false })
        .eq('id', foodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.foods() });
    },
    onError: (error: Error) => {
      console.error('Error removing favorite food:', error);
      toast.error('Failed to remove favorite food');
    },
  });
}

// Dietary Preferences
export function useDietaryPreferences() {
  return useQuery({
    queryKey: favoriteQueryKeys.preferences(),
    queryFn: async (): Promise<DietaryPreference[]> => {
      const { data, error } = await supabase
        .from('user_dietary_preferences')
        .select('*')
        .eq('is_active', true)
        .order('preference_type', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateDietaryPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      preferences: {
        type: 'restriction' | 'cuisine' | 'cooking_style';
        values: string[];
      }[]
    ) => {
      // First, deactivate all existing preferences
      await supabase
        .from('user_dietary_preferences')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      // Then insert new preferences
      const inserts = preferences.flatMap((pref) =>
        pref.values.map((value) => ({
          preference_type: pref.type,
          preference_value: value,
          is_active: true,
        }))
      );

      if (inserts.length > 0) {
        const { error } = await supabase.from('user_dietary_preferences').insert(inserts);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.preferences() });
    },
    onError: (error: Error) => {
      console.error('Error updating dietary preferences:', error);
      toast.error('Failed to update preferences');
    },
  });
}

// Existing Ingredients
export function useExistingIngredients() {
  return useQuery({
    queryKey: favoriteQueryKeys.ingredients(),
    queryFn: async (): Promise<ExistingIngredient[]> => {
      const { data, error } = await supabase
        .from('user_existing_ingredients')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter since this changes frequently)
  });
}

export function useAddExistingIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ingredient_name,
      quantity,
      category,
      image_url,
      expiry_date,
    }: {
      ingredient_name: string;
      quantity?: string;
      category?: string;
      image_url?: string;
      expiry_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('user_existing_ingredients')
        .upsert(
          {
            ingredient_name: ingredient_name.trim(),
            quantity,
            category,
            image_url,
            expiry_date,
            is_available: true,
          },
          {
            onConflict: 'user_id, ingredient_name',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.ingredients() });
    },
    onError: (error: Error) => {
      console.error('Error adding ingredient:', error);
      toast.error('Failed to add ingredient');
    },
  });
}

export function useRemoveExistingIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ingredientId: string) => {
      const { error } = await supabase
        .from('user_existing_ingredients')
        .update({ is_available: false })
        .eq('id', ingredientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.ingredients() });
    },
    onError: (error: Error) => {
      console.error('Error removing ingredient:', error);
      toast.error('Failed to remove ingredient');
    },
  });
}

export function useBulkAddIngredients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ingredients: { name: string; category?: string }[]) => {
      const inserts = ingredients.map((ing) => ({
        ingredient_name: ing.name.trim(),
        category: ing.category,
        is_available: true,
      }));

      const { data, error } = await supabase
        .from('user_existing_ingredients')
        .upsert(inserts, {
          onConflict: 'user_id, ingredient_name',
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.ingredients() });
      toast.success('Ingredients added');
    },
    onError: (error: Error) => {
      console.error('Error adding ingredients:', error);
      toast.error('Failed to add ingredients');
    },
  });
}
