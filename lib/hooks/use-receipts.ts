import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-provider';
import { calculateDeductible } from '@/lib/constants/categories';
import type {
  Receipt,
  ExtractedReceiptData,
  CreateReceiptInput,
  UpdateReceiptInput,
  ReceiptSummary,
  ReceiptFilters,
  DateRange,
} from '@/lib/types/receipt';

export const receiptKeys = {
  all: ['receipts'] as const,
  lists: () => [...receiptKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...receiptKeys.lists(), filters] as const,
  summary: () => [...receiptKeys.all, 'summary'] as const,
  summaryWithRange: (range?: DateRange) => [...receiptKeys.summary(), range] as const,
  details: () => [...receiptKeys.all, 'detail'] as const,
  detail: (id: string) => [...receiptKeys.details(), id] as const,
};

// Fetch all receipts for the current user
export function useReceipts(filters?: ReceiptFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: receiptKeys.list(filters || {}),
    queryFn: async (): Promise<Receipt[]> => {
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
      return (data || []) as Receipt[];
    },
    enabled: !!user,
  });
}

// Fetch a single receipt by ID
export function useReceipt(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: receiptKeys.detail(id),
    queryFn: async (): Promise<Receipt | null> => {
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
      return data as Receipt;
    },
    enabled: !!user && !!id,
  });
}

// Fetch receipt summary for dashboard
export function useReceiptSummary(dateRange?: DateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: receiptKeys.summaryWithRange(dateRange),
    queryFn: async (): Promise<ReceiptSummary> => {
      if (!user) {
        return { totalReceipts: 0, totalAmount: 0, totalDeductible: 0, estimatedSavings: 0 };
      }

      let query = supabase
        .from('receipts')
        .select('total_amount, deductible_amount')
        .eq('user_id', user.id);

      if (dateRange) {
        const startStr = dateRange.startDate.toISOString().split('T')[0];
        const endStr = dateRange.endDate.toISOString().split('T')[0];
        query = query.gte('date', startStr).lte('date', endStr);
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
    enabled: !!user,
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

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
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
      const { File, Paths } = await import('expo-file-system');
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
      const file = new File(Paths.cache, fileName);

      const writer = file.writableStream().getWriter();
      await writer.write(new TextEncoder().encode(csvContent));
      await writer.close();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
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
    }: {
      receipts: Receipt[];
      summary: ReceiptSummary;
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
              font-size: 24px;
              font-weight: 700;
              color: #00C0E8;
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
            .summary-card .value.green {
              color: #10B981;
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
              color: #10B981;
              font-weight: 500;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TaxSnap</div>
            <div class="report-info">
              <h1>Receipt Report</h1>
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
              <div class="value green">${formatCurrency(summary.totalDeductible)}</div>
              <div class="label">Total Deductible</div>
            </div>
            <div class="summary-card">
              <div class="value green">${formatCurrency(summary.estimatedSavings)}</div>
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
