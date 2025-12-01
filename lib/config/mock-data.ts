import { Debt } from '@/lib/types/debt';
import { ChatMessage } from '@/lib/hooks/use-chat';

// Toggle this to true for App Store screenshots
export const DEMO_MODE = false;

// Mock data for demo/screenshots
export const MOCK_DEBTS: Debt[] = [
  {
    id: '1',
    name: 'Chase Credit Card',
    category: 'credit_card',
    original_balance: 8500,
    current_balance: 4250,
    interest_rate: 0.2499,
    minimum_payment: 175,
    due_date: 15,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Car Loan',
    category: 'auto_loan',
    original_balance: 25000,
    current_balance: 18750,
    interest_rate: 0.0699,
    minimum_payment: 450,
    due_date: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Student Loan',
    category: 'student_loan',
    original_balance: 35000,
    current_balance: 28000,
    interest_rate: 0.0525,
    minimum_payment: 350,
    due_date: 20,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Best Buy Card',
    category: 'credit_card',
    original_balance: 2000,
    current_balance: 0,
    interest_rate: 0.2199,
    minimum_payment: 50,
    due_date: 10,
    status: 'paid_off',
    paid_off_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock chat messages for advisor screenshots
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Which debt should I pay off first?',
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '2',
    role: 'assistant',
    content:
      'Based on your debts, I recommend focusing on your Chase Credit Card first. Here\'s why:\n\n• It has the highest interest rate at 24.99% APR\n• You\'ll save the most money by eliminating high-interest debt first\n• This is called the "Avalanche Method"\n\nBy paying an extra $100/month on this card, you could save over $800 in interest and be debt-free 8 months sooner!',
    created_at: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: '3',
    role: 'user',
    content: 'How much interest will I pay in total?',
    created_at: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: '4',
    role: 'assistant',
    content:
      "At your current payment rate, here's your total interest breakdown:\n\n• Chase Credit Card: $2,847\n• Car Loan: $1,523\n• Student Loan: $4,290\n\nTotal Interest: $8,660\n\nWant me to show you how to reduce this amount?",
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
];

// Mock payment history for debt detail screenshots
export const MOCK_PAYMENTS = [
  {
    id: '1',
    debt_id: '1',
    amount: 250,
    principal_paid: 162.5,
    interest_paid: 87.5,
    payment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    debt_id: '1',
    amount: 175,
    principal_paid: 98.3,
    interest_paid: 76.7,
    payment_date: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    debt_id: '1',
    amount: 200,
    principal_paid: 115.2,
    interest_paid: 84.8,
    payment_date: new Date(Date.now() - 67 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    debt_id: '1',
    amount: 175,
    principal_paid: 95.8,
    interest_paid: 79.2,
    payment_date: new Date(Date.now() - 97 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];

export const MOCK_DATA = {
  debts: MOCK_DEBTS,
  activeDebts: MOCK_DEBTS.filter((d) => d.status === 'active'),
  paidOffDebts: MOCK_DEBTS.filter((d) => d.status === 'paid_off'),
  totalOriginal: 70500,
  totalBalance: 51000,
  totalPaid: 19500,
  monthlyPayment: 975,
  interestSaved: 2847.5,
  debtFreeDate: 'Mar 2028',
  priorityDebt: MOCK_DEBTS[0],
  chatMessages: MOCK_CHAT_MESSAGES,
  payments: MOCK_PAYMENTS,
};
