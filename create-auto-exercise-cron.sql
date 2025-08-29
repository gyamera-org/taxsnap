-- Create a function to trigger auto-generation via cron
CREATE OR REPLACE FUNCTION trigger_weekly_exercise_auto_generation()
RETURNS void AS $$
DECLARE
  result JSONB;
BEGIN
  -- Call the auto-generation edge function
  SELECT content INTO result
  FROM http((
    'POST',
    current_setting('app.supabase_url') || '/functions/v1/auto-weekly-exercise-planner?trigger=scheduled',
    ARRAY[
      http_header('Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{}'
  ));
  
  -- Log the result
  INSERT INTO weekly_plan_generation_logs (
    trigger_type,
    execution_time,
    result_data,
    success
  ) VALUES (
    'scheduled',
    NOW(),
    result,
    (result->>'success')::boolean
  );
  
  RAISE NOTICE 'Auto-generation completed: %', result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a table to log auto-generation activities
CREATE TABLE IF NOT EXISTS weekly_plan_generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  execution_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  result_data JSONB,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_generation_logs_trigger_type ON weekly_plan_generation_logs(trigger_type);
CREATE INDEX idx_generation_logs_execution_time ON weekly_plan_generation_logs(execution_time);
CREATE INDEX idx_generation_logs_success ON weekly_plan_generation_logs(success);

-- Enable RLS
ALTER TABLE weekly_plan_generation_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage generation logs"
  ON weekly_plan_generation_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create a function to schedule the auto-generation
-- This would typically be called via a cron job or scheduled task
-- For Supabase, you can use pg_cron extension (if available) or external scheduler

-- Example: Run every Sunday at 6 AM to generate plans for the upcoming week
-- SELECT cron.schedule('weekly-exercise-auto-gen', '0 6 * * 0', 'SELECT trigger_weekly_exercise_auto_generation();');

-- Alternative: Create a manual trigger function for testing
CREATE OR REPLACE FUNCTION manual_trigger_auto_generation()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- For manual testing - calls the auto-generation function
  PERFORM trigger_weekly_exercise_auto_generation();
  
  -- Return the latest log entry
  SELECT to_jsonb(log.*) INTO result
  FROM weekly_plan_generation_logs log
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(result, '{"message": "Auto-generation triggered"}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION trigger_weekly_exercise_auto_generation() TO service_role;
GRANT EXECUTE ON FUNCTION manual_trigger_auto_generation() TO service_role, authenticated;
