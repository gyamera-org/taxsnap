import { useState, useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Alert, Platform, Linking } from 'react-native';
import { router } from 'expo-router';
import { X, HelpCircle, Zap, Camera, Image, FileText } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui';
import { HelpModal } from './help-modal';
import { IngredientAnalysisSheet } from './ingredient-analysis-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubscription } from '@/context/subscription-provider';
import { FreemiumGate } from '@/components/freemium-gate';
import { toast } from 'sonner-native';
import * as FileSystem from 'expo-file-system';

// Safe camera import with better error handling
let CameraView: any = null;
let useCameraPermissions: any = null;
let cameraAvailable = false;

try {
  const expoCamera = require('expo-camera');
  CameraView = expoCamera.CameraView;
  useCameraPermissions = expoCamera.useCameraPermissions;
  cameraAvailable = !!(CameraView && useCameraPermissions);
  console.log('✅ Camera modules loaded successfully');
} catch (error) {
  console.warn('❌ Camera not available:', error);
  cameraAvailable = false;
}

type ScanMode = 'camera' | 'gallery' | 'text';

export function ScanScreen() {
  // Only use camera hooks if available and safe
  const [permission, requestPermission] =
    cameraAvailable && useCameraPermissions ? useCameraPermissions() : [null, null];

  const [scanMode, setScanMode] = useState<ScanMode>('gallery');
  const [showHelp, setShowHelp] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAnalysisSheet, setShowAnalysisSheet] = useState(false);
  const [showFreemiumGate, setShowFreemiumGate] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false); // New state for camera readiness

  const cameraRef = useRef<any>(null);
  const { canAccessFeature, incrementFreeUsage } = useSubscription();

  useEffect(() => {
    console.log('🔍 Camera initialization check:', {
      cameraAvailable,
      CameraView: !!CameraView,
      useCameraPermissions: !!useCameraPermissions,
      permission: permission?.granted,
    });
  }, [permission]);

  // Camera ready callback
  const onCameraReady = () => {
    console.log('📸 Camera is ready!');
    setIsCameraReady(true);
  };

  // Reset camera ready state when switching modes
  useEffect(() => {
    if (scanMode !== 'camera') {
      setIsCameraReady(false);
    }
  }, [scanMode]);

  const processImage = async (imageUri: string): Promise<string> => {
    try {
      // Resize and optimize image for better OCR accuracy
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024 } }, // Optimal size for Google Vision API
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return processedImage.uri;
    } catch (error) {
      toast.error('Failed to process image');
      throw new Error('Failed to process image');
    }
  };

  const extractTextFromImage = async (imageUri: string): Promise<string> => {
    try {
      console.log('🔍 Starting Google Vision OCR extraction for:', imageUri);

      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        console.warn('Google Vision API key not found - skipping OCR');
        throw new Error('Google Vision API key not found');
      }

      // Process the image first
      const processedImageUri = await processImage(imageUri);
      console.log('✅ Image processed, converting to base64...');

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(processedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('📤 Sending to Google Vision API...');

      // Use Google Vision API for text detection
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64,
                },
                features: [
                  {
                    type: 'TEXT_DETECTION',
                    maxResults: 1,
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      console.log('📝 Google Vision result:', result);

      if (!result.responses || !result.responses[0] || !result.responses[0].textAnnotations) {
        console.log('⚠️ No text found in image');
        throw new Error('No text found in image');
      }

      const detectedText = result.responses[0].textAnnotations[0].description;

      if (!detectedText || detectedText.trim().length === 0) {
        throw new Error('No text found in image');
      }

      const extractedText = cleanExtractedText(detectedText);
      console.log('✅ Text extracted successfully:', extractedText.substring(0, 100) + '...');

      return extractedText;
    } catch (error) {
      console.error('❌ OCR extraction failed:', error);
      // Don't show toast error here - let the calling function handle it
      throw error;
    }
  };

  const cleanExtractedText = (rawText: string): string => {
    if (!rawText) return '';

    // Clean and format the extracted text for ingredient lists
    let cleanedText = rawText
      // Remove excessive whitespace and newlines
      .replace(/\s+/g, ' ')
      // Fix common OCR mistakes with ingredient separators
      .replace(/[;|]/g, ',')
      // Ensure proper spacing after commas
      .replace(/,\s*/g, ', ')
      // Remove leading/trailing whitespace
      .trim();

    // Ensure it starts with a capital letter
    if (cleanedText && cleanedText.length > 0) {
      cleanedText = cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
    }

    return cleanedText;
  };

  const takePicture = async () => {
    console.log('📸 Starting takePicture function');
    console.log('📸 Camera state:', {
      cameraAvailable,
      CameraView: !!CameraView,
      cameraRef: !!cameraRef.current,
      scanMode,
      permission: permission?.granted,
      isCameraReady,
    });

    // Wait for camera to be ready
    if (!isCameraReady) {
      console.warn('❌ Camera not ready yet');
      toast.error('Camera is starting up, please wait...');
      return;
    }

    if (!cameraAvailable || !CameraView || !cameraRef.current || !permission?.granted) {
      console.error('❌ Camera not available or ready');
      toast.error('Camera not available');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('📸 Taking picture with ready camera...');

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log('📸 Photo result:', { hasPhoto: !!photo, hasUri: !!photo?.uri });

      if (photo && photo.uri) {
        console.log('✅ Photo captured successfully');
        setCapturedImage(photo.uri);

        // Skip OCR for now to test basic functionality
        setExtractedText('');
        setShowAnalysisSheet(true);
        console.log('✅ Analysis sheet opened');
      } else {
        console.error('❌ No photo captured');
        toast.error('Failed to capture image');
      }
    } catch (error: any) {
      console.error('❌ takePicture failed:', error);
      toast.error(`Camera error: ${error?.message || 'Unknown error'}`);
    } finally {
      console.log('🏁 takePicture completed');
      setIsProcessing(false);
    }
  };

  const pickFromGallery = async () => {
    // Temporarily disable freemium check for testing
    // if (!canAccessFeature('product_scan')) {
    //   setShowFreemiumGate(true);
    //   return;
    // }

    setIsProcessing(true);

    try {
      // First, check if we have permission
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        // Request permission if we don't have it
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'We need access to your photo library to select images. Please grant permission in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  // On iOS, this will open app settings
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    // On Android, open app info
                    Linking.openSettings();
                  }
                },
              },
            ]
          );
          setIsProcessing(false);
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('✅ Image selected from gallery, starting text extraction...');
        setCapturedImage(imageUri);

        // Extract text using Google Vision API - only try if we have an image
        try {
          const extractedIngredients = await extractTextFromImage(imageUri);
          setExtractedText(extractedIngredients);
          console.log('🎉 Text extraction from gallery successful!');
        } catch (ocrError) {
          console.log('⚠️ OCR failed, proceeding with manual entry:', ocrError);
          setExtractedText('');
          // Don't show error toast - user can still manually enter text
        }

        // Temporarily disable usage tracking
        // await incrementFreeUsage('product_scan');
        console.log('🔄 About to set showAnalysisSheet to true...');
        setShowAnalysisSheet(true);
        console.log('✅ setShowAnalysisSheet(true) called');
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
      toast.error('Failed to select image');
    } finally {
      setIsProcessing(false);
    }
  };

  const openTextEntry = () => {
    console.log('🔤 openTextEntry called - opening analysis sheet for manual text entry');

    // Temporarily disable freemium check for testing
    // if (!canAccessFeature('product_scan')) {
    //   setShowFreemiumGate(true);
    //   return;
    // }

    // For text entry, we'll use the analysis sheet directly with no image
    setCapturedImage(null);
    setExtractedText('');
    setShowAnalysisSheet(true);

    console.log('✅ Analysis sheet should now be visible:', { showAnalysisSheet: true });
  };

  const handleModeChange = async (mode: ScanMode) => {
    console.log('🔄 Mode change requested:', mode);

    // Disable camera mode completely for stability
    if (mode === 'camera') {
      console.warn('❌ Camera mode disabled for stability');
      toast.error('Camera mode is currently disabled. Please use Gallery or Text modes.');
      return;
    }

    console.log('✅ Mode change approved:', mode);
    setScanMode(mode);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Camera View */}
      {scanMode === 'camera' && cameraAvailable && CameraView && permission?.granted && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          enableTorch={flashOn}
          facing="back"
          onCameraReady={onCameraReady}
        />
      )}

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 pt-2">
          <Pressable onPress={() => router.back()}>
            <X size={26} color="white" />
          </Pressable>

          <Text className="text-white text-xl font-semibold">Scan Ingredients</Text>

          <Pressable onPress={() => setShowHelp(true)}>
            <HelpCircle size={26} color="white" />
          </Pressable>
        </View>

        {/* Instructions */}
        <View className="px-6 py-4">
          <Text className="text-white text-center text-base">
            {scanMode === 'camera'
              ? permission?.granted && isCameraReady
                ? 'Position ingredients list in the frame and tap capture'
                : permission?.granted
                  ? 'Camera is starting up...'
                  : 'Camera permission required for scanning'
              : scanMode === 'gallery'
                ? 'Select a clear photo of ingredient list'
                : 'Type or paste the ingredients list manually'}
          </Text>
        </View>

        {/* Camera Permission Request UI */}
        {scanMode === 'camera' && (!permission?.granted || !CameraView || !cameraAvailable) && (
          <View className="flex-1 justify-center items-center px-6">
            <Camera size={80} color="white" className="mb-6" />
            <Text className="text-white text-xl font-semibold mb-4 text-center">
              {!CameraView || !cameraAvailable ? 'Camera Not Available' : 'Camera Access Required'}
            </Text>
            <Text className="text-gray-300 text-center mb-8">
              {!CameraView || !cameraAvailable
                ? 'Camera functionality is not available on this device or build.'
                : 'To scan product ingredients, we need access to your camera'}
            </Text>
            {CameraView && cameraAvailable && permission?.canAskAgain ? (
              <Button
                variant="primary"
                label="Grant Camera Permission"
                onPress={requestPermission}
                className="mb-4"
              />
            ) : (
              <View className="items-center">
                <Text className="text-gray-300 text-center mb-4">
                  {!CameraView || !cameraAvailable
                    ? 'Please use gallery or text entry modes instead.'
                    : 'Camera permission was denied. Please enable it in your device settings.'}
                </Text>
                <Button
                  variant="secondary"
                  label="Use Gallery Instead"
                  onPress={() => setScanMode('gallery')}
                />
              </View>
            )}
          </View>
        )}

        {/* Camera Frame */}
        {scanMode === 'camera' && permission?.granted && (
          <View className="flex-1 justify-center items-center">
            <View className="w-[85%] aspect-[4/3] border-2 border-white rounded-xl bg-transparent" />
            <Text className="text-white/70 text-sm mt-4 text-center px-4">
              {isCameraReady
                ? 'Align the ingredients list within this frame for best results'
                : 'Camera is starting up...'}
            </Text>
          </View>
        )}

        {/* Gallery/Text modes content */}
        {scanMode !== 'camera' && (
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-32 h-32 rounded-full border-2 border-white/30 items-center justify-center mb-6">
              {scanMode === 'gallery' ? (
                <Image size={60} color="white" />
              ) : (
                <FileText size={60} color="white" />
              )}
            </View>
            <Text className="text-white text-lg font-medium mb-2 text-center">
              {scanMode === 'gallery' ? 'Select from Gallery' : 'Enter Text Manually'}
            </Text>
            <Text className="text-gray-300 text-center mb-8">
              {scanMode === 'gallery'
                ? 'Choose a clear photo showing the ingredient list'
                : 'Type or paste the ingredient list from the product'}
            </Text>
          </View>
        )}

        {/* Bottom Controls */}
        <View className="bg-black/60 pt-4 pb-8 px-6">
          {/* Mode Selector */}
          <View className="flex-row justify-around mb-6">
            <Pressable
              onPress={() => handleModeChange('camera')}
              className="flex-1 items-center mx-1 py-3 rounded-xl bg-white/10 opacity-50"
              disabled={true}
            >
              <Camera size={24} color="#6b7280" />
              <Text className="text-xs mt-1 text-gray-500">Disabled</Text>
            </Pressable>

            <Pressable
              onPress={() => handleModeChange('gallery')}
              className={`flex-1 items-center mx-1 py-3 rounded-xl ${
                scanMode === 'gallery' ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <Image size={24} color={scanMode === 'gallery' ? 'black' : '#d1d5db'} />
              <Text
                className={`text-xs mt-1 ${
                  scanMode === 'gallery' ? 'text-black font-medium' : 'text-gray-400'
                }`}
              >
                Gallery
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleModeChange('text')}
              className={`flex-1 items-center mx-1 py-3 rounded-xl ${
                scanMode === 'text' ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <FileText size={24} color={scanMode === 'text' ? 'black' : '#d1d5db'} />
              <Text
                className={`text-xs mt-1 ${
                  scanMode === 'text' ? 'text-black font-medium' : 'text-gray-400'
                }`}
              >
                Text
              </Text>
            </Pressable>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-center gap-4">
            {scanMode === 'camera' && permission?.granted && (
              <Pressable
                onPress={() => setFlashOn(!flashOn)}
                className="bg-white/20 p-3 rounded-full"
                disabled={isProcessing}
              >
                <Zap size={24} color="white" />
              </Pressable>
            )}

            {(scanMode !== 'camera' || permission?.granted) && (
              <Button
                variant="primary"
                label={
                  isProcessing
                    ? 'Processing...'
                    : scanMode === 'camera'
                      ? isCameraReady
                        ? 'Capture'
                        : 'Starting Camera...'
                      : scanMode === 'gallery'
                        ? 'Select Photo'
                        : 'Enter Text'
                }
                onPress={() => {
                  console.log('🔘 Button pressed with scanMode:', scanMode);
                  if (scanMode === 'camera') {
                    console.log('📸 Calling takePicture');
                    takePicture();
                  } else if (scanMode === 'gallery') {
                    console.log('🖼️ Calling pickFromGallery');
                    pickFromGallery();
                  } else {
                    console.log('📝 Calling openTextEntry');
                    openTextEntry();
                  }
                }}
                disabled={isProcessing || (scanMode === 'camera' && !isCameraReady)}
                loading={isProcessing}
                className="flex-1 max-w-xs"
              />
            )}
          </View>
        </View>
      </SafeAreaView>

      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />

      <IngredientAnalysisSheet
        visible={showAnalysisSheet}
        onClose={() => {
          setShowAnalysisSheet(false);
          setCapturedImage(null);
          setExtractedText('');
        }}
        imageUri={capturedImage}
        extractedText={extractedText}
        isTextMode={scanMode === 'text'}
      />

      <FreemiumGate
        visible={showFreemiumGate}
        feature="product_scan"
        featureName="Product Scanning"
        featureDescription="Analyze hair product ingredients with AI-powered insights"
        icon="camera-outline"
        onClose={() => setShowFreemiumGate(false)}
      />
    </View>
  );
}
