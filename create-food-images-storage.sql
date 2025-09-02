-- ================================================================
-- Create Food Images Storage Bucket
-- Run this in Supabase SQL Editor
-- ================================================================

-- Create food-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for food images
CREATE POLICY "Users can upload food images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view food images" ON storage.objects
FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "Users can update their food images" ON storage.objects
FOR UPDATE USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their food images" ON storage.objects
FOR DELETE USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ================================================================
-- Update meal_entries table to store image URLs
-- ================================================================

-- Add image_url column to meal_entries if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meal_entries' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE meal_entries ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Add image_url column to food_items if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_items' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE food_items ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Add analysis_status column to meal_entries for tracking scanning progress
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meal_entries' AND column_name = 'analysis_status'
    ) THEN
        ALTER TABLE meal_entries ADD COLUMN analysis_status TEXT DEFAULT 'completed';
        -- Possible values: 'analyzing', 'completed', 'failed'
    END IF;
END $$;

-- Add analysis_confidence column to meal_entries
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meal_entries' AND column_name = 'analysis_confidence'
    ) THEN
        ALTER TABLE meal_entries ADD COLUMN analysis_confidence INTEGER DEFAULT 100;
        -- Scale of 0-100
    END IF;
END $$;

-- Add detailed_ingredients column to food_items for storing ingredient breakdown
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_items' AND column_name = 'detailed_ingredients'
    ) THEN
        ALTER TABLE food_items ADD COLUMN detailed_ingredients JSONB;
        -- Will store array of ingredient objects with calories and portions
    END IF;
END $$;

-- Create index for faster image lookups
CREATE INDEX IF NOT EXISTS idx_meal_entries_image_url ON meal_entries(image_url) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_food_items_image_url ON food_items(image_url) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_meal_entries_analysis_status ON meal_entries(analysis_status);
