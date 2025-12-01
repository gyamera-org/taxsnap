import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENCIES, DEFAULT_CURRENCY, CurrencyConfig } from '@/lib/config/currencies';

// Re-export for backward compatibility
export { CURRENCIES, CurrencyConfig } from '@/lib/config/currencies';

const CURRENCY_STORAGE_KEY = '@debt_free_currency';

interface CurrencyContextType {
  currency: CurrencyConfig;
  setCurrency: (currency: CurrencyConfig) => Promise<void>;
  isLoading: boolean;
  formatCurrency: (amount: number, options?: { decimals?: boolean }) => string;
  formatCurrencyCompact: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved currency on mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const saved = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as CurrencyConfig;
          // Verify it's a valid currency
          const found = CURRENCIES.find((c) => c.code === parsed.code);
          if (found) {
            setCurrencyState(found);
          }
        }
      } catch (error) {
        console.error('Error loading currency:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCurrency();
  }, []);

  const setCurrency = async (newCurrency: CurrencyConfig) => {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(newCurrency));
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const formatCurrency = (amount: number, options?: { decimals?: boolean }): string => {
    if (!isFinite(amount)) return `${currency.symbol}0`;

    const showDecimals = options?.decimals ?? true;

    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
  };

  const formatCurrencyCompact = (amount: number): string => {
    if (!isFinite(amount) || amount === 0) return `${currency.symbol}0`;

    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    isLoading,
    formatCurrency,
    formatCurrencyCompact,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be inside CurrencyProvider');
  return ctx;
}

// Helper to get currency without hook (for utils that can't use hooks)
export async function getSavedCurrency(): Promise<CurrencyConfig> {
  try {
    const saved = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CurrencyConfig;
      const found = CURRENCIES.find((c) => c.code === parsed.code);
      if (found) return found;
    }
  } catch (error) {
    console.error('Error getting saved currency:', error);
  }
  return DEFAULT_CURRENCY;
}

// Helper to save currency without hook
export async function saveCurrency(currency: CurrencyConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(currency));
  } catch (error) {
    console.error('Error saving currency:', error);
  }
}
