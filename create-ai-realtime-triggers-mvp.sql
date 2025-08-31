-- ================================================================
-- AI Real-time Adaptation Triggers - MVP Version
-- Only handles real-time adaptation when users log data
-- No auto-generation complexity
-- ================================================================

-- ================================================================
-- 1. SIMPLIFIED TRIGGER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION trigger_ai_plan_adaptation_mvp()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  trigger_payload JSONB;
BEGIN
  user_uuid := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Simple rate limiting: max once per hour per user
  IF EXISTS (
    SELECT 1 FROM ai_adaptation_rate_limit 
    WHERE user_id = user_uuid 
    AND last_adaptation > NOW() - INTERVAL '1 hour'
  ) THEN
    RAISE NOTICE 'AI adaptation rate limited for user %', user_uuid;
    RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  -- Update rate limit
  INSERT INTO ai_adaptation_rate_limit (user_id, last_adaptation)
  VALUES (user_uuid, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET last_adaptation = NOW();

  -- Build simple payload
  trigger_payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'event_type', TG_OP,
    'user_id', user_uuid,
    'new_record', CASE WHEN NEW IS NOT NULL THEN to_jsonb(NEW) ELSE NULL END,
    'timestamp', NOW()
  );

  -- Call adaptation function (async, non-blocking)
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
    timeout_milliseconds := 3000
  );

  RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 2. SIMPLIFIED RATE LIMITING TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS ai_adaptation_rate_limit (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_adaptation TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. TRIGGERS FOR KEY USER ACTIONS ONLY
-- ================================================================

-- Period logs: Only trigger for significant symptoms/mood changes
CREATE OR REPLACE TRIGGER ai_adaptation_period_logs_mvp
  AFTER INSERT OR UPDATE ON period_logs
  FOR EACH ROW
  WHEN (
    -- High-impact symptoms or mood changes
    (NEW.symptoms IS NOT NULL AND (
      'severe_cramps' = ANY(NEW.symptoms) OR
      'extreme_fatigue' = ANY(NEW.symptoms) OR
      'nausea' = ANY(NEW.symptoms)
    )) OR
    (NEW.mood IN ('anxious', 'irritable', 'sad'))
  )
  EXECUTE FUNCTION trigger_ai_plan_adaptation_mvp();

-- Exercise entries: Only trigger for skipped workouts
CREATE OR REPLACE TRIGGER ai_adaptation_exercise_skip_mvp
  AFTER DELETE ON exercise_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_plan_adaptation_mvp();

-- ================================================================
-- 4. ENABLE REALTIME FOR CLIENT UPDATES
-- ================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE ai_weekly_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_insights;

-- ================================================================
-- 5. CONFIGURATION (Set these in Supabase dashboard)
-- ================================================================
-- ALTER DATABASE postgres SET app.ai_webhook_url = 'https://your-project.supabase.co/functions/v1/ai-weekly-planner';
-- ALTER DATABASE postgres SET app.service_role_key = 'your-service-role-key';

-- ================================================================
-- 6. CLEANUP FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION cleanup_ai_rate_limits_mvp()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_adaptation_rate_limit 
  WHERE last_adaptation < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
