import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAccount } from '@/lib/hooks/use-accounts';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  loggedDates?: string[];
  theme?: 'nutrition' | 'exercise';
}

export default function WeeklyCalendar({
  selectedDate,
  onDateSelect,
  loggedDates = [],
  theme = 'nutrition',
}: WeeklyCalendarProps) {
  const { data: account } = useAccount();

  const themeColors = {
    nutrition: {
      selected: 'bg-green-500 shadow-md',
      todayBg: 'bg-green-50 border border-green-200',
      selectedText: 'text-white',
      todayText: 'text-green-600',
    },
    exercise: {
      selected: 'bg-purple-500 shadow-md',
      todayBg: 'bg-purple-50 border border-purple-200',
      selectedText: 'text-white',
      todayText: 'text-purple-600',
    },
  };
  const colors = themeColors[theme];

  // ---- Helpers (day-level comparisons) ----
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const minDate = (a: Date, b: Date) => (a < b ? a : b);
  const maxDate = (a: Date, b: Date) => (a > b ? a : b);

  const today = startOfDay(new Date());
  const tomorrow = startOfDay(addDays(today, 1)); // MAX future
  const signupDate = account?.created_at ? startOfDay(new Date(account.created_at)) : null;

  const isToday = (date: Date) => startOfDay(date).getTime() === today.getTime();
  const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
  const isAfterTomorrow = (date: Date) => startOfDay(date).getTime() > tomorrow.getTime();
  const isBeforeSignup = (date: Date) =>
    signupDate ? startOfDay(date).getTime() < signupDate.getTime() : false;

  const hasLoggedEntry = (date: Date) => {
    // local YYYY-MM-DD (avoid UTC off-by-one)
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return loggedDates.includes(`${yyyy}-${mm}-${dd}`);
  };

  const getDayName = (date: Date) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[date.getDay()];
  };

  // ---- Generate week window ----
  // Clamp center to [signupDate .. tomorrow]
  const rawCenter = startOfDay(selectedDate);
  const lowerBound = signupDate ?? rawCenter; // if no account yet, don't restrict past
  const boundedCenter = maxDate(rawCenter, lowerBound);
  const effectiveCenter = minDate(boundedCenter, tomorrow);

  // Window: 5 days before center ... 1 day after center (total 7)
  const generateWeekDays = (centerDate: Date) => {
    const days: Date[] = [];
    const startDate = addDays(centerDate, -5);
    for (let i = 0; i < 7; i++) days.push(addDays(startDate, i));
    return days;
  };

  const weekDays = generateWeekDays(effectiveCenter);

  return (
    <View className="mx-4 mb-8">
      <View className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-50">
        <View className="flex-row justify-between">
          {weekDays.map((date, index) => {
            const disabled = isAfterTomorrow(date) || isBeforeSignup(date);
            const isSelected = isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);
            const hasLogs = hasLoggedEntry(date);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (!disabled) onDateSelect(date);
                }}
                className={`items-center flex-1 ${disabled ? 'opacity-40' : ''}`}
                activeOpacity={0.7}
                disabled={disabled}
              >
                {/* Day letter */}
                <Text className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wide">
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
                            ? 'bg-orange-50 border border-orange-200'
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
                              ? 'text-orange-600'
                              : 'text-gray-500'
                      }`}
                    >
                      {date.getDate()}
                    </Text>
                  </View>

                  {/* Activity indicator dot */}
                  {hasLogs && !isSelected && (
                    <View className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <View
                        className={`w-1.5 h-1.5 rounded-full ${
                          isTodayDate ? 'bg-green-400' : 'bg-orange-400'
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
    </View>
  );
}
