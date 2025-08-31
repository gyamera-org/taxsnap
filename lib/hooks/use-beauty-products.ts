import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';

// Types
export interface UserBeautyProduct {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  category: string;
  product_type: 'skincare' | 'haircare';
  safety_score: number;
  ingredients: string[];
  key_ingredients: Array<{
    name: string;
    type: 'beneficial' | 'harmful' | 'neutral';
    description?: string;
  }>;
  usage_frequency: 'daily' | 'weekly' | '2-3x/week' | 'as_needed';
  cycle_phase_preference: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'any';
  notes?: string;
  is_active: boolean;
  scanned_product_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductUsageLog {
  id: string;
  user_id: string;
  product_id: string;
  date: string;
  used: boolean;
  cycle_phase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  skin_reaction?: 'positive' | 'neutral' | 'negative';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BeautyRecommendation {
  category: string;
  ingredients: string[];
  avoid: string[];
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// Helper function to call the edge function
async function callBeautyProductsFunction(endpoint: string, options?: RequestInit) {
  const method = (options?.method as 'GET' | 'POST' | 'PUT' | 'DELETE') || 'GET';

  if (method === 'GET') {
    // For GET requests, we'll use the same approach but pass params in the endpoint
    const { data, error } = await supabase.functions.invoke('beauty-products-manager', {
      body: { endpoint: endpoint },
      method: 'POST', // Use POST even for reads to pass the endpoint
    });

    if (error) throw error;
    return data;
  } else {
    // For POST/PUT/DELETE requests, pass endpoint in body
    const { data, error } = await supabase.functions.invoke('beauty-products-manager', {
      body: {
        endpoint: endpoint,
        ...(options?.body ? JSON.parse(options.body as string) : {}),
      },
      method,
    });

    if (error) throw error;
    return data;
  }
}

// Query keys for cache management
export const beautyProductsQueryKeys = {
  all: ['beauty-products'] as const,
  products: (type?: string, category?: string) =>
    [...beautyProductsQueryKeys.all, 'products', type, category] as const,
  logs: (productId?: string, startDate?: string, endDate?: string) =>
    [...beautyProductsQueryKeys.all, 'logs', productId, startDate, endDate] as const,
  recommendations: (cyclePhase: string, productType: string) =>
    [...beautyProductsQueryKeys.all, 'recommendations', cyclePhase, productType] as const,
};

// Hooks
export function useBeautyProducts(type?: 'skincare' | 'haircare', category?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: beautyProductsQueryKeys.products(type, category),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (category) params.append('category', category);

      return callBeautyProductsFunction(`products?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up realtime subscription for beauty products
  useEffect(() => {
    const channel = supabase
      .channel('user_beauty_products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_beauty_products',
        },
        (payload) => {
          // Invalidate and refetch the query when data changes
          queryClient.invalidateQueries({
            queryKey: beautyProductsQueryKeys.products(type, category),
          });

          // Show toast for different events
          if (payload.eventType === 'INSERT') {
            const product = payload.new as UserBeautyProduct;
            toast.success('Product added!', {
              description: `${product.name} added to your collection`,
            });
          } else if (payload.eventType === 'DELETE') {
            const product = payload.old as UserBeautyProduct;
            toast.success('Product removed!', {
              description: `${product.name} removed from your collection`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, type, category]);

  return query;
}

export function useSkincareProducts() {
  return useBeautyProducts('skincare');
}

export function useHaircareProducts() {
  return useBeautyProducts('haircare');
}

export function useBeautyRecommendations(cyclePhase: string, productType: 'skincare' | 'haircare') {
  return useQuery({
    queryKey: beautyProductsQueryKeys.recommendations(cyclePhase, productType),
    queryFn: async () => {
      const params = new URLSearchParams({
        cycle_phase: cyclePhase,
        product_type: productType,
      });

      return callBeautyProductsFunction(`recommendations?${params.toString()}`);
    },
    enabled: !!cyclePhase,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useProductUsageLogs(productId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: beautyProductsQueryKeys.logs(productId, startDate, endDate),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId) params.append('product_id', productId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      return callBeautyProductsFunction(`logs?${params.toString()}`);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutations
export function useAddBeautyProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      product: Omit<UserBeautyProduct, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) => {
      return callBeautyProductsFunction('product', {
        method: 'POST',
        body: JSON.stringify(product),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: beautyProductsQueryKeys.all });
      toast.success('Product added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add product', {
        description: error.message,
      });
    },
  });
}

export function useUpdateBeautyProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Partial<UserBeautyProduct> & { id: string }) => {
      return callBeautyProductsFunction('product', {
        method: 'PUT',
        body: JSON.stringify(product),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: beautyProductsQueryKeys.all });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update product', {
        description: error.message,
      });
    },
  });
}

export function useDeleteBeautyProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return callBeautyProductsFunction('product', {
        method: 'DELETE',
        body: JSON.stringify({ id: productId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: beautyProductsQueryKeys.all });
      toast.success('Product removed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove product', {
        description: error.message,
      });
    },
  });
}

export function useLogProductUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      log: Omit<ProductUsageLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) => {
      return callBeautyProductsFunction('log', {
        method: 'POST',
        body: JSON.stringify(log),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: beautyProductsQueryKeys.logs() });
    },
    onError: (error: Error) => {
      toast.error('Failed to log usage', {
        description: error.message,
      });
    },
  });
}

export function useImportScannedProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scannedProductId: string) => {
      return callBeautyProductsFunction('import-scan', {
        method: 'POST',
        body: JSON.stringify({ scanned_product_id: scannedProductId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: beautyProductsQueryKeys.all });
      toast.success('Product imported from scan');
    },
    onError: (error: Error) => {
      toast.error('Failed to import product', {
        description: error.message,
      });
    },
  });
}
