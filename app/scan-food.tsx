import { useState, useRef } from 'react';
import { View, TouchableOpacity, Alert, StatusBar, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { toast } from 'sonner-native';
import { useScanFood } from '@/lib/hooks/use-food-scanner';
import { useCreateMealEntry } from '@/lib/hooks/use-meal-tracking';
import { useFoodAnalysisRealtime } from '@/lib/hooks/use-food-analysis-realtime';
import { getLocalDateTime } from '@/lib/utils/date-helpers';

import { Camera, Image as ImageIcon, X, HelpCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function ScanFoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scanFood = useScanFood();
  const createMealEntry = useCreateMealEntry();

  // Set up realtime notifications for food analysis
  const { updateAnalysisProgress, markAnalysisComplete, markAnalysisFailed } =
    useFoodAnalysisRealtime({
      onAnalysisComplete: (mealEntry) => {
        // Additional handling if needed
      },
      onAnalysisFailed: (mealEntry) => {
        // Additional handling if needed
      },
      onAnalysisProgress: (mealEntry) => {
        // Additional handling if needed
      },
    });

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);

  const [selectedMealType, setSelectedMealType] = useState(() => {
    const mealType = (params.mealType as string) || 'breakfast';
    return mealType;
  });

  const [foodContext] = useState<string>(''); // Keep empty since we removed the input

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo) {
        await analyzeFoodImage(photo.uri);
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      toast.error('Failed to take photo');
    }
  };

  const pickFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library permission to upload food images.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        await analyzeFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking from library:', error);
      toast.error('Failed to pick image from library');
    }
  };

  const analyzeFoodImage = async (imageUri: string) => {
    try {
      const { date, time } = getLocalDateTime();
      const analyzingMealEntry = {
        meal_type: selectedMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        food_items: [
          {
            food: {
              id: `analyzing_${Date.now()}`,
              name: 'AI analyzing your food...',
              brand: 'AI Scanning',
              category: 'scanning',
              servingSize: '1 serving',
              nutrition: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
              },
            },
            quantity: 1,
          },
        ],
        logged_date: date,
        logged_time: time,
        notes: 'AI analyzing food',
        analysis_status: 'analyzing' as const,
        analysis_progress: 0,
        analysis_stage: 'uploading' as const,
        image_url: imageUri, // Add the image URL immediately
      };

      createMealEntry.mutate(analyzingMealEntry, {
        onSuccess: async (analyzingMeal) => {
          const returnTo = (params.returnTo as string) || '/(tabs)/nutrition';
          router.push(returnTo as any);
          await updateAnalysisProgress(analyzingMeal.id, 10, 'uploading');

          try {
            const imageBase64 = await convertImageToBase64(imageUri);
            await updateAnalysisProgress(analyzingMeal.id, 30, 'analyzing');
            scanFood.mutate(
              {
                image_base64: imageBase64,
                context: foodContext.trim() || undefined,
                meal_type: selectedMealType,
                auto_save: false,
                meal_entry_id: analyzingMeal.id,
              },
              {
                onSuccess: async (response) => {},
                onError: async (error) => {
                  console.error('❌ Food analysis error:', error);
                  await markAnalysisFailed(analyzingMeal.id);
                },
              }
            );
          } catch (conversionError) {
            console.error('❌ Image conversion error:', conversionError);
            await markAnalysisFailed(analyzingMeal.id);
            toast.error('Failed to process image');
          }
        },
        onError: (error) => {
          console.error('❌ Failed to create analyzing meal entry:', error);
          toast.error('Failed to start food analysis');
        },
      });
    } catch (error) {
      console.error('❌ Image processing error:', error);
      toast.error('Failed to process image');
    }
  };

  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Render based on permission state - no early returns after hooks
  return (
    <>
      {!permission ? (
        <View />
      ) : !permission.granted ? (
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>We need your permission to show the camera</Text>
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          {/* Camera View */}
          <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpButton}>
                <HelpCircle size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Camera Frame */}
            <View style={styles.cameraFrame}>
              <View style={styles.frameCorner} />
              <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
              <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
              <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={takePicture}>
                  <Camera size={20} color="#000000" />
                  <Text style={styles.actionButtonText}>Scan Food</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={pickFromLibrary}>
                  <ImageIcon size={20} color="#000000" />
                  <Text style={styles.actionButtonText}>Library</Text>
                </TouchableOpacity>
              </View>

              {/* Capture Button */}
              <View style={styles.captureContainer}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    marginTop: -125,
    marginLeft: -125,
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderWidth: 3,
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  frameCornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  frameCornerBottomLeft: {
    bottom: 0,
    left: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 3,
  },
  frameCornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 100,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
  },
});
