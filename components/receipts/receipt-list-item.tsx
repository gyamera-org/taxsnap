import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { TrendingUp, Tag, PiggyBank, Loader2, AlertCircle } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { getCategoryById, calculateTaxSavings } from '@/lib/constants/categories';
import type { Receipt } from '@/lib/types/receipt';

interface ReceiptListItemProps {
  receipt: Receipt;
  onPress?: (receipt: Receipt) => void;
}

export function ReceiptListItem({ receipt, onPress }: ReceiptListItemProps) {
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();

  const isProcessing = receipt.status === 'processing' || receipt.status === 'pending';
  const isFailed = receipt.status === 'failed';

  const category = receipt.category ? getCategoryById(receipt.category) : null;

  // Format the receipt date (transaction date from the receipt itself)
  const formattedDate = receipt.date
    ? format(new Date(receipt.date + 'T00:00:00'), 'MMM d, yyyy')
    : '';

  const formattedAmount = receipt.total_amount
    ? `$${(receipt.total_amount / 100).toFixed(2)}`
    : '$0.00';

  const deductibleAmount = receipt.deductible_amount || receipt.total_amount || 0;
  const formattedDeductible = `$${(deductibleAmount / 100).toFixed(2)}`;

  const savingsAmount = calculateTaxSavings(deductibleAmount);
  const formattedSavings = `$${(savingsAmount / 100).toFixed(2)}`;

  // Spinning animation for processing state
  const spinStyle = useAnimatedStyle(() => {
    if (!isProcessing) return {};
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

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(receipt);
    } else {
      router.push({ pathname: '/receipt/[id]', params: { id: receipt.id } });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pressable,
        isDark ? styles.containerDark : styles.containerLight,
        pressed && styles.pressed,
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
              {isProcessing ? 'Processing...' : isFailed ? 'Scan Failed' : (receipt.vendor || 'Unknown Vendor')}
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
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
});
