-- ================================================================
-- AI Real-time Adaptation Triggers
-- These triggers fire when users log data that might require plan adaptation
-- ================================================================

-- ================================================================
-- 1. TRIGGER FUNCTION TO CALL AI ADAPTATION
-- ================================================================
CREATE OR REPLACE FUNCTION trigger_ai_plan_adaptation()
RETURNS TRIGGER AS $$
DECLARE
  trigger_payload JSONB;
BEGIN
  -- Build payload with trigger information
  trigger_payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'event_type', TG_OP,
    'user_id', COALESCE(NEW.user_id, OLD.user_id),
    'new_record', CASE WHEN NEW IS NOT NULL THEN to_jsonb(NEW) ELSE NULL END,
    'old_record', CASE WHEN OLD IS NOT NULL THEN to_jsonb(OLD) ELSE NULL END,
    'timestamp', NOW()
  );

  -- Call the Edge Function asynchronously
  PERFORM net.http_post(
    url := current_setting('app.ai_webhook_url', true),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := jsonb_build_object(
      'action', 'check_adaptation',
      'trigger_data', trigger_payload
    )
  );

  -- Return the appropriate record
  RETURN CASE TG_OP
    WHEN 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 2. TRIGGERS FOR PERIOD LOGS (High Priority)
-- ================================================================
-- Trigger when user logs symptoms that might require immediate adaptation
CREATE OR REPLACE TRIGGER ai_adaptation_period_logs
  AFTER INSERT OR UPDATE ON period_logs
  FOR EACH ROW
  WHEN (
    -- Only trigger for significant changes
    (NEW.symptoms IS NOT NULL AND array_length(NEW.symptoms, 1) > 0) OR
    (NEW.mood IN ('anxious', 'irritable', 'sad')) OR
    (NEW.flow_intensity = 'heavy' AND (OLD.flow_intensity IS NULL OR OLD.flow_intensity != 'heavy'))
  )
  EXECUTE FUNCTION trigger_ai_plan_adaptation();

-- ================================================================
-- 3. TRIGGERS FOR EXERCISE ENTRIES (Medium Priority)
-- ================================================================
-- Trigger when user skips workouts or reports low energy
CREATE OR REPLACE TRIGGER ai_adaptation_exercise_entries
  AFTER INSERT OR UPDATE OR DELETE ON exercise_entries
  FOR EACH ROW
  WHEN (
    -- Trigger on workout deletion (skipped workout)
    TG_OP = 'DELETE' OR
    -- Trigger on very short or low-intensity workouts (may indicate low energy)
    (NEW.duration_minutes < 15 AND NEW.intensity = 'low')
  )
  EXECUTE FUNCTION trigger_ai_plan_adaptation();

-- ================================================================
-- 4. TRIGGERS FOR SUPPLEMENT LOGS (Low Priority)
-- ================================================================
-- Trigger when user misses important supplements
CREATE OR REPLACE TRIGGER ai_adaptation_supplement_logs
  AFTER INSERT OR UPDATE ON supplement_logs
  FOR EACH ROW
  WHEN (
    -- Only trigger for missed supplements that affect energy/mood
    NEW.taken = false AND (
      NEW.supplement_name ILIKE '%iron%' OR
      NEW.supplement_name ILIKE '%magnesium%' OR
      NEW.supplement_name ILIKE '%vitamin d%' OR
      NEW.supplement_name ILIKE '%b12%'
    )
  )
  EXECUTE FUNCTION trigger_ai_plan_adaptation();

-- ================================================================
-- 5. REALTIME PUBLICATION FOR CLIENT UPDATES
-- ================================================================
-- Enable realtime for AI plans so clients get automatic updates
ALTER PUBLICATION supabase_realtime ADD TABLE ai_weekly_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_insights;

-- ================================================================
-- 6. CONFIGURATION SETTINGS
-- ================================================================
-- Set configuration for the webhook URL and service key
-- These should be set via Supabase dashboard or migration
-- ALTER DATABASE postgres SET app.ai_webhook_url = 'https://your-project.supabase.co/functions/v1/ai-weekly-planner';
-- ALTER DATABASE postgres SET app.service_role_key = 'your-service-role-key';

-- ================================================================
-- 7. RATE LIMITING TABLE
-- ================================================================
-- Prevent too many adaptations for the same user
CREATE TABLE IF NOT EXISTS ai_adaptation_rate_limit (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_adaptation TIMESTAMPTZ DEFAULT NOW(),
  adaptation_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 8. ENHANCED TRIGGER FUNCTION WITH RATE LIMITING
-- ================================================================
CREATE OR REPLACE FUNCTION trigger_ai_plan_adaptation_rate_limited()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  current_adaptations INTEGER;
  last_adaptation_time TIMESTAMPTZ;
  trigger_payload JSONB;
BEGIN
  user_uuid := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Check rate limiting
  SELECT adaptation_count, last_adaptation 
  INTO current_adaptations, last_adaptation_time
  FROM ai_adaptation_rate_limit 
  WHERE user_id = user_uuid 
    AND DATE(last_adaptation) = CURRENT_DATE;
  
  -- Reset daily count if it's a new day
  IF last_adaptation_time IS NULL OR DATE(last_adaptation_time) < CURRENT_DATE THEN
    INSERT INTO ai_adaptation_rate_limit (user_id, adaptation_count, last_adaptation)
    VALUES (user_uuid, 1, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      adaptation_count = 1,
      last_adaptation = NOW();
  ELSE
    -- Check if we've hit the daily limit
    IF current_adaptations >= 5 THEN
      RAISE NOTICE 'AI adaptation rate limit reached for user %', user_uuid;
      RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
    END IF;
    
    -- Check if too soon since last adaptation (minimum 30 minutes)
    IF last_adaptation_time > NOW() - INTERVAL '30 minutes' THEN
      RAISE NOTICE 'AI adaptation too soon since last adaptation for user %', user_uuid;
      RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
    END IF;
    
    -- Increment adaptation count
    UPDATE ai_adaptation_rate_limit 
    SET adaptation_count = adaptation_count + 1,
        last_adaptation = NOW()
    WHERE user_id = user_uuid;
  END IF;

  -- Build payload with trigger information
  trigger_payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'event_type', TG_OP,
    'user_id', user_uuid,
    'new_record', CASE WHEN NEW IS NOT NULL THEN to_jsonb(NEW) ELSE NULL END,
    'old_record', CASE WHEN OLD IS NOT NULL THEN to_jsonb(OLD) ELSE NULL END,
    'timestamp', NOW()
  );

  -- Call the Edge Function asynchronously (non-blocking)
  PERFORM net.http_post(
    url := current_setting('app.ai_webhook_url', true),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := jsonb_build_object(
      'action', 'check_adaptation',
      'trigger_data', trigger_payload
    ),
    timeout_milliseconds := 5000 -- 5 second timeout to prevent hanging
  );

  RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 9. REPLACE TRIGGERS WITH RATE-LIMITED VERSIONS
-- ================================================================
DROP TRIGGER IF EXISTS ai_adaptation_period_logs ON period_logs;
DROP TRIGGER IF EXISTS ai_adaptation_exercise_entries ON exercise_entries;
DROP TRIGGER IF EXISTS ai_adaptation_supplement_logs ON supplement_logs;

CREATE TRIGGER ai_adaptation_period_logs
  AFTER INSERT OR UPDATE ON period_logs
  FOR EACH ROW
  WHEN (
    (NEW.symptoms IS NOT NULL AND array_length(NEW.symptoms, 1) > 0) OR
    (NEW.mood IN ('anxious', 'irritable', 'sad')) OR
    (NEW.flow_intensity = 'heavy' AND (OLD.flow_intensity IS NULL OR OLD.flow_intensity != 'heavy'))
  )
  EXECUTE FUNCTION trigger_ai_plan_adaptation_rate_limited();

CREATE TRIGGER ai_adaptation_exercise_entries
  AFTER INSERT OR UPDATE OR DELETE ON exercise_entries
  FOR EACH ROW
  WHEN (
    TG_OP = 'DELETE' OR
    (NEW.duration_minutes < 15 AND NEW.intensity = 'low')
  )
  EXECUTE FUNCTION trigger_ai_plan_adaptation_rate_limited();

CREATE TRIGGER ai_adaptation_supplement_logs
  AFTER INSERT OR UPDATE ON supplement_logs
  FOR EACH ROW
  WHEN (
    NEW.taken = false AND (
      NEW.supplement_name ILIKE '%iron%' OR
      NEW.supplement_name ILIKE '%magnesium%' OR
      NEW.supplement_name ILIKE '%vitamin d%' OR
      NEW.supplement_name ILIKE '%b12%'
    )
  )
  EXECUTE FUNCTION trigger_ai_plan_adaptation_rate_limited();

-- ================================================================
-- 10. CLEANUP FUNCTION FOR OLD RATE LIMIT DATA
-- ================================================================
CREATE OR REPLACE FUNCTION cleanup_ai_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_adaptation_rate_limit 
  WHERE last_adaptation < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Run cleanup weekly
SELECT cron.schedule(
  'cleanup-ai-rate-limits',
  '0 2 * * 1', -- Every Monday at 2 AM
  'SELECT cleanup_ai_rate_limits();'
);
