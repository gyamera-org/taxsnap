import { OnboardingLayout } from '../onboarding-layout';
import { OnboardingOption } from '../onboarding-option';
import { useOnboarding } from '@/context/onboarding-provider';
import { useTranslation } from 'react-i18next';

interface SymptomsStepProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function SymptomsStep({ currentStep, totalSteps, onBack, onNext }: SymptomsStepProps) {
  const { t } = useTranslation();
  const { data, toggleArrayItem } = useOnboarding();

  const SYMPTOMS = [
    { id: 'irregular-periods', label: t('onboarding.symptoms.options.irregularPeriods') },
    { id: 'weight-gain', label: t('onboarding.symptoms.options.weightGain') },
    { id: 'fatigue', label: t('onboarding.symptoms.options.fatigue') },
    { id: 'acne', label: t('onboarding.symptoms.options.acne') },
    { id: 'hair-loss', label: t('onboarding.symptoms.options.hairLoss') },
    { id: 'hair-growth', label: t('onboarding.symptoms.options.hairGrowth') },
    { id: 'mood-swings', label: t('onboarding.symptoms.options.moodSwings') },
    { id: 'cravings', label: t('onboarding.symptoms.options.cravings') },
    { id: 'bloating', label: t('onboarding.symptoms.options.bloating') },
    { id: 'brain-fog', label: t('onboarding.symptoms.options.brainFog') },
  ];

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={t('onboarding.symptoms.title')}
      subtitle={t('onboarding.common.selectAll')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={data.symptoms.length === 0}
    >
      {SYMPTOMS.map((symptom, index) => (
        <OnboardingOption
          key={symptom.id}
          label={symptom.label}
          selected={data.symptoms.includes(symptom.id)}
          onPress={() => toggleArrayItem('symptoms', symptom.id)}
          index={index}
        />
      ))}
    </OnboardingLayout>
  );
}
