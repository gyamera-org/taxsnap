import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Questionnaire } from '@/components/ui';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import {
  Target,
  Flame,
  Beef,
  Wheat,
  GlassWater,
  Sparkles,
  Edit3,
  X,
  Check,
} from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';
import { useNutritionGoals, useUpdateNutritionGoals } from '@/lib/hooks/use-nutrition-goals';
import { useNutritionGoalSetter } from '@/lib/hooks/use-nutrition-goal-setter';
import { useBodyMeasurements } from '@/lib/hooks/use-weight-tracking';
import { nutritionQuestionnaireSteps, formatGoal } from '@/constants/nutrition-questionnaire';
import { NutritionGoalsSkeleton } from '@/components/nutrition/nutrition-goals-skeleton';
import { NutritionGoalsEmptyState } from '@/components/nutrition/nutrition-goals-empty-state';
import { GenerateMacrosButton } from '@/components/nutrition/generate-macros-button';

export default function NutritionGoalsScreen() {
  const router = useRouter();

  // Hooks
  const { data: nutritionGoals, isLoading } = useNutritionGoals();
  const nutritionGoalSetter = useNutritionGoalSetter();
  const updateNutritionGoals = useUpdateNutritionGoals();
  const { data: bodyMeasurements, isLoading: isLoadingBody } = useBodyMeasurements();

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Inline editing state
  const [editingField, setEditingField] = useState<string>('');
  const [editValues, setEditValues] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    water_ml: '',
  });

  // Questionnaire data - initialize with existing nutrition goals data
  const [selectedValues, setSelectedValues] = useState({
    goal: null as string | null,
    activity: null as string | null,
    experience: null as string | null,
  });

  // Pre-populate questionnaire with existing data when nutrition goals are loaded
  useEffect(() => {
    if (nutritionGoals) {
      setSelectedValues({
        goal: nutritionGoals.primary_goal || null,
        activity: nutritionGoals.activity_level || null,
        experience: nutritionGoals.tracking_experience || null,
      });
    }
  }, [nutritionGoals]);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);
    setProgress((nextIndex / nutritionQuestionnaireSteps.length) * 100);
  };

  const handleBack = () => {
    if (currentStepIndex === 0) {
      setShowQuestionnaire(false);
      setCurrentStepIndex(0);
      setProgress(0);
    } else {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setProgress((prevIndex / nutritionQuestionnaireSteps.length) * 100);
    }
  };

  const handleSelectValue = (stepKey: string, value: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [stepKey]: value,
    }));
  };

  const checkBodyMeasurements = () => {
    const hasWeight = bodyMeasurements?.current_weight;
    const hasHeight = bodyMeasurements?.height;

    if (!hasWeight || !hasHeight) {
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

  const generateGoals = async () => {
    if (!checkBodyMeasurements()) return;

    setIsGenerating(true);

    try {
      const goalData = {
        primary_goal:
          (selectedValues.goal as 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health') ||
          'improve_health',
        activity_level:
          (selectedValues.activity as 'sedentary' | 'light' | 'moderate' | 'active') || 'moderate',
        tracking_experience:
          (selectedValues.experience as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      };

      const result = await nutritionGoalSetter.mutateAsync(goalData);

      setShowQuestionnaire(false);
      setCurrentStepIndex(0);
      setProgress(0);
    } catch (error) {
      toast.error('Failed to calculate nutrition goals');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate goals from existing onboarding data
  const generateFromOnboarding = async () => {
    if (!checkBodyMeasurements()) return;
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
    } catch (error) {
      toast.error('Failed to calculate nutrition goals');
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = (field: string) => {
    if (nutritionGoals) {
      setEditValues({
        calories: nutritionGoals.calories?.toString() || '',
        protein: nutritionGoals.protein?.toString() || '',
        carbs: nutritionGoals.carbs?.toString() || '',
        fat: nutritionGoals.fat?.toString() || '',
        water_ml: nutritionGoals.water_ml?.toString() || '2500',
      });
      setEditingField(field);
    }
  };

  const handleValueChange = (field: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const cancelEditing = () => {
    setEditingField('');
  };

  const saveChanges = async () => {
    try {
      await updateNutritionGoals.mutateAsync({
        calories: parseInt(editValues.calories) || undefined,
        protein: parseInt(editValues.protein) || undefined,
        carbs: parseInt(editValues.carbs) || undefined,
        fat: parseInt(editValues.fat) || undefined,
        water_ml: parseInt(editValues.water_ml) || undefined,
      });
      setEditingField('');
    } catch (error) {
      toast.error('Failed to update nutrition goals');
    }
  };

  return (
    <SubPageLayout title="Nutrition Goals">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Goal Cards or Nutrition Results */}
        <View className="px-4">
          {isLoading ? (
            <NutritionGoalsSkeleton />
          ) : nutritionGoals && nutritionGoals.calories && nutritionGoals.protein ? (
            <>
              {/* Show calculated nutrition data from database */}
              <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Your Personalized Plan
                </Text>
                <View className="flex flex-col gap-4">
                  {/* Calories */}
                  <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <View className="bg-orange-100 p-3 rounded-full">
                        <Flame size={28} color="#ea580c" />
                      </View>
                      <View className="ml-4">
                        <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                          Calories
                        </Text>
                        {editingField === 'calories' ? (
                          <TextInput
                            className="text-3xl font-bold text-gray-900 border-b border-gray-300 min-w-20"
                            value={editValues.calories}
                            onChangeText={(value) => handleValueChange('calories', value)}
                            keyboardType="numeric"
                            autoFocus
                            onBlur={() => setEditingField('')}
                          />
                        ) : (
                          <Text className="text-3xl font-bold text-gray-900">
                            {nutritionGoals.calories}
                          </Text>
                        )}
                      </View>
                    </View>
                    {editingField === 'calories' ? (
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={cancelEditing}
                          className="bg-white p-3 rounded-full shadow-sm"
                        >
                          <X size={16} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={saveChanges}
                          disabled={updateNutritionGoals.isPending}
                          className="bg-white p-3 rounded-full shadow-sm"
                        >
                          <Check size={16} color="#22c55e" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => startEditing('calories')}
                        className="bg-white p-3 rounded-full shadow-sm"
                      >
                        <Edit3 size={16} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Protein */}
                  <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <View className="bg-red-100 p-3 rounded-full">
                        <Beef size={28} color="#dc2626" />
                      </View>
                      <View className="ml-4">
                        <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                          Protein
                        </Text>
                        {editingField === 'protein' ? (
                          <TextInput
                            className="text-3xl font-bold text-gray-900 border-b border-gray-300 min-w-20"
                            value={editValues.protein}
                            onChangeText={(value) => handleValueChange('protein', value)}
                            keyboardType="numeric"
                            autoFocus
                            onBlur={() => setEditingField('')}
                          />
                        ) : (
                          <Text className="text-3xl font-bold text-gray-900">
                            {nutritionGoals.protein}g
                          </Text>
                        )}
                      </View>
                    </View>
                    {editingField === 'protein' ? (
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={cancelEditing}
                          className="bg-white p-3 rounded-full shadow-sm"
                        >
                          <X size={16} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={saveChanges}
                          disabled={updateNutritionGoals.isPending}
                          className="bg-white p-3 rounded-full shadow-sm"
                        >
                          <Check size={16} color="#22c55e" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => startEditing('protein')}
                        className="bg-white p-3 rounded-full shadow-sm"
                      >
                        <Edit3 size={16} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Carbs */}
                  <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <View className="bg-amber-100 p-3 rounded-full">
                        <Wheat size={28} color="#d97706" />
                      </View>
                      <View className="ml-4">
                        <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                          Carbs
                        </Text>
                        {editingField === 'carbs' ? (
                          <TextInput
                            className="text-3xl font-bold text-gray-900 border-b border-gray-300 min-w-20"
                            value={editValues.carbs}
                            onChangeText={(value) => handleValueChange('carbs', value)}
                            keyboardType="numeric"
                            autoFocus
                            onBlur={() => setEditingField('')}
                          />
                        ) : (
                          <Text className="text-3xl font-bold text-gray-900">
                            {nutritionGoals.carbs}g
                          </Text>
                        )}
                      </View>
                    </View>
                    {editingField === 'carbs' ? (
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={cancelEditing}
                          className="bg-white p-3 rounded-full shadow-sm"
                        >
                          <X size={16} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={saveChanges}
                          disabled={updateNutritionGoals.isPending}
                          className="bg-white p-3 rounded-full shadow-sm"
                        >
                          <Check size={16} color="#22c55e" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => startEditing('carbs')}
                        className="bg-white p-3 rounded-full shadow-sm"
                      >
                        <Edit3 size={16} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Fat */}
                  <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center">
                      <View className="bg-blue-100 p-3 rounded-full">
                        <OliveOilIcon size={28} color="#2563eb" />
                      </View>
                      <View className="ml-4">
                        <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                          Fat
                        </Text>
                        {editingField === 'fat' ? (
                          <TextInput
                            className="text-3xl font-bold text-gray-900 border-b border-gray-300 min-w-20"
                            value={editValues.fat}
                            onChangeText={(value) => handleValueChange('fat', value)}
                            keyboardType="numeric"
                            autoFocus
                            onBlur={() => setEditingField('')}
                          />
                        ) : (
                          <Text className="text-3xl font-bold text-gray-900">
                            {nutritionGoals.fat}g
                          </Text>
                        )}
                      </View>
                    </View>
                    {editingField === 'fat' ? (
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={cancelEditing}
                          className="bg-white p-3 rounded-full shadow-sm"
                        >
                          <X size={16} color="#6b7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={saveChanges}
                          disabled={updateNutritionGoals.isPending}
                          className="bg-white p-3 rounded-full shadow-sm"
                        >
                          <Check size={16} color="#22c55e" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => startEditing('fat')}
                        className="bg-white p-3 rounded-full shadow-sm"
                      >
                        <Edit3 size={16} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Water Intake */}
              <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
                  <View className="flex-row items-center">
                    <View className="bg-cyan-100 p-3 rounded-full">
                      <GlassWater size={28} color="#0891b2" />
                    </View>
                    <View className="ml-4">
                      <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        Water per day
                      </Text>
                      {editingField === 'water' ? (
                        <TextInput
                          className="text-3xl font-bold text-gray-900 border-b border-gray-300 min-w-20"
                          value={editValues.water_ml}
                          onChangeText={(value) => handleValueChange('water_ml', value)}
                          keyboardType="numeric"
                          autoFocus
                          onBlur={() => setEditingField('')}
                        />
                      ) : (
                        <Text className="text-3xl font-bold text-gray-900">
                          {nutritionGoals.water_ml || 2500}ml
                        </Text>
                      )}
                    </View>
                  </View>
                  {editingField === 'water' ? (
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={cancelEditing}
                        className="bg-white p-3 rounded-full shadow-sm"
                      >
                        <X size={16} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={saveChanges}
                        disabled={updateNutritionGoals.isPending}
                        className="bg-white p-3 rounded-full shadow-sm"
                      >
                        <Check size={16} color="#22c55e" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => startEditing('water')}
                      className="bg-white p-3 rounded-full shadow-sm"
                    >
                      <Edit3 size={16} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Goal Summary */}
              <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                <View className="flex-row items-center mb-4">
                  <View className="bg-gray-100 w-12 h-12 rounded-xl items-center justify-center mr-4">
                    <Target size={24} color="#374151" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">Your Goal</Text>
                    <Text className="text-sm text-gray-500">
                      {nutritionGoals.weight_recommendation || 'Your personalized goal'}
                    </Text>
                  </View>
                </View>
                <Text className="text-3xl font-bold text-gray-900">
                  {formatGoal(nutritionGoals.primary_goal)}
                </Text>
              </View>
            </>
          ) : (
            <NutritionGoalsEmptyState
              nutritionGoals={nutritionGoals || null}
              hasOnboardingData={hasOnboardingData}
            />
          )}
        </View>

        {/* Goals Button */}
        <View className="px-4 mb-8">
          <GenerateMacrosButton 
            variant="secondary"
            onGenerationComplete={() => {
              // Goals will be automatically refreshed by the hook
            }}
          />
        </View>
      </ScrollView>

      <Questionnaire
        visible={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        steps={nutritionQuestionnaireSteps}
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
