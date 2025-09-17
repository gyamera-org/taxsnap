import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAccount } from '@/lib/hooks/use-accounts';
import { useTheme } from '@/context/theme-provider';
import {
  CosmicGradient,
  getNutritionCosmicGradient,
  getExerciseCosmicGradient,
  getCycleCosmicGradient,
} from '@/components/ui/cosmic-gradient';
import { getCyclePhaseForDate, PeriodLog } from '@/lib/utils/cycle-utils';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  loggedDates?: string[];
  theme?: 'nutrition' | 'exercise' | 'cycle';
  periodLogs?: PeriodLog[];
  cycleSettings?: { cycle_length?: number; period_length?: number } | null;
}

export default function WeeklyCalendar({
  selectedDate,
  onDateSelect,
  loggedDates = [],
  theme = 'nutrition',
  periodLogs = [],
  cycleSettings = null,
}: WeeklyCalendarProps) {
  // Add defensive check for selectedDate
  if (!selectedDate || isNaN(selectedDate.getTime())) {
    console.warn('WeeklyCalendar: Invalid selectedDate provided:', selectedDate);
    return null;
  }

  const { data: account } = useAccount();
  const { isDark } = useTheme();

  const themeColors = {
    nutrition: {
      selected: isDark ? 'bg-green-600 shadow-lg' : 'bg-green-500 shadow-md',
      todayBg: isDark
        ? 'bg-green-900 border border-gray-700'
        : 'bg-green-50 border border-green-200',
      selectedText: 'text-white',
      todayText: isDark ? 'text-green-300' : 'text-green-600',
      gradientColors: ['#10B981', '#059669', '#047857'], // Green gradient
    },
    exercise: {
      selected: isDark ? 'bg-purple-600 shadow-lg' : 'bg-purple-500 shadow-md',
      todayBg: isDark
        ? 'bg-purple-900 border border-purple-700'
        : 'bg-purple-50 border border-purple-200',
      selectedText: 'text-white',
      todayText: isDark ? 'text-purple-300' : 'text-purple-600',
      gradientColors: ['#8B5CF6', '#7C3AED', '#6D28D9'], // Purple gradient
    },
    cycle: {
      selected: isDark ? 'bg-pink-600 shadow-lg' : 'bg-pink-500 shadow-md',
      todayBg: isDark ? 'bg-pink-900 border border-gray-700' : 'bg-pink-50 border border-pink-200',
      selectedText: 'text-white',
      todayText: isDark ? 'text-pink-300' : 'text-pink-600',
      gradientColors: ['#EC4899', '#DB2777', '#BE185D'], // Pink gradient
    },
  };
  const colors = themeColors[theme];

  // ---- Helpers (day-level comparisons) ----
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    // Ensure we have a valid date
    if (isNaN(x.getTime())) {
      return new Date(); // Return current date if invalid
    }
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    // Ensure we have a valid date before manipulation
    if (isNaN(x.getTime())) {
      return new Date(); // Return current date if invalid
    }
    x.setDate(x.getDate() + n);
    // Ensure the result is still a valid date
    if (isNaN(x.getTime())) {
      return new Date(); // Return current date if result is invalid
    }
    return x;
  };
  const minDate = (a: Date, b: Date) => (a < b ? a : b);
  const maxDate = (a: Date, b: Date) => (a > b ? a : b);

  const today = startOfDay(new Date());
  const signupDate = account?.created_at ? startOfDay(new Date(account.created_at)) : null;

  const isToday = (date: Date) => startOfDay(date).getTime() === today.getTime();
  const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
  const isAfterToday = (date: Date) => startOfDay(date).getTime() > today.getTime();
  const isBeforeSignup = (date: Date) =>
    signupDate ? startOfDay(date).getTime() < signupDate.getTime() : false;

  const hasLoggedEntry = (date: Date) => {
    // local YYYY-MM-DD (avoid UTC off-by-one)
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return loggedDates.includes(`${yyyy}-${mm}-${dd}`);
  };

  // Get moon phase for cycle tracking
  const getMoonPhase = (date: Date) => {
    if (theme !== 'cycle' || !periodLogs || !cycleSettings) return null;

    const cyclePhase = getCyclePhaseForDate(date, periodLogs, cycleSettings);
    if (!cyclePhase) return null;

    const { phase } = cyclePhase;
    const moonPhases = {
      menstrual: '🌑', // New moon - menstrual phase
      follicular: '🌒', // Waxing crescent - follicular phase
      ovulatory: '🌕', // Full moon - ovulatory phase
      luteal: '🌖', // Waning gibbous - luteal phase
    };

    return moonPhases[phase] || null;
  };

  const getDayName = (date: Date) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[date.getDay()];
  };

  // ---- Generate week window ----
  // Clamp center to [signupDate .. today]
  const rawCenter = startOfDay(selectedDate);
  const lowerBound = signupDate ?? rawCenter; // if no account yet, don't restrict past
  const boundedCenter = maxDate(rawCenter, lowerBound);
  const effectiveCenter = minDate(boundedCenter, today);

  // Window: 5 days before center ... 1 day after center (total 7)
  const generateWeekDays = (centerDate: Date) => {
    const days: Date[] = [];
    const startDate = addDays(centerDate, -5);
    for (let i = 0; i < 7; i++) days.push(addDays(startDate, i));
    return days;
  };

  const weekDays = generateWeekDays(effectiveCenter);

  const containerBg = isDark
    ? 'bg-gray-900/80 border border-gray-600/60' // Much more opaque with darker border
    : 'bg-white/95 border border-gray-300/70'; // Nearly opaque for light mode

  // Get cosmic gradient based on theme
  const getCosmicGradient = () => {
    switch (theme) {
      case 'cycle':
        return getCycleCosmicGradient(isDark);
      case 'exercise':
        return getExerciseCosmicGradient(isDark);
      case 'nutrition':
      default:
        return getNutritionCosmicGradient(isDark);
    }
  };

  const gradientBg = getCosmicGradient();

  return (
    <View className="mx-4 mb-8">
      <CosmicGradient
        colors={gradientBg}
        theme={theme}
        className="rounded-2xl shadow-2xl"
        style={{
          shadowColor: isDark ? '#000000' : '#374151',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.8 : 0.25,
          shadowRadius: 20,
          elevation: 12,
        }}
        animate
      >
        <View
          className={`${containerBg} rounded-2xl px-5 py-4 backdrop-blur-lg`}
          style={{
            shadowColor: isDark ? '#ffffff' : '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.1 : 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="flex-row justify-between">
            {weekDays.map((date, index) => {
              const disabled = isAfterToday(date) || isBeforeSignup(date);
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const hasLogs = hasLoggedEntry(date);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    try {
                      if (!disabled && !isNaN(date.getTime())) {
                        onDateSelect(date);
                      }
                    } catch (error) {
                      console.warn('WeeklyCalendar: Error in onPress handler:', error);
                    }
                  }}
                  className={`items-center flex-1 ${disabled ? 'opacity-40' : ''}`}
                  activeOpacity={0.7}
                  disabled={disabled}
                >
                  {/* Day letter */}
                  <Text
                    className={`${
                      isDark ? 'text-gray-400' : 'text-gray-400'
                    } text-xs font-medium mb-3 uppercase tracking-wide`}
                  >
                    {getDayName(date)}
                  </Text>

                  {/* Date container */}
                  <View className="relative">
                    <View
                      className={`w-12 h-12 rounded-xl items-center justify-center ${
                        isSelected
                          ? colors.selected
                          : isTodayDate
                          ? colors.todayBg
                          : hasLogs
                          ? theme === 'cycle'
                            ? isDark
                              ? 'bg-pink-900 border border-gray-700'
                              : 'bg-pink-50 border border-pink-200'
                            : isDark
                            ? 'bg-orange-900 border border-orange-700'
                            : 'bg-orange-50 border border-orange-200'
                          : isDark
                          ? 'bg-gray-700'
                          : 'bg-gray-50'
                      }`}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          isSelected
                            ? colors.selectedText
                            : isTodayDate
                            ? colors.todayText
                            : hasLogs
                            ? theme === 'cycle'
                              ? isDark
                                ? 'text-pink-300'
                                : 'text-pink-600'
                              : isDark
                              ? 'text-orange-300'
                              : 'text-orange-600'
                            : isDark
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {date.getDate()}
                      </Text>
                    </View>

                    {/* Moon phase indicator for cycle theme */}
                    {theme === 'cycle' && getMoonPhase(date) && (
                      <View className="absolute -top-1 -right-1">
                        <Text className="text-xs">{getMoonPhase(date)}</Text>
                      </View>
                    )}

                    {/* Activity indicator dot */}
                    {hasLogs && !isSelected && (
                      <View className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <View
                          className={`w-1.5 h-1.5 rounded-full ${
                            isTodayDate
                              ? theme === 'cycle'
                                ? isDark
                                  ? 'bg-pink-300'
                                  : 'bg-pink-400'
                                : isDark
                                ? 'bg-green-300'
                                : 'bg-green-400'
                              : theme === 'cycle'
                              ? isDark
                                ? 'bg-pink-300'
                                : 'bg-pink-400'
                              : isDark
                              ? 'bg-orange-300'
                              : 'bg-orange-400'
                          }`}
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </CosmicGradient>
    </View>
  );
}
