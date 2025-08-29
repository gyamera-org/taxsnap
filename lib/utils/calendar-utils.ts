/**
 * Utility functions for calendar components
 */

/**
 * Get the static week range (last 5 days + today + tomorrow)
 * This ensures both WeeklyCalendar and parent components use the same date range
 */
export function getStaticWeekRange() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 5);
  const end = new Date(today);
  end.setDate(today.getDate() + 1);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    dates: generateWeekDays(),
  };
}

/**
 * Generate the 7 static days (last 5 days + today + tomorrow)
 */
export function generateWeekDays(): Date[] {
  const days = [];
  const today = new Date();

  // Last 5 days + today + tomorrow = 7 days
  for (let i = -5; i <= 1; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    days.push(day);
  }

  return days;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}
