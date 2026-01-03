-- ============================================
-- Add Onboarding Data Fields to Accounts Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add onboarding questionnaire fields to accounts table
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS onboarding_income TEXT,
ADD COLUMN IF NOT EXISTS onboarding_work_type TEXT,
ADD COLUMN IF NOT EXISTS onboarding_current_tracking TEXT,
ADD COLUMN IF NOT EXISTS onboarding_monthly_expenses TEXT,
ADD COLUMN IF NOT EXISTS onboarding_estimated_savings INTEGER,
ADD COLUMN IF NOT EXISTS onboarding_estimated_missed_deductions INTEGER;
