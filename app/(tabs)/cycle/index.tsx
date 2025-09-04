import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import PageLayout from '@/components/layouts/page-layout';
import { Calendar, Heart, CalendarHeart } from 'lucide-react-native';
import { router } from 'expo-router';

import {
  useCurrentCycleInfo,
  usePeriodCycles,
  useStartPeriod,
  useEndPeriod,
  useDeletePeriodCycle,
  useCycleSettings,
  type PeriodCycle,
} from '@/lib/hooks/use-cycle-flo-style';
import { useMoodForDate } from '@/lib/hooks/use-daily-moods';
import { useSymptomsForDate } from '@/lib/hooks/use-daily-symptoms';

import { TodaysMood } from '@/components/cycle/TodaysMood';
import { TodaysSupplements } from '@/components/cycle/TodaysSupplements';
import { TodaysSymptoms } from '@/components/cycle/TodaysSymptoms';
import { CyclePhase } from '@/components/cycle/CyclePhase';
import { CyclePageSkeleton } from '@/components/cycle/cycle-skeleton';
import { PredictionInfoModal } from '@/components/cycle/PredictionInfoModal';
import { FullCalendarModal } from '@/components/cycle/FullCalendarModal';
import { PeriodPredictionButton } from '@/components/cycle/PeriodPredictionButton';

import { getLocalDateString } from '@/lib/utils/date-helpers';
import { AnimatedWavyCard } from '@/components/cycle/animated-wavy-card';

export default function CycleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPredictionInfoModal, setShowPredictionInfoModal] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const {
    data: currentCycleInfo,
    isLoading: cycleInfoLoading,
    error: cycleInfoError,
  } = useCurrentCycleInfo(getLocalDateString(selectedDate));

  const { data: cycleSettings, isLoading: settingsLoading } = useCycleSettings();
  const { data: periodCycles = [] } = usePeriodCycles(10);
  const { data: selectedDateMood } = useMoodForDate(getLocalDateString(selectedDate));
  const { data: selectedDateSymptoms } = useSymptomsForDate(getLocalDateString(selectedDate));

  const startPeriod = useStartPeriod();
  const endPeriod = useEndPeriod();
  const deletePeriodCycle = useDeletePeriodCycle();

  const isMainDataLoading = cycleInfoLoading || settingsLoading;
  const hasCriticalErrors = cycleInfoError;

  const handleDateSelect = React.useCallback((date: Date) => {
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
    setShowFullCalendar(true);
  }, []);





  const hasOngoingPeriod = React.useCallback(() => {
    return periodCycles.some((cycle: PeriodCycle) => cycle.end_date === null);
  }, [periodCycles]);

  // Get all period dates for calendar display (actual + predicted)
  const getAllPeriodDatesForCalendar = () => {
    const allDates: string[] = [];
    
    // Add actual period dates from completed cycles
    periodCycles.forEach((cycle: PeriodCycle) => {
      const startDate = new Date(cycle.start_date);
      let endDate: Date;
      
      if (cycle.end_date) {
        // Completed cycle
        endDate = new Date(cycle.end_date);
      } else if (cycle.predicted_end_date) {
        // Ongoing cycle with predicted end
        endDate = new Date(cycle.predicted_end_date);
      } else {
        // Ongoing cycle without prediction, use today
        endDate = new Date();
      }
      
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        allDates.push(getLocalDateString(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return allDates;
  };

  // Get predicted next period dates for calendar
  const getPredictedPeriodDates = () => {
    if (!currentCycleInfo?.next_period_prediction) return [];
    
    const prediction = currentCycleInfo.next_period_prediction;
    
    // Option 1: Show only start date as predicted
    return [prediction.start_date];
    
    // Option 2: Show full predicted period range (original logic)
    // const predictedDates: string[] = [];
    // const startDate = new Date(prediction.start_date);
    // const endDate = new Date(prediction.end_date);
    // const currentDate = new Date(startDate);
    // while (currentDate <= endDate) {
    //   predictedDates.push(getLocalDateString(currentDate));
    //   currentDate.setDate(currentDate.getDate() + 1);
    // }
    // return predictedDates;
  };

  // All predictions now come from currentCycleInfo
  const nextPeriodPrediction = currentCycleInfo?.next_period_prediction;

  return (
    <PageLayout
      title="Cycle"
      theme="cycle"
      selectedDate={selectedDate}
      onDateSelect={handleDateSelect}
      loggedDates={getAllPeriodDatesForCalendar()}
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
            nextPeriodPrediction={nextPeriodPrediction ? {
              daysUntil: nextPeriodPrediction.days_until,
              date: nextPeriodPrediction.start_date
            } : null}
            onPress={handlePeriodPredictionPress}
          />

          <CyclePhase
            currentCycleInfo={currentCycleInfo}
            onLogPeriod={() => setShowFullCalendar(true)}
            isLoading={isMainDataLoading}
            selectedDate={selectedDate}
          />

          <TodaysSymptoms
            selectedDate={selectedDate}
            symptomData={
              selectedDateSymptoms
                ? {
                    symptoms: selectedDateSymptoms.symptoms,
                    severity: selectedDateSymptoms.severity,
                    notes: selectedDateSymptoms.notes,
                  }
                : undefined
            }
            isLoading={false}
          />

          <TodaysMood
            selectedDate={selectedDate}
            moodData={
              selectedDateMood
                ? {
                    mood: selectedDateMood.mood,
                    energy_level: selectedDateMood.energy_level,
                    notes: selectedDateMood.notes,
                  }
                : undefined
            }
            isLoading={false}
          />

          {/* <TodaysSupplements selectedDate={selectedDate} /> */}
        </ScrollView>
      )}


      <PredictionInfoModal
        visible={showPredictionInfoModal}
        onClose={() => setShowPredictionInfoModal(false)}
      />

      <FullCalendarModal
        visible={showFullCalendar}
        onClose={() => setShowFullCalendar(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        loggedDates={getAllPeriodDatesForCalendar()}
        startDates={periodCycles.map((cycle: PeriodCycle) => cycle.start_date)}
        endDates={periodCycles
          .map((cycle: PeriodCycle) => cycle.end_date)
          .filter((date: string | null): date is string => date !== null)}
        predictedDates={getPredictedPeriodDates()}
        nextPeriodPrediction={nextPeriodPrediction}
        hasOngoingPeriod={hasOngoingPeriod()}
        currentCycleInfo={currentCycleInfo}
        onDatePress={handleDateSelect}
        onStartPeriod={(date: Date) => {
          const startDateString = getLocalDateString(date);
          
          // If there's an ongoing period, end it first, then start new one
          if (hasOngoingPeriod()) {
            const ongoingCycle = periodCycles.find((cycle: PeriodCycle) => cycle.end_date === null);
            if (ongoingCycle) {
              // Delete the ongoing period first
              deletePeriodCycle.mutate(ongoingCycle.id, {
                onSuccess: () => {
                  // Then start the new period
                  startPeriod.mutate({
                    start_date: startDateString,
                    flow_intensity: 'moderate',
                    notes: 'Period started',
                  });
                },
              });
              return;
            }
          }
          
          // Normal case: no ongoing period
          startPeriod.mutate({
            start_date: startDateString,
            flow_intensity: 'moderate',
            notes: 'Period started',
          });
        }}
        onEndPeriod={(date: Date) => {
          const endDateString = getLocalDateString(date);
          endPeriod.mutate({
            end_date: endDateString,
          });
        }}
      />

    </PageLayout>
  );
}
