import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import SubPageLayout from '@/components/layouts/sub-page';
import {
  Calendar,
  Heart,
  Zap,
  TrendingUp,
  Activity,
  Coffee,
  Moon,
  Sun,
  X,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';

interface PeriodLog {
  date: string;
  isStartDay: boolean;
  symptoms: string[];
  flow?: 'light' | 'moderate' | 'heavy';
  mood?: 'happy' | 'sad' | 'irritable' | 'anxious' | 'normal';
  notes?: string;
}

interface CyclePhase {
  name: string;
  description: string;
  icon: any;
  color: string;
  recommendations: {
    exercise: string[];
    nutrition: string[];
    selfCare: string[];
  };
}

const cyclePhases: { [key: string]: CyclePhase } = {
  menstrual: {
    name: 'Menstrual Phase',
    description: 'Days 1-5: Your period',
    icon: Moon,
    color: '#DC2626',
    recommendations: {
      exercise: ['Gentle yoga', 'Light walking', 'Stretching', 'Meditation'],
      nutrition: [
        'Iron-rich foods',
        'Dark chocolate',
        'Warm herbal teas',
        'Anti-inflammatory foods',
      ],
      selfCare: [
        'Use heating pad',
        'Take warm baths',
        'Get extra rest',
        'Practice self-compassion',
      ],
    },
  },
  follicular: {
    name: 'Follicular Phase',
    description: 'Days 1-13: Energy building',
    icon: TrendingUp,
    color: '#059669',
    recommendations: {
      exercise: [
        'Cardio workouts',
        'Strength training',
        'High-intensity workouts',
        'New activities',
      ],
      nutrition: ['Lean proteins', 'Complex carbs', 'Fresh fruits', 'Probiotics'],
      selfCare: ['Try new hobbies', 'Social activities', 'Goal setting', 'Creative projects'],
    },
  },
  ovulatory: {
    name: 'Ovulatory Phase',
    description: 'Days 14-16: Peak energy',
    icon: Sun,
    color: '#F59E0B',
    recommendations: {
      exercise: [
        'High-intensity training',
        'Group fitness',
        'Challenging workouts',
        'Outdoor activities',
      ],
      nutrition: [
        'Antioxidant-rich foods',
        'Healthy fats',
        'Colorful vegetables',
        'Adequate hydration',
      ],
      selfCare: ['Schedule important meetings', 'Social events', 'Public speaking', 'Date nights'],
    },
  },
  luteal: {
    name: 'Luteal Phase',
    description: 'Days 17-28: Winding down',
    icon: Moon,
    color: '#8B5CF6',
    recommendations: {
      exercise: ['Yoga', 'Pilates', 'Moderate cardio', 'Strength training'],
      nutrition: ['Complex carbs', 'Magnesium-rich foods', 'B-vitamins', 'Limit caffeine'],
      selfCare: ['Organize spaces', 'Meal prep', 'Early bedtime', 'Limit social obligations'],
    },
  },
};

const symptoms = [
  'Cramps',
  'Headache',
  'Bloating',
  'Breast tenderness',
  'Mood swings',
  'Fatigue',
  'Nausea',
  'Back pain',
  'Acne',
  'Food cravings',
  'Insomnia',
  'Anxiety',
];

const flowOptions = [
  { value: 'light', label: 'Light', color: '#FCA5A5' },
  { value: 'moderate', label: 'Moderate', color: '#F87171' },
  { value: 'heavy', label: 'Heavy', color: '#EF4444' },
];

const moodOptions = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'normal', label: 'Normal', emoji: '😐' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'irritable', label: 'Irritable', emoji: '😤' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
];

export default function PeriodTrackerScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<CyclePhase | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal state
  const [isStartDay, setIsStartDay] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');

  // Generate calendar days for selected month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: i,
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
      setCurrentMonth(newMonth);
    } else if (direction === 'next') {
      // Only allow going to next month if it's not in the future
      const today = new Date();
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + 1);

      if (
        nextMonth.getMonth() <= today.getMonth() &&
        nextMonth.getFullYear() <= today.getFullYear()
      ) {
        setCurrentMonth(nextMonth);
      }
    }
  };

  const canNavigateNext = () => {
    const today = new Date();
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);

    return (
      nextMonth.getFullYear() < today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() <= today.getMonth())
    );
  };

  const getDayInfo = (date: string) => {
    return periodLogs.find((log) => log.date === date);
  };

  const getCurrentPhase = (date: string) => {
    // Find last period start
    const periodStarts = periodLogs
      .filter((log) => log.isStartDay)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (periodStarts.length === 0) return null;

    const lastPeriod = new Date(periodStarts[0].date);
    const currentDate = new Date(date);
    const daysDifference = Math.floor(
      (currentDate.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference >= 0 && daysDifference <= 5) return cyclePhases.menstrual;
    if (daysDifference >= 6 && daysDifference <= 13) return cyclePhases.follicular;
    if (daysDifference >= 14 && daysDifference <= 16) return cyclePhases.ovulatory;
    if (daysDifference >= 17 && daysDifference <= 28) return cyclePhases.luteal;

    return null;
  };

  const openLogModal = (date: string) => {
    setSelectedDate(date);
    const existingLog = getDayInfo(date);

    if (existingLog) {
      setIsStartDay(existingLog.isStartDay);
      setSelectedSymptoms(existingLog.symptoms);
      setSelectedFlow(existingLog.flow || '');
      setSelectedMood(existingLog.mood || '');
    } else {
      setIsStartDay(false);
      setSelectedSymptoms([]);
      setSelectedFlow('');
      setSelectedMood('');
    }

    setShowLogModal(true);
  };

  const closeLogModal = () => {
    setShowLogModal(false);
    setSelectedDate(null);
  };

  const saveLog = () => {
    if (!selectedDate) return;

    const newLog: PeriodLog = {
      date: selectedDate,
      isStartDay,
      symptoms: selectedSymptoms,
      flow: selectedFlow as any,
      mood: selectedMood as any,
    };

    setPeriodLogs((prev) => {
      const filtered = prev.filter((log) => log.date !== selectedDate);
      return [...filtered, newLog];
    });

    closeLogModal();
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const showRecommendations = (date: string) => {
    const phase = getCurrentPhase(date);
    if (phase) {
      setCurrentPhase(phase);
      setShowRecommendationsModal(true);
    }
  };

  const calendarDays = generateCalendarDays();
  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (periodLogs.length > 0) {
      router.back();
    }
  };

  return (
    <SubPageLayout
      title="Period Tracker"
      rightElement={
        <Button
          title="Log"
          onPress={handleSave}
          variant="primary"
          size="small"
          disabled={periodLogs.length === 0}
        />
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-4 py-8">
          {/* Current Phase Info */}
          {(() => {
            const phase = getCurrentPhase(today);
            if (phase) {
              const PhaseIcon = phase.icon;
              return (
                <TouchableOpacity
                  onPress={() => showRecommendations(today)}
                  className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100"
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: `${phase.color}20` }}
                    >
                      <PhaseIcon size={20} color={phase.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-black">{phase.name}</Text>
                      <Text className="text-gray-500 text-sm">{phase.description}</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-400 text-center mt-2">
                    Tap for recommendations
                  </Text>
                </TouchableOpacity>
              );
            }
            return null;
          })()}

          {/* Calendar */}
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => navigateMonth('prev')}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <ChevronLeft size={20} color="#6B7280" />
              </TouchableOpacity>

              <View className="flex-row items-center">
                <Calendar size={16} color="#EC4899" />
                <Text className="text-lg font-semibold text-black ml-2">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => navigateMonth('next')}
                disabled={!canNavigateNext()}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <ChevronRight size={20} color={canNavigateNext() ? '#6B7280' : '#D1D5DB'} />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <View key={day} className="w-[14.28%] p-2">
                  <Text className="text-xs text-gray-500 text-center font-medium">{day}</Text>
                </View>
              ))}

              {calendarDays.map((dayData, index) => {
                if (!dayData) {
                  // Empty cell for days before the first day of the month
                  return <View key={`empty-${index}`} className="w-[14.28%] p-2" />;
                }

                const { date, day, isToday } = dayData;
                const dayInfo = getDayInfo(date);
                const phase = getCurrentPhase(date);

                return (
                  <TouchableOpacity
                    key={date}
                    onPress={() => openLogModal(date)}
                    className="w-[14.28%] p-2"
                  >
                    <View
                      className={`
                        w-8 h-8 rounded-full items-center justify-center mx-auto
                        ${isToday ? 'border-2 border-pink-500' : ''}
                        ${dayInfo?.isStartDay ? 'bg-red-500' : ''}
                        ${dayInfo && !dayInfo.isStartDay ? 'bg-pink-100' : ''}
                      `}
                    >
                      <Text
                        className={`
                          text-sm font-medium
                          ${dayInfo?.isStartDay ? 'text-white' : ''}
                          ${dayInfo && !dayInfo.isStartDay ? 'text-pink-700' : 'text-black'}
                        `}
                      >
                        {day}
                      </Text>
                    </View>

                    {/* Symptoms indicator */}
                    {dayInfo && dayInfo.symptoms.length > 0 && (
                      <View className="flex-row justify-center mt-1">
                        <View className="w-1 h-1 bg-orange-400 rounded-full" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View className="mt-4 pt-4 border-t border-gray-100">
              <Text className="text-xs text-gray-500 mb-2">Legend:</Text>
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  <Text className="text-xs text-gray-600">Period start</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-pink-100 rounded-full mr-2" />
                  <Text className="text-xs text-gray-600">Logged data</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-orange-400 rounded-full mr-2" />
                  <Text className="text-xs text-gray-600">Symptoms</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-black mb-4">Cycle Overview</Text>

            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Heart size={20} color="#EC4899" />
                <Text className="text-sm text-gray-500 mt-1">Last Period</Text>
                <Text className="text-base font-semibold text-black">
                  {(() => {
                    const lastPeriod = periodLogs
                      .filter((log) => log.isStartDay)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                    if (lastPeriod) {
                      const date = new Date(lastPeriod.date);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                    return 'Not logged';
                  })()}
                </Text>
              </View>

              <View className="flex-1 items-center">
                <Zap size={20} color="#F59E0B" />
                <Text className="text-sm text-gray-500 mt-1">Cycle Day</Text>
                <Text className="text-base font-semibold text-black">
                  {(() => {
                    const phase = getCurrentPhase(today);
                    if (phase) {
                      const lastPeriod = periodLogs
                        .filter((log) => log.isStartDay)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                      if (lastPeriod) {
                        const daysDiff =
                          Math.floor(
                            (new Date(today).getTime() - new Date(lastPeriod.date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1;
                        return `Day ${daysDiff}`;
                      }
                    }
                    return '--';
                  })()}
                </Text>
              </View>

              <View className="flex-1 items-center">
                <Activity size={20} color="#10B981" />
                <Text className="text-sm text-gray-500 mt-1">Avg. Cycle</Text>
                <Text className="text-base font-semibold text-black">28 days</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Log Modal */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={closeLogModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-8 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-black">
                Log for{' '}
                {selectedDate &&
                  new Date(selectedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
              </Text>
              <TouchableOpacity onPress={closeLogModal}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Period Start */}
              <View className="mb-6">
                <Text className="text-base font-medium text-black mb-3">Period Start</Text>
                <TouchableOpacity
                  onPress={() => setIsStartDay(!isStartDay)}
                  className="flex-row items-center"
                >
                  {isStartDay ? (
                    <CheckCircle2 size={24} color="#EC4899" />
                  ) : (
                    <Circle size={24} color="#9CA3AF" />
                  )}
                  <Text className="text-black ml-3">This is the first day of my period</Text>
                </TouchableOpacity>
              </View>

              {/* Flow */}
              {isStartDay && (
                <View className="mb-6">
                  <Text className="text-base font-medium text-black mb-3">Flow</Text>
                  <View className="flex-row gap-3">
                    {flowOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setSelectedFlow(option.value)}
                        className={`
                          flex-1 p-3 rounded-xl border
                          ${selectedFlow === option.value ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}
                        `}
                      >
                        <View
                          className="w-4 h-4 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: option.color }}
                        />
                        <Text
                          className={`
                          text-center font-medium
                          ${selectedFlow === option.value ? 'text-pink-700' : 'text-gray-700'}
                        `}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Symptoms */}
              <View className="mb-6">
                <Text className="text-base font-medium text-black mb-3">Symptoms</Text>
                <View className="flex-row flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <TouchableOpacity
                      key={symptom}
                      onPress={() => toggleSymptom(symptom)}
                      className={`
                        px-3 py-2 rounded-lg border
                        ${
                          selectedSymptoms.includes(symptom)
                            ? 'bg-pink-50 border-pink-200'
                            : 'bg-gray-50 border-gray-200'
                        }
                      `}
                    >
                      <Text
                        className={`
                        text-sm font-medium
                        ${selectedSymptoms.includes(symptom) ? 'text-pink-700' : 'text-gray-700'}
                      `}
                      >
                        {symptom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Mood */}
              <View className="mb-6">
                <Text className="text-base font-medium text-black mb-3">Mood</Text>
                <View className="flex-row gap-2">
                  {moodOptions.map((mood) => (
                    <TouchableOpacity
                      key={mood.value}
                      onPress={() => setSelectedMood(mood.value)}
                      className={`
                        flex-1 p-3 rounded-xl border items-center
                        ${selectedMood === mood.value ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}
                      `}
                    >
                      <Text className="text-2xl mb-1">{mood.emoji}</Text>
                      <Text
                        className={`
                        text-xs font-medium text-center
                        ${selectedMood === mood.value ? 'text-pink-700' : 'text-gray-700'}
                      `}
                      >
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <Button title="Save Log" onPress={saveLog} variant="primary" size="large" />
          </View>
        </View>
      </Modal>

      {/* Recommendations Modal */}
      <Modal
        visible={showRecommendationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecommendationsModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-8 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-black">{currentPhase?.name} Tips</Text>
              <TouchableOpacity onPress={() => setShowRecommendationsModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {currentPhase && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                  <Text className="text-gray-600 text-base leading-6">
                    {currentPhase.description}
                  </Text>
                </View>

                {/* Exercise Recommendations */}
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <Activity size={16} color="#10B981" />
                    <Text className="text-lg font-semibold text-black ml-2">Exercise</Text>
                  </View>
                  {currentPhase.recommendations.exercise.map((rec, index) => (
                    <Text key={index} className="text-gray-700 mb-1">
                      • {rec}
                    </Text>
                  ))}
                </View>

                {/* Nutrition Recommendations */}
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <Coffee size={16} color="#F59E0B" />
                    <Text className="text-lg font-semibold text-black ml-2">Nutrition</Text>
                  </View>
                  {currentPhase.recommendations.nutrition.map((rec, index) => (
                    <Text key={index} className="text-gray-700 mb-1">
                      • {rec}
                    </Text>
                  ))}
                </View>

                {/* Self-Care Recommendations */}
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <Heart size={16} color="#EC4899" />
                    <Text className="text-lg font-semibold text-black ml-2">Self-Care</Text>
                  </View>
                  {currentPhase.recommendations.selfCare.map((rec, index) => (
                    <Text key={index} className="text-gray-700 mb-1">
                      • {rec}
                    </Text>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
