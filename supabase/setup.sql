-- ============================================
-- TaxSnap Database Setup
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- Project: xakrgtqjrhoezchhlnmf
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ACCOUNTS TABLE (for auth & user profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  free_scans_used INTEGER DEFAULT 0,
  -- Onboarding questionnaire data
  onboarding_income TEXT,
  onboarding_work_type TEXT,
  onboarding_current_tracking TEXT,
  onboarding_monthly_expenses TEXT,
  onboarding_expense_categories TEXT[], -- Array of selected Schedule C category IDs
  onboarding_estimated_savings INTEGER,
  onboarding_estimated_missed_deductions INTEGER,
  -- Subscription fields (synced from RevenueCat webhook)
  subscription_status TEXT,
  subscription_plan TEXT,
  subscription_platform TEXT,
  subscription_expires_at TIMESTAMPTZ,
  subscription_billing TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Accounts policies
CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own account" ON accounts
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own account" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. RECEIPTS TABLE (from CLAUDE.md spec)
-- ============================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_uri TEXT NOT NULL,
  vendor TEXT,
  date DATE,
  total_amount INTEGER, -- stored in cents
  currency TEXT DEFAULT 'USD',
  category TEXT,
  deductible_amount INTEGER, -- stored in cents
  note TEXT,
  tax_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Enable RLS on receipts
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Receipts policy - users can only access their own
CREATE POLICY "Users can manage own receipts" ON receipts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to increment free scans count
CREATE OR REPLACE FUNCTION increment_free_scans(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE accounts
  SET free_scans_used = COALESCE(free_scans_used, 0) + 1,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING free_scans_used INTO new_count;

  RETURN new_count;
END;
$$;

-- ============================================
-- 4. INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_tax_year ON receipts(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(user_id, category);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(user_id, date);

-- ============================================
-- 5. STORAGE BUCKET for receipt images
-- ============================================
-- IMPORTANT: You must create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage in the left sidebar
-- 2. Click "New bucket"
-- 3. Name: "receipts"
-- 4. Toggle "Public bucket" OFF (private)
-- 5. Click "Create bucket"
--
-- File structure: receipts/{user_id}/{receipt_id}.jpg
-- Example: receipts/abc123-user-uuid/def456-receipt-uuid.jpg

-- Storage policies for the "receipts" bucket:
-- Users can only access files in their own folder (user_id)

CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
