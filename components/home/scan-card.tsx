import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import {
  Gauge,
  Candy,
  Wheat,
  Flame,
  HeartPulse,
  Factory,
} from 'lucide-react-native';
import type { ScanResult, ScanStatus, ScanAnalysis } from '@/lib/types/scan';
import { DEMO_IMAGES } from '@/lib/config/demo-data';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

interface ScanCardProps {
  scan: ScanResult;
  index: number;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

// Circular progress indicator
function CircularProgress({ progress, size = 70 }: { progress: number; size?: number }) {
  const animatedProgress = useSharedValue(0);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value / 100),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );
}

// Skeleton loading bars
function SkeletonBars() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={[styles.skeletonBar, { width: '80%' }]} />
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonBar, { width: '28%' }]} />
        <View style={[styles.skeletonBar, { width: '28%' }]} />
        <View style={[styles.skeletonBar, { width: '28%' }]} />
      </View>
    </View>
  );
}

// Image skeleton with shimmer effect
function ImageSkeleton() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.4, 0.7, 0.4]),
  }));

  return (
    <Animated.View style={[styles.imageSkeleton, shimmerStyle]} />
  );
}

// Get color based on value level
function getIndicatorColor(
  value: 'low' | 'moderate' | 'medium' | 'high' | 'positive' | 'neutral' | 'negative' | 'minimally' | 'moderately' | 'highly' | undefined,
  invertScale = false
): string {
  if (!value) return '#9CA3AF'; // gray for unknown

  const greenValues = invertScale
    ? ['high', 'negative', 'highly']
    : ['low', 'positive', 'minimally'];
  const yellowValues = ['moderate', 'medium', 'neutral', 'moderately'];
  const redValues = invertScale
    ? ['low', 'positive', 'minimally']
    : ['high', 'negative', 'highly'];

  if (greenValues.includes(value)) return '#059669'; // green
  if (yellowValues.includes(value)) return '#D97706'; // yellow/orange
  if (redValues.includes(value)) return '#DC2626'; // red
  return '#9CA3AF';
}

// Get color for inflammatory score (1-10, lower is better)
function getInflammatoryColor(score: number | undefined): string {
  if (score === undefined) return '#9CA3AF';
  if (score <= 3) return '#059669'; // green
  if (score <= 6) return '#D97706'; // yellow
  return '#DC2626'; // red
}

// Nutrition indicators row
function NutritionIndicators({ analysis }: { analysis?: ScanAnalysis }) {
  if (!analysis) return null;

  const indicators = [
    {
      key: 'gi',
      Icon: Gauge,
      color: getIndicatorColor(analysis.glycemic_index),
      visible: !!analysis.glycemic_index,
    },
    {
      key: 'sugar',
      Icon: Candy,
      color: getIndicatorColor(analysis.sugar_content),
      visible: !!analysis.sugar_content,
    },
    {
      key: 'fiber',
      Icon: Wheat,
      color: getIndicatorColor(analysis.fiber_content, true), // inverted: high fiber is good
      visible: !!analysis.fiber_content,
    },
    {
      key: 'inflammation',
      Icon: Flame,
      color: getInflammatoryColor(analysis.inflammatory_score),
      visible: analysis.inflammatory_score !== undefined,
    },
    {
      key: 'hormone',
      Icon: HeartPulse,
      color: getIndicatorColor(analysis.hormone_impact),
      visible: !!analysis.hormone_impact,
    },
    {
      key: 'processed',
      Icon: Factory,
      color: getIndicatorColor(analysis.processed_level),
      visible: !!analysis.processed_level,
    },
  ].filter((ind) => ind.visible);

  if (indicators.length === 0) return null;

  return (
    <View style={styles.indicatorsRow}>
      {indicators.map(({ key, Icon, color }) => (
        <View key={key} style={[styles.indicatorBadge, { backgroundColor: `${color}15` }]}>
          <Icon size={14} color={color} strokeWidth={2.5} />
        </View>
      ))}
    </View>
  );
}

export function ScanCard({ scan, index, onPress, onToggleFavorite, onDelete }: ScanCardProps) {
  const { t } = useTranslation();
  const isPending = scan.status === 'pending';
  const progress = scan.progress ?? 0;

  const statusConfig: Record<Exclude<ScanStatus, 'pending'>, { label: string; color: string; bgColor: string }> = {
    safe: {
      label: t('scanResult.status.safe'),
      color: '#059669',
      bgColor: '#ECFDF5',
    },
    caution: {
      label: t('scanResult.status.caution'),
      color: '#D97706',
      bgColor: '#FFFBEB',
    },
    avoid: {
      label: t('scanResult.status.avoid'),
      color: '#DC2626',
      bgColor: '#FEF2F2',
    },
  };

  const status = !isPending ? statusConfig[scan.status as Exclude<ScanStatus, 'pending'>] : null;

  const timeString = format(new Date(scan.scanned_at), 'h:mm a');

  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLongPress = () => {
    if (isPending) return;

    Alert.alert(
      t('scan.deleteTitle'),
      t('scan.deleteMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => onDelete?.(),
        },
      ]
    );
  };

  const renderImage = () => {
    if (scan.image_url) {
      if (scan.image_url.startsWith('local:')) {
        return (
          <FastImage
            source={DEMO_IMAGES[scan.image_url.replace('local:', '') as keyof typeof DEMO_IMAGES]}
            style={styles.image}
          />
        );
      }
      return (
        <>
          {!imageLoaded && <ImageSkeleton />}
          <FastImage
            source={{ uri: scan.image_url }}
            style={[styles.image, !imageLoaded && styles.imageHidden]}
            onLoad={() => setImageLoaded(true)}
          />
        </>
      );
    }
    return (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.placeholderEmoji}>🍽️</Text>
      </View>
    );
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(400)}
      style={styles.wrapper}
    >
      <Pressable
        onPress={isPending ? undefined : onPress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={styles.container}
        disabled={isPending}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {renderImage()}

          {/* Progress overlay for pending */}
          {isPending && (
            <View style={styles.progressOverlay}>
              <CircularProgress progress={progress} size={70} />
            </View>
          )}

          {/* Corner brackets for pending */}
          {isPending && (
            <>
              <View style={[styles.bracket, styles.bracketTopLeft]} />
              <View style={[styles.bracket, styles.bracketTopRight]} />
              <View style={[styles.bracket, styles.bracketBottomLeft]} />
              <View style={[styles.bracket, styles.bracketBottomRight]} />
            </>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {isPending ? (
            <>
              <Text style={styles.pendingTitle}>{t('scan.analyzingImage')}</Text>
              <SkeletonBars />
              <Text style={styles.pendingSubtext}>{t('scan.notifyWhenDone')}</Text>
            </>
          ) : (
            <>
              {/* Title Row */}
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {scan.name}
                </Text>
                <Text style={styles.time}>{timeString}</Text>
              </View>

              {/* Status Badge */}
              {status && (
                <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              )}

              {/* Nutrition Indicators */}
              <NutritionIndicators analysis={scan.analysis} />
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    marginBottom: 12,
    alignSelf: 'center',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  imageContainer: {
    width: 110,
    height: 110,
    backgroundColor: '#E5E7EB',
    position: 'relative',
    borderRadius: 16,
    margin: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    borderRadius: 12,
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bracket: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
  },
  bracketTopLeft: {
    top: 10,
    left: 10,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
  },
  bracketTopRight: {
    top: 10,
    right: 10,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 6,
  },
  bracketBottomLeft: {
    bottom: 10,
    left: 10,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
  },
  bracketBottomRight: {
    bottom: 10,
    right: 10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 6,
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 6,
    justifyContent: 'center',
  },
  // Pending state
  pendingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  skeletonContainer: {
    gap: 8,
  },
  skeletonBar: {
    height: 10,
    backgroundColor: 'rgba(229, 231, 235, 0.6)',
    borderRadius: 5,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pendingSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 10,
  },
  // Completed state
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  indicatorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  indicatorBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSkeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
  },
  imageHidden: {
    opacity: 0,
  },
});
