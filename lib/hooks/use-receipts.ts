import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-provider';
import { calculateDeductible, TaxCategoryId } from '@/lib/constants/categories';
import { isDemoMode, DEMO_DATA } from '@/lib/config/dev-mode';
import type {
  Receipt,
  ExtractedReceiptData,
  CreateReceiptInput,
  UpdateReceiptInput,
  ReceiptSummary,
  ReceiptFilters,
} from '@/lib/types/receipt';

export const receiptKeys = {
  all: ['receipts'] as const,
  lists: () => [...receiptKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...receiptKeys.lists(), filters] as const,
  summary: () => [...receiptKeys.all, 'summary'] as const,
  summaryWithFilters: (filters?: ReceiptFilters) => [...receiptKeys.summary(), filters] as const,
  details: () => [...receiptKeys.all, 'detail'] as const,
  detail: (id: string) => [...receiptKeys.details(), id] as const,
};

// Helper to extract storage path from image URI and generate signed URL
async function getSignedImageUrl(imageUri: string | null): Promise<string | null> {
  if (!imageUri) return null;

  try {
    // Check if it's already a signed URL (contains 'token=')
    if (imageUri.includes('token=')) {
      return imageUri;
    }

    // Extract the path from the public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/receipts/<user_id>/<filename>
    const match = imageUri.match(/\/receipts\/(.+)$/);
    if (!match) return imageUri; // Return as-is if we can't parse it

    const path = match[1];

    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days expiry

    if (error) {
      console.warn('Failed to create signed URL:', error);
      return imageUri; // Return original URL as fallback
    }

    return data.signedUrl;
  } catch (e) {
    console.warn('Error generating signed URL:', e);
    return imageUri;
  }
}

// Process receipts to add signed URLs
async function addSignedUrlsToReceipts(receipts: Receipt[]): Promise<Receipt[]> {
  return Promise.all(
    receipts.map(async (receipt) => ({
      ...receipt,
      image_uri: (await getSignedImageUrl(receipt.image_uri)) || receipt.image_uri,
    }))
  );
}

// Fetch all receipts for the current user
export function useReceipts(filters?: ReceiptFilters) {
  const { user } = useAuth();
  const demoMode = isDemoMode();

  return useQuery({
    queryKey: receiptKeys.list({ ...(filters as Record<string, unknown> || {}), demoMode }),
    queryFn: async (): Promise<Receipt[]> => {
      // Return mock data in demo mode
      if (demoMode) {
        let receipts = [...DEMO_DATA.receipts];

        // Apply date range filter
        if (filters?.dateRange) {
          const startStr = filters.dateRange.startDate.toISOString().split('T')[0];
          const endStr = filters.dateRange.endDate.toISOString().split('T')[0];
          receipts = receipts.filter((r) => {
            if (!r.date) return false;
            return r.date >= startStr && r.date <= endStr;
          });
        }

        // Apply category filter
        if (filters?.categories && filters.categories.length > 0) {
          receipts = receipts.filter((r) => r.category && filters.categories!.includes(r.category as any));
        }

        // Apply search filter (vendor name)
        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          receipts = receipts.filter((r) => r.vendor?.toLowerCase().includes(query));
        }

        return receipts;
      }

      if (!user) return [];

      let query = supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false, nullsFirst: false });

      // Apply date range filter
      if (filters?.dateRange) {
        const startStr = filters.dateRange.startDate.toISOString().split('T')[0];
        const endStr = filters.dateRange.endDate.toISOString().split('T')[0];
        query = query.gte('date', startStr).lte('date', endStr);
      }

      // Apply tax year filter
      if (filters?.taxYear) {
        query = query.eq('tax_year', filters.taxYear);
      }

      // Apply category filter
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      // Apply search filter (vendor name)
      if (filters?.searchQuery) {
        query = query.ilike('vendor', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Add signed URLs for images
      const receipts = (data || []) as Receipt[];
      return addSignedUrlsToReceipts(receipts);
    },
    enabled: demoMode || !!user,
  });
}

// Fetch a single receipt by ID
export function useReceipt(id: string) {
  const { user } = useAuth();
  const demoMode = isDemoMode();

  return useQuery({
    queryKey: [...receiptKeys.detail(id), demoMode],
    queryFn: async (): Promise<Receipt | null> => {
      // Return mock receipt in demo mode
      if (demoMode) {
        return DEMO_DATA.getById(id) || null;
      }

      if (!user) return null;

      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Add signed URL for image
      const receipt = data as Receipt;
      const signedUrl = await getSignedImageUrl(receipt.image_uri);
      return { ...receipt, image_uri: signedUrl || receipt.image_uri };
    },
    enabled: (demoMode || !!user) && !!id,
  });
}

// Fetch receipt summary for dashboard (now supports full filters including category)
export function useReceiptSummary(filters?: ReceiptFilters) {
  const { user } = useAuth();
  const demoMode = isDemoMode();

  return useQuery({
    queryKey: [...receiptKeys.summaryWithFilters(filters), demoMode],
    queryFn: async (): Promise<ReceiptSummary> => {
      // Return mock summary in demo mode
      if (demoMode) {
        let receipts = [...DEMO_DATA.receipts];

        // Apply date range filter
        if (filters?.dateRange) {
          const startStr = filters.dateRange.startDate.toISOString().split('T')[0];
          const endStr = filters.dateRange.endDate.toISOString().split('T')[0];
          receipts = receipts.filter((r) => {
            if (!r.date) return false;
            return r.date >= startStr && r.date <= endStr;
          });
        }

        // Apply category filter
        if (filters?.categories && filters.categories.length > 0) {
          receipts = receipts.filter((r) => r.category && filters.categories!.includes(r.category as any));
        }

        // Apply search filter
        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          receipts = receipts.filter((r) => r.vendor?.toLowerCase().includes(query));
        }

        const totalReceipts = receipts.length;
        const totalAmount = receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
        const totalDeductible = receipts.reduce((sum, r) => sum + (r.deductible_amount || 0), 0);
        const estimatedSavings = Math.round(totalDeductible * 0.25);

        return { totalReceipts, totalAmount, totalDeductible, estimatedSavings };
      }

      if (!user) {
        return { totalReceipts: 0, totalAmount: 0, totalDeductible: 0, estimatedSavings: 0 };
      }

      let query = supabase
        .from('receipts')
        .select('total_amount, deductible_amount')
        .eq('user_id', user.id);

      // Apply date range filter
      if (filters?.dateRange) {
        const startStr = filters.dateRange.startDate.toISOString().split('T')[0];
        const endStr = filters.dateRange.endDate.toISOString().split('T')[0];
        query = query.gte('date', startStr).lte('date', endStr);
      }

      // Apply category filter
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      // Apply search filter
      if (filters?.searchQuery) {
        query = query.ilike('vendor', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const receipts = data || [];
      const totalReceipts = receipts.length;
      const totalAmount = receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      const totalDeductible = receipts.reduce((sum, r) => sum + (r.deductible_amount || 0), 0);
      const estimatedSavings = Math.round(totalDeductible * 0.25);

      return { totalReceipts, totalAmount, totalDeductible, estimatedSavings };
    },
    enabled: demoMode || !!user,
  });
}

// Create a new receipt
export function useCreateReceipt() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateReceiptInput): Promise<Receipt> => {
      if (!user) throw new Error('User not authenticated');

      // Calculate deductible amount if we have total and category
      let deductibleAmount: number | null = null;
      if (input.total_amount && input.category) {
        deductibleAmount = calculateDeductible(input.total_amount, input.category);
      }

      // Determine tax year from date
      let taxYear: number | null = null;
      if (input.date) {
        taxYear = new Date(input.date).getFullYear();
      }

      const { data, error } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          image_uri: input.image_uri,
          vendor: input.vendor || null,
          date: input.date || null,
          total_amount: input.total_amount || null,
          currency: input.currency || 'USD',
          category: input.category || null,
          deductible_amount: deductibleAmount,
          note: input.note || null,
          tax_year: taxYear,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });
    },
  });
}

// Update a receipt
export function useUpdateReceipt() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateReceiptInput & { id: string }): Promise<Receipt> => {
      if (!user) throw new Error('User not authenticated');

      const updateData: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      // If we have both total and category, recalculate deductible
      if (input.total_amount !== undefined || input.category !== undefined) {
        const { data: current } = await supabase
          .from('receipts')
          .select('total_amount, category')
          .eq('id', id)
          .single();

        const totalAmount = input.total_amount ?? current?.total_amount;
        const category = input.category ?? current?.category;

        if (totalAmount && category) {
          updateData.deductible_amount = calculateDeductible(totalAmount, category);
        }
      }

      // Update tax year if date changed
      if (input.date) {
        updateData.tax_year = new Date(input.date).getFullYear();
      }

      const { data, error } = await supabase
        .from('receipts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Receipt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(data.id) });
    },
  });
}

// Delete a receipt
export function useDeleteReceipt() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      // First get the receipt to find the image path
      const { data: receipt } = await supabase
        .from('receipts')
        .select('image_uri')
        .eq('id', id)
        .single();

      // Delete the receipt from database
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Try to delete the image from storage
      if (receipt?.image_uri) {
        try {
          const url = new URL(receipt.image_uri);
          const path = url.pathname.split('/receipts/')[1];
          if (path) {
            await supabase.storage.from('receipts').remove([path]);
          }
        } catch (e) {
          console.warn('Failed to delete receipt image:', e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });
    },
  });
}

// Upload receipt image to storage
export function useUploadReceiptImage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (imageBase64: string): Promise<string> => {
      if (!user) throw new Error('User not authenticated');

      const fileName = `${user.id}/${Date.now()}.jpg`;

      // Convert base64 to ArrayBuffer
      const binaryString = atob(imageBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, bytes.buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get a signed URL (works for private buckets)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('receipts')
        .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year expiry

      if (signedUrlError) throw signedUrlError;

      return signedUrlData.signedUrl;
    },
  });
}

// Scan receipt with AI (calls Edge Function)
interface ScanReceiptInput {
  imageBase64: string;
  imageUrl?: string;
}

interface ScanReceiptResult {
  extractedData: ExtractedReceiptData;
  imageUrl: string;
}

export function useScanReceipt() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const uploadImage = useUploadReceiptImage();

  return useMutation({
    mutationFn: async (input: ScanReceiptInput): Promise<ScanReceiptResult> => {
      if (!session?.access_token) throw new Error('User not authenticated');

      // Step 1: Upload image if no URL provided
      let imageUrl = input.imageUrl;
      if (!imageUrl) {
        imageUrl = await uploadImage.mutateAsync(input.imageBase64);
      }

      // Step 2: Call Edge Function to scan receipt
      // Explicitly pass the Authorization header to ensure it's included
      const response = await supabase.functions.invoke('receipt-scan', {
        body: {
          imageBase64: input.imageBase64,
          mimeType: 'image/jpeg',
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to scan receipt');
      }

      const data = response.data as ExtractedReceiptData;

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to extract receipt data');
      }

      return {
        extractedData: data,
        imageUrl,
      };
    },
    onSuccess: () => {
      // Invalidate receipt lists to show the new scan
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });
    },
  });
}

// Category breakdown for dashboard
export interface CategoryBreakdown {
  category: TaxCategoryId;
  categoryName: string;
  total: number; // in cents
  count: number;
}

export function useCategoryBreakdown() {
  const { user } = useAuth();
  const demoMode = isDemoMode();

  return useQuery({
    queryKey: [...receiptKeys.all, 'categoryBreakdown', demoMode],
    queryFn: async (): Promise<CategoryBreakdown[]> => {
      const { getCategoryById } = await import('@/lib/constants/categories');

      // Return mock breakdown in demo mode
      if (demoMode) {
        const breakdown = DEMO_DATA.getCategoryBreakdown();
        return breakdown.map((item) => ({
          category: item.category,
          categoryName: getCategoryById(item.category)?.name || 'Other',
          total: item.total,
          count: item.count,
        }));
      }

      if (!user) return [];

      const { data, error } = await supabase
        .from('receipts')
        .select('category, deductible_amount')
        .eq('user_id', user.id)
        .not('category', 'is', null);

      if (error) throw error;

      // Group by category
      const breakdown: Record<string, { total: number; count: number }> = {};

      (data || []).forEach((receipt) => {
        if (receipt.category && receipt.deductible_amount) {
          if (!breakdown[receipt.category]) {
            breakdown[receipt.category] = { total: 0, count: 0 };
          }
          breakdown[receipt.category].total += receipt.deductible_amount;
          breakdown[receipt.category].count += 1;
        }
      });

      return Object.entries(breakdown)
        .map(([category, data]) => ({
          category: category as TaxCategoryId,
          categoryName: getCategoryById(category)?.name || 'Other',
          total: data.total,
          count: data.count,
        }))
        .sort((a, b) => b.total - a.total);
    },
    enabled: demoMode || !!user,
  });
}

// Realtime subscription for receipts
export function useReceiptsRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('receipts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'receipts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
            queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });
          } else if (payload.eventType === 'UPDATE') {
            const updatedReceipt = payload.new as Receipt;
            queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
            queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });
            queryClient.invalidateQueries({ queryKey: receiptKeys.detail(updatedReceipt.id) });
          } else if (payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
            queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

// Export receipts to CSV
export function useExportReceiptsToCSV() {
  return useMutation({
    mutationFn: async (receipts: Receipt[]): Promise<void> => {
      const { cacheDirectory, writeAsStringAsync } = await import(
        'expo-file-system/legacy'
      );
      const Sharing = await import('expo-sharing');
      const { format } = await import('date-fns');
      const { getCategoryById } = await import('@/lib/constants/categories');

      const headers = ['Date', 'Vendor', 'Category', 'Total', 'Deductible', 'Note'];

      const rows = receipts.map((receipt) => {
        const category = receipt.category ? getCategoryById(receipt.category) : null;
        return [
          receipt.date || '',
          `"${(receipt.vendor || '').replace(/"/g, '""')}"`,
          category?.name || '',
          receipt.total_amount ? (receipt.total_amount / 100).toFixed(2) : '0.00',
          receipt.deductible_amount ? (receipt.deductible_amount / 100).toFixed(2) : '0.00',
          `"${(receipt.note || '').replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const fileName = `taxsnap-receipts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const fileUri = `${cacheDirectory}${fileName}`;

      await writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Receipts',
          UTI: 'public.comma-separated-values-text',
        });
      }
    },
  });
}

// Export receipts to PDF
export function useExportReceiptsToPDF() {
  return useMutation({
    mutationFn: async ({
      receipts,
      summary,
      dateRange,
    }: {
      receipts: Receipt[];
      summary: ReceiptSummary;
      dateRange?: { startDate: Date; endDate: Date };
    }): Promise<void> => {
      const Sharing = await import('expo-sharing');
      const Print = await import('expo-print');
      const { format } = await import('date-fns');
      const { getCategoryById } = await import('@/lib/constants/categories');

      const formatCurrency = (cents: number) => {
        return `$${(cents / 100).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      };

      // Group receipts by category
      const receiptsByCategory = receipts.reduce(
        (acc, receipt) => {
          const categoryId = receipt.category || 'uncategorized';
          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(receipt);
          return acc;
        },
        {} as Record<string, Receipt[]>
      );

      // Calculate totals by category
      const categoryTotals = Object.entries(receiptsByCategory)
        .map(([categoryId, categoryReceipts]) => {
          const category = getCategoryById(categoryId);
          const total = categoryReceipts.reduce((sum, r) => sum + (r.deductible_amount || 0), 0);
          return {
            name: category?.name || 'Uncategorized',
            count: categoryReceipts.length,
            total,
          };
        })
        .sort((a, b) => b.total - a.total);

      const receiptRows = receipts
        .sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .map((receipt) => {
          const category = receipt.category ? getCategoryById(receipt.category) : null;
          return `
          <tr>
            <td>${receipt.date ? format(new Date(receipt.date), 'MMM d, yyyy') : '-'}</td>
            <td>${receipt.vendor || 'Unknown'}</td>
            <td>${category?.name || '-'}</td>
            <td class="amount">${formatCurrency(receipt.total_amount || 0)}</td>
            <td class="amount deductible">${formatCurrency(receipt.deductible_amount || 0)}</td>
          </tr>
        `;
        })
        .join('');

      const categoryRows = categoryTotals
        .map(
          (cat) => `
          <tr>
            <td>${cat.name}</td>
            <td class="count">${cat.count}</td>
            <td class="amount">${formatCurrency(cat.total)}</td>
          </tr>
        `
        )
        .join('');

      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>TaxSnap Receipt Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 12px;
              color: #1a1a1a;
              padding: 40px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #00C0E8;
            }
            .logo {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 24px;
              font-weight: 700;
              color: #00C0E8;
            }
            .logo svg {
              width: 32px;
              height: 32px;
            }
            .report-info {
              text-align: right;
            }
            .report-info h1 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .report-info p {
              color: #666;
              font-size: 11px;
            }
            .summary {
              display: flex;
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              flex: 1;
              background: #f8f9fa;
              padding: 16px;
              border-radius: 8px;
              text-align: center;
            }
            .summary-card .value {
              font-size: 24px;
              font-weight: 700;
              color: #1a1a1a;
            }
            .summary-card .value.highlight {
              color: #1a1a1a;
              font-weight: 700;
            }
            .summary-card .label {
              font-size: 11px;
              color: #666;
              margin-top: 4px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 12px;
              color: #1a1a1a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              text-align: left;
              padding: 10px 8px;
              background: #f1f5f9;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b;
              border-bottom: 1px solid #e2e8f0;
            }
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #f1f5f9;
            }
            .amount {
              text-align: right;
              font-family: 'SF Mono', Monaco, monospace;
            }
            .count {
              text-align: center;
            }
            .deductible {
              color: #1a1a1a;
              font-weight: 600;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 10px;
              color: #4a5568;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <svg width="32" height="32" viewBox="0 0 1024 1024" fill="none">
                <path d="M286.88 929.12C286.957 928.778 118.56 394.24 118.56 394.24V928.16C118.582 936.598 121.944 944.684 127.91 950.65C133.877 956.616 141.962 959.978 150.4 960H307.68C297.728 952.098 290.463 941.312 286.88 929.12Z" fill="#00C0E8"/>
                <path d="M910.08 733.44L706.4 86.56C705.161 82.5464 703.143 78.8163 700.462 75.5826C697.781 72.349 694.49 69.6752 690.775 67.7139C687.061 65.7527 682.996 64.5424 678.814 64.1522C674.631 63.7621 670.413 64.1997 666.4 65.44L361.28 161.6C359.308 145.741 354.031 130.473 345.789 116.782C335.771 98.2978 319.823 83.7236 300.514 75.4056C287.293 69.95 272.85 68.1447 258.693 70.1781C226.747 75.8021 200.053 107.148 191.208 148.594C190.085 159.217 189.229 170.562 188.78 182.562C188.341 194.274 188.337 205.391 188.639 215.84L199.679 212.32C202.083 211.574 204.629 211.405 207.111 211.825C209.592 212.245 211.94 213.243 213.965 214.738C215.99 216.233 217.635 218.184 218.766 220.432C219.898 222.68 220.485 225.163 220.48 227.68V326.88C220.379 334.374 222.71 341.7 227.123 347.758C231.537 353.815 237.795 358.279 244.96 360.48C263.59 360.72 272.337 344.575 274.881 327.361C274.88 310.081 275.357 172.186 275.361 155.201C275.04 153.554 274.225 152.044 273.025 150.872C271.824 149.7 270.295 148.922 268.641 148.641C267.029 148.927 265.525 149.643 264.286 150.713C263.047 151.783 262.119 153.168 261.601 154.721V321.121C261.601 325.364 259.915 329.434 256.915 332.434C253.914 335.435 249.844 337.121 245.601 337.121C241.358 337.121 237.288 335.435 234.287 332.434C231.287 329.434 229.601 325.364 229.601 321.121V152C230.727 142.265 235.392 133.284 242.708 126.764C250.024 120.244 259.481 116.641 269.281 116.64C278.731 117.165 287.702 120.967 294.652 127.391C301.602 133.815 306.096 142.461 307.361 151.84C307.361 151.84 306.818 293.53 306.88 328.16C300.029 410.319 198.838 414.905 188.8 331.357C187.893 295.604 189.034 251.689 188.639 215.84L134.4 232.96C126.451 235.598 119.853 241.248 116.024 248.697C112.194 256.147 111.439 264.8 113.92 272.8C137.36 346.897 290.827 834.954 317.6 919.84C318.829 923.839 320.836 927.556 323.507 930.777C326.177 933.997 329.458 936.658 333.161 938.606C336.863 940.554 340.915 941.751 345.081 942.127C349.248 942.504 353.448 942.053 357.44 940.8C357.6 940.784 397.6 928.076 397.76 928.16C409.233 925.337 741.951 819.259 739.842 820.48L889.28 773.44C897.333 770.88 904.043 765.233 907.942 757.736C911.84 750.239 912.609 741.503 910.08 733.44ZM417.76 258.24C416.361 254.271 416.577 249.912 418.361 246.1C420.144 242.289 423.354 239.33 427.298 237.862C431.241 236.393 435.604 236.532 439.446 238.249C443.288 239.966 446.303 243.123 447.84 247.04L454.24 264.319C461.321 264.215 468.329 265.748 474.72 268.799C491.577 275.292 513.774 304.812 490.08 316.16C486.111 317.588 481.739 317.399 477.907 315.633C474.076 313.867 471.092 310.666 469.6 306.72C468.113 302.877 465.173 299.773 461.417 298.078C457.66 296.383 453.388 296.234 449.522 297.663C445.657 299.091 442.508 301.983 440.757 305.713C439.005 309.444 438.791 313.713 440.16 317.6C441.651 321.467 444.591 324.6 448.356 326.333C452.121 328.066 456.413 328.262 460.32 326.88C470.859 322.979 482.436 322.925 493.011 326.726C503.586 330.527 512.479 337.941 518.122 347.658C523.766 357.376 525.796 368.774 523.857 379.843C521.917 390.912 516.131 400.94 507.52 408.16L513.92 425.44C515.314 429.391 515.097 433.733 513.316 437.526C511.535 441.318 508.333 444.258 504.402 445.708C500.47 447.158 496.126 447.003 492.309 445.276C488.491 443.549 485.506 440.389 484 436.479L477.6 419.2C467.755 419.321 458.111 416.406 449.981 410.852C441.85 405.299 435.628 397.375 432.16 388.16C430.775 384.194 430.999 379.843 432.785 376.041C434.571 372.239 437.776 369.289 441.713 367.823C445.65 366.357 450.004 366.493 453.842 368.202C457.68 369.91 460.695 373.055 462.24 376.961C463.317 379.87 465.232 382.395 467.743 384.216C470.254 386.037 473.249 387.073 476.349 387.192C479.449 387.312 482.514 386.509 485.158 384.886C487.802 383.264 489.905 380.893 491.202 378.076C492.499 375.258 492.931 372.118 492.444 369.055C491.957 365.991 490.573 363.141 488.466 360.864C486.36 358.587 483.625 356.985 480.609 356.262C477.592 355.539 474.429 355.727 471.519 356.801C461.019 360.57 449.532 360.545 439.049 356.732C428.566 352.919 419.748 345.557 414.124 335.923C408.5 326.29 406.425 314.992 408.258 303.988C410.091 292.985 415.718 282.97 424.161 275.68L417.76 258.24ZM697.92 449.92C701.946 448.8 706.25 449.304 709.908 451.324C713.566 453.345 716.284 456.72 717.479 460.724C718.674 464.728 718.25 469.042 716.297 472.736C714.345 476.431 711.02 479.211 707.039 480.48L334.72 592.64C333.213 593.077 331.65 593.293 330.08 593.28C326.282 593.238 322.622 591.844 319.759 589.347C316.896 586.85 315.017 583.415 314.458 579.658C313.899 575.9 314.698 572.067 316.711 568.845C318.724 565.624 321.819 563.225 325.441 562.08L697.92 449.92ZM776 690.72L403.52 802.72C399.496 803.836 395.194 803.329 391.54 801.308C387.885 799.287 385.169 795.913 383.975 791.911C382.781 787.909 383.204 783.599 385.154 779.906C387.104 776.213 390.424 773.431 394.402 772.16L766.88 660C770.921 658.898 775.233 659.421 778.893 661.458C782.553 663.496 785.27 666.885 786.462 670.9C787.654 674.916 787.226 679.239 785.271 682.943C783.316 686.647 779.988 689.439 776 690.72ZM359.84 667.04L732.32 554.88C736.367 553.739 740.7 554.232 744.388 556.253C748.075 558.273 750.822 561.661 752.038 565.686C753.253 569.711 752.841 574.053 750.888 577.777C748.936 581.501 745.6 584.31 741.598 585.6L369.12 697.76C365.072 698.906 360.735 698.416 357.044 696.396C353.353 694.376 350.604 690.987 349.387 686.959C348.17 682.932 348.584 678.587 350.539 674.862C352.494 671.136 355.834 668.327 359.84 667.04Z" fill="#00C0E8"/>
                <path d="M403.359 960H708C712.182 960.003 716.323 959.181 720.188 957.581C724.052 955.982 727.563 953.637 730.52 950.68C733.477 947.723 735.822 944.212 737.422 940.348C739.021 936.484 739.843 932.342 739.84 928.16V854.08C726.044 858.516 404.326 959.987 403.359 960Z" fill="#00C0E8"/>
              </svg>
              TaxSnap
            </div>
            <div class="report-info">
              <h1>Receipt Report</h1>
              ${dateRange ? `<p>${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}</p>` : ''}
              <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="value">${summary.totalReceipts}</div>
              <div class="label">Total Receipts</div>
            </div>
            <div class="summary-card">
              <div class="value">${formatCurrency(summary.totalAmount)}</div>
              <div class="label">Total Spending</div>
            </div>
            <div class="summary-card">
              <div class="value highlight">${formatCurrency(summary.totalDeductible)}</div>
              <div class="label">Total Deductible</div>
            </div>
            <div class="summary-card">
              <div class="value highlight">${formatCurrency(summary.estimatedSavings)}</div>
              <div class="label">Est. Tax Savings</div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Deductions by Category</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="count">Receipts</th>
                  <th class="amount">Deductible</th>
                </tr>
              </thead>
              <tbody>
                ${categoryRows}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">All Receipts</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th class="amount">Total</th>
                  <th class="amount">Deductible</th>
                </tr>
              </thead>
              <tbody>
                ${receiptRows}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>This report was generated by TaxSnap. Consult a tax professional for tax advice.</p>
            <p>TaxSnap - AI-Powered Receipt Tracking for Self-Employed Professionals</p>
          </div>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Receipts',
          UTI: 'com.adobe.pdf',
        });
      }
    },
  });
}
