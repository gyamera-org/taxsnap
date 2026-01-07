import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  X,
  Check,
  Calendar,
  DollarSign,
  Store,
  Tag,
  FileText,
  Sparkles,
  ChevronDown,
  Maximize2,
  ZoomIn,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { useAuth } from '@/context/auth-provider';
import {
  TAX_CATEGORIES,
  getCategoryById,
  calculateDeductible,
  calculateTaxSavings,
} from '@/lib/constants/categories';
import { useScanReceipt, useCreateReceipt } from '@/lib/hooks/use-receipts';
import type { TaxCategoryId } from '@/lib/constants/categories';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VerifyReceiptScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams<{
    imageBase64?: string;
    localUri?: string;
    isScanning?: string;
  }>();

  // Hooks for scanning and creating receipts
  const scanReceipt = useScanReceipt();
  const createReceipt = useCreateReceipt();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Pinch-to-zoom state for image preview
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Form state
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TaxCategoryId | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [note, setNote] = useState('');

  // Calculated values
  const amountCents = amount ? Math.round(parseFloat(amount) * 100) : 0;
  const deductibleCents = category ? calculateDeductible(amountCents, category) : amountCents;
  const savingsCents = calculateTaxSavings(deductibleCents);

  const isScanning = scanReceipt.isPending;
  const isSaving = createReceipt.isPending;

  // Perform scan when screen loads with image data
  useEffect(() => {
    if (params.imageBase64 && params.isScanning === 'true') {
      performScan();
    }
  }, [params.imageBase64, params.isScanning]);

  const performScan = async () => {
    if (!params.imageBase64) {
      Alert.alert('Error', 'No image data available. Please try scanning again.');
      return;
    }

    try {
      const result = await scanReceipt.mutateAsync({
        imageBase64: params.imageBase64,
      });

      // Store the uploaded image URL
      setImageUrl(result.imageUrl);

      // Populate form with extracted data
      const data = result.extractedData;
      if (data.vendor) setVendor(data.vendor);
      if (data.date) setDate(new Date(data.date));
      if (data.total) setAmount((data.total / 100).toFixed(2));
      if (data.suggestedCategory) setCategory(data.suggestedCategory as TaxCategoryId);
      if (data.confidence) setConfidence(data.confidence);
    } catch (error) {
      console.error('Scan error:', error);
      // Error is handled by the mutation state
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to save receipts.');
      return;
    }

    if (!imageUrl && !params.localUri) {
      Alert.alert('Error', 'No image available.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createReceipt.mutateAsync({
        image_uri: imageUrl || params.localUri || '',
        vendor: vendor || undefined,
        date: date ? date.toISOString().split('T')[0] : undefined,
        total_amount: amountCents || undefined,
        category: category || undefined,
        note: note || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/receipts');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save receipt');
    }
  };

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Handle opening the image preview
  const handleOpenPreview = () => {
    if (!displayImageUri) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Reset zoom state
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setShowImagePreview(true);
  };

  // Handle closing the preview
  const handleClosePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowImagePreview(false);
  };

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan gesture for moving the image when zoomed
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap to zoom in/out
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTapGesture, panGesture)
  );

  // Animated style for the image
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const selectedCategory = category ? getCategoryById(category) : null;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    },
  ];

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      color: colors.text,
    },
  ];

  // Display image from local URI or uploaded URL
  const displayImageUri = imageUrl || params.localUri;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <X size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('verify.title', 'Verify Receipt')}
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={isSaving || isScanning}
            style={[
              styles.headerButton,
              styles.saveButton,
              { backgroundColor: colors.primary },
              (isSaving || isScanning) && styles.buttonDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Receipt Image Preview */}
            <View style={cardStyle}>
              <View style={styles.imageContainer}>
                {displayImageUri ? (
                  <Image
                    source={{ uri: displayImageUri }}
                    style={styles.receiptImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.noImage}>
                    <FileText size={48} color={colors.textMuted} />
                    <Text style={[styles.noImageText, { color: colors.textMuted }]}>
                      No image
                    </Text>
                  </View>
                )}
                {isScanning && (
                  <View style={styles.scanOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.scanText, { color: '#FFFFFF' }]}>
                      {t('verify.scanning', 'Scanning receipt...')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* AI Confidence Badge */}
            {!isScanning && confidence > 0 && (
              <View style={[styles.confidenceBadge, { backgroundColor: colors.primaryLight }]}>
                <Sparkles size={14} color={colors.primary} />
                <Text style={[styles.confidenceText, { color: colors.primary }]}>
                  {t('verify.aiConfidence', 'AI Confidence')}: {Math.round(confidence * 100)}%
                </Text>
              </View>
            )}

            {/* Scan Error */}
            {scanReceipt.isError && (
              <View style={[styles.errorBanner, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={styles.errorText}>
                  {scanReceipt.error instanceof Error
                    ? scanReceipt.error.message
                    : 'Failed to scan receipt'}
                </Text>
                <Pressable onPress={performScan}>
                  <Text style={[styles.retryText, { color: colors.primary }]}>
                    {t('common.retry', 'Retry')}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Vendor */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <Store size={16} color={colors.textSecondary} />
                  <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                    {t('verify.vendor', 'Vendor')}
                  </Text>
                </View>
                <TextInput
                  style={inputStyle}
                  value={vendor}
                  onChangeText={setVendor}
                  placeholder={t('verify.vendorPlaceholder', 'Store name')}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Date */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                    {t('verify.date', 'Date')}
                  </Text>
                </View>
                <Pressable style={inputStyle} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: date ? colors.text : colors.textMuted }}>
                    {date ? date.toLocaleDateString() : t('verify.selectDate', 'Select date')}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* Amount */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <DollarSign size={16} color={colors.textSecondary} />
                  <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                    {t('verify.amount', 'Amount')}
                  </Text>
                </View>
                <View style={styles.amountInputContainer}>
                  <Text style={[styles.currencyPrefix, { color: colors.text }]}>$</Text>
                  <TextInput
                    style={[inputStyle, styles.amountInput]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Category */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <Tag size={16} color={colors.textSecondary} />
                  <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                    {t('verify.category', 'Category')}
                  </Text>
                </View>
                <Pressable
                  style={[inputStyle, styles.selectInput]}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={{ color: category ? colors.text : colors.textMuted }}>
                    {selectedCategory?.name || t('verify.selectCategory', 'Select category')}
                  </Text>
                  <ChevronDown size={18} color={colors.textSecondary} />
                </Pressable>

                {showCategoryPicker && (
                  <View style={[styles.categoryList, cardStyle]}>
                    <ScrollView style={styles.categoryScroll} nestedScrollEnabled>
                      {TAX_CATEGORIES.map((cat) => (
                        <Pressable
                          key={cat.id}
                          style={[
                            styles.categoryItem,
                            category === cat.id && {
                              backgroundColor: colors.primaryLight,
                            },
                          ]}
                          onPress={() => {
                            setCategory(cat.id as TaxCategoryId);
                            setShowCategoryPicker(false);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                        >
                          <Text
                            style={[
                              styles.categoryName,
                              { color: category === cat.id ? colors.primary : colors.text },
                            ]}
                          >
                            {cat.name}
                          </Text>
                          <Text style={[styles.categoryTip, { color: colors.textMuted }]}>
                            {cat.rate < 1 ? `${cat.rate * 100}% deductible` : '100% deductible'}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {selectedCategory && (
                  <Text style={[styles.categoryHint, { color: colors.textMuted }]}>
                    {selectedCategory.tip}
                  </Text>
                )}
              </View>

              {/* Note */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <FileText size={16} color={colors.textSecondary} />
                  <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                    {t('verify.note', 'Note')} ({t('common.optional', 'optional')})
                  </Text>
                </View>
                <TextInput
                  style={[inputStyle, styles.noteInput]}
                  value={note}
                  onChangeText={setNote}
                  placeholder={t('verify.notePlaceholder', 'Add a note...')}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Deduction Summary */}
            {amountCents > 0 && (
              <View style={[styles.summaryCard, cardStyle]}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  {t('verify.deductionSummary', 'Deduction Summary')}
                </Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('verify.totalAmount', 'Total Amount')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ${(amountCents / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('verify.deductible', 'Deductible Amount')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    ${(deductibleCents / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.savingsRow]}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('verify.estimatedSavings', 'Est. Tax Savings')}
                  </Text>
                  <Text style={[styles.savingsValue, { color: '#10B981' }]}>
                    ${(savingsCents / 100).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    width: 40,
    height: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 280,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noImageText: {
    fontSize: 14,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
  },
  formSection: {
    marginTop: 20,
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    justifyContent: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryList: {
    marginTop: 8,
    maxHeight: 200,
  },
  categoryScroll: {
    padding: 8,
  },
  categoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTip: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryHint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  summaryCard: {
    marginTop: 24,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  savingsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
    marginTop: 8,
    paddingTop: 12,
  },
  savingsValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
