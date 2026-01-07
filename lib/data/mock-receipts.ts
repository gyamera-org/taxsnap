import { Receipt, ReceiptSummary } from '@/lib/types/receipt';
import { TaxCategoryId, calculateDeductible, calculateTaxSavings } from '@/lib/constants/categories';

// Mock user ID for demo
const MOCK_USER_ID = 'demo-user-123';

// Helper to generate receipt ID
const generateId = (index: number) => `mock-receipt-${index.toString().padStart(3, '0')}`;

// Helper to convert dollars to cents
const toCents = (dollars: number) => Math.round(dollars * 100);

// Current year for demo
const CURRENT_YEAR = new Date().getFullYear();

// Mock receipts with realistic business expenses
export const MOCK_RECEIPTS: Receipt[] = [
  // Recent receipts (this week)
  {
    id: generateId(1),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Starbucks',
    date: '2026-01-06',
    total_amount: toCents(18.45),
    currency: 'USD',
    category: 'meals',
    deductible_amount: toCents(18.45 * 0.5),
    note: 'Client meeting - discussing project scope',
    tax_year: CURRENT_YEAR,
    status: 'completed',
    created_at: '2026-01-06T10:30:00Z',
    updated_at: null,
  },
  {
    id: generateId(2),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Amazon Web Services',
    date: '2026-01-05',
    total_amount: toCents(127.83),
    currency: 'USD',
    category: 'office_expense',
    deductible_amount: toCents(127.83),
    note: 'Cloud hosting - January',
    tax_year: CURRENT_YEAR,
    status: 'completed',
    created_at: '2026-01-05T08:15:00Z',
    updated_at: null,
  },
  {
    id: generateId(3),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Office Depot',
    date: '2026-01-04',
    total_amount: toCents(89.99),
    currency: 'USD',
    category: 'supplies',
    deductible_amount: toCents(89.99),
    note: 'Printer paper and ink cartridges',
    tax_year: CURRENT_YEAR,
    status: 'completed',
    created_at: '2026-01-04T14:22:00Z',
    updated_at: null,
  },
  {
    id: generateId(4),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Uber',
    date: '2026-01-03',
    total_amount: toCents(34.50),
    currency: 'USD',
    category: 'travel',
    deductible_amount: toCents(34.50),
    note: 'Airport to client office',
    tax_year: CURRENT_YEAR,
    status: 'completed',
    created_at: '2026-01-03T09:00:00Z',
    updated_at: null,
  },

  // Last week
  {
    id: generateId(5),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Figma',
    date: '2025-12-30',
    total_amount: toCents(15.00),
    currency: 'USD',
    category: 'office_expense',
    deductible_amount: toCents(15.00),
    note: 'Design tool subscription',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-30T12:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(6),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'WeWork',
    date: '2025-12-28',
    total_amount: toCents(450.00),
    currency: 'USD',
    category: 'rent_property',
    deductible_amount: toCents(450.00),
    note: 'Coworking space - December',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-28T10:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(7),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Shell Gas Station',
    date: '2025-12-27',
    total_amount: toCents(62.40),
    currency: 'USD',
    category: 'car_truck',
    deductible_amount: toCents(62.40),
    note: 'Gas for client visits',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-27T16:45:00Z',
    updated_at: null,
  },

  // Earlier this month / last month
  {
    id: generateId(8),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'LinkedIn',
    date: '2025-12-20',
    total_amount: toCents(59.99),
    currency: 'USD',
    category: 'advertising',
    deductible_amount: toCents(59.99),
    note: 'Premium subscription for networking',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-20T11:30:00Z',
    updated_at: null,
  },
  {
    id: generateId(9),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Apple',
    date: '2025-12-15',
    total_amount: toCents(1299.00),
    currency: 'USD',
    category: 'depreciation',
    deductible_amount: toCents(1299.00),
    note: 'MacBook Pro for development',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-15T14:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(10),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Chipotle',
    date: '2025-12-12',
    total_amount: toCents(24.50),
    currency: 'USD',
    category: 'meals',
    deductible_amount: toCents(24.50 * 0.5),
    note: 'Lunch with potential client',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-12T13:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(11),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Verizon',
    date: '2025-12-10',
    total_amount: toCents(85.00),
    currency: 'USD',
    category: 'utilities',
    deductible_amount: toCents(85.00),
    note: 'Business phone line',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-10T09:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(12),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Delta Airlines',
    date: '2025-12-05',
    total_amount: toCents(387.00),
    currency: 'USD',
    category: 'travel',
    deductible_amount: toCents(387.00),
    note: 'Flight to NYC for conference',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-05T07:30:00Z',
    updated_at: null,
  },
  {
    id: generateId(13),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Marriott Hotels',
    date: '2025-12-05',
    total_amount: toCents(245.00),
    currency: 'USD',
    category: 'travel',
    deductible_amount: toCents(245.00),
    note: 'Hotel for NYC conference',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-05T18:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(14),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'TurboTax',
    date: '2025-12-01',
    total_amount: toCents(89.00),
    currency: 'USD',
    category: 'legal_professional',
    deductible_amount: toCents(89.00),
    note: 'Tax preparation software',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(15),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Google Ads',
    date: '2025-11-28',
    total_amount: toCents(150.00),
    currency: 'USD',
    category: 'advertising',
    deductible_amount: toCents(150.00),
    note: 'November ad spend',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-11-28T12:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(16),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Staples',
    date: '2025-11-25',
    total_amount: toCents(156.78),
    currency: 'USD',
    category: 'supplies',
    deductible_amount: toCents(156.78),
    note: 'Office supplies and organizers',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-11-25T15:30:00Z',
    updated_at: null,
  },
  {
    id: generateId(17),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'Zoom',
    date: '2025-11-20',
    total_amount: toCents(14.99),
    currency: 'USD',
    category: 'office_expense',
    deductible_amount: toCents(14.99),
    note: 'Video conferencing subscription',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-11-20T08:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(18),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'State Farm',
    date: '2025-11-15',
    total_amount: toCents(175.00),
    currency: 'USD',
    category: 'insurance',
    deductible_amount: toCents(175.00),
    note: 'Professional liability insurance',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-11-15T10:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(19),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'The Capital Grille',
    date: '2025-11-10',
    total_amount: toCents(187.50),
    currency: 'USD',
    category: 'meals',
    deductible_amount: toCents(187.50 * 0.5),
    note: 'Team dinner with contractors',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-11-10T20:00:00Z',
    updated_at: null,
  },
  {
    id: generateId(20),
    user_id: MOCK_USER_ID,
    image_uri: 'https://placehold.co/400x600/1a1a2e/ffffff?text=Receipt',
    vendor: 'GitHub',
    date: '2025-11-05',
    total_amount: toCents(4.00),
    currency: 'USD',
    category: 'office_expense',
    deductible_amount: toCents(4.00),
    note: 'Code repository subscription',
    tax_year: CURRENT_YEAR - 1,
    status: 'completed',
    created_at: '2025-11-05T09:00:00Z',
    updated_at: null,
  },
];

// Calculate summary from mock receipts
export function getMockReceiptSummary(): ReceiptSummary {
  const totalReceipts = MOCK_RECEIPTS.length;
  const totalAmount = MOCK_RECEIPTS.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const totalDeductible = MOCK_RECEIPTS.reduce((sum, r) => sum + (r.deductible_amount || 0), 0);
  const estimatedSavings = calculateTaxSavings(totalDeductible);

  return {
    totalReceipts,
    totalAmount,
    totalDeductible,
    estimatedSavings,
  };
}

// Get receipts filtered by date range
export function getMockReceiptsByDateRange(startDate: Date, endDate: Date): Receipt[] {
  return MOCK_RECEIPTS.filter((receipt) => {
    if (!receipt.date) return false;
    const receiptDate = new Date(receipt.date);
    return receiptDate >= startDate && receiptDate <= endDate;
  });
}

// Get receipts filtered by category
export function getMockReceiptsByCategory(category: TaxCategoryId): Receipt[] {
  return MOCK_RECEIPTS.filter((receipt) => receipt.category === category);
}

// Get receipts for current month
export function getMockReceiptsThisMonth(): Receipt[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return getMockReceiptsByDateRange(startOfMonth, endOfMonth);
}

// Get receipts for current week
export function getMockReceiptsThisWeek(): Receipt[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return getMockReceiptsByDateRange(startOfWeek, endOfWeek);
}

// Get category breakdown for dashboard
export function getMockCategoryBreakdown(): { category: TaxCategoryId; total: number; count: number }[] {
  const breakdown: Record<string, { total: number; count: number }> = {};

  MOCK_RECEIPTS.forEach((receipt) => {
    if (receipt.category && receipt.deductible_amount) {
      if (!breakdown[receipt.category]) {
        breakdown[receipt.category] = { total: 0, count: 0 };
      }
      breakdown[receipt.category].total += receipt.deductible_amount;
      breakdown[receipt.category].count += 1;
    }
  });

  return Object.entries(breakdown)
    .map(([category, data]) => ({
      category: category as TaxCategoryId,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total);
}

// Format cents to dollar string
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Get a single receipt by ID
export function getMockReceiptById(id: string): Receipt | undefined {
  return MOCK_RECEIPTS.find((receipt) => receipt.id === id);
}
