import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { DEMO_MODE, getDemoScanById, DEMO_IMAGES } from '@/lib/config/demo-data';
import { useScan, useToggleFavorite, useDeleteScan } from '@/lib/hooks/use-scans';
import type { ScanResult, ScanStatus } from '@/lib/types/scan';
import * as Haptics from 'expo-haptics';

// Icons
function ChevronLeftIcon({ color = '#111827', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

function BookmarkIcon({ color = '#111827', size = 24, filled = false }: { color?: string; size?: number; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function TrashIcon({ color = '#111827', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
    </Svg>
  );
}

function CheckCircleIcon({ color = '#10B981', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

function AlertTriangleIcon({ color = '#F59E0B', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <Path d="M12 9v4M12 17h.01" />
    </Svg>
  );
}

function XCircleIcon({ color = '#EF4444', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="m15 9-6 6M9 9l6 6" />
    </Svg>
  );
}

// Image skeleton with shimmer effect for hero image
function HeroImageSkeleton() {
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
    <Animated.View style={[styles.heroImageSkeleton, shimmerStyle]} />
  );
}

// Skeleton loader component
function ScanDetailSkeleton({ insets }: { insets: { top: number; bottom: number } }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Skeleton */}
        <View>
          <Animated.View style={[styles.skeletonHeroImage, shimmerStyle]} />
          <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
            <View style={styles.headerButton}>
              <ChevronLeftIcon color="rgba(255,255,255,0.5)" />
            </View>
            <View style={styles.headerButton}>
              <BookmarkIcon color="rgba(255,255,255,0.5)" />
            </View>
          </View>
        </View>

        {/* Content Skeleton */}
        <View style={styles.content}>
          {/* Status Badge Skeleton */}
          <Animated.View style={[styles.skeletonStatusBadge, shimmerStyle]} />

          {/* Title Skeleton */}
          <Animated.View style={[styles.skeletonTitle, shimmerStyle]} />

          {/* Summary Skeleton */}
          <Animated.View style={[styles.skeletonSummary, shimmerStyle]} />
          <Animated.View style={[styles.skeletonSummary, styles.skeletonSummaryShort, shimmerStyle]} />

          {/* Analysis Section Skeleton */}
          <View style={styles.skeletonSection}>
            <Animated.View style={[styles.skeletonSectionTitle, shimmerStyle]} />
            <View style={styles.skeletonAnalysisGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Animated.View key={i} style={[styles.skeletonAnalysisItem, shimmerStyle]} />
              ))}
            </View>
          </View>

          {/* Ingredients Section Skeleton */}
          <View style={styles.skeletonSection}>
            <Animated.View style={[styles.skeletonSectionTitle, shimmerStyle]} />
            <View style={styles.skeletonIngredients}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Animated.View
                  key={i}
                  style={[styles.skeletonIngredientTag, { width: 60 + Math.random() * 40 }, shimmerStyle]}
                />
              ))}
            </View>
          </View>

          {/* Recommendations Section Skeleton */}
          <View style={styles.skeletonSection}>
            <Animated.View style={[styles.skeletonSectionTitle, shimmerStyle]} />
            <View style={styles.skeletonListContainer}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonListItem}>
                  <Animated.View style={[styles.skeletonListIcon, shimmerStyle]} />
                  <Animated.View style={[styles.skeletonListText, shimmerStyle]} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Status configuration (labels will be translated in component)
const statusConfig: Record<Exclude<ScanStatus, 'pending'>, { color: string; bgColor: string; icon: React.ReactNode }> = {
  safe: {
    color: '#059669',
    bgColor: 'rgba(209, 250, 229, 0.8)',
    icon: <CheckCircleIcon color="#059669" />,
  },
  caution: {
    color: '#D97706',
    bgColor: 'rgba(254, 243, 199, 0.8)',
    icon: <AlertTriangleIcon color="#D97706" />,
  },
  avoid: {
    color: '#DC2626',
    bgColor: 'rgba(254, 226, 226, 0.8)',
    icon: <XCircleIcon color="#DC2626" />,
  },
};

// Analysis label keys for translation
const analysisLabelKeys: Record<string, string> = {
  glycemic_index: 'nutrition.glycemicIndex',
  sugar_content: 'nutrition.sugarContent',
  inflammatory_score: 'nutrition.inflammatoryScore',
  hormone_impact: 'nutrition.hormoneImpact',
  fiber_content: 'nutrition.fiberContent',
  protein_quality: 'nutrition.proteinQuality',
  healthy_fats: 'nutrition.healthyFats',
  processed_level: 'nutrition.processedLevel',
};

// Value translation keys
const analysisValueKeys: Record<string, string> = {
  low: 'nutrition.values.low',
  moderate: 'nutrition.values.moderate',
  medium: 'nutrition.values.medium',
  high: 'nutrition.values.high',
  positive: 'nutrition.values.positive',
  neutral: 'nutrition.values.neutral',
  negative: 'nutrition.values.negative',
  minimally: 'nutrition.values.minimally',
  moderately: 'nutrition.values.moderately',
  highly: 'nutrition.values.highly',
};

// Get translated analysis label
function getAnalysisLabel(t: any, key: string): string {
  return t(analysisLabelKeys[key] || key);
}

// Format and translate analysis value
function formatAnalysisValue(t: any, key: string, value: any): string {
  if (key === 'inflammatory_score') return `${value}/10`;
  if (key === 'healthy_fats') return value ? t('nutrition.values.yes') : t('nutrition.values.no');
  if (typeof value === 'string' && analysisValueKeys[value]) {
    return t(analysisValueKeys[value]);
  }
  if (typeof value === 'string') return value.charAt(0).toUpperCase() + value.slice(1);
  return String(value);
}

function getAnalysisColor(key: string, value: any): string {
  // Good values
  if (key === 'glycemic_index' && value === 'low') return '#059669';
  if (key === 'sugar_content' && value === 'low') return '#059669';
  if (key === 'inflammatory_score' && value <= 3) return '#059669';
  if (key === 'hormone_impact' && value === 'positive') return '#059669';
  if (key === 'fiber_content' && value === 'high') return '#059669';
  if (key === 'protein_quality' && value === 'high') return '#059669';
  if (key === 'healthy_fats' && value === true) return '#059669';
  if (key === 'processed_level' && value === 'minimally') return '#059669';

  // Moderate values
  if (key === 'glycemic_index' && value === 'medium') return '#D97706';
  if (key === 'sugar_content' && value === 'moderate') return '#D97706';
  if (key === 'inflammatory_score' && value <= 6) return '#D97706';
  if (key === 'hormone_impact' && value === 'neutral') return '#D97706';
  if (key === 'fiber_content' && value === 'moderate') return '#D97706';
  if (key === 'protein_quality' && value === 'moderate') return '#D97706';
  if (key === 'processed_level' && value === 'moderately') return '#D97706';

  // Bad values
  return '#DC2626';
}

interface AnalysisItemProps {
  label: string;
  value: string;
  color: string;
}

function AnalysisItem({ label, value, color }: AnalysisItemProps) {
  return (
    <View style={styles.analysisItem}>
      <Text style={styles.analysisLabel}>{label}</Text>
      <Text style={[styles.analysisValue, { color }]}>{value}</Text>
    </View>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

function Section({ title, children, delay = 0 }: SectionProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Animated.View>
  );
}

export default function ScanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const toggleFavorite = useToggleFavorite();
  const deleteScan = useDeleteScan();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get scan data
  const { data: apiScan, isLoading } = useScan(id || '');
  const demoScan = DEMO_MODE ? getDemoScanById(id || '') : undefined;
  const scan: ScanResult | undefined = DEMO_MODE ? demoScan : apiScan;

  const handleToggleFavorite = () => {
    if (!scan) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite.mutate(scan);
  };

  const handleDelete = () => {
    if (!scan) return;

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
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            deleteScan.mutate(scan.id);
            router.back();
          },
        },
      ]
    );
  };

  if (!scan && !isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeftIcon />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('scanDetail.notFound')}</Text>
        </View>
      </View>
    );
  }

  if (!scan) {
    return <ScanDetailSkeleton insets={insets} />;
  }

  const status = statusConfig[scan.status];
  const analysis = scan.analysis;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs for liquid effect */}
      <Animated.View
        entering={FadeIn.delay(100).duration(1000)}
        style={[styles.orb, styles.orb1]}
      />
      <Animated.View
        entering={FadeIn.delay(200).duration(1000)}
        style={[styles.orb, styles.orb2]}
      />
      <Animated.View
        entering={FadeIn.delay(300).duration(1000)}
        style={[styles.orb, styles.orb3]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {scan.image_url && (
          <Animated.View entering={FadeIn.duration(400)}>
            <View style={styles.heroImageContainer}>
              {scan.image_url.startsWith('local:') ? (
                <FastImage
                  source={DEMO_IMAGES[scan.image_url.replace('local:', '') as keyof typeof DEMO_IMAGES]}
                  style={styles.heroImage}
                />
              ) : (
                <>
                  {!imageLoaded && <HeroImageSkeleton />}
                  <FastImage
                    source={{ uri: scan.image_url }}
                    style={[styles.heroImage, !imageLoaded && styles.imageHidden]}
                    onLoad={() => setImageLoaded(true)}
                  />
                </>
              )}
            </View>
            <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
              <Pressable onPress={() => router.back()} style={styles.headerButtonDark}>
                <ChevronLeftIcon color="#FFFFFF" />
              </Pressable>
              <View style={styles.headerRightButtons}>
                <Pressable onPress={handleToggleFavorite} style={styles.headerButtonDark}>
                  <BookmarkIcon color="#FFFFFF" filled={scan.is_favorite} />
                </Pressable>
                <Pressable onPress={handleDelete} style={styles.headerButtonDark}>
                  <TrashIcon color="#FFFFFF" size={22} />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Status Badge */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[styles.statusBadge, { backgroundColor: status.bgColor }]}
          >
            {status.icon}
            <Text style={[styles.statusText, { color: status.color }]}>
              {t(`scanDetail.status.${scan.status}`)}
            </Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.title}>
            {scan.name}
          </Animated.Text>

          {/* Summary */}
          <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={styles.summary}>
            {scan.summary}
          </Animated.Text>

          {/* Analysis Grid */}
          {analysis && (
            <Section title={t('scanDetail.sections.analysis')} delay={250}>
              <View style={styles.analysisGrid}>
                {Object.entries(analysis).map(([key, value]) => {
                  if (key === 'recommendations' || key === 'warnings' || value === undefined) return null;
                  return (
                    <AnalysisItem
                      key={key}
                      label={getAnalysisLabel(t, key)}
                      value={formatAnalysisValue(t, key, value)}
                      color={getAnalysisColor(key, value)}
                    />
                  );
                })}
              </View>
            </Section>
          )}

          {/* Ingredients */}
          {scan.ingredients && scan.ingredients.length > 0 && (
            <Section title={t('scanDetail.sections.ingredients')} delay={300}>
              <View style={styles.ingredientsList}>
                {scan.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientTag}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Recommendations */}
          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <Section title={t('scanDetail.sections.recommendations')} delay={350}>
              <View style={styles.listContainer}>
                {analysis.recommendations.map((rec, index) => (
                  <View key={index} style={styles.listItem}>
                    <CheckCircleIcon size={18} />
                    <Text style={styles.listItemText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Warnings */}
          {analysis?.warnings && analysis.warnings.length > 0 && (
            <Section title={t('scanDetail.sections.warnings')} delay={400}>
              <View style={styles.listContainer}>
                {analysis.warnings.map((warning, index) => (
                  <View key={index} style={styles.listItem}>
                    <AlertTriangleIcon size={18} />
                    <Text style={styles.listItemText}>{warning}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}
        </View>
      </ScrollView>

      {/* Header without image */}
      {!scan.image_url && (
        <View style={[styles.headerNoImage, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeftIcon />
          </Pressable>
          <View style={styles.headerRightButtons}>
            <Pressable onPress={handleToggleFavorite} style={styles.backButton}>
              <BookmarkIcon filled={scan.is_favorite} />
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.backButton}>
              <TrashIcon size={22} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    bottom: 200,
    left: -40,
  },
  orb3: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(94, 234, 212, 0.1)',
    top: '40%',
    right: -20,
  },
  scrollView: {
    flex: 1,
  },
  heroImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroImageSkeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1D5DB',
  },
  imageHidden: {
    opacity: 0,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerButtonDark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerNoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analysisItem: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analysisLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  ingredientText: {
    fontSize: 14,
    color: '#374151',
  },
  listContainer: {
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Skeleton styles
  skeletonHeroImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#D1D5DB',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  skeletonStatusBadge: {
    width: 100,
    height: 36,
    backgroundColor: '#D1D5DB',
    borderRadius: 20,
    marginBottom: 16,
  },
  skeletonTitle: {
    width: '70%',
    height: 32,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonSummary: {
    width: '100%',
    height: 16,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonSummaryShort: {
    width: '60%',
    marginBottom: 24,
  },
  skeletonSection: {
    marginBottom: 24,
  },
  skeletonSectionTitle: {
    width: 120,
    height: 20,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonAnalysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeletonAnalysisItem: {
    width: '47%',
    height: 70,
    backgroundColor: '#D1D5DB',
    borderRadius: 16,
  },
  skeletonIngredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skeletonIngredientTag: {
    height: 36,
    backgroundColor: '#D1D5DB',
    borderRadius: 20,
  },
  skeletonListContainer: {
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 16,
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonListIcon: {
    width: 18,
    height: 18,
    backgroundColor: '#D1D5DB',
    borderRadius: 9,
  },
  skeletonListText: {
    flex: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
  },
});
