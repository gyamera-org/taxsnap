import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { X, RotateCcw, Image as ImageIcon, Zap, ZapOff } from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { useTabBar } from '@/context/tab-bar-provider';
import { useAuth } from '@/context/auth-provider';
import { usePendingReceipt } from '@/context/pending-receipt-provider';

export default function ScanScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();
  const { hideTabBar, showTabBar } = useTabBar();
  const { session } = useAuth();
  const { startScan } = usePendingReceipt();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);

  // Hide tab bar when screen mounts, show when unmounts
  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, []);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showTabBar();
    router.back();
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const toggleFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const processImage = async (imageBase64: string, localUri: string) => {
    try {
      // Start the scan in the background and navigate back
      showTabBar();
      router.back();
      startScan(imageBase64, localUri);
    } catch (error) {
      console.error('Failed to process image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const handleCapture = async () => {
    if (isCapturing || !cameraRef.current || !session?.user?.id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo?.uri && photo?.base64) {
        await processImage(photo.base64, photo.uri);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickImage = async () => {
    if (!session?.user?.id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to select receipt images.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      const { uri, base64 } = result.assets[0];
      await processImage(base64, uri);
    }
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            {t('scan.permissionTitle')}
          </Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            {t('scan.permissionText')}
          </Text>
          <Pressable
            onPress={requestPermission}
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.permissionButtonText}>{t('scan.grantPermission')}</Text>
          </Pressable>
          <Pressable onPress={handleClose} style={styles.cancelButton}>
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
              {t('common.cancel')}
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera View */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flash}>
        {/* Overlay */}
        <SafeAreaView style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <Pressable onPress={handleClose} style={styles.controlButton}>
              <X size={24} color="#FFFFFF" />
            </Pressable>

            <View style={styles.topRightControls}>
              <Pressable onPress={toggleFlash} style={styles.controlButton}>
                {flash === 'on' ? (
                  <Zap size={22} color="#FFCC00" fill="#FFCC00" />
                ) : (
                  <ZapOff size={22} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Scan Frame Guide */}
          <View style={styles.frameContainer}>
            <View style={styles.scanFrame}>
              {/* Corner guides */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <Text style={styles.frameHint}>{t('scan.alignReceipt')}</Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Gallery Button */}
            <Pressable onPress={handlePickImage} style={styles.sideButton}>
              <View style={styles.galleryButton}>
                <ImageIcon size={24} color="#FFFFFF" />
              </View>
            </Pressable>

            {/* Capture Button */}
            <Pressable
              onPress={handleCapture}
              disabled={isCapturing}
              style={styles.captureButtonOuter}
            >
              <View
                style={[styles.captureButtonInner, isCapturing && styles.captureButtonCapturing]}
              />
            </Pressable>

            {/* Flip Camera Button */}
            <Pressable onPress={toggleFacing} style={styles.sideButton}>
              <View style={styles.flipButton}>
                <RotateCcw size={22} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 280,
    height: 380,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00C0E8',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  frameHint: {
    marginTop: 20,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 40,
  },
  sideButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  captureButtonCapturing: {
    backgroundColor: '#00C0E8',
    transform: [{ scale: 0.9 }],
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    fontSize: 15,
  },
});
