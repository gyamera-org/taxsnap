import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  ChevronDown,
  X,
  Check,
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
import type { DateRange, QuickFilterType } from '@/lib/types/receipt';

interface QuickRange {
  key: QuickFilterType;
  label: string;
  getRange: () => DateRange;
}

const QUICK_RANGES: QuickRange[] = [
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
  {
    key: 'all',
    label: 'All Time',
    getRange: () => ({
      startDate: new Date(2000, 0, 1),
      endDate: new Date(),
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

interface DateRangePickerProps {
  selectedRange: DateRange | null;
  selectedQuickFilter: QuickFilterType;
  onRangeChange: (range: DateRange | null, quickFilter: QuickFilterType) => void;
  visible?: boolean;
  onClose?: () => void;
}

export function DateRangePicker({
  selectedRange,
  selectedQuickFilter,
  onRangeChange,
  visible,
  onClose,
}: DateRangePickerProps) {
  const colors = useThemedColors();
  const { isDark } = useTheme();
  const [internalVisible, setInternalVisible] = useState(false);

  // Support both controlled (visible/onClose) and uncontrolled modes
  const isModalVisible = visible !== undefined ? visible : internalVisible;
  const setIsModalVisible = (value: boolean) => {
    if (visible !== undefined && onClose) {
      if (!value) onClose();
    } else {
      setInternalVisible(value);
    }
  };
  const [tempStartDate, setTempStartDate] = useState<Date>(
    selectedRange?.startDate || new Date()
  );
  const [tempEndDate, setTempEndDate] = useState<Date>(
    selectedRange?.endDate || new Date()
  );
  const [selectingStart, setSelectingStart] = useState(true);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const getDisplayLabel = () => {
    if (selectedQuickFilter === 'all') return 'All Time';
    if (selectedQuickFilter === 'custom' && selectedRange) {
      return `${format(selectedRange.startDate, 'MMM d')} - ${format(selectedRange.endDate, 'MMM d, yyyy')}`;
    }
    const quickRange = QUICK_RANGES.find((r) => r.key === selectedQuickFilter);
    return quickRange?.label || 'Select Date Range';
  };

  const handleQuickRangeSelect = (range: QuickRange) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dateRange = range.getRange();
    onRangeChange(range.key === 'all' ? null : dateRange, range.key);
    setIsModalVisible(false);
    setShowCustomPicker(false);
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
    setIsModalVisible(false);
    setShowCustomPicker(false);
  };

  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  };

  // In controlled mode (visible prop provided), don't render the trigger
  const isControlled = visible !== undefined;

  return (
    <>
      {!isControlled && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalVisible(true);
          }}
          style={[styles.trigger, cardStyle]}
        >
          <Calendar size={16} color={colors.primary} />
          <Text style={[styles.triggerText, { color: colors.text }]}>
            {getDisplayLabel()}
          </Text>
          <ChevronDown size={16} color={colors.textSecondary} />
        </Pressable>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
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
                Select Date Range
              </Text>
              <Pressable
                onPress={() => {
                  setIsModalVisible(false);
                  setShowCustomPicker(false);
                }}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </Pressable>
            </View>

            {!showCustomPicker ? (
              <>
                {/* Quick Ranges */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Quick Select
                  </Text>
                  <View style={styles.quickRanges}>
                    {QUICK_RANGES.map((range) => (
                      <Pressable
                        key={range.key}
                        onPress={() => handleQuickRangeSelect(range)}
                        style={[
                          styles.quickRangeItem,
                          cardStyle,
                          selectedQuickFilter === range.key && {
                            backgroundColor: colors.primaryLight,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.quickRangeText,
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
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Additional Ranges */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Rolling Periods
                  </Text>
                  <View style={styles.quickRanges}>
                    {ADDITIONAL_RANGES.map((range, index) => (
                      <Pressable
                        key={`additional-${index}`}
                        onPress={() => handleQuickRangeSelect(range)}
                        style={[styles.quickRangeItem, cardStyle]}
                      >
                        <Text style={[styles.quickRangeText, { color: colors.text }]}>
                          {range.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Custom Range Button */}
                <Pressable
                  onPress={handleCustomSelect}
                  style={[
                    styles.customButton,
                    { borderColor: colors.primary },
                  ]}
                >
                  <Calendar size={18} color={colors.primary} />
                  <Text style={[styles.customButtonText, { color: colors.primary }]}>
                    Custom Date Range
                  </Text>
                </Pressable>
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
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 40,
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
  closeButton: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickRanges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickRangeItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickRangeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  customButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
});
