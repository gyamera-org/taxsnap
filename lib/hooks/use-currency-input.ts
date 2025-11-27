import { useState, useCallback } from 'react';

interface UseCurrencyInputOptions {
  initialValue?: string;
}

interface UseCurrencyInputReturn {
  value: string;
  numericValue: number;
  setValue: (text: string) => void;
  clear: () => void;
}

/**
 * Format a string to currency display (with commas)
 */
export function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers === '') return '';
  const num = parseInt(numbers, 10);
  return num.toLocaleString('en-US');
}

/**
 * Parse a formatted currency string to number
 */
export function parseCurrencyValue(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format a number as currency for display
 */
export function formatMoney(amount: number): string {
  if (!isFinite(amount) || amount === 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format months as human-readable duration
 */
export function formatDuration(months: number): string {
  if (!isFinite(months) || months <= 0) return 'Never';
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);

  if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years}y ${remainingMonths}m`;
}

/**
 * Hook for handling currency input with formatting
 */
export function useCurrencyInput(options: UseCurrencyInputOptions = {}): UseCurrencyInputReturn {
  const { initialValue = '' } = options;
  const [value, setValueState] = useState(initialValue);

  const setValue = useCallback((text: string) => {
    setValueState(formatCurrencyInput(text));
  }, []);

  const clear = useCallback(() => {
    setValueState('');
  }, []);

  const numericValue = parseCurrencyValue(value);

  return {
    value,
    numericValue,
    setValue,
    clear,
  };
}
