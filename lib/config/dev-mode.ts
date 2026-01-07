/**
 * Dev Mode Configuration
 *
 * This file controls development mode bypasses for testing.
 * Set DEV_MODE_ENABLED to true to bypass auth, onboarding, and paywall.
 *
 * IMPORTANT: This should NEVER be enabled in production builds.
 * The __DEV__ flag ensures this only works in development.
 */

import {
  MOCK_RECEIPTS,
  getMockReceiptSummary,
  getMockReceiptsThisWeek,
  getMockReceiptsThisMonth,
  getMockReceiptsByCategory,
  getMockCategoryBreakdown,
  getMockReceiptById,
  formatCurrency,
} from '@/lib/data/mock-receipts';

export const DEV_MODE_CONFIG = {
  /**
   * Master switch for dev mode.
   * When true (and __DEV__ is true), bypasses auth, onboarding, and paywall.
   */
  ENABLED: false,

  /**
   * Mock user data used when dev mode is enabled.
   * Customize this to test different user scenarios.
   */
  MOCK_USER: {
    id: 'dev-user-12345',
    email: 'dev@example.com',
    name: 'Dev User',
  },

  /**
   * Demo mode for screenshots.
   * When true, uses mock receipt data instead of real data.
   */
  DEMO_MODE: false,

  /**
   * Individual feature bypasses.
   * These only take effect when ENABLED is true.
   */
  bypasses: {
    /** Skip Apple/Google sign-in, use mock user instead */
    AUTH: true,

    /** Skip onboarding flow, mark as completed */
    ONBOARDING: true,

    /** Skip paywall, treat user as subscribed */
    PAYWALL: true,

    /** Give unlimited free scans (if not bypassing paywall) */
    UNLIMITED_FREE_SCANS: true,
  },

  /**
   * Mock subscription state when PAYWALL bypass is enabled.
   */
  mockSubscription: {
    isSubscribed: true,
    isTrialing: false,
    freeScansRemaining: 999,
  },
} as const;

/**
 * Check if dev mode is active.
 * Returns true only in development AND when dev mode is enabled.
 */
export function isDevModeActive(): boolean {
  return __DEV__ && DEV_MODE_CONFIG.ENABLED;
}

/**
 * Check if a specific bypass is active.
 */
export function isBypassActive(bypass: keyof typeof DEV_MODE_CONFIG.bypasses): boolean {
  return isDevModeActive() && DEV_MODE_CONFIG.bypasses[bypass];
}

/**
 * Log dev mode status on app start (only in dev).
 */
export function logDevModeStatus(): void {
  if (__DEV__) {
    if (DEV_MODE_CONFIG.ENABLED) {
      console.log('🔧 DEV MODE ENABLED');
      console.log('   Bypasses:', DEV_MODE_CONFIG.bypasses);
    } else {
      console.log(
        '🔧 Dev mode available but disabled (set DEV_MODE_CONFIG.ENABLED = true to enable)'
      );
    }
    if (DEV_MODE_CONFIG.DEMO_MODE) {
      console.log('📸 DEMO MODE ENABLED - Using mock receipt data');
    }
  }
}

/**
 * Check if demo mode is active for screenshots.
 * Demo mode works independently of dev mode.
 */
export function isDemoMode(): boolean {
  return DEV_MODE_CONFIG.DEMO_MODE;
}

/**
 * Demo data exports for use in screens.
 * Import these when isDemoMode() returns true.
 */
export const DEMO_DATA = {
  receipts: MOCK_RECEIPTS,
  getSummary: getMockReceiptSummary,
  getThisWeek: getMockReceiptsThisWeek,
  getThisMonth: getMockReceiptsThisMonth,
  getByCategory: getMockReceiptsByCategory,
  getCategoryBreakdown: getMockCategoryBreakdown,
  getById: getMockReceiptById,
  formatCurrency,
};
