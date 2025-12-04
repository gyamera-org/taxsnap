import { OnboardingLayout } from '../onboarding-layout';
import { OnboardingOption } from '../onboarding-option';
import { useOnboarding } from '@/context/onboarding-provider';
import { useTranslation } from 'react-i18next';

interface FoodRelationshipStepProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function FoodRelationshipStep({
  currentStep,
  totalSteps,
  onBack,
  onNext,
}: FoodRelationshipStepProps) {
  const { t } = useTranslation();
  const { data, updateData } = useOnboarding();

  const RELATIONSHIPS = [
    { id: 'love-food', label: t('onboarding.foodRelationship.options.loveFood') },
    { id: 'complicated', label: t('onboarding.foodRelationship.options.complicated') },
    { id: 'anxious', label: t('onboarding.foodRelationship.options.anxious') },
    { id: 'restricted', label: t('onboarding.foodRelationship.options.restricted') },
    { id: 'confused', label: t('onboarding.foodRelationship.options.confused') },
    { id: 'fresh-start', label: t('onboarding.foodRelationship.options.freshStart') },
  ];

  const handleSelect = (relationshipId: string) => {
    updateData({ foodRelationship: relationshipId });
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={t('onboarding.foodRelationship.title')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.foodRelationship}
    >
      {RELATIONSHIPS.map((relationship, index) => (
        <OnboardingOption
          key={relationship.id}
          label={relationship.label}
          selected={data.foodRelationship === relationship.id}
          onPress={() => handleSelect(relationship.id)}
          index={index}
        />
      ))}
    </OnboardingLayout>
  );
}
