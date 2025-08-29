-- Create function to get users who need weekly exercise plans
CREATE OR REPLACE FUNCTION get_users_needing_weekly_plans(target_date DATE)
RETURNS TABLE (
  user_id UUID,
  last_plan_end_date DATE,
  has_active_plan BOOLEAN,
  days_since_last_plan INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_plan_status AS (
    SELECT 
      u.id as user_id,
      wep.end_date as last_plan_end_date,
      CASE 
        WHEN wep.start_date <= target_date AND wep.end_date >= target_date THEN true
        ELSE false
      END as has_active_plan,
      CASE 
        WHEN wep.end_date IS NOT NULL THEN target_date - wep.end_date
        ELSE NULL
      END as days_since_last_plan,
      ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY wep.created_at DESC) as rn
    FROM auth.users u
    LEFT JOIN weekly_exercise_plans wep ON u.id = wep.user_id 
      AND wep.is_active = true
    WHERE u.email_confirmed_at IS NOT NULL -- Only confirmed users
      AND u.created_at < NOW() - INTERVAL '1 day' -- Account at least 1 day old
  )
  SELECT 
    ups.user_id,
    ups.last_plan_end_date,
    ups.has_active_plan,
    ups.days_since_last_plan
  FROM user_plan_status ups
  WHERE ups.rn = 1 -- Most recent plan per user
    AND (
      ups.has_active_plan = false -- No active plan
      OR ups.last_plan_end_date <= target_date -- Current plan ending today/tomorrow
      OR ups.last_plan_end_date IS NULL -- Never had a plan
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user needs a new plan
CREATE OR REPLACE FUNCTION user_needs_weekly_plan(target_user_id UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  active_plan_count INTEGER;
  plan_ending_soon_count INTEGER;
BEGIN
  -- Check for active plans covering the target date
  SELECT COUNT(*)
  INTO active_plan_count
  FROM weekly_exercise_plans
  WHERE user_id = target_user_id
    AND is_active = true
    AND start_date <= target_date
    AND end_date >= target_date;

  -- Check for plans ending today or tomorrow
  SELECT COUNT(*)
  INTO plan_ending_soon_count
  FROM weekly_exercise_plans
  WHERE user_id = target_user_id
    AND is_active = true
    AND end_date <= target_date + INTERVAL '1 day';

  -- User needs a plan if they don't have an active one OR their plan is ending soon
  RETURN (active_plan_count = 0 OR plan_ending_soon_count > 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-deactivate expired plans
CREATE OR REPLACE FUNCTION deactivate_expired_plans()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE weekly_exercise_plans
  SET is_active = false, updated_at = NOW()
  WHERE is_active = true
    AND end_date < CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically deactivate plans (runs daily)
-- This ensures old plans don't interfere with the auto-generation logic

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_users_needing_weekly_plans(DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION user_needs_weekly_plan(UUID, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION deactivate_expired_plans() TO anon, authenticated;
