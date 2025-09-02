-- Add analysis_status field to meal_entries table for realtime food scanning
-- This enables tracking of AI analysis progress in real-time

-- Add the analysis_status column
ALTER TABLE meal_entries 
ADD COLUMN analysis_status TEXT CHECK (analysis_status IN ('analyzing', 'completed', 'failed')) DEFAULT 'completed';

-- Add analysis_progress column for progress tracking (0-100)
ALTER TABLE meal_entries 
ADD COLUMN analysis_progress INTEGER DEFAULT 100 CHECK (analysis_progress >= 0 AND analysis_progress <= 100);

-- Add analysis_stage column for detailed status
ALTER TABLE meal_entries 
ADD COLUMN analysis_stage TEXT CHECK (analysis_stage IN ('uploading', 'analyzing', 'processing', 'finalizing')) DEFAULT NULL;

-- Create an index for efficient querying of analyzing entries
CREATE INDEX idx_meal_entries_analysis_status ON meal_entries(analysis_status) WHERE analysis_status != 'completed';

-- Enable realtime for meal_entries table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_entries;

-- Create a function to update analysis progress
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

-- Create a function to clean up old analyzing entries (older than 10 minutes)
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

-- Create a scheduled job to run cleanup every 5 minutes (requires pg_cron extension)
-- This is optional and may need to be set up separately in your Supabase project
-- SELECT cron.schedule('cleanup-analyzing-entries', '*/5 * * * *', 'SELECT cleanup_stuck_analyzing_entries();');

-- Comments for documentation
COMMENT ON COLUMN meal_entries.analysis_status IS 'Status of AI food analysis: analyzing, completed, or failed';
COMMENT ON COLUMN meal_entries.analysis_progress IS 'Progress percentage (0-100) of AI analysis';
COMMENT ON COLUMN meal_entries.analysis_stage IS 'Current stage of analysis: uploading, analyzing, processing, finalizing';
COMMENT ON FUNCTION update_meal_analysis_progress IS 'Updates the analysis progress of a meal entry';
COMMENT ON FUNCTION cleanup_stuck_analyzing_entries IS 'Cleans up meal entries stuck in analyzing state';
