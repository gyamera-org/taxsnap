import React from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { UserRound, Camera } from 'lucide-react-native';
import { useAvatar, useAvatarUpload } from '@/lib/hooks/use-avatar';

interface AvatarUploadProps {
  size?: number;
  showActions?: boolean;
}

export const AvatarUpload = ({ size = 80, showActions = true }: AvatarUploadProps) => {
  const { data: avatarUrl, isLoading } = useAvatar();
  const avatarUpload = useAvatarUpload();

  const handleUploadFromCamera = async () => {
    try {
      await avatarUpload.mutateAsync({ useCamera: true });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUploadFromGallery = async () => {
    try {
      await avatarUpload.mutateAsync({ useCamera: false });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const showUploadOptions = () => {
    Alert.alert('Update Avatar', 'Choose how you want to update your avatar', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera', onPress: handleUploadFromCamera },
      { text: 'Photo Gallery', onPress: handleUploadFromGallery },
    ]);
  };

  return (
    <View className="items-center">
      {/* Avatar Display */}
      <TouchableOpacity
        onPress={showActions ? showUploadOptions : undefined}
        disabled={isLoading || avatarUpload.isPending}
        className="relative"
      >
        <View
          className="rounded-full bg-gray-100 items-center justify-center border-2 border-gray-200"
          style={{ width: size, height: size }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: size, height: size }}
              className="rounded-full"
            />
          ) : (
            <UserRound size={size * 0.5} color="#9CA3AF" />
          )}
        </View>

        {showActions && (
          <View className="absolute -bottom-2 -right-2 bg-pink-500 rounded-full p-2">
            <Camera size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>

      {/* Loading State */}
      {(isLoading || avatarUpload.isPending) && (
        <Text className="text-sm text-gray-500 mt-2">
          {avatarUpload.isPending ? 'Uploading...' : 'Loading...'}
        </Text>
      )}
    </View>
  );
};
