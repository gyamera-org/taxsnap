// IRS Schedule C Tax Categories (Form 1040)
// Part II - Expenses (Lines 8-27)
// Reference: https://www.irs.gov/forms-pubs/about-schedule-c-form-1040

export const TAX_CATEGORIES = [
  // Line 8
  {
    id: 'advertising',
    name: 'Advertising',
    line: 8,
    rate: 1.0,
    tip: 'Marketing, promotions, business cards, online ads.',
  },
  // Line 9
  {
    id: 'car_truck',
    name: 'Car & Truck Expenses',
    line: 9,
    rate: 1.0,
    tip: 'Gas, repairs, insurance for business vehicle. Track mileage or actual expenses.',
  },
  // Line 10
  {
    id: 'commissions_fees',
    name: 'Commissions & Fees',
    line: 10,
    rate: 1.0,
    tip: 'Payment processing fees, referral fees, sales commissions.',
  },
  // Line 11
  {
    id: 'contract_labor',
    name: 'Contract Labor',
    line: 11,
    rate: 1.0,
    tip: 'Payments to independent contractors (not employees).',
  },
  // Line 12
  {
    id: 'depletion',
    name: 'Depletion',
    line: 12,
    rate: 1.0,
    tip: 'For natural resource businesses (timber, oil, gas, minerals).',
  },
  // Line 13
  {
    id: 'depreciation',
    name: 'Depreciation & Section 179',
    line: 13,
    rate: 1.0,
    tip: 'Equipment, computers, furniture. May deduct full cost or depreciate over time.',
  },
  // Line 14
  {
    id: 'employee_benefits',
    name: 'Employee Benefit Programs',
    line: 14,
    rate: 1.0,
    tip: 'Health insurance, retirement plans for employees (not yourself).',
  },
  // Line 15
  {
    id: 'insurance',
    name: 'Insurance',
    line: 15,
    rate: 1.0,
    tip: 'Business liability, professional liability, property insurance. Not health insurance.',
  },
  // Line 16a
  {
    id: 'interest_mortgage',
    name: 'Interest - Mortgage',
    line: '16a',
    rate: 1.0,
    tip: 'Mortgage interest on business property paid to banks.',
  },
  // Line 16b
  {
    id: 'interest_other',
    name: 'Interest - Other',
    line: '16b',
    rate: 1.0,
    tip: 'Business loan interest, credit card interest for business purchases.',
  },
  // Line 17
  {
    id: 'legal_professional',
    name: 'Legal & Professional Services',
    line: 17,
    rate: 1.0,
    tip: 'Attorney fees, accountant fees, bookkeeping, tax prep.',
  },
  // Line 18
  {
    id: 'office_expense',
    name: 'Office Expense',
    line: 18,
    rate: 1.0,
    tip: 'Software subscriptions, postage, small office items, cleaning.',
  },
  // Line 19
  {
    id: 'pension_profit_sharing',
    name: 'Pension & Profit-Sharing',
    line: 19,
    rate: 1.0,
    tip: 'Contributions to employee retirement plans.',
  },
  // Line 20a
  {
    id: 'rent_equipment',
    name: 'Rent - Vehicles/Equipment',
    line: '20a',
    rate: 1.0,
    tip: 'Leased vehicles, machinery, equipment rentals.',
  },
  // Line 20b
  {
    id: 'rent_property',
    name: 'Rent - Business Property',
    line: '20b',
    rate: 1.0,
    tip: 'Office rent, warehouse rent, coworking space.',
  },
  // Line 21
  {
    id: 'repairs_maintenance',
    name: 'Repairs & Maintenance',
    line: 21,
    rate: 1.0,
    tip: 'Repairs to business property or equipment. Not improvements.',
  },
  // Line 22
  {
    id: 'supplies',
    name: 'Supplies',
    line: 22,
    rate: 1.0,
    tip: 'Materials and supplies used in your business.',
  },
  // Line 23
  {
    id: 'taxes_licenses',
    name: 'Taxes & Licenses',
    line: 23,
    rate: 1.0,
    tip: 'Business licenses, permits, state/local business taxes.',
  },
  // Line 24a
  {
    id: 'travel',
    name: 'Travel',
    line: '24a',
    rate: 1.0,
    tip: 'Airfare, hotels, car rentals for business trips. 100% deductible.',
  },
  // Line 24b
  {
    id: 'meals',
    name: 'Meals',
    line: '24b',
    rate: 0.5,
    tip: 'Business meals are 50% deductible. Document who attended and business purpose.',
  },
  // Line 25
  {
    id: 'utilities',
    name: 'Utilities',
    line: 25,
    rate: 1.0,
    tip: 'Phone, internet, electricity for business. Prorate if mixed use.',
  },
  // Line 26
  {
    id: 'wages',
    name: 'Wages',
    line: 26,
    rate: 1.0,
    tip: 'Employee salaries and wages (less employment credits).',
  },
  // Line 27a - Other Expenses
  {
    id: 'other',
    name: 'Other Expenses',
    line: '27a',
    rate: 1.0,
    tip: 'Business expenses not listed above. Keep detailed records.',
  },
  // Line 27b - Energy Efficient Commercial Buildings
  {
    id: 'energy_efficient',
    name: 'Energy Efficient Buildings',
    line: '27b',
    rate: 1.0,
    tip: 'Deduction for energy efficient commercial building property. Attach Form 7205.',
  },
  // Line 30 - Home Office (from Form 8829)
  {
    id: 'home_office',
    name: 'Home Office',
    line: 30,
    rate: 1.0,
    tip: 'Simplified method: $5/sq ft (max 300 sq ft). Or calculate actual expenses.',
  },
  // Part III - Cost of Goods Sold (Line 4/42)
  {
    id: 'cost_of_goods',
    name: 'Cost of Goods Sold',
    line: 4,
    rate: 1.0,
    tip: 'Inventory, purchases, materials, and labor for products you sell.',
  },
] as const;

export type TaxCategoryId = (typeof TAX_CATEGORIES)[number]['id'];

// Helper to get category by ID
export function getCategoryById(id: string) {
  return TAX_CATEGORIES.find((cat) => cat.id === id);
}

// Helper to get deduction rate for a category
export function getDeductionRate(categoryId: string): number {
  const category = getCategoryById(categoryId);
  return category?.rate ?? 1.0;
}

// Calculate deductible amount based on category
export function calculateDeductible(totalCents: number, categoryId: string): number {
  const rate = getDeductionRate(categoryId);
  return Math.round(totalCents * rate);
}

// Calculate estimated tax savings (default 25% tax rate for self-employed)
export function calculateTaxSavings(deductibleCents: number, taxRate = 0.25): number {
  return Math.round(deductibleCents * taxRate);
}

// Get categories grouped by common use cases for easier selection
export const COMMON_CATEGORIES = [
  'office_expense',
  'supplies',
  'meals',
  'travel',
  'car_truck',
  'advertising',
  'legal_professional',
  'insurance',
  'utilities',
] as const;

// Get all category IDs for validation
export const ALL_CATEGORY_IDS = TAX_CATEGORIES.map((cat) => cat.id);
