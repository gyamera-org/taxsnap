/**
 * Cycle-related utility functions
 * These functions handle period cycle calculations, date formatting, and data processing
 */

// Types for period logs and cycles
export interface PeriodLog {
  date: string;
  is_start_day: boolean;
  notes?: string;
  mood?: string;
  symptoms?: string[];
  [key: string]: any;
}

export interface PeriodCycle {
  start: string;
  end: string | null;
}

export interface NextPeriodPrediction {
  date: string;
  daysUntil: number;
  avgCycleLength: number;
  cyclesUsed: number;
  predictedPeriodDates: string[];
}

export interface CyclePhase {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  day_in_cycle: number;
  cycle_length: number;
}

export interface PregnancyChances {
  level: string;
  color: string;
  description: string;
}

/**
 * Get recent period logs for calendar indicators
 */
export function getLoggedDates(periodLogs: PeriodLog[]): string[] {
  return periodLogs.map((log) => log.date) || [];
}

/**
 * Get period start dates for calendar
 */
export function getStartDates(periodLogs: PeriodLog[]): string[] {
  return periodLogs.filter((log) => log.is_start_day).map((log) => log.date) || [];
}

/**
 * Get period end dates for calendar
 */
export function getEndDates(periodLogs: PeriodLog[]): string[] {
  return (
    periodLogs
      .filter((log) => !log.is_start_day && log.notes?.includes('Period ended'))
      .map((log) => log.date) || []
  );
}

/**
 * Get the most recent period start date
 */
export function getLastPeriodStart(periodLogs: PeriodLog[]): string | null {
  const startDates = getStartDates(periodLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  return startDates.length > 0 ? startDates[0] : null;
}

/**
 * Get properly matched period cycles (start-end pairs)
 */
export function getPeriodCycles(periodLogs: PeriodLog[]): PeriodCycle[] {
  const startDates = getStartDates(periodLogs).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const endDates = getEndDates(periodLogs).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const cycles: PeriodCycle[] = [];

  // Match each start date with the next chronological end date
  startDates.forEach((startDate) => {
    const start = new Date(startDate);

    // Find the first end date that comes after this start date
    const correspondingEndDate = endDates.find((endDate) => {
      const end = new Date(endDate);
      return end > start;
    });

    cycles.push({
      start: startDate,
      end: correspondingEndDate || null,
    });
  });

  return cycles;
}

/**
 * Get all period days (including days between start and end dates)
 */
export function getAllPeriodDays(periodLogs: PeriodLog[]): string[] {
  const cycles = getPeriodCycles(periodLogs);
  const allPeriodDays = new Set<string>();

  cycles.forEach((cycle) => {
    if (cycle.start) {
      const start = new Date(cycle.start);

      if (cycle.end) {
        // Complete cycle: fill all days from start to end
        const end = new Date(cycle.end);
        const currentDate = new Date(start);

        while (currentDate <= end) {
          const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
          allPeriodDays.add(dateString);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // Ongoing cycle: just add the start date
        allPeriodDays.add(cycle.start);
      }
    }
  });

  return Array.from(allPeriodDays).sort();
}

/**
 * Check if there's an ongoing period (started but not explicitly ended)
 */
export function hasOngoingPeriod(periodLogs: PeriodLog[]): boolean {
  const lastPeriodStart = getLastPeriodStart(periodLogs);
  if (!lastPeriodStart) return false;

  // Check if there are any period logs after the start date that could indicate the end
  const startDate = new Date(lastPeriodStart);
  const periodDays = periodLogs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate >= startDate;
  });

  // If we only have start days or no explicit end marker, period is ongoing
  const hasEndMarker = periodDays.some(
    (log) => !log.is_start_day && log.notes?.includes('Period ended')
  );

  if (hasEndMarker) return false;

  // Safety check: don't consider period ongoing if more than 10 days since start
  const daysSinceStart = Math.floor(
    (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceStart <= 10;
}

/**
 * Calculate next period prediction using complete cycles (start to start)
 */
export function getNextPeriodPrediction(
  periodLogs: PeriodLog[],
  cycleSettings: { cycle_length?: number; period_length?: number } | null,
  referenceDate: Date = new Date()
): NextPeriodPrediction | null {
  const cycles = getPeriodCycles(periodLogs);
  if (cycles.length === 0) return null;

  // Use last 3-5 complete cycles for prediction
  let avgCycleLength = cycleSettings?.cycle_length || 28;
  let cyclesUsed = 0;

  // Get completed cycles (cycles that have ended)
  const completedCycles = cycles.filter((cycle) => cycle.end !== null);

  if (completedCycles.length >= 1) {
    // Calculate cycle lengths from completed cycles
    const cycleLengths: number[] = [];

    // Add cycle lengths from start to start
    const startDates = cycles
      .map((c) => c.start)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    for (let i = 1; i < startDates.length; i++) {
      const prevStart = new Date(startDates[i - 1]);
      const currentStart = new Date(startDates[i]);
      const daysBetween = Math.floor(
        (currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Valid cycle length between 21-35 days
      if (daysBetween >= 21 && daysBetween <= 35) {
        cycleLengths.push(daysBetween);
      }
    }

    if (cycleLengths.length > 0) {
      // Use the most recent cycles (up to 5) for prediction
      const recentCycles = cycleLengths.slice(-5); // Last 5 cycles
      const totalDays = recentCycles.reduce((sum, days) => sum + days, 0);
      cyclesUsed = recentCycles.length;
      avgCycleLength = Math.round(totalDays / cyclesUsed);
    }
  }

  // Get the most recent period start date
  const sortedStarts = cycles
    .map((c) => c.start)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const lastStart = sortedStarts[0];

  if (!lastStart) return null;

  // Calculate next predicted date
  const lastStartDate = new Date(lastStart);
  const nextPredictedDate = new Date(lastStartDate);
  nextPredictedDate.setDate(nextPredictedDate.getDate() + avgCycleLength);

  // Calculate days until next period relative to the reference date
  const daysUntilNext = Math.ceil(
    (nextPredictedDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Generate predicted period dates (5-day period by default)
  const predictedPeriodDates: string[] = [];
  for (let i = 0; i < (cycleSettings?.period_length || 5); i++) {
    const predDate = new Date(nextPredictedDate);
    predDate.setDate(predDate.getDate() + i);
    predictedPeriodDates.push(predDate.toISOString().split('T')[0]);
  }

  return {
    date: nextPredictedDate.toISOString().split('T')[0],
    daysUntil: daysUntilNext,
    avgCycleLength,
    cyclesUsed,
    predictedPeriodDates,
  };
}

/**
 * Calculate cycle phase for any given date
 */
export function getCyclePhaseForDate(
  date: Date,
  periodLogs: PeriodLog[],
  cycleSettings: { cycle_length?: number; period_length?: number } | null
): CyclePhase | undefined {
  if (!cycleSettings) return undefined;

  const lastPeriodStart = getLastPeriodStart(periodLogs);
  if (!lastPeriodStart) return undefined;

  const startDate = new Date(lastPeriodStart);
  const targetDate = new Date(date);

  // Calculate days since last period start
  const daysSinceStart =
    Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const cycleLength = cycleSettings.cycle_length || 28;
  const periodLength = cycleSettings.period_length || 5;

  // Check if the selected date is before the last period start (no cycle data)
  if (daysSinceStart <= 0) return undefined;

  // Check if we're too far beyond a reasonable cycle range
  // Only show data for current cycle or if it's a logged period day
  const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  const isLoggedPeriodDay = getAllPeriodDays(periodLogs).includes(dateString);

  // If it's not a logged period day and it's beyond the current cycle, don't show data
  if (!isLoggedPeriodDay && daysSinceStart > cycleLength) {
    return undefined;
  }

  // Normalize the day within the cycle
  let dayInCycle = ((daysSinceStart - 1) % cycleLength) + 1;
  if (dayInCycle <= 0) dayInCycle += cycleLength;

  // Determine phase based on day in cycle
  let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

  if (dayInCycle <= periodLength) {
    phase = 'menstrual';
  } else if (dayInCycle <= 13) {
    phase = 'follicular';
  } else if (dayInCycle <= 16) {
    phase = 'ovulatory';
  } else {
    phase = 'luteal';
  }

  return {
    phase,
    day_in_cycle: dayInCycle,
    cycle_length: cycleLength,
  };
}

/**
 * Calculate pregnancy chances based on cycle phase for selected date
 */
export function getPregnancyChances(
  date: Date,
  periodLogs: PeriodLog[],
  cycleSettings: { cycle_length?: number; period_length?: number } | null
): PregnancyChances {
  const cyclePhase = getCyclePhaseForDate(date, periodLogs, cycleSettings);
  if (!cyclePhase) return { level: 'Unknown', color: '#6B7280', description: 'No cycle data' };

  const { day_in_cycle } = cyclePhase;

  // Pregnancy chances based on cycle day
  if (day_in_cycle <= 5) {
    // Menstrual phase - very low chance
    return {
      level: 'Very Low',
      color: '#10B981',
      description: 'Menstrual phase - very low fertility',
    };
  } else if (day_in_cycle <= 9) {
    // Early follicular - low chance
    return {
      level: 'Low',
      color: '#10B981',
      description: 'Early follicular phase - low fertility',
    };
  } else if (day_in_cycle <= 11) {
    // Late follicular - increasing chance
    return {
      level: 'Medium',
      color: '#F59E0B',
      description: 'Late follicular phase - fertility increasing',
    };
  } else if (day_in_cycle >= 12 && day_in_cycle <= 16) {
    // Ovulatory phase - highest chance
    return {
      level: 'High',
      color: '#EF4444',
      description: 'Ovulatory phase - peak fertility window',
    };
  } else if (day_in_cycle <= 21) {
    // Early luteal - medium chance
    return {
      level: 'Medium',
      color: '#F59E0B',
      description: 'Early luteal phase - moderate fertility',
    };
  } else {
    // Late luteal - low chance
    return {
      level: 'Low',
      color: '#10B981',
      description: 'Late luteal phase - low fertility',
    };
  }
}

/**
 * Format selected date for display
 */
export function formatSelectedDate(date: Date): string {
  const isToday = date.toDateString() === new Date().toDateString();
  const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
  const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  if (isTomorrow) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get mood data for selected date
 */
export function getMoodDataForDate(date: Date, periodLogs: PeriodLog[]) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  const moodLog = periodLogs.find((log) => log.date === dateString && log.mood);

  if (moodLog && moodLog.mood) {
    // Extract energy level from notes (format: "Energy: high | user notes")
    let energy_level = 'medium';
    let userNotes = moodLog.notes;

    if (moodLog.notes && moodLog.notes.includes('Energy:')) {
      const energyMatch = moodLog.notes.match(/Energy:\s*(high|medium|low)/);
      if (energyMatch) {
        energy_level = energyMatch[1];
        // Remove energy and any severity info from notes to get just user notes
        userNotes = moodLog.notes
          .replace(/Energy:\s*(high|medium|low)\s*\|\s*/, '')
          .replace(/Severity:\s*(mild|moderate|severe)\s*\|\s*/, '')
          .replace(/Severity:\s*(mild|moderate|severe)/, '')
          .trim();
        if (userNotes === `Energy: ${energy_level}` || userNotes.startsWith('Severity:')) {
          userNotes = undefined; // If only energy/severity was stored
        }
      }
    }

    return {
      mood: moodLog.mood,
      energy_level,
      notes: userNotes,
    };
  }

  return undefined;
}

/**
 * Get symptom data for selected date
 */
export function getSymptomDataForDate(date: Date, periodLogs: PeriodLog[]) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  const symptomLog = periodLogs.find(
    (log) => log.date === dateString && log.symptoms && log.symptoms.length > 0
  );

  if (symptomLog && symptomLog.symptoms && symptomLog.symptoms.length > 0) {
    // Extract severity from notes (format: "Severity: moderate | user notes")
    let severity: 'mild' | 'moderate' | 'severe' | undefined = undefined;
    let userNotes = symptomLog.notes;

    if (symptomLog.notes && symptomLog.notes.includes('Severity:')) {
      const severityMatch = symptomLog.notes.match(/Severity:\s*(mild|moderate|severe)/);
      if (severityMatch) {
        severity = severityMatch[1] as 'mild' | 'moderate' | 'severe';
        // Remove severity from notes to get just user notes
        userNotes = symptomLog.notes
          .replace(/Severity:\s*(mild|moderate|severe)\s*\|\s*/, '')
          .trim();
        if (userNotes === `Severity: ${severity}`) {
          userNotes = undefined; // If only severity was stored
        }
      }
    }

    return {
      symptoms: symptomLog.symptoms,
      severity,
      notes: userNotes,
    };
  }

  return undefined;
}
