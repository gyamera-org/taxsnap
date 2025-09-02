import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import PageLayout from '@/components/layouts/page-layout';
import { Calendar, Heart, CalendarHeart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAppNavigation } from '@/lib/hooks/use-navigation';

import { useCycleSettings, useCurrentCyclePhase } from '@/lib/hooks/use-cycle-settings';
import {
  usePeriodLogsRealtime,
  useLogPeriodData,
  useDeletePeriodLog,
  useUpdateCycleSettings,
} from '@/lib/hooks/use-cycle-data';

import { TodaysMood } from '@/components/cycle/TodaysMood';
import { TodaysSupplements } from '@/components/cycle/TodaysSupplements';
import { TodaysSymptoms } from '@/components/cycle/TodaysSymptoms';
import { CyclePhase } from '@/components/cycle/CyclePhase';
import { PeriodModal } from '@/components/cycle/PeriodModal';
import { CyclePageSkeleton } from '@/components/cycle/cycle-skeleton';
import { PredictionInfoModal } from '@/components/cycle/PredictionInfoModal';
import { FullCalendarModal } from '@/components/cycle/FullCalendarModal';
import { PeriodPredictionButton } from '@/components/cycle/PeriodPredictionButton';

import {
  getLoggedDates,
  getStartDates,
  getEndDates,
  getLastPeriodStart,
  getAllPeriodDays,
  hasOngoingPeriod,
  getNextPeriodPrediction,
  getPregnancyChances,
  getMoodDataForDate,
  getSymptomDataForDate,
  type PeriodLog,
} from '@/lib/utils/cycle-utils';
import { getLocalDateString } from '@/lib/utils/date-helpers';

export default function CycleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showPredictionInfoModal, setShowPredictionInfoModal] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());

  const {
    data: cycleSettings,
    isLoading: cycleSettingsLoading,
    error: cycleSettingsError,
  } = useCycleSettings();
  const {
    data: currentPhase,
    isError: currentPhaseError,
    isLoading: currentPhaseLoading,
    error: currentPhaseErrorDetails,
  } = useCurrentCyclePhase();
  const { data: periodLogs = [] } = usePeriodLogsRealtime();

  const logPeriodData = useLogPeriodData();
  const deletePeriodLog = useDeletePeriodLog();
  const updateCycleSettings = useUpdateCycleSettings();

  const isMainDataLoading = cycleSettingsLoading || currentPhaseLoading;

  const safeCurrentPhase = currentPhaseError ? null : currentPhase;

  const hasCriticalErrors = cycleSettingsError || currentPhaseErrorDetails;

  const handleDateSelect = React.useCallback((date: Date) => {
    // Don't allow future dates - clamp to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);

    if (selectedDay > today) {
      setSelectedDate(today);
    } else {
      setSelectedDate(date);
    }
  }, []);

  const handlePeriodPredictionPress = React.useCallback(() => {
    const today = new Date();
    setModalDate(today);
    setShowPeriodModal(true);
  }, []);

  const handleStartPeriod = () => {
    const dateString = getLocalDateString(modalDate);

    logPeriodData.mutate(
      {
        date: dateString,
        is_start_day: true,
        flow_intensity: 'moderate',
        symptoms: [],
        notes: 'Period started',
      },
      {
        onSuccess: () => {
          updateCycleSettings.mutate({
            cycle_length: cycleSettings?.cycle_length || 28,
            period_length: cycleSettings?.period_length || 5,
            last_period_date: dateString,
          });
          setShowPeriodModal(false);
        },
      }
    );
  };

  const handleEndPeriod = () => {
    const dateString = getLocalDateString(modalDate);

    const currentPeriodStart = getLastPeriodStart(periodLogs as PeriodLog[]);

    if (currentPeriodStart) {
      const startDate = new Date(currentPeriodStart);
      const endDate = modalDate;

      logPeriodData.mutate(
        {
          date: dateString,
          is_start_day: false,
          flow_intensity: 'light',
          symptoms: [],
          notes: 'Period ended',
        },
        {
          onSuccess: () => {
            const periodLength =
              Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            updateCycleSettings.mutate({
              cycle_length: cycleSettings?.cycle_length || 28,
              period_length: periodLength,
              last_period_date: currentPeriodStart,
            });

            setShowPeriodModal(false);
          },
        }
      );
    }
  };

  const handleRemovePeriod = () => {
    const dateString = getLocalDateString(modalDate);

    deletePeriodLog.mutate(dateString, {
      onSuccess: () => {
        setShowPeriodModal(false);
      },
    });
  };

  const nextPeriodPrediction = React.useMemo(() => {
    return getNextPeriodPrediction(periodLogs as PeriodLog[], cycleSettings, selectedDate);
  }, [periodLogs, cycleSettings, selectedDate]);

  const pregnancyChances = React.useMemo(() => {
    return getPregnancyChances(selectedDate, periodLogs as PeriodLog[], cycleSettings);
  }, [selectedDate, cycleSettings, periodLogs]);

  return (
    <PageLayout
      title="Cycle"
      theme="cycle"
      selectedDate={selectedDate}
      onDateSelect={handleDateSelect}
      loggedDates={getAllPeriodDays(periodLogs as PeriodLog[])}
      btn={
        <TouchableOpacity
          className="bg-pink-500 p-3 rounded-full"
          onPress={() => setShowFullCalendar(true)}
          style={{
            shadowColor: '#EC4899',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Calendar size={18} color="#FFFFFF" />
        </TouchableOpacity>
      }
    >
      {isMainDataLoading ? (
        <CyclePageSkeleton />
      ) : hasCriticalErrors ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="px-4 py-8">
            <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center">
              <View className="w-16 h-16 rounded-2xl bg-pink-50 items-center justify-center mb-4">
                <CalendarHeart size={24} color="#EC4899" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load cycle data
              </Text>
              <Text className="text-gray-600 text-center text-sm mb-4">
                We're having trouble connecting to your cycle data. Please check your internet
                connection and try again.
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-pink-500 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <PeriodPredictionButton
            nextPeriodPrediction={nextPeriodPrediction}
            onPress={handlePeriodPredictionPress}
          />

          {safeCurrentPhase && (
            <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-black">{safeCurrentPhase.name}</Text>
                  <Text className="text-gray-600 text-sm">
                    Day {safeCurrentPhase.day_in_cycle} • {safeCurrentPhase.days_remaining} days
                    left
                  </Text>
                  {nextPeriodPrediction && nextPeriodPrediction.daysUntil > 0 && (
                    <View className="bg-purple-50 px-2 py-1 rounded-full mt-2 self-start">
                      <Text className="text-purple-700 text-xs font-medium">
                        Period in {nextPeriodPrediction.daysUntil} days
                      </Text>
                    </View>
                  )}
                </View>
                <View className="bg-pink-50 p-3 rounded-xl">
                  <Heart size={20} color="#EC4899" />
                </View>
              </View>
              <Text className="text-gray-700 text-sm mb-3">{safeCurrentPhase.description}</Text>
            </View>
          )}

          <CyclePhase
            selectedDate={selectedDate}
            periodStartDate={
              periodLogs && periodLogs.length > 0
                ? (() => {
                    const lastStart = getLastPeriodStart(periodLogs as PeriodLog[]);
                    return lastStart ? new Date(lastStart + 'T00:00:00') : undefined;
                  })()
                : undefined
            }
            onLogPeriod={() => setShowFullCalendar(true)}
            nextPeriodPrediction={nextPeriodPrediction}
            pregnancyChances={pregnancyChances}
          />

          <TodaysSymptoms
            selectedDate={selectedDate}
            symptomData={getSymptomDataForDate(selectedDate, periodLogs as PeriodLog[])}
            isLoading={false}
          />

          <TodaysMood
            selectedDate={selectedDate}
            moodData={getMoodDataForDate(selectedDate, periodLogs as PeriodLog[])}
            isLoading={false}
          />

          {/* <TodaysSupplements selectedDate={selectedDate} /> */}
        </ScrollView>
      )}

      <PeriodModal
        isVisible={showPeriodModal}
        selectedDate={modalDate}
        isLoggedDate={getLoggedDates(periodLogs as PeriodLog[]).includes(
          getLocalDateString(modalDate)
        )}
        isStartDate={getStartDates(periodLogs as PeriodLog[]).includes(
          getLocalDateString(modalDate)
        )}
        hasOngoingPeriod={hasOngoingPeriod(periodLogs as PeriodLog[])}
        onClose={() => setShowPeriodModal(false)}
        onStartPeriod={handleStartPeriod}
        onEndPeriod={handleEndPeriod}
        onRemovePeriod={handleRemovePeriod}
      />

      <PredictionInfoModal
        visible={showPredictionInfoModal}
        onClose={() => setShowPredictionInfoModal(false)}
      />

      <FullCalendarModal
        visible={showFullCalendar}
        onClose={() => setShowFullCalendar(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        loggedDates={getAllPeriodDays(periodLogs as PeriodLog[])}
        startDates={getStartDates(periodLogs as PeriodLog[])}
        endDates={getEndDates(periodLogs as PeriodLog[])}
        predictedDates={nextPeriodPrediction?.predictedPeriodDates || []}
        nextPeriodPrediction={nextPeriodPrediction}
        onDatePress={(date) => {
          setModalDate(date);
          setSelectedDate(date);
          setShowPeriodModal(true);
        }}
        onLogPeriodPress={() => {
          setModalDate(selectedDate);
          setShowPeriodModal(true);
        }}
      />
    </PageLayout>
  );
}
