import { createContext, useContext, ReactNode } from 'react';
import { DEV_MODE_CONFIG, isDevModeActive, isBypassActive, logDevModeStatus } from '@/lib/config/dev-mode';

interface DevModeContextType {
  /** Whether dev mode is currently active */
  isActive: boolean;
  /** Check if a specific bypass is enabled */
  isBypassEnabled: (bypass: keyof typeof DEV_MODE_CONFIG.bypasses) => boolean;
  /** Mock user data for dev mode */
  mockUser: typeof DEV_MODE_CONFIG.MOCK_USER;
  /** Mock subscription state for dev mode */
  mockSubscription: typeof DEV_MODE_CONFIG.mockSubscription;
  /** Full config access for advanced use cases */
  config: typeof DEV_MODE_CONFIG;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
  // Log dev mode status on mount
  if (__DEV__) {
    logDevModeStatus();
  }

  const value: DevModeContextType = {
    isActive: isDevModeActive(),
    isBypassEnabled: isBypassActive,
    mockUser: DEV_MODE_CONFIG.MOCK_USER,
    mockSubscription: DEV_MODE_CONFIG.mockSubscription,
    config: DEV_MODE_CONFIG,
  };

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
}

export function useDevMode(): DevModeContextType {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
}

/**
 * Hook to check if dev mode is active without requiring provider.
 * Useful for conditional logic outside the provider tree.
 */
export function useIsDevMode(): boolean {
  return isDevModeActive();
}
