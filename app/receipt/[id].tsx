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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Save,
  Trash2,
  Calendar,
  DollarSign,
  Store,
  Tag,
  FileText,
  ChevronDown,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { TAX_CATEGORIES, getCategoryById, calculateDeductible, calculateTaxSavings } from '@/lib/constants/categories';
import { useReceipt, useUpdateReceipt, useDeleteReceipt } from '@/lib/hooks/use-receipts';
import type { TaxCategoryId } from '@/lib/constants/categories';

export default function ReceiptDetailScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch receipt with React Query
  const { data: receipt, isLoading } = useReceipt(id || '');
  const updateReceiptMutation = useUpdateReceipt();
  const deleteReceiptMutation = useDeleteReceipt();

  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TaxCategoryId | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [note, setNote] = useState('');
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Calculated values
  const amountCents = amount ? Math.round(parseFloat(amount) * 100) : 0;
  const deductibleCents = category ? calculateDeductible(amountCents, category) : amountCents;
  const savingsCents = calculateTaxSavings(deductibleCents);

  // Initialize form when receipt data loads
  useEffect(() => {
    if (receipt && !isFormInitialized) {
      setVendor(receipt.vendor || '');
      setDate(receipt.date ? new Date(receipt.date) : null);
      setAmount(receipt.total_amount ? (receipt.total_amount / 100).toFixed(2) : '');
      setCategory(receipt.category as TaxCategoryId | null);
      setNote(receipt.note || '');
      setIsFormInitialized(true);
    }
  }, [receipt, isFormInitialized]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateReceiptMutation.mutateAsync({
        id,
        vendor: vendor || null,
        date: date ? date.toISOString().split('T')[0] : null,
        total_amount: amountCents || null,
        category: category,
        note: note || null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasChanges(false);
      router.back();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(t('common.error'), 'Failed to save changes');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            try {
              await deleteReceiptMutation.mutateAsync(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(t('common.error'), 'Failed to delete receipt');
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setHasChanges(true);
    }
  };

  const handleFieldChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setHasChanges(true);
  };

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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Receipt not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.headerButton}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Receipt Details
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={updateReceiptMutation.isPending || !hasChanges}
            style={[
              styles.headerButton,
              styles.saveButton,
              { backgroundColor: hasChanges ? colors.primary : colors.textMuted },
              updateReceiptMutation.isPending && styles.buttonDisabled,
            ]}
          >
            {updateReceiptMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Save size={18} color="#FFFFFF" />
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
            <Pressable
              style={cardStyle}
              onPress={() => {
                if (receipt.image_uri) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <View style={styles.imageContainer}>
                {receipt.image_uri ? (
                  <Image
                    source={{ uri: receipt.image_uri }}
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
              </View>
            </Pressable>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Vendor */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <Store size={16} color={colors.textSecondary} />
                  <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                    {t('verify.vendor')}
                  </Text>
                </View>
                <TextInput
                  style={inputStyle}
                  value={vendor}
                  onChangeText={handleFieldChange(setVendor)}
                  placeholder={t('verify.vendorPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Date */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                    {t('verify.date')}
                  </Text>
                </View>
                <Pressable
                  style={inputStyle}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: date ? colors.text : colors.textMuted }}>
                    {date
                      ? date.toLocaleDateString()
                      : t('verify.selectDate')}
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
                    {t('verify.amount')}
                  </Text>
                </View>
                <View style={styles.amountInputContainer}>
                  <Text style={[styles.currencyPrefix, { color: colors.text }]}>$</Text>
                  <TextInput
                    style={[inputStyle, styles.amountInput]}
                    value={amount}
                    onChangeText={(val) => {
                      setAmount(val);
                      setHasChanges(true);
                    }}
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
                    {t('verify.category')}
                  </Text>
                </View>
                <Pressable
                  style={[inputStyle, styles.selectInput]}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={{ color: category ? colors.text : colors.textMuted }}>
                    {selectedCategory?.name || t('verify.selectCategory')}
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
                            setHasChanges(true);
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
              </View>

              {/* Note */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <FileText size={16} color={colors.textSecondary} />
                  <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                    {t('verify.note')} ({t('common.optional')})
                  </Text>
                </View>
                <TextInput
                  style={[inputStyle, styles.noteInput]}
                  value={note}
                  onChangeText={handleFieldChange(setNote)}
                  placeholder={t('verify.notePlaceholder')}
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
                  {t('verify.deductionSummary')}
                </Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('verify.totalAmount')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ${(amountCents / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('verify.deductible')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    ${(deductibleCents / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.savingsRow]}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('verify.estimatedSavings')}
                  </Text>
                  <Text style={[styles.savingsValue, { color: '#10B981' }]}>
                    ${(savingsCents / 100).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {/* Delete Button */}
            <Pressable
              onPress={handleDelete}
              disabled={deleteReceiptMutation.isPending}
              style={[
                styles.deleteButton,
                { borderColor: '#EF4444' },
                deleteReceiptMutation.isPending && styles.buttonDisabled,
              ]}
            >
              {deleteReceiptMutation.isPending ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Trash2 size={18} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>Delete Receipt</Text>
                </>
              )}
            </Pressable>
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
