import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Pressable, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Sparkles, Lock, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTabBar } from '@/context/tab-bar-provider';
import { usePendingScan } from '@/context/pending-scan-provider';
import { useRevenueCat } from '@/context/revenuecat-provider';
import { CameraHeader, CameraControls, ScanFrame, ScanHelpModal } from '@/components/scan';

export default function ScanScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { hideTabBar, showTabBar } = useTabBar();
  const { startScan, pendingScan } = usePendingScan();
  const { isSubscribed, freeScansRemaining, maxFreeScans, canScan } = useRevenueCat();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Hide tab bar when screen is focused, show when leaving
  useFocusEffect(
    useCallback(() => {
      hideTabBar();
      return () => showTabBar();
    }, [hideTabBar, showTabBar])
  );

  // Request permission on mount if not determined
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const toggleFlash = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash((prev) => !prev);
  }, []);

  const handleOpenHelp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHelp(true);
  }, []);

  const handleCloseHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  const toggleCameraFacing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const processImage = useCallback(
    (imageBase64: string, imageUri?: string) => {
      // Start the scan in background and immediately go back to home
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startScan(imageBase64, imageUri);

      // Navigate back to home to show pending scan in list
      router.back();
    },
    [startScan, router]
  );

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing || pendingScan) return;

    // Check if user has reached free scan limit
    if (!canScan) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setShowLimitModal(true);
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo?.base64) {
        processImage(photo.base64, photo.uri);
      } else {
        throw new Error('No image data captured');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('errors.camera'));
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, pendingScan, processImage, t, canScan]);

  const handlePickImage = useCallback(async () => {
    if (pendingScan) return;

    // Check if user has reached free scan limit
    if (!canScan) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setShowLimitModal(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      processImage(result.assets[0].base64, result.assets[0].uri);
    }
  }, [pendingScan, processImage, canScan]);

  const handleUpgrade = useCallback(() => {
    setShowLimitModal(false);
    router.push('/paywall');
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  // Loading state - show black screen
  if (!permission) {
    return <View style={styles.container} />;
  }

  // Permission denied and can't ask again - show message on black background
  if (!permission.granted && !permission.canAskAgain) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.permissionContainer}>
          <CameraHeader flash={false} onClose={handleClose} onToggleFlash={() => {}} />
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>{t('scan.cameraPermission.title')}</Text>
            <Text style={styles.permissionText}>{t('scan.cameraPermission.description')}</Text>
            <Pressable onPress={handleOpenSettings} style={styles.settingsButton}>
              <Text style={styles.settingsButtonText}>
                {t('scan.cameraPermission.openSettings')}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Permission not granted yet (waiting for native alert response)
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.permissionContainer}>
          <CameraHeader flash={false} onClose={handleClose} onToggleFlash={() => {}} />
        </SafeAreaView>
      </View>
    );
  }

  const isProcessing = isCapturing || !!pendingScan;

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={flash}
      >
        <SafeAreaView style={styles.cameraContent}>
          <CameraHeader
            flash={flash}
            onClose={handleClose}
            onToggleFlash={toggleFlash}
            onHelp={handleOpenHelp}
          />

          {/* Free scans remaining banner for non-subscribers */}
          {!isSubscribed && freeScansRemaining > 0 && (
            <Pressable onPress={() => router.push('/paywall')} style={styles.freeScansContainer}>
              <Sparkles size={14} color="#14B8A6" />
              <Text style={styles.freeScansText}>
                {t('scan.freeScansRemaining', { count: freeScansRemaining, max: maxFreeScans })}
              </Text>
            </Pressable>
          )}

          <ScanFrame />

          <CameraControls
            onCapture={handleCapture}
            onFlipCamera={toggleCameraFacing}
            onPickImage={handlePickImage}
            isCapturing={isProcessing}
          />
        </SafeAreaView>
      </CameraView>

      <ScanHelpModal visible={showHelp} onClose={handleCloseHelp} />

      {/* Scan Limit Reached Modal */}
      <Modal visible={showLimitModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLimitModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Close button */}
            <Pressable style={styles.modalCloseButton} onPress={() => setShowLimitModal(false)}>
              <X size={20} color="#6B7280" />
            </Pressable>

            {/* Icon */}
            <View style={styles.modalIconContainer}>
              <Lock size={32} color="#14B8A6" />
            </View>

            {/* Title & Description */}
            <Text style={styles.modalTitle}>{t('scan.limitReached.title')}</Text>
            <Text style={styles.modalDescription}>{t('scan.limitReached.modalDescription')}</Text>

            {/* Features list */}
            {/* <View style={styles.modalFeatures}>
              <Text style={styles.modalFeatureItem}>• {t('scan.limitReached.feature1')}</Text>
              <Text style={styles.modalFeatureItem}>• {t('scan.limitReached.feature2')}</Text>
              <Text style={styles.modalFeatureItem}>• {t('scan.limitReached.feature3')}</Text>
            </View> */}

            {/* CTA Button */}
            <Pressable style={styles.modalCta} onPress={handleUpgrade}>
              <LinearGradient
                colors={['#14B8A6', '#0D9488', '#0F766E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.modalCtaText}>{t('scan.limitReached.cta')}</Text>
            </Pressable>

            {/* Maybe later */}
            {/* <Pressable
              style={styles.modalLaterButton}
              onPress={() => setShowLimitModal(false)}
            >
              <Text style={styles.modalLaterText}>{t('scan.limitReached.maybeLater')}</Text>
            </Pressable> */}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContent: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  settingsButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  freeScansContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginTop: 8,
  },
  freeScansText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D0D0D',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0D0D',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalFeatures: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  modalFeatureItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalCta: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  modalCtaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalLaterButton: {
    paddingVertical: 8,
  },
  modalLaterText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
