import { View, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { PhotoGrid } from '@/components/photo-grid';
import { Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProgressPhotos } from '@/lib/hooks/use-progress-photos';
import { useState } from 'react';

type ProgressPicturesSectionProps = {
  startDate: string;
  endDate: string;
};

export function ProgressPicturesSection({ startDate, endDate }: ProgressPicturesSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { photos, uploadPhoto, deletePhoto, isLoading } = useProgressPhotos(startDate, endDate);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload progress pictures.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4], // Portrait aspect ratio for progress pictures
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        await uploadPhoto(result.assets[0]);
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload progress picture. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take progress pictures.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4], // Portrait aspect ratio for progress pictures
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        await uploadPhoto(result.assets[0]);
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload progress picture. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Add Progress Picture',
      'Choose how you want to add your progress picture',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View className="bg-white rounded-2xl p-6 mx-4 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Progress Pictures</Text>
        <TouchableOpacity
          onPress={showUploadOptions}
          disabled={isUploading}
          className="bg-pink-500 rounded-full p-2"
        >
          {isUploading ? (
            <Upload size={20} color="#ffffff" />
          ) : (
            <Camera size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
      
      {photos.length === 0 ? (
        <View className="items-center py-8">
          <Camera size={48} color="#D1D5DB" />
          <Text className="text-gray-500 text-center mt-2 mb-4">
            No progress pictures yet for this week
          </Text>
          <TouchableOpacity
            onPress={showUploadOptions}
            disabled={isUploading}
            className="bg-pink-100 rounded-xl px-4 py-2"
          >
            <Text className="text-pink-600 font-medium">
              {isUploading ? 'Uploading...' : 'Add Your First Picture'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <PhotoGrid photos={photos} onDeletePhoto={deletePhoto} />
      )}
    </View>
  );
}