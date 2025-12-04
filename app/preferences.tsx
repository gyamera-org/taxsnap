import { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  GoalStep,
  SymptomsStep,
  StrugglesStep,
  FoodRelationshipStep,
  FavoriteFoodsStep,
  ActivityStep,
} from '@/components/onboarding/steps';

type Step =
  | 'goal'
  | 'symptoms'
  | 'struggles'
  | 'food-relationship'
  | 'favorite-foods'
  | 'activity';

export default function PreferencesScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('goal');

  const steps: Step[] = [
    'goal',
    'symptoms',
    'struggles',
    'food-relationship',
    'favorite-foods',
    'activity',
  ];
  const totalSteps = steps.length;

  const goBack = () => {
    const i = steps.indexOf(step);
    if (i > 0) {
      setStep(steps[i - 1]);
    } else {
      router.back();
    }
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const i = steps.indexOf(step);
    if (i < steps.length - 1) {
      setStep(steps[i + 1]);
    } else {
      // Last step - go back to settings
      router.back();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'goal':
        return (
          <GoalStep
            currentStep={1}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'symptoms':
        return (
          <SymptomsStep
            currentStep={2}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'struggles':
        return (
          <StrugglesStep
            currentStep={3}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'food-relationship':
        return (
          <FoodRelationshipStep
            currentStep={4}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'favorite-foods':
        return (
          <FavoriteFoodsStep
            currentStep={5}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      case 'activity':
        return (
          <ActivityStep
            currentStep={6}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={goNext}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {renderStep()}
    </View>
  );
}
