import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import PageLayout from '@/components/layouts/page-layout';
import { CalendarHeart, Calendar } from 'lucide-react-native';
import { RobotIcon } from '@/components/ui/robot-icon';
import { AIChatInterface } from '@/components/ui/ai-chat-interface';
import { useAIChat } from '@/lib/hooks/use-ai-chat';
import { router } from 'expo-router';

import {
  useCurrentCycleInfo,
  usePeriodCycles,
  useCycleSettings,
  useFlowForDate,
  type PeriodCycle,
  type CurrentCycleInfo,
} from '@/lib/hooks/use-cycle-flo-style';
import { useMoodForDate } from '@/lib/hooks/use-daily-moods';
import { useSymptomsForDate } from '@/lib/hooks/use-daily-symptoms';

import { TodaysMood } from '@/components/cycle/TodaysMood';
import { TodaysSymptoms } from '@/components/cycle/TodaysSymptoms';
import { TodaysFlow } from '@/components/cycle/TodaysFlow';
import { CycleAverages } from '@/components/cycle/CycleAverages';
import { CyclePhase } from '@/components/cycle/CyclePhase';
import { CyclePageSkeleton } from '@/components/cycle/cycle-skeleton';
import { PredictionInfoModal } from '@/components/cycle/PredictionInfoModal';
import { PeriodPredictionButton } from '@/components/cycle/PeriodPredictionButton';

import { getLocalDateString } from '@/lib/utils/date-helpers';

export default function CycleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPredictionInfoModal, setShowPredictionInfoModal] = useState(false);
  const { isVisible, openChat, closeChat, handleSendMessage, config } = useAIChat('cycle');

  const {
    data: currentCycleInfo,
    isLoading: cycleInfoLoading,
    error: cycleInfoError,
  } = useCurrentCycleInfo(getLocalDateString(selectedDate));

  const { isLoading: settingsLoading } = useCycleSettings();
  const { data: periodCycles = [] } = usePeriodCycles(10);
  const { data: selectedDateMood } = useMoodForDate(getLocalDateString(selectedDate));
  const { data: selectedDateSymptoms } = useSymptomsForDate(getLocalDateString(selectedDate));
  const { data: selectedDateFlow } = useFlowForDate(getLocalDateString(selectedDate));

  // All predictions now come from currentCycleInfo
  const nextPeriodPrediction = (currentCycleInfo as CurrentCycleInfo)?.next_period_prediction;

  // Get actual period dates for calendar display
  const getActualPeriodDates = React.useCallback(() => {
    const allDates: string[] = [];

    try {
      // Add actual period dates from completed cycles
      periodCycles.forEach((cycle: PeriodCycle) => {
        try {
          const startDate = new Date(cycle.start_date);
          if (isNaN(startDate.getTime())) {
            console.warn('Invalid start date in cycle:', cycle.start_date);
            return;
          }

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

          if (isNaN(endDate.getTime())) {
            console.warn('Invalid end date in cycle:', cycle);
            return;
          }

          const currentDate = new Date(startDate);
          while (currentDate <= endDate && !isNaN(currentDate.getTime())) {
            allDates.push(getLocalDateString(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);

            // Safety check to prevent infinite loop
            if (allDates.length > 1000) {
              console.warn('Too many dates generated, breaking loop');
              break;
            }
          }
        } catch (error) {
          console.error('Error processing cycle:', cycle, error);
        }
      });
    } catch (error) {
      console.error('Error generating calendar dates:', error);
    }

    return allDates;
  }, [periodCycles]);

  // Check if user is currently on their period for the selected date
  const isOnPeriod = React.useMemo(() => {
    if (!periodCycles.length) return false;

    const selectedDateStr = getLocalDateString(selectedDate);
    return getActualPeriodDates().includes(selectedDateStr);
  }, [selectedDate, getActualPeriodDates]);

  // Get cycle settings which includes calculated averages from backend
  const { data: cycleSettings } = useCycleSettings();

  // Get average cycle data from backend settings
  const averageCycleData = React.useMemo(() => {
    if (!cycleSettings) return undefined;

    return {
      average_cycle_length: cycleSettings.cycle_length || 28,
      average_period_length: cycleSettings.period_length || 5,
      cycle_count: periodCycles.length, // Use periodCycles length as cycle count
      last_updated: new Date().toISOString(),
    };
  }, [cycleSettings, periodCycles.length]);

  const isMainDataLoading = cycleInfoLoading || settingsLoading;
  const hasCriticalErrors = cycleInfoError;

  const handleDateSelect = React.useCallback((date: Date) => {
    // Ensure we have a valid date
    if (!date || isNaN(date.getTime())) {
      console.warn('Invalid date passed to handleDateSelect:', date);
      return;
    }

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
    router.push('/log-period');
  }, []);

  return (
    <PageLayout
      title="Cycle"
      theme="cycle"
      selectedDate={selectedDate}
      onDateSelect={handleDateSelect}
      loggedDates={getActualPeriodDates()}
      btn={
        <View className="flex-row gap-3">
          {/* Edit/Log Period Button */}
          <TouchableOpacity
            className="bg-pink-600 p-3 rounded-full"
            onPress={() => router.push('/log-period')}
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

          {/* AI Chat Button */}
          {/* <TouchableOpacity
            className="bg-pink-500 p-3 rounded-full"
            onPress={openChat}
            style={{
              shadowColor: '#EC4899',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <RobotIcon size={18} color="#FFFFFF" theme="cycle" />
          </TouchableOpacity> */}
        </View>
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
            nextPeriodPrediction={nextPeriodPrediction || null}
            onPress={handlePeriodPredictionPress}
          />

          <CyclePhase
            currentCycleInfo={currentCycleInfo as CurrentCycleInfo}
            onLogPeriod={() => router.push('/log-period')}
            isLoading={isMainDataLoading}
            selectedDate={selectedDate}
          />

          <CycleAverages averageData={averageCycleData} isLoading={isMainDataLoading} />

          <TodaysFlow
            selectedDate={selectedDate}
            flowData={selectedDateFlow}
            isLoading={false}
            isOnPeriod={isOnPeriod}
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

      <AIChatInterface
        visible={isVisible}
        onClose={closeChat}
        context="cycle"
        title={config.title}
        introMessages={config.introMessages}
        quickActions={config.quickActions}
        onSendMessage={handleSendMessage}
      />
    </PageLayout>
  );
}
