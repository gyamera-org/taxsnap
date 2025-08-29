-- ================================================================
-- Supabase Storage Setup for Aurae App
-- Avatar uploads and file management
-- ================================================================

-- ================================================================
-- 1. CREATE AVATARS BUCKET
-- ================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 2. STORAGE POLICIES FOR AVATARS BUCKET
-- ================================================================

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view avatars (since bucket is public)
CREATE POLICY "Anyone can view avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- ================================================================
-- 3. ADDITIONAL STORAGE FUNCTIONS
-- ================================================================

-- Function to clean up old avatar files when user uploads new one
CREATE OR REPLACE FUNCTION cleanup_old_avatars()
RETURNS TRIGGER AS $$
BEGIN
  -- When avatar_url is updated, delete old files from storage
  IF OLD.avatar_url IS NOT NULL AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    -- Extract file path from old URL
    DECLARE
      old_path TEXT;
    BEGIN
      old_path := REPLACE(OLD.avatar_url, 
        CONCAT((SELECT url FROM storage.buckets WHERE id = 'avatars'), '/object/public/avatars/'), 
        '');
      
      -- Delete old file from storage
      DELETE FROM storage.objects 
      WHERE bucket_id = 'avatars' 
      AND name = old_path;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the update
      RAISE WARNING 'Failed to cleanup old avatar: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply cleanup trigger to user_profiles table
DROP TRIGGER IF EXISTS cleanup_old_avatars_trigger ON user_profiles;
CREATE TRIGGER cleanup_old_avatars_trigger
  BEFORE UPDATE OF avatar_url ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_avatars();

-- ================================================================
-- 4. UTILITY FUNCTIONS FOR STORAGE MANAGEMENT
-- ================================================================

-- Function to get avatar URL for a user
CREATE OR REPLACE FUNCTION get_user_avatar_url(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  avatar_url TEXT;
BEGIN
  SELECT up.avatar_url INTO avatar_url
  FROM user_profiles up
  WHERE up.user_id = p_user_id;
  
  RETURN avatar_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update avatar URL (with cleanup)
CREATE OR REPLACE FUNCTION update_user_avatar(
  p_user_id UUID,
  p_avatar_url TEXT
) RETURNS JSONB AS $$
BEGIN
  -- Update the avatar URL (trigger will handle cleanup)
  UPDATE user_profiles 
  SET avatar_url = p_avatar_url,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'avatar_url', p_avatar_url
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_avatar_url(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_avatar(UUID, TEXT) TO authenticated;

-- ================================================================
-- 5. FILE SIZE AND TYPE RESTRICTIONS
-- ================================================================

-- Create a function to validate file uploads
CREATE OR REPLACE FUNCTION validate_avatar_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Check file size (limit to 5MB)
  IF NEW.metadata->>'size' IS NOT NULL THEN
    IF (NEW.metadata->>'size')::INTEGER > 5242880 THEN
      RAISE EXCEPTION 'File size exceeds 5MB limit';
    END IF;
  END IF;
  
  -- Check file type (only images)
  IF NEW.metadata->>'mimetype' IS NOT NULL THEN
    IF NOT (NEW.metadata->>'mimetype' LIKE 'image/%') THEN
      RAISE EXCEPTION 'Only image files are allowed';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger to avatars bucket
DROP TRIGGER IF EXISTS validate_avatar_upload_trigger ON storage.objects;
CREATE TRIGGER validate_avatar_upload_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'avatars')
  EXECUTE FUNCTION validate_avatar_upload();

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Supabase Storage setup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage features:';
  RAISE NOTICE '- avatars bucket created (public access)';
  RAISE NOTICE '- RLS policies for user avatar management';
  RAISE NOTICE '- Automatic cleanup of old avatar files';
  RAISE NOTICE '- File size limit: 5MB';
  RAISE NOTICE '- File type restriction: images only';
  RAISE NOTICE '- Utility functions for avatar management';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for avatar uploads!';
END $$;
