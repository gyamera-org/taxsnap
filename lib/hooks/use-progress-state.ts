import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  PeriodType, 
  WeekType, 
  calculateDateRange,
  isValidWeekPeriodCombination,
  getSafeDefaultWeek
} from '@/lib/utils/progress-date-utils';
import { useMealEntriesRange } from '@/lib/hooks/use-meal-tracking';
import { useWeightHistoryRange, useBodyMeasurements } from '@/lib/hooks/use-weight-tracking';

interface NutrientProgressData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function useProgressState() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('90days');
  const [selectedWeek, setSelectedWeek] = useState<WeekType>('thisweek');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [isPeriodChanging, setIsPeriodChanging] = useState(false);
  const [isWeekChanging, setIsWeekChanging] = useState(false);

  const debounceTimeout = useRef<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // State validation effect - ensures we never have invalid combinations
  useEffect(() => {
    const validateAndCorrectState = () => {
      try {
        // Check if the current week selection makes sense for the period
        if (!isValidWeekPeriodCombination(selectedWeek, selectedPeriod)) {
          console.log('Invalid period/week combination detected, resetting to safe default');
          setSelectedWeek(getSafeDefaultWeek(selectedPeriod));
        }
      } catch (error) {
        console.error('Error in state validation:', error);
        // Reset to completely safe state
        setSelectedPeriod('90days');
        setSelectedWeek('thisweek');
      }
    };

    validateAndCorrectState();
  }, [selectedPeriod, selectedWeek]);

  // Calculate date range
  const dateRange = useMemo(() => {
    return calculateDateRange(selectedWeek, selectedPeriod);
  }, [selectedWeek, selectedPeriod]);

  // Data fetching
  const shouldFetchData = !isPeriodChanging && !isWeekChanging && Boolean(dateRange.startDate && dateRange.endDate);
  
  const { data: mealEntries = [], isLoading } = useMealEntriesRange(
    dateRange.startDate, 
    dateRange.endDate, 
    { enabled: shouldFetchData }
  );
  
  const { data: weightEntries = [] } = useWeightHistoryRange(
    dateRange.startDate, 
    dateRange.endDate, 
    { enabled: shouldFetchData }
  );
  
  const { data: bodyMeasurements } = useBodyMeasurements();

  // Process meal entries to get daily totals
  const nutrientData = useMemo((): NutrientProgressData[] => {
    const dailyTotals: Record<string, NutrientProgressData> = {};

    mealEntries.forEach((entry) => {
      const date = entry.logged_date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = {
          date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }
      dailyTotals[date].calories += entry.total_calories;
      dailyTotals[date].protein += entry.total_protein;
      dailyTotals[date].carbs += entry.total_carbs;
      dailyTotals[date].fat += entry.total_fat;
    });

    return Object.values(dailyTotals).sort((a, b) => a.date.localeCompare(b.date));
  }, [mealEntries]);

  // Calculate weekly totals for current selection
  const weeklyTotals = useMemo(
    () =>
      nutrientData.reduce(
        (totals, day) => ({
          calories: totals.calories + day.calories,
          protein: totals.protein + day.protein,
          carbs: totals.carbs + day.carbs,
          fat: totals.fat + day.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [nutrientData]
  );

  // Handlers
  const handleWeekChange = useCallback((week: WeekType) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Immediately set loading state to prevent rendering during transition
    setIsWeekChanging(true);

    debounceTimeout.current = setTimeout(() => {
      try {
        console.log('Debounce week', week);
        setSelectedWeek(week);
      } catch (error) {
        console.error('Error setting week:', error);
      } finally {
        // Clear loading state after additional delay
        setTimeout(() => setIsWeekChanging(false), 200);
      }
    }, 100);
  }, []);

  const handlePeriodChange = useCallback((period: PeriodType) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Immediately set loading state to prevent rendering during transition
    setIsPeriodChanging(true);

    debounceTimeout.current = setTimeout(() => {
      try {
        setSelectedPeriod(period);
        // Reset to safe week when changing periods to avoid invalid combinations
        setSelectedWeek(getSafeDefaultWeek(period));
      } catch (error) {
        console.error('Error setting period:', error);
        // Fallback to safe defaults
        setSelectedPeriod('90days');
        setSelectedWeek('thisweek');
      } finally {
        // Clear loading state after additional delay
        setTimeout(() => setIsPeriodChanging(false), 300);
      }
    }, 300);
  }, []);

  const handleModalClose = useCallback(() => {
    try {
      setShowPeriodModal(false);
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  }, []);

  const handleCalendarPress = useCallback(() => {
    setShowPeriodModal(true);
  }, []);

  return {
    // State
    selectedPeriod,
    selectedWeek,
    showPeriodModal,
    isPeriodChanging,
    isWeekChanging,
    
    // Data
    nutrientData,
    weeklyTotals,
    weightEntries,
    bodyMeasurements,
    isLoading,
    dateRange,
    
    // Handlers
    handleWeekChange,
    handlePeriodChange,
    handleModalClose,
    handleCalendarPress,
  };
}