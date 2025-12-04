import { OnboardingLayout } from '../onboarding-layout';
import { OnboardingOption } from '../onboarding-option';
import { useOnboarding } from '@/context/onboarding-provider';
import { useTranslation } from 'react-i18next';

interface StrugglesStepProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function StrugglesStep({ currentStep, totalSteps, onBack, onNext }: StrugglesStepProps) {
  const { t } = useTranslation();
  const { data, toggleArrayItem } = useOnboarding();

  const STRUGGLES = [
    { id: 'what-to-eat', label: t('onboarding.struggles.options.whatToEat') },
    { id: 'grocery-shopping', label: t('onboarding.struggles.options.groceryShopping') },
    { id: 'eating-out', label: t('onboarding.struggles.options.eatingOut') },
    { id: 'family-meals', label: t('onboarding.struggles.options.familyMeals') },
    { id: 'time', label: t('onboarding.struggles.options.time') },
    { id: 'conflicting-info', label: t('onboarding.struggles.options.conflictingInfo') },
    { id: 'emotional-eating', label: t('onboarding.struggles.options.emotionalEating') },
    { id: 'giving-up', label: t('onboarding.struggles.options.givingUp') },
  ];

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={t('onboarding.struggles.title')}
      subtitle={t('onboarding.common.selectAll')}
      onBack={onBack}
      onNext={onNext}
      onSkip={onNext}
    >
      {STRUGGLES.map((struggle, index) => (
        <OnboardingOption
          key={struggle.id}
          label={struggle.label}
          selected={data.dailyStruggles.includes(struggle.id)}
          onPress={() => toggleArrayItem('dailyStruggles', struggle.id)}
          index={index}
        />
      ))}
    </OnboardingLayout>
  );
}
