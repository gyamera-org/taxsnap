-- Check the exact structure of your accounts table
-- Run this in Supabase SQL Editor to see what columns exist

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'accounts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if there's an avatar_url column instead of avatar
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'accounts' 
  AND table_schema = 'public' 
  AND column_name LIKE '%avatar%';
