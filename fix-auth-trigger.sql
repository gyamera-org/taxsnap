-- Fixed auth trigger - handles common column name issues
-- Run this in Supabase SQL Editor to replace the problematic trigger

-- First, drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create updated function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (
    user_id,
    name,
    avatar_url,  -- Changed from 'avatar' to 'avatar_url'
    onboarding_completed,
    subscription_status,
    subscription_plan,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        CASE 
          WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
               AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL 
          THEN ' ' 
          ELSE '' 
        END,
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ),
      SPLIT_PART(NEW.email, '@', 1) -- Fallback to email username
    ),
    NULL, -- avatar_url
    false, -- onboarding_completed
    'inactive', -- subscription_status
    'free', -- subscription_plan
    NOW(), -- created_at
    NOW() -- updated_at
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error and re-raise it
  RAISE LOG 'Error in handle_new_user trigger: % %', SQLERRM, SQLSTATE;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
