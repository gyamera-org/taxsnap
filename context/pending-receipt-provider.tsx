import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './auth-provider';
import { receiptKeys } from '@/lib/hooks/use-receipts';
import { calculateDeductible } from '@/lib/constants/categories';
import type { ExtractedReceiptData, ReceiptStatus } from '@/lib/types/receipt';

export interface PendingReceipt {
  id: string; // Now stores the actual database receipt ID
  imageBase64: string;
  imagePreviewUri?: string;
  imageUrl?: string;
  progress: number;
  status: ReceiptStatus;
  createdAt: Date;
}

interface PendingReceiptContextType {
  pendingReceipt: PendingReceipt | null;
  startScan: (imageBase64: string, imagePreviewUri?: string) => void;
  clearPendingReceipt: () => void;
}

const PendingReceiptContext = createContext<PendingReceiptContextType | undefined>(undefined);

export function PendingReceiptProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { session, user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pendingReceipt, setPendingReceipt] = useState<PendingReceipt | null>(null);

  const clearPendingReceipt = useCallback(() => {
    setPendingReceipt(null);
  }, []);

  const uploadImage = async (imageBase64: string): Promise<string> => {
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
  };

  const startScan = useCallback(
    async (imageBase64: string, imagePreviewUri?: string) => {
      if (!session?.access_token || !user) {
        toast.error(t('errors.notAuthenticated'));
        return;
      }

      let receiptId: string | null = null;
      let imageUrl: string | null = null;

      // Set pending receipt state immediately (with temp ID until we get DB ID)
      setPendingReceipt({
        id: `temp-${Date.now()}`,
        imageBase64,
        imagePreviewUri,
        progress: 5,
        status: 'pending',
        createdAt: new Date(),
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setPendingReceipt((prev) => {
          if (!prev || prev.status === 'completed') return prev;
          const newProgress = Math.min(prev.progress + Math.random() * 10, 85);
          return { ...prev, progress: newProgress };
        });
      }, 600);

      try {
        // Step 1: Upload image to storage
        imageUrl = await uploadImage(imageBase64);

        // Update progress
        setPendingReceipt((prev) => prev ? { ...prev, progress: 30, imageUrl: imageUrl || undefined } : null);

        // Step 2: Create receipt in database immediately with 'processing' status
        const { data: newReceipt, error: insertError } = await supabase
          .from('receipts')
          .insert({
            user_id: user.id,
            image_uri: imageUrl,
            status: 'processing',
            currency: 'USD',
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        receiptId = newReceipt.id;

        // Update pending receipt with real DB ID
        setPendingReceipt((prev) => prev ? { ...prev, id: receiptId!, progress: 40, status: 'processing' } : null);

        // Invalidate lists so the new receipt appears
        queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });

        // Step 3: Call the receipt-scan edge function
        const response = await supabase.functions.invoke('receipt-scan', {
          body: {
            imageBase64,
            mimeType: 'image/jpeg',
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to scan receipt');
        }

        const extractedData = response.data as ExtractedReceiptData;

        if (!extractedData || extractedData.error) {
          throw new Error(extractedData?.error || 'Failed to extract receipt data');
        }

        // Step 4: Update the receipt with extracted data
        const deductibleAmount = extractedData.total && extractedData.suggestedCategory
          ? calculateDeductible(extractedData.total, extractedData.suggestedCategory)
          : null;

        const taxYear = extractedData.date ? new Date(extractedData.date).getFullYear() : null;

        const { error: updateError } = await supabase
          .from('receipts')
          .update({
            vendor: extractedData.vendor,
            date: extractedData.date,
            total_amount: extractedData.total,
            currency: extractedData.currency || 'USD',
            category: extractedData.suggestedCategory,
            deductible_amount: deductibleAmount,
            tax_year: taxYear,
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', receiptId);

        if (updateError) throw updateError;

        clearInterval(progressInterval);

        // Set progress to 100%
        setPendingReceipt((prev) => prev ? { ...prev, progress: 100, status: 'completed' } : null);

        // Small delay to show 100% progress
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Clear pending receipt
        clearPendingReceipt();

        // Invalidate receipt lists to show updated data
        queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
        queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });

        // Success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success(t('scan.scanComplete'));
      } catch (error) {
        clearInterval(progressInterval);

        console.error('Error scanning receipt:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // If we created a receipt, update its status to failed
        if (receiptId) {
          await supabase
            .from('receipts')
            .update({ status: 'failed', updated_at: new Date().toISOString() })
            .eq('id', receiptId);

          // Invalidate to show the failed state
          queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
        }

        clearPendingReceipt();

        const errorMessage = error instanceof Error ? error.message : t('errors.generic');
        toast.error(t('scan.analysisFailed'), {
          description: errorMessage,
        });
      }
    },
    [session, user, queryClient, router, t, clearPendingReceipt]
  );

  const value = {
    pendingReceipt,
    startScan,
    clearPendingReceipt,
  };

  return (
    <PendingReceiptContext.Provider value={value}>{children}</PendingReceiptContext.Provider>
  );
}

export function usePendingReceipt(): PendingReceiptContextType {
  const ctx = useContext(PendingReceiptContext);
  if (!ctx) throw new Error('usePendingReceipt must be inside PendingReceiptProvider');
  return ctx;
}
