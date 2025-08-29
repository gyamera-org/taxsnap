import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { OnboardingStepContent } from '@/components/onboarding/onboarding-step-content';
import { CalendarModal } from '@/components/onboarding/calendar-modal';
import { onboardingSteps } from '@/constants/onboarding-steps';
import { OnboardingData } from '@/types/onboarding';

export default function OnboardingScreen() {
  const params = useLocalSearchParams();
  const selectedPlan = (params.plan as 'yearly' | 'monthly') || 'yearly';

  const [currentStep, setCurrentStep] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [calendarType, setCalendarType] = useState<'birthday'>('birthday');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 25);

  const [data, setData] = useState<OnboardingData>({
    name: '',
    dateOfBirth: '',
    fitnessGoal: '',
    fitnessFrequency: '',
    fitnessExperience: '',
    nutritionGoal: '',
    activityLevel: '',
    nutritionExperience: '',
    height: 0,
    weight: 0,
    weightGoal: 0,
    units: 'metric',
    plan: selectedPlan,
  });

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and navigate to auth with data
      router.replace(
        `/auth?mode=signup&plan=${data.plan}&onboardingData=${encodeURIComponent(JSON.stringify(data))}`
      );
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleDateSelect = (day: { dateString: string }) => {
    if (calendarType === 'birthday') {
      updateData('dateOfBirth', day.dateString);
    }
    setShowCalendar(false);
  };

  const openCalendar = (type: 'birthday') => {
    setCalendarType(type);
    setSelectedYear(new Date().getFullYear() - 25);
    setShowCalendar(true);
  };

  const openYearPicker = () => {
    setShowYearPicker(true);
  };

  const selectYear = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
  };

  const closeCalendar = () => {
    setShowCalendar(false);
    setShowYearPicker(false);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 12; year >= currentYear - 100; year--) {
      years.push(year);
    }
    return years;
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return true;
      case 'personal':
        return data.name.trim().length > 0;
      case 'birthday':
        return data.dateOfBirth.length > 0;

      case 'fitness-goal':
        return data.fitnessGoal.length > 0;
      case 'fitness-frequency':
        return data.fitnessFrequency.length > 0;
      case 'fitness-experience':
        return data.fitnessExperience.length > 0;
      case 'nutrition-goal':
        return data.nutritionGoal.length > 0;
      case 'nutrition-activity':
        return data.activityLevel.length > 0;
      case 'nutrition-experience':
        return data.nutritionExperience.length > 0;
      case 'body-units':
        return true; // units has default value
      case 'body-measurements':
        return data.height > 0 && data.weight > 0 && data.weightGoal > 0;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  // Content is now handled by OnboardingStepContent component

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Progress Bar - Hide on complete step */}
      {currentStepData.id !== 'complete' && (
        <View className="mx-6 mb-4">
          <View className="h-3 bg-gray-200" style={{ borderRadius: 6 }}>
            <View
              className="h-full"
              style={{
                width: `${progress}%`,
                backgroundColor: '#EC4899',
                borderRadius: 6,
              }}
            />
          </View>
        </View>
      )}

      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          onPress={handleBack}
          className={currentStepData.id === 'complete' ? 'p-1' : 'p-2'}
        >
          <ArrowLeft size={currentStepData.id === 'complete' ? 20 : 24} color="#374151" />
        </TouchableOpacity>

        {currentStepData.id !== 'complete' && (
          <Text className="text-gray-500 font-medium">
            {currentStep + 1} of {onboardingSteps.length}
          </Text>
        )}

        <View className="p-2 w-10" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {currentStepData.id !== 'complete' && (
          <View className="items-center mb-8">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: `${currentStepData.color}20` }}
            >
              <IconComponent size={40} color={currentStepData.color} />
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
              {currentStepData.title}
            </Text>

            <Text className="text-gray-600 text-center text-lg">{currentStepData.subtitle}</Text>
          </View>
        )}

        {currentStepData.id === 'complete' && (
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
              You're all set!
            </Text>
            <Text className="text-gray-600 text-center text-lg">
              Ready to start your wellness journey
            </Text>
          </View>
        )}

        <OnboardingStepContent
          stepId={currentStepData.id}
          data={data}
          updateData={updateData}
          openCalendar={openCalendar}
        />
      </ScrollView>

      {/* Footer */}
      <View className="p-6">
        <Button
          title={currentStep === onboardingSteps.length - 1 ? 'Start 3-Day Free Trial' : 'Continue'}
          onPress={handleNext}
          disabled={!canProceed()}
          variant="primary"
          size="large"
        />
      </View>

      <CalendarModal
        visible={showCalendar}
        calendarType={calendarType}
        currentStepData={currentStepData}
        showYearPicker={showYearPicker}
        selectedYear={selectedYear}
        onDateSelect={handleDateSelect}
        onYearSelect={selectYear}
        onOpenYearPicker={openYearPicker}
        onClose={closeCalendar}
      />
    </SafeAreaView>
  );
}
