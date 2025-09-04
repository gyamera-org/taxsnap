import { View, Pressable, Image } from 'react-native';
import { Camera, X } from 'lucide-react-native';
import * as ImagePickerExpo from 'expo-image-picker';
import { useState } from 'react';

type ImagePickerProps = {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  aspectRatio?: [number, number];
};

export function ImagePicker({ images, onImagesChange, maxImages = 4, aspectRatio = [1, 1] }: ImagePickerProps) {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= maxImages) return;

    try {
      setLoading(true);
      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled) {
        onImagesChange([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {images.map((uri, index) => (
        <View key={index} className="relative">
          <Image source={{ uri }} className="w-24 h-24 rounded-xl" resizeMode="cover" />
          <Pressable
            onPress={() => removeImage(index)}
            className="absolute -top-2 -right-2 bg-black rounded-full p-1"
          >
            <X size={16} color="white" />
          </Pressable>
        </View>
      ))}

      {images.length < maxImages && (
        <Pressable
          onPress={pickImage}
          disabled={loading}
          className="w-24 h-24 bg-gray-100 rounded-xl items-center justify-center"
        >
          <Camera size={24} color="#4B5563" />
        </Pressable>
      )}
    </View>
  );
}
