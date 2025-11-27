/**
 * Hook for debt payoff calculations
 * Provides accurate loan amortization math for payoff projections
 */

interface DebtCalculationInput {
  principal: number;
  annualRate: number; // as decimal (e.g., 0.18 for 18%)
  monthlyPayment: number;
}

interface DebtCalculationResult {
  monthlyRate: number;
  payoffMonths: number;
  totalInterest: number;
  minPaymentRequired: number;
  paymentCoversInterest: boolean;
  debtFreeDate: Date;
}

interface OptimizedCalculation extends DebtCalculationResult {
  optimizedPayment: number;
  optimizedMonths: number;
  optimizedTotalInterest: number;
  interestSaved: number;
  monthsSaved: number;
}

/**
 * Calculate months to pay off debt with a given payment
 * Formula: n = -log(1 - rP/M) / log(1+r)
 */
export function calculateMonthsToPayoff(
  principal: number,
  monthlyRate: number,
  payment: number
): number {
  if (payment <= 0 || principal <= 0) return Infinity;
  if (monthlyRate === 0) return Math.ceil(principal / payment);

  const monthlyInterest = principal * monthlyRate;
  if (payment <= monthlyInterest) return Infinity;

  const months = -Math.log(1 - (monthlyRate * principal) / payment) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
}

/**
 * Calculate total interest paid over the life of the loan
 */
export function calculateTotalInterest(
  principal: number,
  payment: number,
  months: number
): number {
  if (months <= 0 || payment <= 0 || principal <= 0 || !isFinite(months)) return 0;
  return payment * months - principal;
}

/**
 * Hook to calculate debt payoff projections
 */
export function useDebtCalculations(input: DebtCalculationInput): DebtCalculationResult {
  const { principal, annualRate, monthlyPayment } = input;
  const monthlyRate = annualRate / 12;

  const payoffMonths = calculateMonthsToPayoff(principal, monthlyRate, monthlyPayment);
  const totalInterest = calculateTotalInterest(principal, monthlyPayment, payoffMonths);
  const minPaymentRequired = principal * monthlyRate;
  const paymentCoversInterest = monthlyPayment > minPaymentRequired;

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + (isFinite(payoffMonths) ? payoffMonths : 0));

  return {
    monthlyRate,
    payoffMonths,
    totalInterest,
    minPaymentRequired,
    paymentCoversInterest,
    debtFreeDate,
  };
}

/**
 * Hook to calculate optimized debt payoff (e.g., paying 20% more)
 */
export function useOptimizedDebtCalculations(
  input: DebtCalculationInput,
  multiplier: number = 1.2
): OptimizedCalculation {
  const baseCalc = useDebtCalculations(input);
  const { principal, annualRate, monthlyPayment } = input;
  const monthlyRate = annualRate / 12;

  const optimizedPayment = monthlyPayment * multiplier;
  const optimizedMonths = calculateMonthsToPayoff(principal, monthlyRate, optimizedPayment);
  const optimizedTotalInterest = calculateTotalInterest(principal, optimizedPayment, optimizedMonths);

  const interestSaved = Math.max(0, baseCalc.totalInterest - optimizedTotalInterest);
  const monthsSaved =
    isFinite(baseCalc.payoffMonths) && isFinite(optimizedMonths)
      ? Math.max(0, baseCalc.payoffMonths - optimizedMonths)
      : 0;

  // Update debt free date to use optimized months
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + (isFinite(optimizedMonths) ? optimizedMonths : 0));

  return {
    ...baseCalc,
    debtFreeDate,
    optimizedPayment,
    optimizedMonths,
    optimizedTotalInterest,
    interestSaved,
    monthsSaved,
  };
}
