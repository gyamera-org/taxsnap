import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';
import { queryKeys } from './query-keys';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/lib/utils/image-upload';

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create unique filename for storage bucket
      const fileName = `${user.id}/${Date.now()}.jpg`;

      // Use common upload utility with progress photo settings
      const { publicUrl } = await uploadImage(asset.uri, 'progress-photos', fileName, {
        maxSize: 1000, // Larger than avatar for better progress photo quality
        quality: 0.8,
        upsert: false,
      });

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

      return {
        id: data.id,
        uri: data.image_url,
        date: new Date(data.created_at).toLocaleDateString(),
        createdAt: data.created_at,
        week: new Date(data.created_at).toLocaleDateString(),
      } as ProgressPhoto;
    },
    onSuccess: (newPhoto) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      // Invalidate all progress photo queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
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
