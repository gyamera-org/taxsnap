import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Receipt as ReceiptIcon } from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import type { PendingReceipt } from '@/context/pending-receipt-provider';

interface PendingReceiptItemProps {
  pendingReceipt: PendingReceipt;
}

export function PendingReceiptItem({ pendingReceipt }: PendingReceiptItemProps) {
  const colors = useThemedColors();
  const { isDark } = useTheme();

  // Animated pulse effect for the progress ring
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedRingStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const progress = Math.round(pendingReceipt.progress);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        },
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* Image with Progress Overlay */}
      <View style={styles.imageContainer}>
        {pendingReceipt.imagePreviewUri ? (
          <Image
            source={{ uri: pendingReceipt.imagePreviewUri }}
            style={styles.receiptImage}
            resizeMode="cover"
            blurRadius={2}
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <ReceiptIcon size={32} color={colors.textMuted} />
          </View>
        )}

        {/* Dark Overlay */}
        <View style={styles.imageOverlay} />

        {/* Circular Progress Indicator */}
        <View style={styles.progressCircleContainer}>
          <Animated.View style={[styles.progressRing, animatedRingStyle]}>
            <View
              style={[
                styles.progressRingInner,
                { borderColor: 'rgba(255,255,255,0.3)' },
              ]}
            />
          </Animated.View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          Analyzing receipt...
        </Text>

        {/* Progress Bars */}
        <View style={styles.progressBarsContainer}>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progress * 3, 100)}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(0, Math.min((progress - 33) * 3, 100))}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(0, Math.min((progress - 66) * 3, 100))}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We'll notify you when done!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 20,
    minHeight: 110,
  },
  containerLight: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  containerDark: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageContainer: {
    width: 110,
    minHeight: 110,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2C2C2E',
  },
  receiptImage: {
    width: 110,
    height: 110,
  },
  placeholderIcon: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  progressCircleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    position: 'absolute',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  progressBarsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  subtitle: {
    fontSize: 13,
  },
});
