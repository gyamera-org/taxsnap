import { useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { useReceiptSummary } from './use-receipts';

const REVIEW_PROMPT_KEY = '@taxsnap_review_prompt';
const FIRST_USE_KEY = '@taxsnap_first_use';
const MIN_RECEIPTS_FOR_REVIEW = 3;
const MIN_DAYS_FOR_REVIEW = 7;

interface ReviewPromptData {
  hasRequestedReview: boolean;
  lastPromptDate: string | null;
  receiptCountAtPrompt: number;
}

/**
 * Get the first use date from AsyncStorage
 */
async function getFirstUseDate(): Promise<Date | null> {
  try {
    const dateStr = await AsyncStorage.getItem(FIRST_USE_KEY);
    if (dateStr) {
      return new Date(dateStr);
    }
    // First time - set the date
    const now = new Date().toISOString();
    await AsyncStorage.setItem(FIRST_USE_KEY, now);
    return new Date(now);
  } catch (error) {
    console.error('Error getting first use date:', error);
    return null;
  }
}

/**
 * Calculate days since first use
 */
function daysSince(date: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get review prompt data from AsyncStorage
 */
async function getReviewPromptData(): Promise<ReviewPromptData> {
  try {
    const data = await AsyncStorage.getItem(REVIEW_PROMPT_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting review prompt data:', error);
  }
  return {
    hasRequestedReview: false,
    lastPromptDate: null,
    receiptCountAtPrompt: 0,
  };
}

/**
 * Save review prompt data to AsyncStorage
 */
async function saveReviewPromptData(data: ReviewPromptData): Promise<void> {
  try {
    await AsyncStorage.setItem(REVIEW_PROMPT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving review prompt data:', error);
  }
}

/**
 * Hook to manage app review prompts
 * Prompts user to review the app when:
 * 1. They have 3+ receipts (experienced value)
 * 2. They've been using the app for 7+ days
 * 3. They're on the home screen (natural pause point)
 */
export function useReviewPrompt() {
  const { data: summary } = useReceiptSummary();
  const hasChecked = useRef(false);

  /**
   * Check if we should prompt for review and show the prompt if appropriate
   * Call this on the home screen mount
   */
  const maybeRequestReview = useCallback(async (): Promise<boolean> => {
    // Only check once per app session
    if (hasChecked.current) {
      return false;
    }
    hasChecked.current = true;

    try {
      const totalReceipts = summary?.totalReceipts ?? 0;

      // Need at least MIN_RECEIPTS_FOR_REVIEW receipts
      if (totalReceipts < MIN_RECEIPTS_FOR_REVIEW) {
        return false;
      }

      // Check if enough days have passed
      const firstUseDate = await getFirstUseDate();
      if (!firstUseDate || daysSince(firstUseDate) < MIN_DAYS_FOR_REVIEW) {
        return false;
      }

      const promptData = await getReviewPromptData();

      // Already requested review
      if (promptData.hasRequestedReview) {
        return false;
      }

      // Check if StoreReview is available
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) {
        return false;
      }

      // Request the review
      await StoreReview.requestReview();

      // Mark as requested
      await saveReviewPromptData({
        hasRequestedReview: true,
        lastPromptDate: new Date().toISOString(),
        receiptCountAtPrompt: totalReceipts,
      });

      return true;
    } catch (error) {
      console.error('Error requesting review:', error);
      return false;
    }
  }, [summary?.totalReceipts]);

  /**
   * Reset review prompt state (useful for testing)
   */
  const resetReviewPrompt = useCallback(async (): Promise<void> => {
    hasChecked.current = false;
    await saveReviewPromptData({
      hasRequestedReview: false,
      lastPromptDate: null,
      receiptCountAtPrompt: 0,
    });
  }, []);

  return {
    maybeRequestReview,
    resetReviewPrompt,
    totalReceipts: summary?.totalReceipts ?? 0,
    minReceiptsForReview: MIN_RECEIPTS_FOR_REVIEW,
    minDaysForReview: MIN_DAYS_FOR_REVIEW,
  };
}
