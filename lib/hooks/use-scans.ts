import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { queryKeys } from './query-keys';
import { ProductAnalysisResult, ScannedProduct } from '@/lib/types/product';

const PAGE_SIZE = 100;

export function useScansInfinite(filter = 'all', sort = 'newest', search = '') {
  return useInfiniteQuery({
    queryKey: queryKeys.scans.list(filter, sort, search),
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase.rpc('get_scans_for_user', {
        p_limit: PAGE_SIZE,
        p_offset: pageParam,
        p_filter: filter,
        p_sort: sort,
        p_search: search,
      });
      if (error) throw error;
      return data as ScannedProduct[];
    },
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length < PAGE_SIZE ? undefined : all.flat().length),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (scanId: string) => {
      const { data, error } = await supabase.rpc('toggle_favorite', {
        p_scan_id: scanId,
      });
      if (error) throw error;
      return data as boolean;
    },
    onSuccess: (_, scanId) => {
      qc.invalidateQueries({ queryKey: queryKeys.scans.all });
      qc.invalidateQueries({ queryKey: queryKeys.favorites.all });
      qc.invalidateQueries({ queryKey: queryKeys.scans.detail(scanId) });
    },
    onError: (err) => {
      toast.error(`Failed to toggle favorite: ${err.message}`);
    },
  });
}

export function useRecentScansPreview() {
  return useQuery({
    queryKey: queryKeys.preview.recent(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_scans_for_user', {
        p_limit: 3,
        p_offset: 0,
        p_filter: 'all',
        p_sort: 'newest',
        p_search: '',
      });
      if (error) throw error;
      return data as ScannedProduct[];
    },
  });
}

export function useFavoriteScansPreview() {
  return useQuery({
    queryKey: queryKeys.preview.favorites(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_scans_for_user', {
        p_limit: 3,
        p_offset: 0,
        p_filter: 'favorites',
        p_sort: 'newest',
        p_search: '',
      });
      if (error) throw error;
      return data as ScannedProduct[];
    },
  });
}

export function useSaveScan() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, ProductAnalysisResult>({
    mutationFn: async (prod: ProductAnalysisResult) => {
      const { data, error } = await supabase.rpc('save_scan', {
        p_name: prod.name,
        p_brand: prod.brand,
        p_category: prod.category,
        p_safety_score: prod.safety_score,
        p_image_url: prod.image_url,
        p_ingredients: prod.ingredients,
        p_key_ingredients: prod.key_ingredients,
        p_product_links: prod.product_links,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scans.all });
    },
    onError: (err) => {
      toast.error(`Save failed: ${err.message}`);
    },
  });
}

export function useRefreshScans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scans.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}
