import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { TrendingUp, Tag, PiggyBank, Loader2, AlertCircle, Receipt as ReceiptIcon } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { getCategoryById, calculateTaxSavings } from '@/lib/constants/categories';
import type { Receipt } from '@/lib/types/receipt';
import type { PendingReceipt } from '@/context/pending-receipt-provider';

interface ReceiptListItemProps {
  receipt?: Receipt;
  pendingReceipt?: PendingReceipt;
  onPress?: (receipt: Receipt) => void;
  variant?: 'default' | 'compact';
}

export function ReceiptListItem({ receipt, pendingReceipt, onPress, variant = 'default' }: ReceiptListItemProps) {
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();

  // Determine if this is an active pending scan (with progress) or a database receipt
  const isPendingScan = !!pendingReceipt && !receipt;
  const progress = pendingReceipt?.progress ?? 0;

  // For database receipts, check status
  const isProcessing = receipt?.status === 'processing' || receipt?.status === 'pending';
  const isFailed = receipt?.status === 'failed';
  const isCompleted = receipt?.status === 'completed' || (!receipt?.status && receipt);

  const category = receipt?.category ? getCategoryById(receipt.category) : null;

  // Format the receipt date
  const formattedDate = receipt?.date
    ? format(new Date(receipt.date + 'T00:00:00'), 'MMM d, yyyy')
    : '';

  const formattedDateCompact = receipt?.date
    ? format(new Date(receipt.date + 'T00:00:00'), 'MMM d')
    : '';

  const formattedAmount = receipt?.total_amount
    ? `$${(receipt.total_amount / 100).toFixed(2)}`
    : '$0.00';

  const deductibleAmount = receipt?.deductible_amount || receipt?.total_amount || 0;
  const formattedDeductible = `$${(deductibleAmount / 100).toFixed(2)}`;

  const savingsAmount = calculateTaxSavings(deductibleAmount);
  const formattedSavings = `$${(savingsAmount / 100).toFixed(2)}`;

  // Spinning animation for processing state
  const spinStyle = useAnimatedStyle(() => {
    if (!isProcessing && !isPendingScan) return {};
    return {
      transform: [
        {
          rotate: withRepeat(
            withTiming('360deg', { duration: 1500, easing: Easing.linear }),
            -1,
            false
          ),
        },
      ],
    };
  });

  // Pulsing animation for pending scan
  const pulseStyle = useAnimatedStyle(() => {
    if (!isPendingScan) return {};
    return {
      opacity: withRepeat(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      ),
    };
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPendingScan) return; // Don't navigate for pending scans
    if (onPress && receipt) {
      onPress(receipt);
    } else if (receipt) {
      router.push({ pathname: '/receipt/[id]', params: { id: receipt.id } });
    }
  };

  // Compact variant for home page
  if (variant === 'compact' && receipt && isCompleted) {
    return (
      <Pressable
        onPress={handlePress}
        style={[
          styles.compactContainer,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <View style={styles.compactDetails}>
          <Text style={[styles.compactVendor, { color: colors.text }]} numberOfLines={1}>
            {receipt.vendor || 'Unknown Vendor'}
          </Text>
          <Text style={[styles.compactMeta, { color: colors.textMuted }]}>
            {formattedDateCompact}
            {category && ` · ${category.name}`}
          </Text>
        </View>
        <View style={styles.compactAmountWrapper}>
          <Text style={[styles.compactAmount, { color: colors.text }]}>
            {formattedAmount}
          </Text>
          {receipt.deductible_amount && receipt.deductible_amount > 0 && (
            <Text style={styles.compactDeductible}>
              -{formattedDeductible}
            </Text>
          )}
        </View>
      </Pressable>
    );
  }

  // Pending scan with image preview and progress
  if (isPendingScan && pendingReceipt) {
    return (
      <View
        style={[
          styles.pendingContainer,
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
            <Animated.View style={[styles.progressRing, pulseStyle]}>
              <View style={styles.progressRingInner} />
            </Animated.View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.pendingContent}>
          <Text style={[styles.vendor, { color: colors.text }]}>
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

          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            We'll notify you when done!
          </Text>
        </View>
      </View>
    );
  }

  // Default variant - full receipt display
  return (
    <Pressable
      onPress={handlePress}
      disabled={isPendingScan}
      style={({ pressed }) => [
        styles.pressable,
        isDark ? styles.containerDark : styles.containerLight,
        pressed && !isPendingScan && styles.pressed,
      ]}
    >
      <View style={[styles.row, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        {/* Status Icon for processing/failed states */}
        {(isProcessing || isFailed) && (
          <View
            style={[
              styles.statusIconContainer,
              { backgroundColor: isFailed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 192, 232, 0.1)' },
            ]}
          >
            {isProcessing ? (
              <Animated.View style={spinStyle}>
                <Loader2 size={20} color="#00C0E8" />
              </Animated.View>
            ) : (
              <AlertCircle size={20} color="#EF4444" />
            )}
          </View>
        )}

        {/* Content */}
        <View style={[styles.content, !isProcessing && !isFailed && styles.contentFull]}>
          {/* Header: Vendor & Time */}
          <View style={styles.headerRow}>
            <Text
              style={[styles.vendor, { color: colors.text }]}
              numberOfLines={1}
            >
              {isProcessing ? 'Processing...' : isFailed ? 'Scan Failed' : (receipt?.vendor || 'Unknown Vendor')}
            </Text>
            {!isProcessing && !isFailed && formattedDate && (
              <Text style={[styles.time, { color: colors.textMuted }]}>
                {formattedDate}
              </Text>
            )}
          </View>

          {/* Amount or status message */}
          {isProcessing ? (
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Analyzing receipt with AI...
            </Text>
          ) : isFailed ? (
            <Text style={[styles.statusText, { color: '#EF4444' }]}>
              Tap to retry or delete
            </Text>
          ) : (
            <>
              <Text style={[styles.amount, { color: colors.text }]}>
                {formattedAmount}
              </Text>

              {/* Meta Row: Category, Deductible, Savings */}
              <View style={styles.metaRow}>
                {category && (
                  <View style={styles.metaItem}>
                    <Tag size={14} color="#8B5CF6" />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {category.name}
                    </Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <TrendingUp size={14} color="#10B981" />
                  <Text style={styles.greenText}>
                    {formattedDeductible}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <PiggyBank size={14} color="#F59E0B" />
                  <Text style={styles.orangeText}>
                    {formattedSavings}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    borderRadius: 12,
    overflow: 'hidden',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
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
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 4,
  },
  contentFull: {
    paddingLeft: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendor: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  greenText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  orangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  statusText: {
    fontSize: 14,
    marginTop: 2,
  },
  // Compact variant styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  compactDetails: {
    flex: 1,
  },
  compactVendor: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactMeta: {
    fontSize: 13,
  },
  compactAmountWrapper: {
    alignItems: 'flex-end',
  },
  compactAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  compactDeductible: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  // Pending scan styles
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 20,
    minHeight: 110,
    overflow: 'hidden',
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
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'absolute',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pendingContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 10,
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
});
