import { useMemo } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import PageLayout from '@/components/layouts/page-layout';
import { Calendar } from 'lucide-react-native';
import { PeriodSelectionModal } from '@/components/progress/period-selection-modal';
import { DailyBreakdownChart } from '@/components/progress/daily-calories-breakdown-chart';
import { WeightProgressChart } from '@/components/progress/weight-progress-chart';
import { ProgressLoadingState } from '@/components/progress/progress-loading-state';
import { WeekSelectionTabs } from '@/components/progress/week-selection-tabs';
import { ProgressPicturesSection } from '@/components/progress/progress-pictures-section';
import { useProgressState } from '@/lib/hooks/use-progress-state';

function ProgressScreen() {
  const {
    selectedPeriod,
    selectedWeek,
    showPeriodModal,
    isPeriodChanging,
    isWeekChanging,
    nutrientData,
    weeklyTotals,
    weightEntries,
    bodyMeasurements,
    isLoading,
    dateRange,
    handleWeekChange,
    handlePeriodChange,
    handleModalClose,
    handleCalendarPress,
  } = useProgressState();

  // Create calendar button for PageLayout
  const CalendarButton = useMemo(
    () => (
      <TouchableOpacity
        onPress={handleCalendarPress}
        className="w-10 h-10 items-center justify-center rounded-full bg-pink-500"
      >
        <Calendar size={20} color="#ffffff" />
      </TouchableOpacity>
    ),
    [handleCalendarPress]
  );

  const pageLoading = isPeriodChanging || isWeekChanging;

  return (
    <PageLayout title="Progress" theme="progress" btn={CalendarButton}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {pageLoading && <ProgressLoadingState CalendarButton={CalendarButton} />}
        {/* Week Selection Tabs */}
        {!pageLoading && (
          <>
            <WeekSelectionTabs
              selectedWeek={selectedWeek}
              onWeekChange={handleWeekChange}
              isLoading={isLoading}
            />

            {/* Daily Breakdown Chart */}
            <DailyBreakdownChart
              weeklyTotals={weeklyTotals}
              nutrientData={nutrientData}
              isLoading={isLoading}
            />

            {/* Weight Progress Chart */}
            <WeightProgressChart
              weightEntries={weightEntries}
              goalWeight={bodyMeasurements?.goal_weight}
              isLoading={isLoading}
            />
            {/* Progress Pictures Section */}
            <ProgressPicturesSection startDate={dateRange.startDate} endDate={dateRange.endDate} />
          </>
        )}
      </ScrollView>

      {/* Period Selection Modal */}
      <PeriodSelectionModal
        visible={showPeriodModal}
        onClose={handleModalClose}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={handlePeriodChange}
      />
    </PageLayout>
  );
}

export default function ProgressScreenWithErrorBoundary() {
  return <ProgressScreen />;
}
