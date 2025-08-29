-- ================================================================
-- Test Weight Tracking Tables
-- Use this to verify your tables are set up correctly
-- ================================================================

-- Check if tables exist and their structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('body_measurements', 'weight_history')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename, 
  policyname,
  cmd,
  permissive,
  qual
FROM pg_policies 
WHERE tablename IN ('body_measurements', 'weight_history');

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('body_measurements', 'weight_history');

-- Test inserting sample data (replace with your actual user_id)
-- INSERT INTO body_measurements (user_id, height, current_weight, goal_weight, units) 
-- VALUES ('your-user-id-here', 170.0, 70.0, 65.0, 'kg');

-- INSERT INTO weight_history (user_id, weight, units, note, measured_at) 
-- VALUES ('your-user-id-here', 70.0, 'kg', 'Starting weight', NOW());
