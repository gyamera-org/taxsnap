import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { queryKeys } from './query-keys';
import * as ImagePicker from 'expo-image-picker';

export type ProgressPhoto = {
  id: string;
  uri: string;
  date: string;
  createdAt: string;
  week: string;
};

// Hook to fetch progress photos within a date range
export function useProgressPhotosLogsRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: queryKeys.progress.photos(startDate, endDate),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching photos for user:', user.id, 'dateRange:', startDate, '-', endDate);

      const { data, error } = await supabase.rpc('get_progress_photos_for_user', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_limit: 100,
        p_offset: 0,
      });

      if (error) {
        console.error('Error fetching progress photos:', error);
        throw error;
      }

      console.log('Raw progress photos data:', data);

      const mappedPhotos = data.map((photo: any) => ({
        id: photo.id,
        uri: photo.image_url,
        date: new Date(photo.created_at).toLocaleDateString(),
        createdAt: photo.created_at,
        week: new Date(photo.created_at).toLocaleDateString(), // Use date instead of week
      })) as ProgressPhoto[];

      console.log('Mapped progress photos:', mappedPhotos);
      return mappedPhotos;
    },
  });
}

// Hook to upload progress photos
export function useUploadProgressPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: ImagePicker.ImagePickerAsset) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Starting photo upload for user:', user.id);

      // Create unique filename for storage bucket
      const fileExt = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Convert image to blob for upload to bucket
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      console.log('Uploading to progress-photos bucket:', fileName);

      // Upload to Supabase Storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL from the bucket
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);

      console.log('Got public URL:', publicUrl);

      // Verify the URL is accessible
      try {
        const testResponse = await fetch(publicUrl);
        console.log('URL test response status:', testResponse.status);
      } catch (testError) {
        console.error('URL test failed:', testError);
      }

      // Save to database with current date and bucket URL
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          logged_date: currentDate,
          image_url: publicUrl, // Store bucket URL reference
          file_path: fileName, // Store file path for deletion
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Photo saved to database:', data);

      return {
        id: data.id,
        uri: data.image_url,
        date: new Date(data.created_at).toLocaleDateString(),
        createdAt: data.created_at,
        week: new Date(data.created_at).toLocaleDateString(),
      } as ProgressPhoto;
    },
    onSuccess: (newPhoto) => {
      console.log('Upload successful, new photo:', newPhoto);
      // Invalidate all progress photo queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
      toast.success('Progress picture uploaded successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
}

// Hook to delete progress photos
export function useDeleteProgressPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get photo details first to get the file path for bucket deletion
      const { data: photo, error: fetchError } = await supabase
        .from('progress_photos')
        .select('file_path')
        .eq('id', photoId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching photo for deletion:', fetchError);
        throw fetchError;
      }

      // Delete from storage bucket if file_path exists
      if (photo.file_path) {
        const { error: storageError } = await supabase.storage
          .from('progress-photos')
          .remove([photo.file_path]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Don't throw here - still try to delete from database
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw dbError;
      }

      return photoId;
    },
    onSuccess: (deletedPhotoId) => {
      console.log('Photo deleted successfully:', deletedPhotoId);
      // Invalidate all progress photo queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
      toast.success('Progress picture deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
}

// Legacy hook for backwards compatibility - combines all functionality
export function useProgressPhotos(startDate: string, endDate: string) {
  const { data: photos = [], isLoading } = useProgressPhotosLogsRange(startDate, endDate);
  const uploadMutation = useUploadProgressPhoto();
  const deleteMutation = useDeleteProgressPhoto();

  return {
    photos,
    isLoading,
    uploadPhoto: uploadMutation.mutate,
    deletePhoto: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}