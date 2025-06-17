import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { ProductAnalysisResult } from '@/lib/types/product';

export function useAnalyzeScan() {
  return useMutation<ProductAnalysisResult, Error, { barcode?: string; imageUrl?: string }>({
    mutationFn: async ({ barcode, imageUrl }) => {
      try {
        const { data, error } = await supabase.functions.invoke<ProductAnalysisResult>(
          'ai-scan-api',
          {
            body: { barcode, image_url: imageUrl },
          }
        );

        if (error) {
          throw new Error(error.message);
        }

        if (!data) {
          throw new Error('No analysis data received. Please try again.');
        }

        return data;
      } catch (err) {
        console.error('Analysis error:', err);
        throw err;
      }
    },
  });
}
