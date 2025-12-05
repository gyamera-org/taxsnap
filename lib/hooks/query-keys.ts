export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    detail: () => [...queryKeys.accounts.all, 'detail'] as const,
    subscription: () => [...queryKeys.accounts.all, 'subscription'] as const,
    onboardingProfile: () => [...queryKeys.accounts.all, 'onboarding-profile'] as const,
  },
  subscription: {
    all: ['subscription'] as const,
    info: (userId?: string) => [...queryKeys.subscription.all, 'info', userId] as const,
    status: () => [...queryKeys.subscription.all, 'status'] as const,
  },
  settings: {
    all: ['settings'] as const,
    detail: () => [...queryKeys.settings.all, 'detail'] as const,
    avatar: () => [...queryKeys.settings.all, 'avatar'] as const,
    reminderSettings: ['settings', 'reminder-settings'] as const,
  },
} as const;
