import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  Utensils,
  Coffee,
  Sandwich,
  Cookie,
  ChevronRight,
  Sparkles,
  X,
  Beef,
  Wheat,
  Flame,
  Upload,
  Brain,
  Cpu,
  Zap,
} from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';
import { useThemedStyles } from '@/lib/utils/theme';

interface MealData {
  id: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  image_url?: string;
  analysis_status?: 'analyzing' | 'completed' | 'failed';
  analysis_progress?: number;
  analysis_stage?: 'uploading' | 'analyzing' | 'processing' | 'finalizing';
  confidence?: number;
  isPending?: boolean;
  isAnalyzing?: boolean;
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

const getStageIcon = (stage: string) => {
  switch (stage) {
    case 'uploading':
      return Upload;
    case 'analyzing':
      return Brain;
    case 'processing':
      return Cpu;
    case 'finalizing':
      return Zap;
    case 'failed':
      return X;
    default:
      return Upload;
  }
};

const getStageText = (stage: string) => {
  switch (stage) {
    case 'uploading':
      return 'Uploading image...';
    case 'analyzing':
      return 'AI analyzing food...';
    case 'processing':
      return 'Processing nutrition data...';
    case 'finalizing':
      return 'Finalizing meal entry...';
    case 'failed':
      return 'Analysis failed';
    default:
      return 'Analyzing...';
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'uploading':
      return '#3B82F6';
    case 'analyzing':
      return '#10B981';
    case 'processing':
      return '#F59E0B';
    case 'finalizing':
      return '#10B981';
    case 'failed':
      return '#EF4444';
    default:
      return '#3B82F6';
  }
};

export const MealCard = ({
  meal,
  onPress,
  onDiscardPending,
}: {
  meal: MealData;
  onPress?: (meal: MealData) => void;
  onDiscardPending?: (meal: MealData) => void;
}) => {
  const themed = useThemedStyles();
  const IconComponent = getMealIcon(meal.type);
  const mealTypeColor = getMealTypeColor(meal.type);

  const isAnalyzing =
    meal.analysis_status === 'analyzing' ||
    (meal.analysis_status !== 'completed' &&
      meal.analysis_status !== 'failed' &&
      (meal.analysis_stage === 'uploading' ||
        meal.analysis_stage === 'analyzing' ||
        meal.analysis_stage === 'processing' ||
        meal.analysis_stage === 'finalizing' ||
        meal.isAnalyzing));
  const isPending = meal.analysis_status === 'completed' && meal.isPending;
  const isFailed = meal.analysis_status === 'failed';

  // Determine display values based on state
  const displayName = isFailed 
    ? 'Analysis failed - Tap to retry' 
    : isAnalyzing 
    ? getStageText(meal.analysis_stage || 'analyzing') 
    : meal.name;

  const displayCalories = isAnalyzing ? 0 : meal.calories;
  const displayProtein = isAnalyzing ? 0 : meal.protein;
  const displayCarbs = isAnalyzing ? 0 : meal.carbs;
  const displayFat = isAnalyzing ? 0 : meal.fat;

  // Get stage-specific styling
  const stageColor = isAnalyzing
    ? getStageColor(meal.analysis_stage || 'analyzing')
    : mealTypeColor;
  const StageIcon = isAnalyzing ? getStageIcon(meal.analysis_stage || 'analyzing') : IconComponent;

  const handlePress = () => {
    if (!isAnalyzing && onPress) {
      onPress(meal);
    }
  };

  return (
    <TouchableOpacity
      className={themed("bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-50 relative", "bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm border border-gray-700 relative")}
      onPress={handlePress}
      disabled={isAnalyzing}
      style={{ opacity: isAnalyzing ? 0.9 : isFailed ? 0.8 : 1 }}
    >
      <View className="flex-row items-center">
        {/* Food Image */}
        {meal.image_url ? (
          <View className="w-24 h-24 rounded-xl mr-3 overflow-hidden relative">
            <Image
              source={{ uri: meal.image_url }}
              style={{ width: 96, height: 96 }}
              className="rounded-xl"
              resizeMode="cover"
            />
            {/* Failed overlay */}
            {isFailed && (
              <View className="absolute inset-0 bg-red-500/40 rounded-xl flex items-center justify-center">
                <View className="w-8 h-8 bg-red-500 rounded-full items-center justify-center">
                  <X size={16} color="white" />
                </View>
              </View>
            )}
            {/* Analyzing overlay with circular progress */}
            {isAnalyzing && (
              <View className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                <View className="w-24 h-24 items-center justify-center">
                  {/* Circular progress ring */}
                  <View
                    className="absolute w-16 h-16 rounded-full border-4 border-white/30"
                    style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                  <View
                    className="absolute w-16 h-16 rounded-full border-4 border-transparent"
                    style={{
                      borderTopColor: '#10B981',
                      borderRightColor:
                        (meal.analysis_progress || 0) > 25 ? '#10B981' : 'transparent',
                      borderBottomColor:
                        (meal.analysis_progress || 0) > 50 ? '#10B981' : 'transparent',
                      borderLeftColor:
                        (meal.analysis_progress || 0) > 75 ? '#10B981' : 'transparent',
                      transform: [{ rotate: '-90deg' }],
                    }}
                  />
                  {/* Progress percentage */}
                  <Text className="text-white text-xs font-bold">
                    {meal.analysis_progress || 0}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View
            style={{ backgroundColor: `${stageColor}20` }}
            className="w-24 h-24 rounded-xl items-center justify-center mr-3 relative"
          >
            {isPending ? (
              <Sparkles size={20} color={stageColor} />
            ) : isFailed ? (
              <X size={20} color="#EF4444" />
            ) : isAnalyzing ? (
              <>
                {/* Analyzing overlay with circular progress for no image */}
                <View className="w-16 h-16 items-center justify-center">
                  {/* Circular progress ring */}
                  <View
                    className="absolute w-16 h-16 rounded-full border-4"
                    style={{ borderColor: `${stageColor}30` }}
                  />
                  <View
                    className="absolute w-16 h-16 rounded-full border-4 border-transparent"
                    style={{
                      borderTopColor: stageColor,
                      borderRightColor:
                        (meal.analysis_progress || 0) > 25 ? stageColor : 'transparent',
                      borderBottomColor:
                        (meal.analysis_progress || 0) > 50 ? stageColor : 'transparent',
                      borderLeftColor:
                        (meal.analysis_progress || 0) > 75 ? stageColor : 'transparent',
                      transform: [{ rotate: '-90deg' }],
                    }}
                  />
                  {/* Progress percentage */}
                  <Text className="text-xs font-bold" style={{ color: stageColor }}>
                    {meal.analysis_progress || 0}%
                  </Text>
                </View>
              </>
            ) : (
              <StageIcon size={20} color={stageColor} />
            )}
          </View>
        )}

        {/* Food Details */}
        <View className="flex-1 gap-3">
          <Text className={themed("text-base font-semibold text-gray-900 mb-1", "text-base font-semibold text-white mb-1")} numberOfLines={1}>
            {displayName}
          </Text>

          {/* Calories */}
          <View className="flex-row items-center gap-2">
            <View className={themed("rounded-full bg-gray-100 p-1", "rounded-full bg-gray-700 p-1")}>
              <Flame size={14} color="#F59E0B" />
            </View>
            {isAnalyzing ? (
              <View className={themed("bg-gray-200 h-4 w-20 rounded animate-pulse", "bg-gray-600 h-4 w-20 rounded animate-pulse")} />
            ) : (
              <Text className={themed("text-sm text-gray-600 font-semibold", "text-sm text-gray-300 font-semibold")}>
                {isFailed ? 'Analysis failed' : `${displayCalories} calories`}
              </Text>
            )}
          </View>

          {/* Macronutrients with Icons */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center">
              <View className="rounded-full bg-red-100 p-1">
                <Beef size={14} color="#EF4444" />
              </View>
              {isAnalyzing ? (
                <View className={themed("bg-gray-200 h-3 w-8 rounded ml-1 animate-pulse", "bg-gray-600 h-3 w-8 rounded ml-1 animate-pulse")} />
              ) : (
                <Text className={themed("text-sm text-gray-700 ml-1", "text-sm text-gray-300 ml-1")}>{displayProtein}g</Text>
              )}
            </View>
            <View className="flex-row items-center">
              <View className="rounded-full bg-amber-100 p-1">
                <Wheat size={14} color="#F59E0B" />
              </View>
              {isAnalyzing ? (
                <View className={themed("bg-gray-200 h-3 w-8 rounded ml-1 animate-pulse", "bg-gray-600 h-3 w-8 rounded ml-1 animate-pulse")} />
              ) : (
                <Text className={themed("text-sm text-gray-700 ml-1", "text-sm text-gray-300 ml-1")}>{displayCarbs}g</Text>
              )}
            </View>
            <View className="flex-row items-center">
              <View className="rounded-full bg-blue-100 p-1">
                <OliveOilIcon size={14} color="#8B5CF6" />
              </View>
              {isAnalyzing ? (
                <View className={themed("bg-gray-200 h-3 w-8 rounded ml-1 animate-pulse", "bg-gray-600 h-3 w-8 rounded ml-1 animate-pulse")} />
              ) : (
                <Text className={themed("text-sm text-gray-700 ml-1", "text-sm text-gray-300 ml-1")}>{displayFat}g</Text>
              )}
            </View>
          </View>
        </View>

        {/* Right side - Time and Status */}
        <View className="items-end">
          <Text className={themed("text-xs text-gray-400 mb-1", "text-xs text-gray-500 mb-1")}>{meal.time}</Text>
          {!isPending && !isAnalyzing && <ChevronRight size={16} color="#D1D5DB" />}
        </View>
      </View>
    </TouchableOpacity>
  );
};
