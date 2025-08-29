import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Questionnaire } from '@/components/ui';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { Target, Calendar, Zap } from 'lucide-react-native';
import { useFitnessGoals, useUpdateFitnessGoals } from '@/lib/hooks/use-fitness-goals';
import { FitnessGoalsSkeleton } from '@/components/fitness/fitness-goals-skeleton';
import {
  fitnessQuestionnaireSteps,
  formatFitnessGoal,
  formatWorkoutFrequency,
  formatFitnessExperience,
} from '@/constants/fitness-questionnaire';

export default function FitnessGoalsScreen() {
  const router = useRouter();

  // Hooks
  const { data: fitnessGoals, isLoading } = useFitnessGoals();
  const updateFitnessGoals = useUpdateFitnessGoals();

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Questionnaire data
  const [selectedValues, setSelectedValues] = useState({
    goal: null as string | null,
    frequency: null as string | null,
    experience: null as string | null,
  });

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);
    setProgress((nextIndex / fitnessQuestionnaireSteps.length) * 100);
  };

  const handleBack = () => {
    if (currentStepIndex === 0) {
      setShowQuestionnaire(false);
      setCurrentStepIndex(0);
      setProgress(0);
    } else {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setProgress((prevIndex / fitnessQuestionnaireSteps.length) * 100);
    }
  };

  const handleSelectValue = (stepKey: string, value: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [stepKey]: value,
    }));
  };

  const generateGoals = async () => {
    setIsGenerating(true);

    try {
      const newGoals = {
        primary_goal: selectedValues.goal || 'general_fitness',
        workout_frequency: selectedValues.frequency || '3-4',
        experience_level: selectedValues.experience || 'beginner',
      };

      await updateFitnessGoals.mutateAsync(newGoals);

      setShowQuestionnaire(false);
      setCurrentStepIndex(0);
      setProgress(0);
    } catch (error) {
      toast.error('Failed to update fitness goals');
    } finally {
      setIsGenerating(false);
    }
  };

  const GoalCard = ({
    icon,
    title,
    value,
    subtitle,
  }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle: string;
  }) => (
    <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
          {React.createElement(icon, { size: 24, color: '#374151' })}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
          <Text className="text-sm text-gray-500">{subtitle}</Text>
        </View>
      </View>

      <Text className="text-3xl font-bold text-gray-900">{value}</Text>
    </View>
  );

  return (
    <SubPageLayout title="Fitness Goals" onBack={() => router.back()}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Goal Cards */}
        <View className="px-4">
          {isLoading ? (
            <FitnessGoalsSkeleton />
          ) : (
            <>
              <GoalCard
                icon={Target}
                title="Primary Goal"
                value={fitnessGoals ? formatFitnessGoal(fitnessGoals.primary_goal) : '--'}
                subtitle="Your main focus area"
              />

              <GoalCard
                icon={Calendar}
                title="Workout Frequency"
                value={fitnessGoals ? formatWorkoutFrequency(fitnessGoals.workout_frequency) : '--'}
                subtitle="How often you workout"
              />

              <GoalCard
                icon={Zap}
                title="Experience Level"
                value={fitnessGoals ? formatFitnessExperience(fitnessGoals.experience_level) : '--'}
                subtitle="Your fitness experience"
              />
            </>
          )}
        </View>

        {/* Goals Button */}
        <View className="px-4 mb-8">
          <Button
            title={fitnessGoals ? 'Update Goals' : 'Set New Goals'}
            variant="secondary"
            className="w-full"
            onPress={() => setShowQuestionnaire(true)}
          />
        </View>
      </ScrollView>

      <Questionnaire
        visible={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        steps={fitnessQuestionnaireSteps}
        currentStepIndex={currentStepIndex}
        selectedValues={selectedValues}
        onSelectValue={handleSelectValue}
        onNext={handleNext}
        onBack={handleBack}
        onComplete={generateGoals}
        progress={progress}
        isGenerating={isGenerating}
        accentColor="#ec4899"
      />
    </SubPageLayout>
  );
}
