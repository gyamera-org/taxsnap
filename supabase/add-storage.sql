-- ============================================
-- TaxSnap - Add Storage Bucket for Receipt Images
-- Run this AFTER creating the bucket in Dashboard
-- ============================================

-- STEP 1: Create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage in the left sidebar
-- 2. Click "New bucket"
-- 3. Name: "receipts"
-- 4. Toggle "Public bucket" OFF (private)
-- 5. Click "Create bucket"

-- STEP 2: Run this SQL to add storage policies
-- File structure: receipts/{user_id}/{receipt_id}.jpg

-- Allow users to upload receipts to their own folder
CREATE POLICY "Users can upload own receipt images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own receipts
CREATE POLICY "Users can view own receipt images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own receipts
CREATE POLICY "Users can update own receipt images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own receipts
CREATE POLICY "Users can delete own receipt images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
