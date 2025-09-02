-- Safe migration to add analysis columns to meal_entries table
-- This script checks if columns exist before adding them

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

-- Create index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_meal_entries_analysis_status') THEN
        CREATE INDEX idx_meal_entries_analysis_status ON meal_entries(analysis_status) WHERE analysis_status != 'completed';
        RAISE NOTICE 'Created analysis_status index';
    ELSE
        RAISE NOTICE 'analysis_status index already exists';
    END IF;
END $$;

-- Enable realtime for meal_entries table (safe to run multiple times)
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_entries;

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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_meal_analysis_progress TO authenticated;

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_stuck_analyzing_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete entries that have been analyzing for more than 10 minutes
  DELETE FROM meal_entries 
  WHERE analysis_status = 'analyzing' 
  AND created_at < NOW() - INTERVAL '10 minutes';
  
  RAISE NOTICE 'Cleaned up stuck analyzing entries';
END;
$$;

-- Comments for documentation
COMMENT ON COLUMN meal_entries.analysis_status IS 'Status of AI food analysis: analyzing, completed, or failed';
COMMENT ON COLUMN meal_entries.analysis_progress IS 'Progress percentage (0-100) of AI analysis';
COMMENT ON COLUMN meal_entries.analysis_stage IS 'Current stage of analysis: uploading, analyzing, processing, finalizing';
COMMENT ON FUNCTION update_meal_analysis_progress IS 'Updates the analysis progress of a meal entry';
COMMENT ON FUNCTION cleanup_stuck_analyzing_entries IS 'Cleans up meal entries stuck in analyzing state';
