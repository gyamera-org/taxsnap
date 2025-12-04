import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { RotateCcw, ImagePlus } from 'lucide-react-native';

interface CameraControlsProps {
  onCapture: () => void;
  onFlipCamera: () => void;
  onPickImage?: () => void;
  isCapturing?: boolean;
}

export function CameraControls({
  onCapture,
  onFlipCamera,
  onPickImage,
  isCapturing = false,
}: CameraControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        {/* Flip Camera Button */}
        <Pressable
          onPress={onFlipCamera}
          style={styles.sideButton}
          disabled={isCapturing}
        >
          <RotateCcw size={24} color="#FFFFFF" />
        </Pressable>

        {/* Capture Button */}
        <Pressable onPress={onCapture} disabled={isCapturing}>
          <View style={styles.captureButtonOuter}>
            {isCapturing ? (
              <ActivityIndicator size="large" color="#0D9488" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </View>
        </Pressable>

        {/* Gallery Button */}
        {onPickImage ? (
          <Pressable
            onPress={onPickImage}
            style={styles.sideButton}
            disabled={isCapturing}
          >
            <ImagePlus size={24} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#0D9488',
  },
  placeholder: {
    width: 48,
    height: 48,
  },
});
