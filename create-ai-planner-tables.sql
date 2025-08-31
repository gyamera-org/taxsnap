-- ================================================================
-- AI Weekly Planner Database Schema
-- Run this SQL script in your Supabase SQL Editor
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. AI WEEKLY PLANS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS public.ai_weekly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  plan_data JSONB NOT NULL, -- Complete AI-generated plan
  generation_context JSONB NOT NULL, -- Context used for generation
  adaptation_history JSONB[] DEFAULT '{}', -- Track plan changes
  success_metrics JSONB, -- Plan effectiveness metrics
  ai_model_used TEXT DEFAULT 'gpt-4-1106-preview',
  is_active BOOLEAN DEFAULT true,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, week_start)
);

-- ================================================================
-- 2. AI INSIGHTS TABLE (Cache for generated insights)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('daily', 'weekly', 'cycle_phase', 'adaptation')),
  target_date DATE, -- For daily insights
  insights_data JSONB NOT NULL,
  relevance_score FLOAT DEFAULT 0.8 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- 3. AI USAGE TRACKING TABLE (For billing and monitoring)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('weekly_plan_generation', 'daily_insight_generation', 'plan_adaptation', 'cycle_analysis')),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 1,
  cost_estimate DECIMAL(8,4) DEFAULT 0, -- Track actual AI costs
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, feature_type, usage_date)
);

-- ================================================================
-- 4. USER AI PREFERENCES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_ai_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  adaptation_sensitivity FLOAT DEFAULT 0.7 CHECK (adaptation_sensitivity >= 0 AND adaptation_sensitivity <= 1),
  insight_detail_level TEXT DEFAULT 'balanced' CHECK (insight_detail_level IN ('minimal', 'balanced', 'detailed')),
  coaching_style TEXT DEFAULT 'supportive' CHECK (coaching_style IN ('supportive', 'motivational', 'scientific', 'casual')),
  notification_preferences JSONB DEFAULT '{"workout_reminders": true, "meal_reminders": true, "cycle_insights": true}'::jsonb,
  auto_adaptation BOOLEAN DEFAULT true,
  focus_areas TEXT[] DEFAULT '{"energy_management", "fitness_goals"}'::text[],
  learning_opt_in BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- 5. AI FEEDBACK TABLE (For improvement)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES ai_weekly_plans(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('plan_rating', 'insight_helpful', 'adaptation_effective', 'suggestion_followed')),
  feedback_data JSONB NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_ai_weekly_plans_user_id ON ai_weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_weekly_plans_week_start ON ai_weekly_plans(week_start);
CREATE INDEX IF NOT EXISTS idx_ai_weekly_plans_active ON ai_weekly_plans(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type_date ON ai_insights(insight_type, target_date);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires ON ai_insights(expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_tracking(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature_type ON ai_usage_tracking(feature_type);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id ON ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_plan_id ON ai_feedback(plan_id);

-- ================================================================
-- 7. ENABLE RLS (Row Level Security)
-- ================================================================
ALTER TABLE ai_weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 8. CREATE RLS POLICIES
-- ================================================================

-- AI Weekly Plans Policies
CREATE POLICY "Users can view their own AI plans"
  ON ai_weekly_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI plans"
  ON ai_weekly_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI plans"
  ON ai_weekly_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI plans"
  ON ai_weekly_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- AI Insights Policies
CREATE POLICY "Users can view their own AI insights"
  ON ai_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI insights"
  ON ai_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AI Usage Tracking Policies
CREATE POLICY "Users can view their own AI usage"
  ON ai_usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert AI usage"
  ON ai_usage_tracking
  FOR INSERT
  WITH CHECK (true); -- Allow service role to insert

-- User AI Preferences Policies
CREATE POLICY "Users can view their own AI preferences"
  ON user_ai_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own AI preferences"
  ON user_ai_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI preferences"
  ON user_ai_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- AI Feedback Policies
CREATE POLICY "Users can view their own AI feedback"
  ON ai_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI feedback"
  ON ai_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_weekly_plans_updated_at
  BEFORE UPDATE ON ai_weekly_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ai_preferences_updated_at
  BEFORE UPDATE ON user_ai_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 10. AUTO-CLEANUP FOR EXPIRED INSIGHTS
-- ================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_insights()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_insights 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job or call this function periodically
-- Example: SELECT cleanup_expired_insights();

-- ================================================================
-- 11. HELPFUL VIEWS FOR ANALYTICS
-- ================================================================
CREATE OR REPLACE VIEW ai_usage_summary AS
SELECT 
  user_id,
  feature_type,
  COUNT(*) as total_usage,
  SUM(usage_count) as total_requests,
  SUM(cost_estimate) as total_cost,
  MAX(usage_date) as last_used
FROM ai_usage_tracking
GROUP BY user_id, feature_type;

CREATE OR REPLACE VIEW weekly_plan_effectiveness AS
SELECT 
  p.user_id,
  p.week_start,
  p.ai_model_used,
  COUNT(f.id) as feedback_count,
  AVG(f.rating) as avg_rating,
  p.success_metrics
FROM ai_weekly_plans p
LEFT JOIN ai_feedback f ON p.id = f.plan_id
GROUP BY p.user_id, p.week_start, p.ai_model_used, p.success_metrics;
