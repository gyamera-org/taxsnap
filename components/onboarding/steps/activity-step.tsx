import { OnboardingLayout } from '../onboarding-layout';
import { OnboardingOption } from '../onboarding-option';
import { useOnboarding } from '@/context/onboarding-provider';
import { useTranslation } from 'react-i18next';

interface ActivityStepProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function ActivityStep({ currentStep, totalSteps, onBack, onNext }: ActivityStepProps) {
  const { t } = useTranslation();
  const { data, updateData } = useOnboarding();

  const ACTIVITY_LEVELS = [
    { id: 'sedentary', label: t('onboarding.activity.options.sedentary') },
    { id: 'light', label: t('onboarding.activity.options.light') },
    { id: 'moderate', label: t('onboarding.activity.options.moderate') },
    { id: 'active', label: t('onboarding.activity.options.active') },
    { id: 'very-active', label: t('onboarding.activity.options.veryActive') },
    { id: 'varies', label: t('onboarding.activity.options.varies') },
  ];

  const handleSelect = (activityId: string) => {
    updateData({ activityLevel: activityId });
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={t('onboarding.activity.title')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.activityLevel}
    >
      {ACTIVITY_LEVELS.map((level, index) => (
        <OnboardingOption
          key={level.id}
          label={level.label}
          selected={data.activityLevel === level.id}
          onPress={() => handleSelect(level.id)}
          index={index}
        />
      ))}
    </OnboardingLayout>
  );
}
