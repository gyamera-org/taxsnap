import { TaxCategoryId } from '@/lib/constants/categories';

// Receipt status for tracking scan progress
export type ReceiptStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Receipt entity stored in database
export interface Receipt {
  id: string;
  user_id: string;
  image_uri: string;
  vendor: string | null;
  date: string | null; // YYYY-MM-DD format
  total_amount: number | null; // stored in cents
  currency: string;
  category: TaxCategoryId | null;
  deductible_amount: number | null; // stored in cents
  note: string | null;
  tax_year: number | null;
  status: ReceiptStatus; // Track scan status
  created_at: string;
  updated_at: string | null;
}

// Data returned from OCR extraction
export interface ExtractedReceiptData {
  vendor: string | null;
  date: string | null; // YYYY-MM-DD format
  total: number | null; // in cents
  currency: string;
  suggestedCategory: TaxCategoryId | null;
  confidence: number; // 0-1
  rawText?: string; // Optional: raw text from OCR
  error?: string; // Error message if extraction failed
}

// Create receipt input (for new receipts)
export interface CreateReceiptInput {
  image_uri: string;
  vendor?: string;
  date?: string;
  total_amount?: number;
  currency?: string;
  category?: TaxCategoryId;
  note?: string;
}

// Update receipt input
export interface UpdateReceiptInput {
  vendor?: string | null;
  date?: string | null;
  total_amount?: number | null;
  currency?: string;
  category?: TaxCategoryId | null;
  deductible_amount?: number | null;
  note?: string | null;
}

// Receipt summary for dashboard
export interface ReceiptSummary {
  totalReceipts: number;
  totalAmount: number; // in cents
  totalDeductible: number; // in cents
  estimatedSavings: number; // in cents
}

// Date range filter type
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Quick filter presets
export type QuickFilterType = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// Receipt filters for querying
export interface ReceiptFilters {
  dateRange?: DateRange;
  categories?: TaxCategoryId[];
  searchQuery?: string;
  taxYear?: number;
}

// Export format options
export type ExportFormat = 'csv' | 'pdf';

// Export options
export interface ExportOptions {
  format: ExportFormat;
  dateRange?: DateRange;
  includeImages?: boolean;
  categories?: TaxCategoryId[];
}
