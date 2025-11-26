import { Debt, DebtPayment, DebtSummary } from '@/lib/types/debt';

// Mock debt data sorted by interest rate (highest first - Avalanche method)
export const MOCK_DEBTS: Debt[] = [
  {
    id: '1',
    name: 'Visa Gold Card',
    category: 'credit_card',
    status: 'active',
    current_balance: 8500,
    original_balance: 12000,
    interest_rate: 0.2499, // 24.99%
    minimum_payment: 170,
    due_date: 15,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-11-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'Chase Sapphire',
    category: 'credit_card',
    status: 'active',
    current_balance: 4200,
    original_balance: 5000,
    interest_rate: 0.2199, // 21.99%
    minimum_payment: 84,
    due_date: 22,
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-11-18T00:00:00Z',
  },
  {
    id: '3',
    name: 'Personal Loan - SoFi',
    category: 'personal_loan',
    status: 'active',
    current_balance: 15000,
    original_balance: 20000,
    interest_rate: 0.1299, // 12.99%
    minimum_payment: 450,
    due_date: 1,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-11-15T00:00:00Z',
  },
  {
    id: '4',
    name: 'Toyota Camry Loan',
    category: 'auto_loan',
    status: 'active',
    current_balance: 18500,
    original_balance: 28000,
    interest_rate: 0.0649, // 6.49%
    minimum_payment: 485,
    due_date: 5,
    created_at: '2022-08-15T00:00:00Z',
    updated_at: '2024-11-05T00:00:00Z',
  },
  {
    id: '5',
    name: 'Federal Student Loan',
    category: 'student_loan',
    status: 'active',
    current_balance: 32000,
    original_balance: 45000,
    interest_rate: 0.0499, // 4.99%
    minimum_payment: 350,
    due_date: 28,
    created_at: '2020-09-01T00:00:00Z',
    updated_at: '2024-11-28T00:00:00Z',
  },
  // Paid off debt example
  {
    id: '6',
    name: 'Best Buy Store Card',
    category: 'credit_card',
    status: 'paid_off',
    current_balance: 0,
    original_balance: 2500,
    interest_rate: 0.2699, // 26.99%
    minimum_payment: 0,
    due_date: 10,
    paid_off_date: '2024-09-15T00:00:00Z',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-09-15T00:00:00Z',
  },
].sort((a, b) => b.interest_rate - a.interest_rate);

// Mock payment history
export const MOCK_PAYMENTS: DebtPayment[] = [
  {
    id: 'p1',
    debt_id: '1',
    amount: 200,
    principal_paid: 85,
    interest_paid: 115,
    payment_date: '2024-11-15T00:00:00Z',
    created_at: '2024-11-15T00:00:00Z',
  },
  {
    id: 'p2',
    debt_id: '1',
    amount: 170,
    principal_paid: 62,
    interest_paid: 108,
    payment_date: '2024-10-15T00:00:00Z',
    created_at: '2024-10-15T00:00:00Z',
  },
  {
    id: 'p3',
    debt_id: '2',
    amount: 100,
    principal_paid: 45,
    interest_paid: 55,
    payment_date: '2024-11-22T00:00:00Z',
    created_at: '2024-11-22T00:00:00Z',
  },
];

// Calculate debt summary from mock data (only active debts)
export function calculateDebtSummary(debts: Debt[]): DebtSummary {
  // Only count active debts for summary
  const activeDebts = debts.filter(d => d.status === 'active');

  if (activeDebts.length === 0) {
    return {
      total_balance: 0,
      total_original_balance: 0,
      total_minimum_payment: 0,
      total_interest_paid: 0,
      debt_count: 0,
      highest_rate_debt: null,
    };
  }

  const total_balance = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
  const total_original_balance = activeDebts.reduce((sum, d) => sum + d.original_balance, 0);
  const total_minimum_payment = activeDebts.reduce((sum, d) => sum + d.minimum_payment, 0);
  const total_interest_paid = total_original_balance - total_balance; // Simplified
  const highest_rate_debt = [...activeDebts].sort((a, b) => b.interest_rate - a.interest_rate)[0];

  return {
    total_balance,
    total_original_balance,
    total_minimum_payment,
    total_interest_paid,
    debt_count: activeDebts.length,
    highest_rate_debt,
  };
}

// Simulate API delay
export const simulateDelay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));
