import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  X,
  ChevronRight,
  ArrowLeft,
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
import type { DateRange, ReceiptSummary } from '@/lib/types/receipt';

type ExportFormat = 'csv' | 'pdf';
type ExportStep = 'period' | 'format' | 'exporting';

interface ExportPeriodOption {
  key: string;
  label: string;
  getRange: () => DateRange | null;
}

// Quick select periods (same as DateRangePicker)
const QUICK_PERIODS: ExportPeriodOption[] = [
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
    getRange: () => null,
  },
];

// Rolling periods (same as DateRangePicker)
const ROLLING_PERIODS: ExportPeriodOption[] = [
  {
    key: 'last7',
    label: 'Last 7 Days',
    getRange: () => ({
      startDate: subDays(new Date(), 6),
      endDate: new Date(),
    }),
  },
  {
    key: 'last30',
    label: 'Last 30 Days',
    getRange: () => ({
      startDate: subDays(new Date(), 29),
      endDate: new Date(),
    }),
  },
  {
    key: 'last3months',
    label: 'Last 3 Months',
    getRange: () => ({
      startDate: subMonths(new Date(), 3),
      endDate: new Date(),
    }),
  },
];

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, dateRange: DateRange | null) => Promise<void>;
  receiptCount: number;
  summary: ReceiptSummary;
}

export function ExportModal({
  visible,
  onClose,
  onExport,
  receiptCount,
  summary,
}: ExportModalProps) {
  const colors = useThemedColors();
  const { isDark } = useTheme();

  const [step, setStep] = useState<ExportStep>('period');
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const resetState = useCallback(() => {
    setStep('period');
    setSelectedPeriodKey(null);
    setSelectedRange(null);
    setIsExporting(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePeriodSelect = (period: ExportPeriodOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPeriodKey(period.key);
    setSelectedRange(period.getRange());
  };

  const handleContinue = () => {
    if (!selectedPeriodKey) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('format');
  };

  const handleFormatSelect = async (format: ExportFormat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('exporting');
    setIsExporting(true);

    try {
      await onExport(format, selectedRange);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClose();
    } catch (error) {
      console.error('Export failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStep('format');
      setIsExporting(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('period');
  };

  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  };

  const formatDateRange = () => {
    if (!selectedRange) return 'All receipts';
    return `${format(selectedRange.startDate, 'MMM d')} - ${format(selectedRange.endDate, 'MMM d, yyyy')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            {step === 'format' && (
              <Pressable onPress={handleBack} style={styles.backButton}>
                <ArrowLeft size={24} color={colors.text} />
              </Pressable>
            )}
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {step === 'period' && 'Export Receipts'}
              {step === 'format' && 'Choose Format'}
              {step === 'exporting' && 'Exporting...'}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </Pressable>
          </View>

          {step === 'period' && (
            <>
              {/* Quick Select */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Quick Select
                </Text>
                <View style={styles.chipsContainer}>
                  {QUICK_PERIODS.map((period) => (
                    <Pressable
                      key={period.key}
                      onPress={() => handlePeriodSelect(period)}
                      style={[
                        styles.chip,
                        cardStyle,
                        selectedPeriodKey === period.key && {
                          backgroundColor: colors.primaryLight,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              selectedPeriodKey === period.key
                                ? colors.primary
                                : colors.text,
                          },
                        ]}
                      >
                        {period.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Rolling Periods */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Rolling Periods
                </Text>
                <View style={styles.chipsContainer}>
                  {ROLLING_PERIODS.map((period) => (
                    <Pressable
                      key={period.key}
                      onPress={() => handlePeriodSelect(period)}
                      style={[
                        styles.chip,
                        cardStyle,
                        selectedPeriodKey === period.key && {
                          backgroundColor: colors.primaryLight,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              selectedPeriodKey === period.key
                                ? colors.primary
                                : colors.text,
                          },
                        ]}
                      >
                        {period.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Continue Button */}
              <View style={styles.continueContainer}>
                <Pressable
                  onPress={handleContinue}
                  disabled={!selectedPeriodKey}
                  style={[
                    styles.continueButton,
                    {
                      backgroundColor: selectedPeriodKey
                        ? colors.primary
                        : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.continueButtonText,
                      {
                        color: selectedPeriodKey
                          ? '#FFFFFF'
                          : colors.textMuted,
                      },
                    ]}
                  >
                    Continue
                  </Text>
                  <ChevronRight
                    size={18}
                    color={selectedPeriodKey ? '#FFFFFF' : colors.textMuted}
                  />
                </Pressable>
              </View>
            </>
          )}

          {step === 'format' && (
            <>
              {/* Selected Period Summary */}
              <View style={[styles.summaryBanner, { backgroundColor: colors.primaryLight }]}>
                <Calendar size={16} color={colors.primary} />
                <Text style={[styles.summaryText, { color: colors.primary }]}>
                  {formatDateRange()}
                </Text>
              </View>

              {/* Format Selection */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Export Format
                </Text>
                <View style={styles.formatList}>
                  <Pressable
                    onPress={() => handleFormatSelect('csv')}
                    style={[styles.formatItem, cardStyle]}
                  >
                    <View style={styles.formatInfo}>
                      <View
                        style={[
                          styles.formatIcon,
                          { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                        ]}
                      >
                        <FileSpreadsheet size={22} color="#10B981" />
                      </View>
                      <View style={styles.formatText}>
                        <Text style={[styles.formatLabel, { color: colors.text }]}>
                          CSV Spreadsheet
                        </Text>
                        <Text style={[styles.formatDescription, { color: colors.textMuted }]}>
                          Import into Excel, Google Sheets, or accounting software
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </Pressable>

                  <Pressable
                    onPress={() => handleFormatSelect('pdf')}
                    style={[styles.formatItem, cardStyle]}
                  >
                    <View style={styles.formatInfo}>
                      <View
                        style={[
                          styles.formatIcon,
                          { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                        ]}
                      >
                        <FileText size={22} color="#EF4444" />
                      </View>
                      <View style={styles.formatText}>
                        <Text style={[styles.formatLabel, { color: colors.text }]}>
                          PDF Report
                        </Text>
                        <Text style={[styles.formatDescription, { color: colors.textMuted }]}>
                          Professional report with receipt images for your accountant
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {step === 'exporting' && (
            <View style={styles.exportingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.exportingText, { color: colors.text }]}>
                Preparing your export...
              </Text>
              <Text style={[styles.exportingSubtext, { color: colors.textMuted }]}>
                This may take a moment
              </Text>
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 4,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  continueContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formatList: {
    gap: 12,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  formatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatText: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  exportingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  exportingText: {
    fontSize: 17,
    fontWeight: '600',
  },
  exportingSubtext: {
    fontSize: 14,
  },
});
