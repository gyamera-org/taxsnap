import { OnboardingLayout } from '../onboarding-layout';
import { OnboardingOption } from '../onboarding-option';
import { useOnboarding } from '@/context/onboarding-provider';
import { useTranslation } from 'react-i18next';

interface GoalStepProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function GoalStep({ currentStep, totalSteps, onBack, onNext }: GoalStepProps) {
  const { t } = useTranslation();
  const { data, updateData } = useOnboarding();

  const GOALS = [
    { id: 'manage-weight', label: t('onboarding.goal.options.manageWeight') },
    { id: 'reduce-symptoms', label: t('onboarding.goal.options.reduceSymptoms') },
    { id: 'fertility', label: t('onboarding.goal.options.fertility') },
    { id: 'energy', label: t('onboarding.goal.options.energy') },
    { id: 'understand', label: t('onboarding.goal.options.understand') },
    { id: 'peace', label: t('onboarding.goal.options.peace') },
  ];

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={t('onboarding.goal.title')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.primaryGoal}
    >
      {GOALS.map((goal, index) => (
        <OnboardingOption
          key={goal.id}
          label={goal.label}
          selected={data.primaryGoal === goal.id}
          onPress={() => updateData({ primaryGoal: goal.id })}
          index={index}
        />
      ))}
    </OnboardingLayout>
  );
}
