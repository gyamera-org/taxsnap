import { Debt, DebtScenario, RefinanceScenario } from '@/lib/types/debt';

/**
 * Calculate the number of months to pay off a debt with given payment
 */
export function calculatePayoffMonths(
  balance: number,
  annualRate: number,
  monthlyPayment: number
): number {
  if (monthlyPayment <= 0 || balance <= 0) return Infinity;

  const monthlyRate = annualRate / 12;

  // If payment doesn't cover interest, it will never be paid off
  const monthlyInterest = balance * monthlyRate;
  if (monthlyPayment <= monthlyInterest) return Infinity;

  // Formula: n = -log(1 - (r * P) / M) / log(1 + r)
  // Where: P = principal, r = monthly rate, M = monthly payment
  const months = Math.ceil(
    -Math.log(1 - (monthlyRate * balance) / monthlyPayment) / Math.log(1 + monthlyRate)
  );

  return isFinite(months) ? months : Infinity;
}

/**
 * Calculate total interest paid over the life of the loan
 */
export function calculateTotalInterest(
  balance: number,
  annualRate: number,
  monthlyPayment: number
): number {
  const months = calculatePayoffMonths(balance, annualRate, monthlyPayment);
  if (!isFinite(months)) return 0;

  const totalPaid = monthlyPayment * months;
  return Math.max(0, totalPaid - balance);
}

/**
 * Calculate payoff date given current date and months remaining
 * Returns null if months is not finite
 */
export function calculatePayoffDate(months: number): Date | null {
  if (!isFinite(months) || months < 0) return null;
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

/**
 * Calculate scenario with extra monthly payment
 */
export function calculateExtraPaymentScenario(
  debt: Debt,
  extraMonthlyPayment: number
): DebtScenario {
  const originalPayment = debt.minimum_payment;
  const newPayment = originalPayment + extraMonthlyPayment;

  const originalMonths = calculatePayoffMonths(
    debt.current_balance,
    debt.interest_rate,
    originalPayment
  );

  const newMonths = calculatePayoffMonths(
    debt.current_balance,
    debt.interest_rate,
    newPayment
  );

  const originalInterest = calculateTotalInterest(
    debt.current_balance,
    debt.interest_rate,
    originalPayment
  );

  const newInterest = calculateTotalInterest(
    debt.current_balance,
    debt.interest_rate,
    newPayment
  );

  return {
    extra_payment: extraMonthlyPayment,
    original_payoff_date: calculatePayoffDate(originalMonths) ?? new Date(),
    new_payoff_date: calculatePayoffDate(newMonths) ?? new Date(),
    total_interest_saved: isFinite(originalInterest) && isFinite(newInterest)
      ? Math.max(0, originalInterest - newInterest)
      : 0,
    months_saved: isFinite(originalMonths) && isFinite(newMonths)
      ? Math.max(0, originalMonths - newMonths)
      : 0,
  };
}

/**
 * Calculate scenario with refinanced interest rate
 */
export function calculateRefinanceScenario(
  debt: Debt,
  newAnnualRate: number
): RefinanceScenario {
  const originalInterest = calculateTotalInterest(
    debt.current_balance,
    debt.interest_rate,
    debt.minimum_payment
  );

  const newInterest = calculateTotalInterest(
    debt.current_balance,
    newAnnualRate,
    debt.minimum_payment
  );

  const newMonths = calculatePayoffMonths(
    debt.current_balance,
    newAnnualRate,
    debt.minimum_payment
  );

  return {
    new_rate: newAnnualRate,
    total_interest_saved: isFinite(originalInterest) && isFinite(newInterest)
      ? Math.max(0, originalInterest - newInterest)
      : 0,
    new_monthly_payment: debt.minimum_payment,
    new_payoff_date: calculatePayoffDate(newMonths) ?? new Date(),
  };
}

/**
 * Calculate the progress percentage of a debt
 */
export function calculateDebtProgress(debt: Debt): number {
  if (debt.original_balance <= 0) return 100;
  const paid = debt.original_balance - debt.current_balance;
  return Math.round((paid / debt.original_balance) * 100);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (!isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency with decimals
 */
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format months as years and months
 */
export function formatDuration(months: number): string {
  if (!isFinite(months)) return 'Never';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years}y ${remainingMonths}m`;
}
