import React from 'react';
import { View, TouchableOpacity, Alert, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  Utensils,
  Coffee,
  Sandwich,
  Cookie,
  ChevronRight,
  Timer,
  Sparkles,
  Check,
  X,
  Upload,
  Brain,
  Cpu,
  Zap,
} from 'lucide-react-native';
import { toast } from 'sonner-native';
import { ModernAnalyzingCard } from '../food/modern-analyzing-card';

interface MealData {
  id: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  image_url?: string; // Added for AI food scanning
  // Analysis status properties
  analysis_status?: 'analyzing' | 'completed' | 'failed';
  analysis_progress?: number; // 0-100
  analysis_stage?: 'uploading' | 'analyzing' | 'processing' | 'finalizing';
  confidence?: number;
  // Legacy properties for backwards compatibility
  isPending?: boolean;
  isAnalyzing?: boolean;
}

interface MealsSectionProps {
  meals: MealData[];
  onAddMealPress?: () => void;
  onMealPress?: (meal: MealData) => void;
  // Pending food actions
  onSavePendingFood?: (meal: MealData) => void;
  onDiscardPendingFood?: (meal: MealData) => void;
}

const getMealIcon = (type: string) => {
  switch (type) {
    case 'breakfast':
      return Coffee;
    case 'lunch':
      return Utensils;
    case 'dinner':
      return Sandwich;
    case 'snack':
      return Cookie;
    default:
      return Utensils;
  }
};

const getMealTypeColor = (type: string) => {
  switch (type) {
    case 'breakfast':
      return '#F59E0B';
    case 'lunch':
      return '#10B981';
    case 'dinner':
      return '#8B5CF6';
    case 'snack':
      return '#EC4899';
    default:
      return '#6B7280';
  }
};

const getAnalysisStageIcon = (stage?: string) => {
  switch (stage) {
    case 'uploading':
      return Upload;
    case 'analyzing':
      return Brain;
    case 'processing':
      return Cpu;
    case 'finalizing':
      return Zap;
    default:
      return Timer;
  }
};

const getAnalysisStageText = (stage?: string) => {
  switch (stage) {
    case 'uploading':
      return 'Uploading image...';
    case 'analyzing':
      return 'AI analyzing food...';
    case 'processing':
      return 'Processing nutrition data...';
    case 'finalizing':
      return 'Finalizing meal entry...';
    default:
      return 'Analyzing...';
  }
};

const MealCard = ({
  meal,
  onPress,
  onSavePending,
  onDiscardPending,
}: {
  meal: MealData;
  onPress?: (meal: MealData) => void;
  onSavePending?: (meal: MealData) => void;
  onDiscardPending?: (meal: MealData) => void;
}) => {
  const IconComponent = getMealIcon(meal.type);
  const color = getMealTypeColor(meal.type);

  // Determine analysis state (prioritize new analysis_status over legacy properties)
  const isAnalyzing =
    meal.analysis_status === 'analyzing' ||
    (meal.isAnalyzing && meal.analysis_status !== 'completed');
  const isPending = meal.analysis_status === 'completed' && meal.isPending; // Legacy pending state
  const isFailed = meal.analysis_status === 'failed';

  const AnalysisStageIcon = getAnalysisStageIcon(meal.analysis_stage);
  const analysisStageText = getAnalysisStageText(meal.analysis_stage);

  const handleDiscardPending = () => {
    Alert.alert('Discard Food', `Are you sure you want to discard "${meal.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          onDiscardPending?.(meal);
        },
      },
    ]);
  };

  // If meal is being analyzed, use the modern analyzing card
  if (isAnalyzing) {
    return (
      <ModernAnalyzingCard
        imageUrl={meal.image_url}
        progress={meal.analysis_progress}
        stage={meal.analysis_stage}
        mealType={meal.type}
        time={meal.time}
      />
    );
  }

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-50"
      onPress={() => !isPending && onPress?.(meal)}
      disabled={false}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {meal.image_url ? (
            <View className="w-16 h-16 rounded-xl mr-3 overflow-hidden">
              <Image
                source={{ uri: meal.image_url }}
                style={{ width: 64, height: 64 }}
                className="rounded-xl"
                resizeMode="cover"
              />
            </View>
          ) : (
            <View
              style={{ backgroundColor: `${color}20` }}
              className="w-16 h-16 rounded-xl items-center justify-center mr-3"
            >
              {isPending ? (
                <Sparkles size={20} color={color} />
              ) : isFailed ? (
                <X size={20} color="#EF4444" />
              ) : (
                <IconComponent size={20} color={color} />
              )}
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-medium text-gray-500 capitalize">{meal.type}</Text>
              <Text className="text-xs text-gray-400">{meal.time}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-base font-semibold text-gray-900 mb-1">{meal.name}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-600">
                {isFailed ? 'Analysis failed' : `${meal.calories} cal`}
              </Text>
              {isPending && meal.confidence && (
                <Text className="text-xs text-blue-600 ml-2">• {meal.confidence}% confidence</Text>
              )}
              {isFailed && (
                <Text className="text-xs text-red-600 ml-2">• Please try scanning again</Text>
              )}
            </View>
          </View>
        </View>

        {!isPending && <ChevronRight size={16} color="#D1D5DB" />}
      </View>

      {/* Nutrition breakdown or analysis status */}
      {isFailed ? (
        <View className="mt-3 pt-3 border-t border-gray-50">
          <View className="bg-red-50 rounded-xl p-3 mb-3">
            <View className="flex-row items-center justify-center mb-2">
              <X size={16} color="#EF4444" />
              <Text className="text-red-600 font-medium ml-2">Analysis Failed</Text>
            </View>
            <Text className="text-red-500 text-sm text-center">
              Unable to analyze your food. Please try scanning again.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onDiscardPending?.(meal)}
            className="bg-red-100 py-2 rounded-xl flex-row items-center justify-center"
          >
            <X size={14} color="#EF4444" />
            <Text className="text-red-700 font-medium ml-1 text-sm">Remove Failed Entry</Text>
          </TouchableOpacity>
        </View>
      ) : isPending ? (
        <View className="mt-3 pt-3 border-t border-gray-50">
          <View className="flex-row justify-between mb-3">
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-400">Protein</Text>
              <Text className="text-sm font-medium text-gray-700">{meal.protein}g</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-400">Carbs</Text>
              <Text className="text-sm font-medium text-gray-700">{meal.carbs}g</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-400">Fat</Text>
              <Text className="text-sm font-medium text-gray-700">{meal.fat}g</Text>
            </View>
          </View>

          {/* Pending Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleDiscardPending}
              className="flex-1 bg-gray-100 py-2 rounded-xl flex-row items-center justify-center"
            >
              <X size={14} color="#6B7280" />
              <Text className="text-gray-700 font-medium ml-1 text-sm">Discard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSavePending?.(meal)}
              className="flex-1 bg-green-500 py-2 rounded-xl flex-row items-center justify-center"
            >
              <Check size={14} color="white" />
              <Text className="text-white font-medium ml-1 text-sm">Save to Meals</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-50">
          <View className="items-center">
            <Text className="text-xs text-gray-400">Protein</Text>
            <Text className="text-sm font-medium text-gray-700">{meal.protein}g</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400">Carbs</Text>
            <Text className="text-sm font-medium text-gray-700">{meal.carbs}g</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400">Fat</Text>
            <Text className="text-sm font-medium text-gray-700">{meal.fat}g</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const EmptyMealsState = ({ onAddMealPress }: { onAddMealPress?: () => void }) => (
  <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-50">
    <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
      <Utensils size={24} color="#9CA3AF" />
    </View>
    <Text className="text-gray-500 text-center mb-2">No meals logged today</Text>
    <TouchableOpacity onPress={onAddMealPress} className="bg-green-500 px-4 py-2 rounded-xl">
      <Text className="text-white font-medium">Log Your First Meal</Text>
    </TouchableOpacity>
  </View>
);

export default function MealsSection({
  meals,
  onAddMealPress,
  onMealPress,
  onSavePendingFood,
  onDiscardPendingFood,
}: MealsSectionProps) {
  // Sort meals - analyzing first, then failed, then pending, then saved
  const sortedMeals = meals.sort((a, b) => {
    const aAnalyzing = a.analysis_status === 'analyzing' || a.isAnalyzing;
    const bAnalyzing = b.analysis_status === 'analyzing' || b.isAnalyzing;
    const aFailed = a.analysis_status === 'failed';
    const bFailed = b.analysis_status === 'failed';
    const aPending = (a.analysis_status === 'completed' && a.isPending) || a.isPending;
    const bPending = (b.analysis_status === 'completed' && b.isPending) || b.isPending;

    if (aAnalyzing && !bAnalyzing) return -1;
    if (!aAnalyzing && bAnalyzing) return 1;
    if (aFailed && !bFailed) return -1;
    if (!aFailed && bFailed) return 1;
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    return 0;
  });

  return (
    <View className="px-4 mb-6 mt-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900">Today's Meals</Text>
        <TouchableOpacity onPress={onAddMealPress}>
          <Text className="text-green-600 font-medium">Add Meal</Text>
        </TouchableOpacity>
      </View>

      {sortedMeals.length > 0 ? (
        sortedMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onPress={onMealPress}
            onSavePending={onSavePendingFood}
            onDiscardPending={onDiscardPendingFood}
          />
        ))
      ) : (
        <EmptyMealsState onAddMealPress={onAddMealPress} />
      )}
    </View>
  );
}
