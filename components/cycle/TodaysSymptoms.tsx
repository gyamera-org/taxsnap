import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { AlertCircle, Plus, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/theme-provider';
import {
  CrampsIcon,
  HeadacheIcon,
  MoodSwingsIcon,
  BloatingIcon,
  FatigueIcon,
  BreastTendernessIcon,
  BackPainIcon,
  NauseaIcon,
  AcneIcon,
  FoodCravingsIcon,
  InsomniaIcon,
  AnxietyIcon,
} from '@/components/icons/symptom-icons';

interface TodaysSymptomsProps {
  selectedDate: Date;
  symptomData?: {
    symptoms: string[];
    severity?: 'mild' | 'moderate' | 'severe';
    notes?: string;
  };
  isLoading?: boolean;
}

export function TodaysSymptoms({ selectedDate, symptomData, isLoading }: TodaysSymptomsProps) {
  const { isDark } = useTheme();
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date() && !isToday;

  const getSymptomIcon = (symptom: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      cramps: <CrampsIcon size={28} />,
      headache: <HeadacheIcon size={28} />,
      mood_swings: <MoodSwingsIcon size={28} />,
      bloating: <BloatingIcon size={28} />,
      fatigue: <FatigueIcon size={28} />,
      breast_tenderness: <BreastTendernessIcon size={28} />,
      back_pain: <BackPainIcon size={28} />,
      nausea: <NauseaIcon size={28} />,
      acne: <AcneIcon size={28} />,
      food_cravings: <FoodCravingsIcon size={28} />,
      insomnia: <InsomniaIcon size={28} />,
      anxiety: <AnxietyIcon size={28} />,
    };
    return iconMap[symptom] || <AlertCircle size={28} color="#6B7280" />;
  };

  const getSymptomLabel = (symptom: string) => {
    const labelMap: { [key: string]: string } = {
      cramps: 'Cramps',
      headache: 'Headache',
      mood_swings: 'Mood Swings',
      bloating: 'Bloating',
      fatigue: 'Fatigue',
      breast_tenderness: 'Breast Tenderness',
      back_pain: 'Back Pain',
      nausea: 'Nausea',
      acne: 'Acne',
      food_cravings: 'Food Cravings',
      insomnia: 'Insomnia',
      anxiety: 'Anxiety',
    };
    return labelMap[symptom] || symptom;
  };

  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View
          className={`${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
          } rounded-2xl p-4 border`}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View
                className={`w-10 h-10 rounded-2xl ${
                  isDark ? 'bg-pink-900' : 'bg-orange-100'
                } items-center justify-center mr-3`}
              >
                <AlertCircle size={20} color={isDark ? '#EC4899' : '#F97316'} />
              </View>
              <Text className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-black'}`}>
                Symptoms
              </Text>
            </View>
          </View>
          <View className="animate-pulse">
            <View className={`h-4 ${isDark ? 'bg-pink-800' : 'bg-gray-200'} rounded w-1/2 mb-2`} />
            <View className={`h-3 ${isDark ? 'bg-pink-700' : 'bg-gray-200'} rounded w-1/3`} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <View
        className={`${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl p-4 border`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View
              className={`w-10 h-10 rounded-2xl ${
                isDark ? 'bg-pink-900' : 'bg-pink-100'
              } items-center justify-center mr-3`}
            >
              <AlertCircle size={20} color={isDark ? '#EC4899' : '#f6339a'} />
            </View>
            <Text className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-black'}`}>
              Symptoms
            </Text>
          </View>
          {!isFuture && (
            <TouchableOpacity
              onPress={() => {
                router.push(`/log-symptoms?date=${selectedDate.toISOString().split('T')[0]}`);
              }}
              className={`w-8 h-8 rounded-full ${
                isDark ? 'bg-pink-900' : 'bg-pink-100'
              } items-center justify-center`}
            >
              <Plus size={16} color={isDark ? '#EC4899' : '#f6339a'} />
            </TouchableOpacity>
          )}
        </View>

        {symptomData?.symptoms && symptomData.symptoms.length > 0 ? (
          <View className="flex-col gap-2">
            {symptomData.symptoms.map((symptom, index) => (
              <View
                key={index}
                className={`flex-row items-center justify-between ${
                  isDark ? 'bg-pink-900/30' : 'bg-pink-50'
                } rounded-2xl p-4`}
                style={{
                  shadowColor: isDark ? '#EC4899' : '#EC4899',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-12 h-12 rounded-full ${
                      isDark ? 'bg-pink-800' : 'bg-pink-200'
                    } items-center justify-center mr-4`}
                  >
                    {getSymptomIcon(symptom)}
                  </View>
                  <Text
                    className={`${isDark ? 'text-gray-100' : 'text-gray-900'} text-lg font-medium`}
                  >
                    {getSymptomLabel(symptom)}
                  </Text>
                </View>
                <View
                  className={`w-8 h-8 rounded-full ${
                    isDark ? 'bg-pink-600' : 'bg-pink-500'
                  } items-center justify-center`}
                >
                  <Check size={16} color="#FFFFFF" />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center py-8">
            <View
              className={`w-16 h-16 rounded-3xl items-center justify-center mb-4 border ${
                isDark ? 'border-pink-600' : 'border-pink-100'
              }`}
            >
              <AlertCircle size={28} color={isDark ? '#EC4899' : '#f6339a'} />
            </View>
            <Text
              className={`${
                isDark ? 'text-gray-200' : 'text-gray-700'
              } text-center mb-2 font-medium`}
            >
              No symptoms today
            </Text>
            <Text
              className={`${
                isDark ? 'text-gray-400' : 'text-gray-500'
              } text-center text-sm mb-4 px-4`}
            >
              Track how you're feeling to better understand your cycle
            </Text>
            {!isFuture && (
              <TouchableOpacity
                onPress={() =>
                  router.push(`/log-symptoms?date=${selectedDate.toISOString().split('T')[0]}`)
                }
                className={`rounded-xl px-6 py-3 ${isDark ? 'bg-pink-600' : 'bg-pink-500'}`}
              >
                <Text className="text-white font-semibold">Log Symptoms</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
