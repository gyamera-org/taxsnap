import { OnboardingLayout } from '../onboarding-layout';
import { OnboardingOption } from '../onboarding-option';
import { useOnboarding } from '@/context/onboarding-provider';
import { useTranslation } from 'react-i18next';

interface FavoriteFoodsStepProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function FavoriteFoodsStep({
  currentStep,
  totalSteps,
  onBack,
  onNext,
}: FavoriteFoodsStepProps) {
  const { t } = useTranslation();
  const { data, toggleArrayItem } = useOnboarding();

  const FOODS = [
    { id: 'chocolate', label: t('onboarding.favoriteFoods.options.chocolate') },
    { id: 'bread', label: t('onboarding.favoriteFoods.options.bread') },
    { id: 'cheese', label: t('onboarding.favoriteFoods.options.cheese') },
    { id: 'coffee', label: t('onboarding.favoriteFoods.options.coffee') },
    { id: 'sweets', label: t('onboarding.favoriteFoods.options.sweets') },
    { id: 'rice', label: t('onboarding.favoriteFoods.options.rice') },
    { id: 'fruit', label: t('onboarding.favoriteFoods.options.fruit') },
    { id: 'fast-food', label: t('onboarding.favoriteFoods.options.fastFood') },
    { id: 'snacks', label: t('onboarding.favoriteFoods.options.snacks') },
    { id: 'drinks', label: t('onboarding.favoriteFoods.options.drinks') },
  ];

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={t('onboarding.favoriteFoods.title')}
      subtitle={t('onboarding.common.selectAll')}
      onBack={onBack}
      onNext={onNext}
      onSkip={onNext}
    >
      {FOODS.map((food, index) => (
        <OnboardingOption
          key={food.id}
          label={food.label}
          selected={data.feelGoodFoods.includes(food.id)}
          onPress={() => toggleArrayItem('feelGoodFoods', food.id)}
          index={index}
        />
      ))}
    </OnboardingLayout>
  );
}
