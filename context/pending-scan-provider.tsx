import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './auth-provider';
import { useLanguage } from './language-provider';
import { useRevenueCat } from './revenuecat-provider';
import { scanKeys } from '@/lib/hooks/use-scans';
import type { ScanResult } from '@/lib/types/scan';

interface PendingScan {
  id: string;
  imageBase64: string;
  imagePreviewUri?: string;
  progress: number;
  createdAt: Date;
}

interface PendingScanContextType {
  pendingScan: PendingScan | null;
  startScan: (imageBase64: string, imagePreviewUri?: string) => void;
  clearPendingScan: () => void;
}

const PendingScanContext = createContext<PendingScanContextType | undefined>(undefined);

export function PendingScanProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { session, user } = useAuth();
  const { language } = useLanguage();
  const { isSubscribed, canScan, freeScansRemaining, recordFreeScan } = useRevenueCat();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);

  const clearPendingScan = useCallback(() => {
    setPendingScan(null);
  }, []);

  const startScan = useCallback(
    async (imageBase64: string, imagePreviewUri?: string) => {
      if (!session?.access_token || !user) {
        toast.error(t('errors.notAuthenticated'));
        return;
      }

      // Check if user can scan (subscribed or has free scans remaining)
      if (!canScan) {
        toast.error(t('scan.limitReached.title'), {
          description: t('scan.limitReached.description'),
        });
        router.push('/paywall');
        return;
      }

      // Create a temporary pending scan ID
      const tempId = `pending-${Date.now()}`;

      // Set pending scan state immediately
      setPendingScan({
        id: tempId,
        imageBase64,
        imagePreviewUri,
        progress: 0,
        createdAt: new Date(),
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setPendingScan((prev) => {
          if (!prev) return null;
          const newProgress = Math.min(prev.progress + Math.random() * 15, 90);
          return { ...prev, progress: newProgress };
        });
      }, 500);

      try {
        // Call the analyze-food edge function with language preference
        const response = await supabase.functions.invoke('analyze-food', {
          body: {
            image_base64: imageBase64,
            language,
          },
        });

        clearInterval(progressInterval);

        if (response.error) {
          throw new Error(response.error.message || 'Failed to analyze food');
        }

        const data = response.data as { success: boolean; scan: ScanResult };

        if (!data.success) {
          throw new Error('Analysis failed');
        }

        // Set progress to 100%
        setPendingScan((prev) => (prev ? { ...prev, progress: 100 } : null));

        // Small delay to show 100% progress
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Record free scan usage (only for non-subscribers)
        if (!isSubscribed) {
          await recordFreeScan();
        }

        // Clear pending scan
        clearPendingScan();

        // Invalidate scan lists to show the new scan
        queryClient.invalidateQueries({ queryKey: scanKeys.lists() });

        // Success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Show success toast with action to view result
        toast.success(t('scan.analysisComplete'), {
          description: data.scan.name,
          action: {
            label: t('scan.viewResult'),
            onClick: () => router.push(`/scan/${data.scan.id}`),
          },
          duration: 8000,
        });
      } catch (error) {
        clearInterval(progressInterval);
        clearPendingScan();

        console.error('Error analyzing food:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        const errorMessage = error instanceof Error ? error.message : t('errors.generic');
        toast.error(t('scan.analysisFailed'), {
          description: errorMessage,
        });
      }
    },
    [session, user, language, queryClient, router, t, clearPendingScan, canScan, isSubscribed, recordFreeScan]
  );

  const value = {
    pendingScan,
    startScan,
    clearPendingScan,
  };

  return <PendingScanContext.Provider value={value}>{children}</PendingScanContext.Provider>;
}

export function usePendingScan(): PendingScanContextType {
  const ctx = useContext(PendingScanContext);
  if (!ctx) throw new Error('usePendingScan must be inside PendingScanProvider');
  return ctx;
}
