import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { AlertCircle, Plus, Eye, X } from 'lucide-react-native';
import { router } from 'expo-router';
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
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
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
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-orange-100 items-center justify-center mr-3">
                <AlertCircle size={20} color="#F97316" />
              </View>
              <Text className="text-lg font-semibold text-black">Symptoms</Text>
            </View>
          </View>
          <View className="animate-pulse">
            <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <View className="h-3 bg-gray-200 rounded w-1/3" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-red-100 items-center justify-center mr-3">
              <AlertCircle size={20} color="#DC2626" />
            </View>
            <Text className="text-lg font-semibold text-black">Symptoms</Text>
          </View>
          {!isFuture && (
            <TouchableOpacity
              onPress={() => {
                router.push('/log-symptoms');
              }}
              className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
            >
              <Plus size={16} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        {symptomData?.symptoms && symptomData.symptoms.length > 0 ? (
          <>
            {/* Clean Modern Symptoms Card */}
            <View
              className="rounded-3xl p-6"
              style={{
                backgroundColor: '#FEF2F2',
                borderWidth: 1,
                borderColor: '#FECACA',
                shadowColor: '#DC2626',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              {/* Modern Symptoms Grid - 3 per row */}
              <View className="flex-row flex-wrap justify-between">
                {symptomData.symptoms.map((symptom, index) => (
                  <View
                    key={index}
                    className="rounded-3xl p-3 mb-3"
                    style={{
                      width: '30%',
                      backgroundColor: '#FEF2F2',
                      borderWidth: 1,
                      borderColor: '#FECACA',
                      shadowColor: '#DC2626',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View className="items-center">
                      <View className="w-12 h-12 rounded-2xl items-center justify-center mb-2">
                        <View style={{ transform: [{ scale: 1.4 }] }}>
                          {getSymptomIcon(symptom)}
                        </View>
                      </View>
                      <Text className="text-red-900 text-xs font-medium text-center">
                        {getSymptomLabel(symptom)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View className="items-center py-8">
            <View
              className="w-16 h-16 rounded-3xl items-center justify-center mb-4"
              style={{
                backgroundColor: '#FEF2F2',
                borderWidth: 2,
                borderColor: '#FECACA',
                borderStyle: 'dashed',
              }}
            >
              <AlertCircle size={28} color="#DC2626" />
            </View>
            <Text className="text-gray-700 text-center mb-2 font-medium">No symptoms today</Text>
            <Text className="text-gray-500 text-center text-sm mb-4 px-4">
              Track how you're feeling to better understand your cycle
            </Text>
            {!isFuture && (
              <TouchableOpacity
                onPress={() => router.push('/log-symptoms')}
                className="rounded-xl px-6 py-3"
                style={{
                  backgroundColor: '#DC2626',
                  shadowColor: '#DC2626',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white font-semibold">Log Symptoms</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Modern Centered Notes Modal */}
      <Modal
        visible={isNotesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsNotesModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => setIsNotesModalVisible(false)}
            activeOpacity={1}
          />
          <View
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setIsNotesModalVisible(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <X size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* Content */}
            <View className="pr-8">
              {symptomData?.severity && (
                <View className="mb-4">
                  <Text className="text-gray-600 text-sm font-semibold mb-1">Severity:</Text>
                  <Text className="text-black text-base capitalize font-medium">
                    {symptomData.severity}
                  </Text>
                </View>
              )}

              {symptomData?.notes && (
                <View>
                  <Text className="text-gray-600 text-sm font-semibold mb-2">Notes:</Text>
                  <Text className="text-black text-base leading-relaxed">{symptomData.notes}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
