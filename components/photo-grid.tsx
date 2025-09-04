import {
  View,
  ScrollView,
  Image as RNImage,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Trash2 } from 'lucide-react-native';
import { useState } from 'react';

type Photo = {
  id: string;
  uri: string;
  date: string;
  createdAt: string;
};

type PhotoGridProps = {
  photos: Photo[];
  onDeletePhoto?: (photoId: string) => void;
};

export function PhotoGrid({ photos, onDeletePhoto }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return null;
  }

  // Sort photos by creation date (newest first)
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this progress picture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDeletePhoto?.(photoId);
          setSelectedPhoto(null);
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
      >
        {sortedPhotos.map((photo) => (
          <View key={photo.id} style={{ width: 96 }}>
            <TouchableOpacity onPress={() => setSelectedPhoto(photo)}>
              <RNImage
                source={{ uri: photo.uri }}
                style={{ width: 96, height: 128, borderRadius: 12, backgroundColor: '#E5E7EB' }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <Text className="text-gray-600 text-sm mt-2">{photo.date}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Modal for enlarged view */}
      <Modal visible={selectedPhoto !== null} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setSelectedPhoto(null)}
        >
          <View style={{ position: 'relative' }}>
            {/* Image */}
            {selectedPhoto && (
              <RNImage
                source={{ uri: selectedPhoto.uri }}
                style={{ width: 300, height: 400, borderRadius: 12 }}
                resizeMode="contain"
              />
            )}

            {/* Top action buttons - inside image */}
            <View
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              {/* Delete button */}
              {onDeletePhoto && selectedPhoto && (
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    borderRadius: 20,
                    padding: 8,
                  }}
                  onPress={() => handleDeletePhoto(selectedPhoto.id)}
                >
                  <Trash2 size={20} color="#ffffff" />
                </TouchableOpacity>
              )}

              {/* Close button */}
              <TouchableOpacity
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: 20, padding: 8 }}
                onPress={() => setSelectedPhoto(null)}
              >
                <X size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Date inside image - bottom */}
            {selectedPhoto && (
              <View style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    textAlign: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  {selectedPhoto.date}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
