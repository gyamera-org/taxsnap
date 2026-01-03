/**
 * App Configuration
 *
 * This file contains all app-specific configuration settings.
 * Customize these values for each app that uses this base.
 */

// ============================================================================
// LOCALIZATION SETTINGS
// ============================================================================

export const localizationConfig = {
  /**
   * Enable/disable localization for the app
   * When disabled, the app will only use English
   */
  enabled: true,

  /**
   * Default language code
   * Must be one of the supported languages if localization is enabled
   */
  defaultLanguage: 'en' as const,

  /**
   * Allow users to manually change language in settings
   * If false, the app will only use device language or defaultLanguage
   */
  allowLanguageSwitch: true,
} as const;

// ============================================================================
// PRICING MODELS
// ============================================================================

export type PricingPlan = 'weekly' | 'monthly' | 'yearly' | 'lifetime';

export interface PlanConfig {
  /** Unique identifier matching RevenueCat package identifier */
  id: PricingPlan;
  /** Display order (lower = first) */
  order: number;
  /** Whether this plan has a free trial */
  hasTrial: boolean;
  /** Number of trial days (if hasTrial is true) */
  trialDays?: number;
  /** Badge text to show (e.g., "Best Value", "Most Popular") */
  badge?: string;
  /** Whether to show savings percentage compared to other plans */
  showSavings: boolean;
  /** The plan to compare savings against (e.g., 'weekly' for yearly savings) */
  savingsComparedTo?: PricingPlan;
}

export const pricingConfig = {
  /**
   * Available pricing plans
   * Set enabled: true for plans you want to show in the paywall
   */
  plans: {
    weekly: {
      enabled: true,
      config: {
        id: 'weekly',
        order: 4,
        hasTrial: false,
        showSavings: false,
      } as PlanConfig,
    },
    monthly: {
      enabled: false,
      config: {
        id: 'monthly',
        order: 3,
        hasTrial: false,
        showSavings: true,
        savingsComparedTo: 'weekly',
      } as PlanConfig,
    },
    yearly: {
      enabled: true,
      config: {
        id: 'yearly',
        order: 1,
        hasTrial: true,
        trialDays: 3,
        badge: 'bestValue',
        showSavings: true,
        savingsComparedTo: 'weekly',
      } as PlanConfig,
    },
    lifetime: {
      enabled: false,
      config: {
        id: 'lifetime',
        order: 2,
        hasTrial: false,
        badge: 'oneTime',
        showSavings: false,
      } as PlanConfig,
    },
  },

  /**
   * Default selected plan when paywall opens
   * Must be one of the enabled plans
   */
  defaultSelectedPlan: 'yearly' as PricingPlan,

  /**
   * Show "Continue for Free" button on paywall
   */
  showContinueForFree: false,

  /**
   * Show restore purchases button
   */
  showRestorePurchases: true,
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const featureFlags = {
  /**
   * Enable premium features paywall
   */
  enablePaywall: true,

  /**
   * Enable onboarding flow for new users
   */
  enableOnboarding: true,

  /**
   * Enable user authentication
   */
  enableAuth: true,

  /**
   * Enable dark mode toggle in settings
   */
  enableDarkMode: true,

  /**
   * Enable notifications settings
   */
  enableNotifications: true,

  /**
   * Enable feedback submission
   */
  enableFeedback: true,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all enabled pricing plans sorted by order
 */
export function getEnabledPlans(): PlanConfig[] {
  return Object.values(pricingConfig.plans)
    .filter((plan) => plan.enabled)
    .map((plan) => plan.config)
    .sort((a, b) => a.order - b.order);
}

/**
 * Check if a specific plan is enabled
 */
export function isPlanEnabled(planId: PricingPlan): boolean {
  return pricingConfig.plans[planId]?.enabled ?? false;
}

/**
 * Get the default selected plan (falls back to first enabled plan)
 */
export function getDefaultSelectedPlan(): PricingPlan {
  const enabledPlans = getEnabledPlans();
  if (isPlanEnabled(pricingConfig.defaultSelectedPlan)) {
    return pricingConfig.defaultSelectedPlan;
  }
  return enabledPlans[0]?.id ?? 'yearly';
}

/**
 * Calculate savings percentage between two plans
 * @param planPrice - The price of the plan to calculate savings for
 * @param comparisonPrice - The price of the comparison plan
 * @param planPeriodWeeks - Number of weeks in the plan period (52 for yearly, 4 for monthly)
 */
export function calculateSavingsPercent(
  planPrice: number,
  comparisonPrice: number,
  planPeriodWeeks: number
): number {
  if (comparisonPrice === 0) return 0;
  const equivalentPrice = comparisonPrice * planPeriodWeeks;
  return Math.round((1 - planPrice / equivalentPrice) * 100);
}
