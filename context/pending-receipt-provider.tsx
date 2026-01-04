import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './auth-provider';
import { receiptKeys } from '@/lib/hooks/use-receipts';
import type { ExtractedReceiptData } from '@/lib/types/receipt';

export interface PendingReceipt {
  id: string;
  imageBase64: string;
  imagePreviewUri?: string;
  progress: number;
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

    // Get the public URL
    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const startScan = useCallback(
    async (imageBase64: string, imagePreviewUri?: string) => {
      if (!session?.access_token || !user) {
        toast.error(t('errors.notAuthenticated'));
        return;
      }

      // Create a temporary pending receipt ID
      const tempId = `pending-${Date.now()}`;

      // Set pending receipt state immediately
      setPendingReceipt({
        id: tempId,
        imageBase64,
        imagePreviewUri,
        progress: 0,
        createdAt: new Date(),
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setPendingReceipt((prev) => {
          if (!prev) return null;
          const newProgress = Math.min(prev.progress + Math.random() * 15, 90);
          return { ...prev, progress: newProgress };
        });
      }, 500);

      try {
        // Step 1: Upload image to storage
        const imageUrl = await uploadImage(imageBase64);

        // Step 2: Call the receipt-scan edge function
        // Explicitly pass auth header since supabase-js may not auto-attach it
        const response = await supabase.functions.invoke('receipt-scan', {
          body: {
            imageBase64,
            mimeType: 'image/jpeg',
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        clearInterval(progressInterval);

        if (response.error) {
          throw new Error(response.error.message || 'Failed to scan receipt');
        }

        const extractedData = response.data as ExtractedReceiptData;

        if (!extractedData || extractedData.error) {
          throw new Error(extractedData?.error || 'Failed to extract receipt data');
        }

        // Set progress to 100%
        setPendingReceipt((prev) => (prev ? { ...prev, progress: 100 } : null));

        // Small delay to show 100% progress
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Clear pending receipt
        clearPendingReceipt();

        // Invalidate receipt lists
        queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
        queryClient.invalidateQueries({ queryKey: receiptKeys.summary() });

        // Success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Navigate to verify screen with extracted data
        router.push({
          pathname: '/receipt/verify',
          params: {
            imageUrl,
            vendor: extractedData.vendor || '',
            date: extractedData.date || '',
            total: extractedData.total?.toString() || '',
            currency: extractedData.currency || 'USD',
            suggestedCategory: extractedData.suggestedCategory || '',
            confidence: extractedData.confidence?.toString() || '0',
          },
        });
      } catch (error) {
        clearInterval(progressInterval);
        clearPendingReceipt();

        console.error('Error scanning receipt:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

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
