import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { OnboardingStepContent } from '@/components/onboarding/onboarding-step-content';
import { CalendarModal } from '@/components/onboarding/calendar-modal';
import { onboardingSteps } from '@/constants/onboarding-steps';
import { OnboardingData } from '@/types/onboarding';
import { OnboardingStorage } from '@/lib/utils/onboarding-storage';

export default function OnboardingScreen() {
  const params = useLocalSearchParams();
  const selectedPlan = (params.plan as 'yearly' | 'monthly') || 'yearly';

  const [currentStep, setCurrentStep] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'birthday'>('birthday');
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getFullYear() - 25, 0, 1));

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

  const updateData = async (key: keyof OnboardingData, value: any) => {
    const newData = { ...data, [key]: value };
    setData(newData);

    // Save to local storage immediately
    try {
      await OnboardingStorage.save(newData);
    } catch (error) {
      console.error('Failed to save onboarding data to storage:', error);
    }
  };

  // Load data from storage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedData = await OnboardingStorage.load();
        if (storedData) {
          // Merge stored data with current data (preserve plan from URL)
          setData({ ...storedData, plan: selectedPlan });
        }
      } catch (error) {
        console.error('Failed to load onboarding data from storage:', error);
      }
    };

    loadStoredData();
  }, [selectedPlan]);

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save final data to storage and navigate to auth
      try {
        await OnboardingStorage.save(data);
        // Navigate to auth without onboarding data in URL
        router.push(`/auth?mode=signup&plan=${data.plan}`);
      } catch (error) {
        console.error('Failed to save onboarding data:', error);
        // Fallback to old method if storage fails
        router.push(
          `/auth?mode=signup&plan=${data.plan}&onboardingData=${encodeURIComponent(JSON.stringify(data))}`
        );
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    // On Android, the picker closes automatically, so we handle the date selection
    if (Platform.OS === 'android') {
      setShowCalendar(false);
      if (date && calendarType === 'birthday') {
        const dateString = date.toISOString().split('T')[0];
        updateData('dateOfBirth', dateString);
        setSelectedDate(date);
      }
    } else {
      // On iOS, just update the selected date without closing the modal
      // The modal will close when user taps "Done" button
      if (date && calendarType === 'birthday') {
        setSelectedDate(date);
      }
    }
  };

  const handleDateConfirm = () => {
    // This handles the iOS "Done" button press
    if (calendarType === 'birthday') {
      const dateString = selectedDate.toISOString().split('T')[0];
      updateData('dateOfBirth', dateString);
    }
    setShowCalendar(false);
  };

  const openCalendar = (type: 'birthday') => {
    setCalendarType(type);
    // Set initial date based on current dateOfBirth or default to 25 years ago
    if (data.dateOfBirth) {
      setSelectedDate(new Date(data.dateOfBirth));
    } else {
      setSelectedDate(new Date(new Date().getFullYear() - 25, 0, 1));
    }
    setShowCalendar(true);
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
          title={currentStep === onboardingSteps.length - 1 ? 'Set Up Account' : 'Continue'}
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
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onClose={() => setShowCalendar(false)}
        onConfirm={handleDateConfirm}
      />
    </SafeAreaView>
  );
}
