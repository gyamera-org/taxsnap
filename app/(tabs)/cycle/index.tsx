import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { AIAssistant } from '@/components/ui/ai-assistant';
import PageLayout from '@/components/layouts/page-layout';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Calendar,
  TrendingUp,
  Clock,
  BarChart3,
  Moon,
  Sun,
  Zap,
  Plus,
  Activity,
  Droplets,
  Flower2,
} from 'lucide-react-native';

// Import our new components
import { FertilityWindow } from '@/components/cycle/FertilityWindow';
import { NextPeriodPrediction } from '@/components/cycle/NextPeriodPrediction';
import { CycleHistory } from '@/components/cycle/CycleHistory';
import { SupplementsTab } from '@/components/cycle/SupplementsTab';
import { MonthlyCalendar } from '@/components/cycle/MonthlyCalendar';

interface PeriodLog {
  date: string;
  isStartDay: boolean;
  symptoms: string[];
  flow?: 'light' | 'moderate' | 'heavy';
  mood?: 'happy' | 'sad' | 'irritable' | 'anxious' | 'normal';
}

const { width } = Dimensions.get('window');

// Simple chart component using SVG
const CycleChart = ({ data }: { data: number[] }) => {
  const chartWidth = width - 64;
  const chartHeight = 120;
  const maxValue = Math.max(...data, 35);

  return (
    <View className="bg-white rounded-xl p-4">
      <Text className="text-sm font-medium text-gray-600 mb-3">Cycle Length (Days)</Text>
      <View style={{ width: chartWidth, height: chartHeight }}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (chartHeight - 20);
          const barWidth = (chartWidth - 40) / data.length - 8;
          const x = 20 + index * (barWidth + 8);
          const y = chartHeight - barHeight - 10;

          return (
            <View key={index} className="absolute">
              <View
                style={{
                  left: x,
                  top: y,
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: '#EC4899',
                  borderRadius: 4,
                }}
              />
              <Text
                style={{
                  position: 'absolute',
                  left: x + barWidth / 2 - 8,
                  top: chartHeight - 8,
                  fontSize: 10,
                  color: '#6B7280',
                }}
              >
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const SymptomChart = ({ symptoms }: { symptoms: { [key: string]: number } }) => {
  const topSymptoms = Object.entries(symptoms)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <View className="bg-white rounded-xl p-4">
      <Text className="text-sm font-medium text-gray-600 mb-3">Common Symptoms</Text>
      <View className="gap-2">
        {topSymptoms.map(([symptom, count]) => (
          <View key={symptom} className="flex-row items-center">
            <Text className="text-sm text-gray-700 w-20">{symptom}</Text>
            <View className="flex-1 bg-gray-100 rounded-full h-2 mx-2">
              <View
                className="bg-pink-500 h-2 rounded-full"
                style={{ width: `${(count / Math.max(...Object.values(symptoms))) * 100}%` }}
              />
            </View>
            <Text className="text-xs text-gray-500 w-8">{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function CycleScreen() {
  const [activeTab, setActiveTab] = useState<'cycle' | 'supplements'>('cycle');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([
    { date: '2024-12-01', isStartDay: true, symptoms: ['Cramps', 'Mood swings'], flow: 'moderate' },
    { date: '2024-12-02', isStartDay: false, symptoms: ['Cramps'], flow: 'moderate' },
    { date: '2024-12-03', isStartDay: false, symptoms: ['Fatigue'], flow: 'light' },
    { date: '2024-11-03', isStartDay: true, symptoms: ['Headache'], flow: 'heavy' },
    { date: '2024-11-04', isStartDay: false, symptoms: ['Cramps'], flow: 'heavy' },
    { date: '2024-11-05', isStartDay: false, symptoms: ['Bloating'], flow: 'moderate' },
    { date: '2024-10-06', isStartDay: true, symptoms: ['Cramps', 'Fatigue'], flow: 'moderate' },
    { date: '2024-10-07', isStartDay: false, symptoms: ['Mood swings'], flow: 'moderate' },
    { date: '2024-09-09', isStartDay: true, symptoms: ['Cramps', 'Bloating'], flow: 'light' },
    { date: '2024-08-12', isStartDay: true, symptoms: ['Mood swings'], flow: 'moderate' },
  ]);

  // Sample supplements data
  const [supplementLogs] = useState([
    {
      name: 'Folic Acid',
      frequency: 'Daily',
      time: 'Morning',
      importance: 'high' as const,
      reminderTime: '08:00',
      days: ['Daily'],
    },
    {
      name: 'Iron',
      frequency: 'Daily',
      time: 'Evening',
      importance: 'medium' as const,
      reminderTime: '20:00',
      days: ['Daily'],
    },
    {
      name: 'Vitamin D',
      frequency: '3x/week',
      time: 'Morning',
      importance: 'medium' as const,
      reminderTime: '09:00',
      days: ['Monday', 'Wednesday', 'Friday'],
    },
    {
      name: 'Omega-3',
      frequency: 'Daily',
      time: 'With meals',
      importance: 'low' as const,
      reminderTime: '12:00',
      days: ['Daily'],
    },
  ]);

  const calculateCycleStats = () => {
    const periodStarts = periodLogs
      .filter((log) => log.isStartDay)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (periodStarts.length < 2) {
      return {
        averageCycle: 28,
        lastPeriod: periodStarts[0]?.date || null,
        nextPredicted: null,
        cycleRegularity: 'Insufficient data',
      };
    }

    // Calculate cycle lengths
    const cycleLengths = [];
    for (let i = 0; i < periodStarts.length - 1; i++) {
      const current = new Date(periodStarts[i].date);
      const previous = new Date(periodStarts[i + 1].date);
      const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      cycleLengths.push(diffDays);
    }

    const averageCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);

    // Predict next period
    const lastPeriodDate = new Date(periodStarts[0].date);
    const nextPredicted = new Date(lastPeriodDate);
    nextPredicted.setDate(lastPeriodDate.getDate() + averageCycle);

    // Calculate regularity
    const variance =
      cycleLengths.reduce((acc, length) => acc + Math.pow(length - averageCycle, 2), 0) /
      cycleLengths.length;
    const standardDeviation = Math.sqrt(variance);

    let regularity = 'Regular';
    if (standardDeviation > 7) regularity = 'Irregular';
    else if (standardDeviation > 4) regularity = 'Somewhat irregular';

    return {
      averageCycle,
      lastPeriod: periodStarts[0].date,
      nextPredicted: nextPredicted.toISOString().split('T')[0],
      cycleRegularity: regularity,
      cycleLengths,
    };
  };

  const getSymptomData = () => {
    const symptomCounts: { [key: string]: number } = {};

    periodLogs.forEach((log) => {
      log.symptoms.forEach((symptom) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    return symptomCounts;
  };

  const getCurrentPhase = () => {
    const stats = calculateCycleStats();
    if (!stats.lastPeriod) return null;

    const lastPeriod = new Date(stats.lastPeriod);
    const today = new Date();
    const daysSinceLastPeriod = Math.floor(
      (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod <= 5) {
      return { name: 'Menstrual', color: '#DC2626', icon: Moon, day: daysSinceLastPeriod + 1 };
    } else if (daysSinceLastPeriod >= 6 && daysSinceLastPeriod <= 13) {
      return {
        name: 'Follicular',
        color: '#059669',
        icon: TrendingUp,
        day: daysSinceLastPeriod + 1,
      };
    } else if (daysSinceLastPeriod >= 14 && daysSinceLastPeriod <= 16) {
      return { name: 'Ovulatory', color: '#F59E0B', icon: Sun, day: daysSinceLastPeriod + 1 };
    } else if (daysSinceLastPeriod >= 17 && daysSinceLastPeriod <= 28) {
      return { name: 'Luteal', color: '#8B5CF6', icon: Moon, day: daysSinceLastPeriod + 1 };
    }

    return null;
  };

  const getDaysUntilNextPeriod = () => {
    const stats = calculateCycleStats();
    if (!stats.nextPredicted) return null;

    const today = new Date();
    const nextPeriod = new Date(stats.nextPredicted);
    const daysUntil = Math.floor((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntil;
  };

  // Comprehensive cycle phases based on menstrual cycle science
  const getCyclePhases = () => {
    return [
      {
        name: 'Menstrual Phase',
        phase: 'menstrual' as const,
        dayRange: 'Days 1-5',
        days: [1, 2, 3, 4, 5],
        icon: Droplets,
        color: '#DC2626',
        bgColor: '#FEE2E2',
        fertilityLevel: 'low' as const,
        symptoms: ['Cramps', 'Fatigue', 'Heavy flow', 'Mood changes'],
        advice: ['Rest well', 'Stay hydrated', 'Use heat therapy', 'Gentle movement'],
        symptomExplanations: {
          Cramps:
            'Painful contractions of the uterus as it sheds its lining. Usually felt in the lower abdomen and back.',
          Fatigue:
            'Tiredness caused by hormonal changes and blood loss. Your body is working hard during menstruation.',
          'Heavy flow':
            'Normal menstrual bleeding that may be heavier in the first 2-3 days. Use appropriate protection.',
          'Mood changes':
            'Emotional fluctuations due to dropping estrogen and progesterone levels. Completely normal.',
        } as { [key: string]: string },
        detailedActivities: [
          'Gentle yoga or stretching to ease cramps',
          'Light walking for circulation',
          'Warm baths for pain relief',
          'Reading or journaling for relaxation',
          'Getting extra sleep (8-9 hours)',
          'Meditation or breathing exercises',
        ],
      },
      {
        name: 'Follicular Phase',
        phase: 'follicular' as const,
        dayRange: 'Days 6-13',
        days: [6, 7, 8, 9, 10, 11, 12, 13],
        icon: Sun,
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        fertilityLevel: 'high' as const,
        symptoms: ['High energy', 'Better mood', 'Clear skin', 'Motivation'],
        advice: ['Try new workouts', 'Be social', 'Start projects', 'High intensity exercise'],
        symptomExplanations: {
          'High energy':
            'Rising estrogen levels boost your energy and make you feel more active and alert.',
          'Better mood': 'Increasing estrogen improves mood, confidence, and overall well-being.',
          'Clear skin':
            'Estrogen helps improve skin texture and reduces breakouts during this phase.',
          Motivation:
            'Hormonal changes make you feel more driven and ready to tackle new challenges.',
        } as { [key: string]: string },
        detailedActivities: [
          'High-intensity interval training (HIIT)',
          'Strength training with heavier weights',
          'Dance classes or cardio workouts',
          'Social activities and networking',
          'Learning new skills or hobbies',
          'Starting new projects or goals',
        ],
      },
      {
        name: 'Ovulation Phase',
        phase: 'ovulation' as const,
        dayRange: 'Days 14-16',
        days: [14, 15, 16],
        icon: Flower2,
        color: '#EC4899',
        bgColor: '#FCE7F3',
        fertilityLevel: 'peak' as const,
        symptoms: ['Ovulation pain', 'Higher libido', 'Cervical changes', 'Body temperature rise'],
        advice: ['Track symptoms', 'Stay hydrated', 'Moderate exercise', 'Listen to your body'],
        symptomExplanations: {
          'Ovulation pain':
            'Mild cramping on one side when the ovary releases an egg. Called "mittelschmerz" - completely normal.',
          'Higher libido':
            'Natural increase in sex drive due to peak fertility hormones. Your body is optimized for conception.',
          'Cervical changes':
            'Cervical mucus becomes clear and stretchy (like egg whites) to help sperm travel.',
          'Body temperature rise':
            'Slight temperature increase (0.5-1°F) after ovulation due to progesterone release.',
        } as { [key: string]: string },
        detailedActivities: [
          'Moderate cardio like jogging or cycling',
          'Yoga flows and flexibility work',
          'Swimming for low-impact exercise',
          'Tracking fertility signs if trying to conceive',
          'Romantic activities with partner',
          'Creative pursuits and artistic expression',
        ],
      },
      {
        name: 'Luteal Phase',
        phase: 'luteal' as const,
        dayRange: 'Days 17-28',
        days: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
        icon: Moon,
        color: '#7C3AED',
        bgColor: '#EDE9FE',
        fertilityLevel: 'low' as const,
        symptoms: ['PMS symptoms', 'Bloating', 'Food cravings', 'Mood swings'],
        advice: ['Self-care focus', 'Gentle exercise', 'Comfort foods OK', 'Stress management'],
        symptomExplanations: {
          'PMS symptoms':
            'Premenstrual Syndrome - a collection of physical and emotional symptoms before periods. Affects 75% of women.',
          Bloating:
            'Water retention and digestive changes due to progesterone. Your clothes might feel tighter.',
          'Food cravings':
            'Hormonal changes trigger cravings, especially for carbs and chocolate. Your body needs extra calories.',
          'Mood swings':
            'Emotional ups and downs due to progesterone fluctuations. Irritability and sadness are common.',
        } as { [key: string]: string },
        detailedActivities: [
          'Gentle walks in nature',
          'Restorative yoga and stretching',
          'Journaling or creative writing',
          'Cooking comfort foods mindfully',
          'Spa activities like baths or facials',
          'Meditation and mindfulness practices',
        ],
      },
    ];
  };

  const getFertilityWindow = () => {
    const stats = calculateCycleStats();
    if (!stats.lastPeriod) return null;

    const lastPeriod = new Date(stats.lastPeriod);
    const today = new Date();
    const daysSinceLastPeriod =
      Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 because period starts on day 1, not day 0

    const cycleLength = stats.averageCycle;
    const phases = getCyclePhases();

    // Adjust phases based on actual cycle length
    const scaleFactor = cycleLength / 28;
    const adjustedPhases = phases.map((phase) => ({
      ...phase,
      days: phase.days.map((day) => Math.round(day * scaleFactor)),
    }));

    // Find current phase
    const dayInCycle = ((daysSinceLastPeriod - 1) % cycleLength) + 1;
    const currentPhase =
      adjustedPhases.find((phase) => phase.days.includes(dayInCycle)) || adjustedPhases[0];

    // Calculate ovulation day (typically 14 days before next period)
    const ovulationDay = Math.round(cycleLength - 14);
    const fertilityStart = ovulationDay - 5; // 5 days before ovulation
    const fertilityEnd = ovulationDay + 1; // 1 day after ovulation

    const isInWindow = dayInCycle >= fertilityStart && dayInCycle <= fertilityEnd;
    const daysToFertilityStart = fertilityStart - dayInCycle;
    const daysToOvulation = ovulationDay - dayInCycle;

    // Find next phase
    const currentPhaseIndex = adjustedPhases.findIndex((p) => p.name === currentPhase.name);
    const nextPhase = adjustedPhases[(currentPhaseIndex + 1) % adjustedPhases.length];
    const nextPhaseStartDay = nextPhase.days[0];
    const daysToNextPhase =
      nextPhaseStartDay > dayInCycle
        ? nextPhaseStartDay - dayInCycle
        : cycleLength - dayInCycle + nextPhaseStartDay;

    return {
      daysToStart: daysToFertilityStart,
      daysToEnd: fertilityEnd - dayInCycle,
      isInWindow,
      ovulationDay: daysToOvulation,
      currentPhase,
      dayInCycle,
      nextPhase,
      daysToNextPhase,
    };
  };

  const stats = calculateCycleStats();
  const currentPhase = getCurrentPhase();
  const daysUntilNext = getDaysUntilNextPeriod();
  const symptomData = getSymptomData();
  const fertilityWindow = getFertilityWindow();

  return (
    <PageLayout
      title={activeTab === 'cycle' ? 'Cycle' : 'Supplements'}
      btn={
        <View className="flex-row items-center">
          {activeTab === 'cycle' && (
            <View className="mr-3">
              <AIAssistant context="cycle" size={24} />
            </View>
          )}
          <TouchableOpacity
            onPress={() =>
              router.push(activeTab === 'cycle' ? '/period-tracker' : '/log-supplements')
            }
            className="bg-pink-500 w-10 h-10 rounded-full items-center justify-center"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      }
    >
      {/* Tab Navigation */}
      <View className="px-4 mb-6">
        <View className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setActiveTab('cycle')}
              className={`flex-1 py-3 px-4 rounded-xl ${
                activeTab === 'cycle' ? 'bg-pink-500' : ''
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'cycle' ? 'text-white' : 'text-gray-500'
                }`}
              >
                Cycle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('supplements')}
              className={`flex-1 py-3 px-4 rounded-xl ${
                activeTab === 'supplements' ? 'bg-pink-500' : ''
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'supplements' ? 'text-white' : 'text-gray-500'
                }`}
              >
                Supplements
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        <View className="px-4 pb-6">
          {activeTab === 'cycle' ? (
            <>
              {/* Fertility Window */}
              <FertilityWindow fertilityWindow={fertilityWindow} />

              {/* Next Period Prediction */}
              <NextPeriodPrediction
                daysUntilNext={daysUntilNext}
                nextPeriodDate={stats.nextPredicted}
              />

              {/* Monthly Calendar */}
              <MonthlyCalendar
                periodLogs={periodLogs}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
              />

              {/* Cycle History */}
              <CycleHistory periodLogs={periodLogs} />

              {/* Current Phase Status */}
              {currentPhase && (
                <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${currentPhase.color}20` }}
                      >
                        <currentPhase.icon size={20} color={currentPhase.color} />
                      </View>
                      <View>
                        <Text className="text-lg font-bold text-black">{currentPhase.name}</Text>
                        <Text className="text-gray-500 text-sm">Day {currentPhase.day}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Quick Stats */}
              <View className="flex-row gap-4 mb-6">
                <View className="flex-1 bg-white rounded-xl p-3 items-center">
                  <Clock size={20} color="#EC4899" />
                  <Text className="text-xl font-bold text-black mt-1">{stats.averageCycle}</Text>
                  <Text className="text-xs text-gray-500">avg. days</Text>
                </View>
                <View className="flex-1 bg-white rounded-xl p-3 items-center">
                  <BarChart3 size={20} color="#10B981" />
                  <Text className="text-sm font-bold text-black mt-1">{stats.cycleRegularity}</Text>
                  <Text className="text-xs text-gray-500">regularity</Text>
                </View>
                <View className="flex-1 bg-white rounded-xl p-3 items-center">
                  <Activity size={20} color="#F59E0B" />
                  <Text className="text-xl font-bold text-black mt-1">
                    {Object.keys(symptomData).length}
                  </Text>
                  <Text className="text-xs text-gray-500">symptoms</Text>
                </View>
              </View>

              {/* Cycle History Chart */}
              {stats.cycleLengths && stats.cycleLengths.length > 0 && (
                <View className="mb-6">
                  <CycleChart data={stats.cycleLengths} />
                </View>
              )}

              {/* Symptoms Chart */}
              {Object.keys(symptomData).length > 0 && (
                <View className="mb-6">
                  <SymptomChart symptoms={symptomData} />
                </View>
              )}
            </>
          ) : (
            /* Supplements Tab */
            <SupplementsTab supplementLogs={supplementLogs} fertilityWindow={fertilityWindow} />
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}
