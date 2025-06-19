import { useState, useRef, useEffect } from 'react';
import { View, Image, Dimensions, Alert, Linking } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Text } from '@/components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAnalyzeScan, NonBeautyProductError } from '@/lib/hooks/use-analyze-scan';
import { ProductDetailModal } from '@/components/saves/ProductDetailModal';
import { useSaveScan } from '@/lib/hooks/use-scans';
import { useAuth } from '@/context/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { ScannedProductUI, convertToUIFormat } from '@/lib/types/product';
import { toast } from 'sonner-native';
import { router } from 'expo-router';
import { CropOverlay, ProcessingOverlay, CameraControls, CropArea } from '@/components/scan';
import { PRODUCT_IMAGES_BUCKET } from '@/constants/images';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProductUI | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [showCapturedImage, setShowCapturedImage] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({
    x: screenWidth * 0.1,
    y: screenHeight * 0.3,
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
  });
  const hasPromptedRef = useRef(false);
  const cameraRef = useRef<CameraView>(null);

  const { user } = useAuth();
  const {
    mutate: analyzeImage,
    data: analysisData,
    error: analysisError,
    isPending: isAnalyzing,
    reset: resetAnalysis,
  } = useAnalyzeScan();
  const saveScan = useSaveScan();

  // Comprehensive reset function to clear all scan-related states
  const resetScanState = () => {
    setCapturedImage(null);
    setShowCapturedImage(false);
    setIsProcessingImage(false);
    setProcessedImageUrl(null);
    setScannedProduct(null);
    setShowModal(false);
    resetAnalysis();
    saveScan.reset();
  };

  // Clear any previous errors on component mount to prevent crashes
  useEffect(() => {
    resetAnalysis();
  }, []);

  useEffect(() => {
    if (analysisData && capturedImage) {
      try {
        const uiProduct = convertToUIFormat(analysisData, capturedImage);
        setScannedProduct(uiProduct);
        setShowModal(true);
      } catch (error: any) {
        toast.error('Failed to process analysis results. Please try again.');
        resetAnalysis();
      }
    }
  }, [analysisData, capturedImage]);

  useEffect(() => {
    if (analysisError) {
      // Handle non-beauty product errors specifically
      if (analysisError instanceof NonBeautyProductError) {
        toast.warning('Not a Beauty Product', {
          description: `We detected "${analysisError.detectedCategory}" but currently only support beauty and personal care products.`,
          duration: 1000,
          action: {
            label: 'Scan Another',
            onClick: () => {
              resetScanState();
              toast.dismiss();
            },
          },
        });
      } else {
        // Handle other errors
        toast.error(analysisError.message || 'Unable to analyze the product. Please try again.', {
          action: {
            label: 'Try Again',
            onClick: () => {
              resetScanState();
            },
          },
        });
      }

      // Reset all states when there's an error
      setTimeout(() => {
        resetScanState();
      }, 100);
    }
  }, [analysisError]);

  // Cleanup on component unmount to prevent crashes
  useEffect(() => {
    return () => {
      resetAnalysis();
      saveScan.reset();
    };
  }, []);

  // Early return for permission loading - AFTER all hooks
  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    if (!hasPromptedRef.current) {
      hasPromptedRef.current = true;

      if (permission.canAskAgain) {
        requestPermission();
      } else {
        Alert.alert(
          'Camera Permission Needed',
          'You have previously denied camera access. Please enable it in your settings to scan products.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => router.replace('/(tabs)/explore'),
            },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    }

    return <View className="flex-1 bg-black" />;
  }

  const takePicture = async () => {
    if (!cameraRef.current) {
      toast.error('Camera not ready. Please wait a moment and try again.');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo && photo.uri) {
        setCapturedImage(photo);
        setShowCapturedImage(true);
      } else {
        toast.error('Failed to capture image. Please try again.');
      }
    } catch (error: any) {
      let errorMessage = 'Failed to take picture. Please try again.';

      if (error?.message?.includes('Camera')) {
        errorMessage = 'Camera error. Please restart the app and try again.';
      } else if (error?.message?.includes('permission')) {
        errorMessage = 'Camera permission denied. Please check your settings.';
      }

      toast.error(errorMessage);
    }
  };

  const cropAndAnalyze = async () => {
    if (!capturedImage) {
      toast.error('No image to analyze. Please take a photo first.');
      return;
    }

    setIsProcessingImage(true);

    try {
      const cropX = cropArea.x / screenWidth;
      const cropY = cropArea.y / screenHeight;
      const cropWidth = cropArea.width / screenWidth;
      const cropHeight = cropArea.height / screenHeight;

      const croppedImage = await ImageManipulator.manipulateAsync(
        capturedImage.uri,
        [
          {
            crop: {
              originX: cropX * capturedImage.width,
              originY: cropY * capturedImage.height,
              width: cropWidth * capturedImage.width,
              height: cropHeight * capturedImage.height,
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      setCapturedImage(croppedImage);

      const filename = `scan-${Date.now()}.jpeg`;
      const base64Data = croppedImage.base64;
      if (!base64Data) throw new Error('No base64 data available');
      const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(filename, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(filename);

      if (!urlData?.publicUrl) {
        throw new Error('Could not get public URL for uploaded image');
      }

      setProcessedImageUrl(urlData.publicUrl);

      analyzeImage({ imageUrl: urlData.publicUrl });

      setIsProcessingImage(false);
    } catch (error: any) {
      // Reset all states on any error during processing
      resetScanState();

      toast.error(error.message || 'Failed to process image. Please try again.');
    }
  };

  const retakePhoto = () => {
    resetScanState();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedImage(asset);
        setShowCapturedImage(true);
      }
    } catch (error: any) {
      toast.error('Failed to pick image from gallery. Please try again.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleTorch = () => {
    setTorch((current) => !current);
  };

  const handleSaveScan = async () => {
    if (!scannedProduct || !user || !analysisData) return;

    await saveScan.mutateAsync({
      ...analysisData,
      image_url: processedImageUrl || '',
    });

    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setScannedProduct(null);
    setIsProcessingImage(false);
    resetAnalysis();

    // Reset to camera view
    setCapturedImage(null);
    setShowCapturedImage(false);
  };

  const closeScan = () => {
    resetScanState();

    // Navigate back to the previous screen or home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/explore');
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Camera or captured image */}
      {showCapturedImage && capturedImage ? (
        <Image source={{ uri: capturedImage.uri }} className="flex-1" resizeMode="cover" />
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} enableTorch={torch} />
      )}

      {/* Crop overlay - hidden when processing or analyzing */}
      {!isProcessingImage && !isAnalyzing && (
        <CropOverlay
          cropArea={cropArea}
          onCropAreaChange={setCropArea}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      )}

      {/* Camera controls */}
      <CameraControls
        torch={torch}
        showCapturedImage={showCapturedImage}
        onToggleTorch={toggleTorch}
        onToggleFacing={toggleCameraFacing}
        onPickImage={pickImage}
        onTakePicture={takePicture}
        onRetakePhoto={retakePhoto}
        onCropAndAnalyze={cropAndAnalyze}
        onClose={closeScan}
      />

      {/* Processing overlay */}
      <ProcessingOverlay visible={isProcessingImage} />

      {/* Analysis overlay */}
      {isAnalyzing && !isProcessingImage && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center z-50">
          <View className="bg-white/95 rounded-2xl p-8 items-center max-w-[80%]">
            <View className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-full p-4 mb-5 relative">
              <Text className="text-2xl">🧠</Text>
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </View>
            <Text className="text-xl font-bold text-black text-center mb-2">
              AI Brain Analyzing...
            </Text>
            <Text className="text-gray-600 text-center text-sm mb-4">
              🤖 Neural networks are examining ingredients, safety profiles, and beauty science data
            </Text>
            <View className="flex-row items-center justify-center mb-2">
              <View className="w-2 h-2 bg-purple-500 rounded-full mr-1 animate-pulse" />
              <View className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse delay-150" />
              <View className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300" />
            </View>
            <Text className="text-gray-500 text-center text-xs">
              Processing with advanced AI models...
            </Text>
          </View>
        </View>
      )}

      {/* Product detail modal */}
      {showModal && scannedProduct && (
        <ProductDetailModal
          product={scannedProduct}
          visible={showModal}
          onClose={closeModal}
          onSaveScan={handleSaveScan}
          isSavingScan={saveScan.isPending}
          modalHeight="80%"
        />
      )}
    </View>
  );
}
