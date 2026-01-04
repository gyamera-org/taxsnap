import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { Receipt as ReceiptIcon, Flame, TrendingUp, Tag } from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { getCategoryById } from '@/lib/constants/categories';
import type { Receipt } from '@/lib/types/receipt';

interface ReceiptListItemProps {
  receipt: Receipt;
  onPress?: (receipt: Receipt) => void;
}

export function ReceiptListItem({ receipt, onPress }: ReceiptListItemProps) {
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();

  const category = receipt.category ? getCategoryById(receipt.category) : null;
  const formattedTime = receipt.date
    ? format(new Date(receipt.date), 'h:mm a')
    : '';
  const formattedAmount = receipt.total_amount
    ? `$${(receipt.total_amount / 100).toFixed(2)}`
    : '$0.00';
  const formattedDeductible = receipt.deductible_amount
    ? `$${(receipt.deductible_amount / 100).toFixed(2)}`
    : formattedAmount;

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
        styles.container,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        },
        isDark ? styles.containerDark : styles.containerLight,
        pressed && styles.pressed,
      ]}
    >
      {/* Large Receipt Image */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7' },
        ]}
      >
        {receipt.image_uri ? (
          <Image
            source={{ uri: receipt.image_uri }}
            style={styles.receiptImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderIcon}>
            <ReceiptIcon size={32} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header: Vendor & Time */}
        <View style={styles.headerRow}>
          <Text
            style={[styles.vendor, { color: colors.text }]}
            numberOfLines={1}
          >
            {receipt.vendor || 'Unknown Vendor'}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formattedTime}
          </Text>
        </View>

        {/* Amount with icon */}
        <View style={styles.amountRow}>
          <Flame size={16} color={colors.primary} />
          <Text style={[styles.amount, { color: colors.text }]}>
            {formattedAmount}
          </Text>
        </View>

        {/* Meta: Category & Deductible */}
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
            <Text style={styles.deductibleText}>
              {formattedDeductible}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
  },
  containerLight: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
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
  imageContainer: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    gap: 6,
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
  deductibleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
});
