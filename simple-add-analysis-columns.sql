-- Simple migration to add analysis columns (skip realtime setup)

-- Add analysis_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='meal_entries' AND column_name='analysis_status') THEN
        ALTER TABLE meal_entries 
        ADD COLUMN analysis_status TEXT CHECK (analysis_status IN ('analyzing', 'completed', 'failed')) DEFAULT 'completed';
        RAISE NOTICE 'Added analysis_status column';
    ELSE
        RAISE NOTICE 'analysis_status column already exists';
    END IF;
END $$;

-- Add analysis_progress column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='meal_entries' AND column_name='analysis_progress') THEN
        ALTER TABLE meal_entries 
        ADD COLUMN analysis_progress INTEGER DEFAULT 100 CHECK (analysis_progress >= 0 AND analysis_progress <= 100);
        RAISE NOTICE 'Added analysis_progress column';
    ELSE
        RAISE NOTICE 'analysis_progress column already exists';
    END IF;
END $$;

-- Add analysis_stage column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='meal_entries' AND column_name='analysis_stage') THEN
        ALTER TABLE meal_entries 
        ADD COLUMN analysis_stage TEXT CHECK (analysis_stage IN ('uploading', 'analyzing', 'processing', 'finalizing')) DEFAULT NULL;
        RAISE NOTICE 'Added analysis_stage column';
    ELSE
        RAISE NOTICE 'analysis_stage column already exists';
    END IF;
END $$;

-- Create or replace the progress update function
CREATE OR REPLACE FUNCTION update_meal_analysis_progress(
  meal_entry_id UUID,
  status TEXT DEFAULT NULL,
  progress INTEGER DEFAULT NULL,
  stage TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE meal_entries 
  SET 
    analysis_status = COALESCE(status, analysis_status),
    analysis_progress = COALESCE(progress, analysis_progress),
    analysis_stage = COALESCE(stage, analysis_stage),
    updated_at = NOW()
  WHERE id = meal_entry_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_meal_analysis_progress TO authenticated;
