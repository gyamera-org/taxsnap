import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  X,
  Check,
  Tag,
  ChevronRight,
} from 'lucide-react-native';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  format,
} from 'date-fns';
import { useThemedColors } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { TAX_CATEGORIES, type TaxCategoryId } from '@/lib/constants/categories';
import type { DateRange, QuickFilterType } from '@/lib/types/receipt';

interface QuickRange {
  key: QuickFilterType;
  label: string;
  getRange: () => DateRange;
}

const QUICK_RANGES: QuickRange[] = [
  {
    key: 'all',
    label: 'All Time',
    getRange: () => ({
      startDate: new Date(2000, 0, 1),
      endDate: new Date(),
    }),
  },
  {
    key: 'today',
    label: 'Today',
    getRange: () => {
      const today = new Date();
      return { startDate: today, endDate: today };
    },
  },
  {
    key: 'week',
    label: 'This Week',
    getRange: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 0 }),
      endDate: endOfWeek(new Date(), { weekStartsOn: 0 }),
    }),
  },
  {
    key: 'month',
    label: 'This Month',
    getRange: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    }),
  },
  {
    key: 'quarter',
    label: 'This Quarter',
    getRange: () => ({
      startDate: startOfQuarter(new Date()),
      endDate: endOfQuarter(new Date()),
    }),
  },
  {
    key: 'year',
    label: 'This Year',
    getRange: () => ({
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date()),
    }),
  },
];

const ADDITIONAL_RANGES: QuickRange[] = [
  {
    key: 'week' as QuickFilterType,
    label: 'Last 7 Days',
    getRange: () => ({
      startDate: subDays(new Date(), 6),
      endDate: new Date(),
    }),
  },
  {
    key: 'month' as QuickFilterType,
    label: 'Last 30 Days',
    getRange: () => ({
      startDate: subDays(new Date(), 29),
      endDate: new Date(),
    }),
  },
  {
    key: 'quarter' as QuickFilterType,
    label: 'Last 3 Months',
    getRange: () => ({
      startDate: subMonths(new Date(), 3),
      endDate: new Date(),
    }),
  },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  // Period filters
  selectedRange: DateRange | null;
  selectedQuickFilter: QuickFilterType;
  onRangeChange: (range: DateRange | null, quickFilter: QuickFilterType) => void;
  // Category filters (multi-select)
  selectedCategories: TaxCategoryId[];
  onCategoriesChange: (categories: TaxCategoryId[]) => void;
}

export function FilterModal({
  visible,
  onClose,
  selectedRange,
  selectedQuickFilter,
  onRangeChange,
  selectedCategories,
  onCategoriesChange,
}: FilterModalProps) {
  const colors = useThemedColors();
  const { isDark } = useTheme();

  const [tempStartDate, setTempStartDate] = useState<Date>(
    selectedRange?.startDate || new Date()
  );
  const [tempEndDate, setTempEndDate] = useState<Date>(
    selectedRange?.endDate || new Date()
  );
  const [selectingStart, setSelectingStart] = useState(true);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleQuickRangeSelect = (range: QuickRange) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dateRange = range.getRange();
    onRangeChange(range.key === 'all' ? null : dateRange, range.key);
  };

  const handleCustomSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCustomPicker(true);
    setSelectingStart(true);
  };

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      if (selectingStart) {
        setTempStartDate(selectedDate);
        if (selectedDate > tempEndDate) {
          setTempEndDate(selectedDate);
        }
        if (Platform.OS === 'android') {
          setSelectingStart(false);
        }
      } else {
        setTempEndDate(selectedDate);
      }
    }
  };

  const handleApplyCustomRange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRangeChange({ startDate: tempStartDate, endDate: tempEndDate }, 'custom');
    setShowCustomPicker(false);
  };

  const handleCategoryToggle = (categoryId: TaxCategoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedCategories.includes(categoryId)) {
      // Remove category
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      // Add category
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const handleSelectAllCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCategoriesChange([]);
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRangeChange(null, 'all');
    onCategoriesChange([]);
  };

  const hasActiveFilters = selectedQuickFilter !== 'all' || selectedCategories.length > 0;

  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Filters
            </Text>
            <View style={styles.headerActions}>
              {hasActiveFilters && (
                <Pressable
                  onPress={handleClearAll}
                  style={styles.clearButton}
                >
                  <Text style={[styles.clearButtonText, { color: colors.primary }]}>
                    Clear All
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  onClose();
                  setShowCustomPicker(false);
                }}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!showCustomPicker ? (
              <>
                {/* Period Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      Period
                    </Text>
                  </View>

                  {/* Quick Ranges */}
                  <View style={styles.quickRanges}>
                    {QUICK_RANGES.map((range) => (
                      <Pressable
                        key={range.key}
                        onPress={() => handleQuickRangeSelect(range)}
                        style={[
                          styles.filterChip,
                          cardStyle,
                          selectedQuickFilter === range.key && {
                            backgroundColor: colors.primaryLight,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            {
                              color:
                                selectedQuickFilter === range.key
                                  ? colors.primary
                                  : colors.text,
                            },
                          ]}
                        >
                          {range.label}
                        </Text>
                        {selectedQuickFilter === range.key && (
                          <Check size={14} color={colors.primary} />
                        )}
                      </Pressable>
                    ))}
                  </View>

                  {/* Rolling Periods */}
                  <Text style={[styles.subsectionTitle, { color: colors.textMuted }]}>
                    Rolling Periods
                  </Text>
                  <View style={styles.quickRanges}>
                    {ADDITIONAL_RANGES.map((range, index) => (
                      <Pressable
                        key={`additional-${index}`}
                        onPress={() => handleQuickRangeSelect(range)}
                        style={[styles.filterChip, cardStyle]}
                      >
                        <Text style={[styles.filterChipText, { color: colors.text }]}>
                          {range.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Custom Range Button */}
                  <Pressable
                    onPress={handleCustomSelect}
                    style={[
                      styles.customRangeButton,
                      cardStyle,
                      selectedQuickFilter === 'custom' && {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <View style={styles.customRangeContent}>
                      <Calendar size={16} color={selectedQuickFilter === 'custom' ? colors.primary : colors.textSecondary} />
                      <Text style={[
                        styles.customRangeText,
                        { color: selectedQuickFilter === 'custom' ? colors.primary : colors.text }
                      ]}>
                        {selectedQuickFilter === 'custom' && selectedRange
                          ? `${format(selectedRange.startDate, 'MMM d')} - ${format(selectedRange.endDate, 'MMM d, yyyy')}`
                          : 'Custom Date Range'
                        }
                      </Text>
                    </View>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </Pressable>
                </View>

                {/* Category Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Tag size={16} color={colors.textSecondary} />
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      Categories
                    </Text>
                    {selectedCategories.length > 0 && (
                      <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.countBadgeText}>{selectedCategories.length}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.quickRanges}>
                    {/* All Categories Option */}
                    <Pressable
                      onPress={handleSelectAllCategories}
                      style={[
                        styles.filterChip,
                        cardStyle,
                        selectedCategories.length === 0 && {
                          backgroundColor: colors.primaryLight,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color: selectedCategories.length === 0 ? colors.primary : colors.text,
                          },
                        ]}
                      >
                        All Categories
                      </Text>
                      {selectedCategories.length === 0 && (
                        <Check size={14} color={colors.primary} />
                      )}
                    </Pressable>

                    {/* Category Options (Multi-select) */}
                    {TAX_CATEGORIES.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      return (
                        <Pressable
                          key={category.id}
                          onPress={() => handleCategoryToggle(category.id)}
                          style={[
                            styles.filterChip,
                            cardStyle,
                            isSelected && {
                              backgroundColor: colors.primaryLight,
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              {
                                color: isSelected ? colors.primary : colors.text,
                              },
                            ]}
                          >
                            {category.name}
                          </Text>
                          {isSelected && (
                            <Check size={14} color={colors.primary} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            ) : (
              /* Custom Date Picker */
              <View style={styles.customPickerContainer}>
                <View style={styles.dateSelectors}>
                  <Pressable
                    onPress={() => setSelectingStart(true)}
                    style={[
                      styles.dateSelector,
                      cardStyle,
                      selectingStart && {
                        borderColor: colors.primary,
                        backgroundColor: colors.primaryLight,
                      },
                    ]}
                  >
                    <Text style={[styles.dateSelectorLabel, { color: colors.textSecondary }]}>
                      Start Date
                    </Text>
                    <Text
                      style={[
                        styles.dateSelectorValue,
                        { color: selectingStart ? colors.primary : colors.text },
                      ]}
                    >
                      {format(tempStartDate, 'MMM d, yyyy')}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectingStart(false)}
                    style={[
                      styles.dateSelector,
                      cardStyle,
                      !selectingStart && {
                        borderColor: colors.primary,
                        backgroundColor: colors.primaryLight,
                      },
                    ]}
                  >
                    <Text style={[styles.dateSelectorLabel, { color: colors.textSecondary }]}>
                      End Date
                    </Text>
                    <Text
                      style={[
                        styles.dateSelectorValue,
                        { color: !selectingStart ? colors.primary : colors.text },
                      ]}
                    >
                      {format(tempEndDate, 'MMM d, yyyy')}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={selectingStart ? tempStartDate : tempEndDate}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    maximumDate={selectingStart ? tempEndDate : new Date()}
                    minimumDate={selectingStart ? undefined : tempStartDate}
                    themeVariant={isDark ? 'dark' : 'light'}
                  />
                </View>

                <View style={styles.customActions}>
                  <Pressable
                    onPress={() => setShowCustomPicker(false)}
                    style={[styles.actionButton, cardStyle]}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>
                      Back
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleApplyCustomRange}
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  >
                    <Check size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                      Apply
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Apply Button */}
          {!showCustomPicker && (
            <View style={styles.footer}>
              <Pressable
                onPress={onClose}
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.applyButtonText}>
                  Apply Filters
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 0,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 10,
  },
  quickRanges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  customRangeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customPickerContainer: {
    padding: 20,
  },
  dateSelectors: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateSelector: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateSelectorLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateSelectorValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickerContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  customActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  applyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
