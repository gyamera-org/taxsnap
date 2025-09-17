import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Sparkles, Edit3 } from 'lucide-react-native';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import { useNutritionGoalSetter } from '@/lib/hooks/use-nutrition-goal-setter';
import { useBodyMeasurements } from '@/lib/hooks/use-weight-tracking';
import { useNutritionGoals } from '@/lib/hooks/use-nutrition-goals';

interface GenerateMacrosButtonProps {
  variant?: 'primary' | 'secondary';
  className?: string;
  onGenerationComplete?: () => void;
}

export function GenerateMacrosButton({
  variant = 'primary',
  className = '',
  onGenerationComplete,
}: GenerateMacrosButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const nutritionGoalSetter = useNutritionGoalSetter();
  const { data: bodyMeasurements } = useBodyMeasurements();
  const { data: nutritionGoals } = useNutritionGoals();

  const hasBodyMeasurements = Boolean(bodyMeasurements?.current_weight && bodyMeasurements?.height);

  const checkBodyMeasurementsWithAlert = () => {
    if (!hasBodyMeasurements) {
      Alert.alert(
        'Body Measurements Required',
        'We need your weight and height to calculate accurate nutrition goals. Please set them in your profile first.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Weight Settings',
            onPress: () => router.push('/settings/weight'),
          },
        ]
      );
      return false;
    }
    return true;
  };

  // Check if user has onboarding data (can generate without questionnaire)
  const hasOnboardingData = Boolean(
    nutritionGoals?.primary_goal &&
      nutritionGoals?.activity_level &&
      nutritionGoals?.tracking_experience
  );

  // Check if user has calculated nutrition values
  const hasCalculatedGoals = Boolean(nutritionGoals?.calories && nutritionGoals?.protein);

  // Generate goals from existing onboarding data
  const generateFromOnboarding = async () => {
    if (!checkBodyMeasurementsWithAlert()) return;
    if (!hasOnboardingData) return;

    setIsGenerating(true);

    try {
      const goalData = {
        primary_goal: nutritionGoals!.primary_goal as
          | 'lose_weight'
          | 'gain_muscle'
          | 'maintain'
          | 'improve_health',
        activity_level: nutritionGoals!.activity_level as
          | 'sedentary'
          | 'light'
          | 'moderate'
          | 'active',
        tracking_experience: nutritionGoals!.tracking_experience as
          | 'beginner'
          | 'intermediate'
          | 'advanced',
      };

      await nutritionGoalSetter.mutateAsync(goalData);
      onGenerationComplete?.();
    } catch (error) {
      toast.error('Failed to calculate nutrition goals');
    } finally {
      setIsGenerating(false);
    }
  };

  const openNutritionGoals = () => {
    router.push('/settings/nutrition-goals');
  };

  // If we don't have body measurements, show setup button
  if (!hasBodyMeasurements) {
    return (
      <Button
        title="Complete Profile Setup"
        preIcon={<Edit3 size={20} color="#6b7280" />}
        variant={variant}
        className={`w-full ${className}`}
        onPress={() => router.push('/settings/weight')}
        disabled={isGenerating}
      />
    );
  }

  if (hasOnboardingData && !hasCalculatedGoals) {
    // User has onboarding data but no calculated goals - show direct generate button
    return (
      <View className="flex flex-col gap-3">
        <Button
          title="Generate Your Macros"
          variant={variant}
          onPress={generateFromOnboarding}
          disabled={isGenerating}
          loading={isGenerating}
        />
        <Button
          title="Update Preferences"
          variant="secondary"
          onPress={openNutritionGoals}
          disabled={isGenerating}
        />
      </View>
    );
  }

  // Normal flow - show questionnaire button
  return (
    <Button
      title={hasCalculatedGoals ? 'Recalculate Goals' : 'Generate Your Macros'}
      preIcon={<Sparkles size={20} color="#ec4899" />}
      variant={variant}
      className={`w-full ${className}`}
      onPress={openNutritionGoals}
      disabled={isGenerating}
    />
  );
}
