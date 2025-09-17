import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { Clock, Flame, Beef, Wheat, Plus, Eye, Check, Heart } from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';

interface PlannedMealCardProps {
  meal: any;
  mealType: string;
  isLogged?: boolean;
  isSaved?: boolean;
  onView?: (meal: any, mealType: string) => void;
  onToggleFavorite?: (meal: any, mealType: string) => void;
  onAddToLog?: (meal: any, mealType: string) => void;
  showActions?: boolean;
  isAddingToLog?: boolean;
}

export default function PlannedMealCard({
  meal,
  mealType,
  isLogged = false,
  isSaved = false,
  onView,
  onToggleFavorite,
  onAddToLog,
  showActions = true,
  isAddingToLog = false,
}: PlannedMealCardProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();

  if (!meal) return null;

  return (
    <View
      className={themed(
        'bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm',
        'bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-700 shadow-sm'
      )}
    >
      <View className="flex-row">
        {/* Left: Calories Display */}
        <View
          className={themed(
            'w-16 h-16 bg-yellow-50 rounded-xl items-center justify-center mr-4',
            'w-16 h-16 bg-yellow-900/30 rounded-xl items-center justify-center mr-4'
          )}
        >
          <Flame size={20} color="#EAB308" />
          <Text
            className={themed(
              'text-xs font-bold text-yellow-700 mt-1',
              'text-xs font-bold text-yellow-300 mt-1'
            )}
          >
            {meal.calories || 0}
          </Text>
        </View>

        {/* Center: Meal Info */}
        <View className="flex-1">
          <Text
            className={themed(
              'text-xs font-medium text-green-600 uppercase tracking-wide mb-1',
              'text-xs font-medium text-green-400 uppercase tracking-wide mb-1'
            )}
          >
            {mealType}
          </Text>

          <Text
            className={themed(
              'text-lg font-semibold text-gray-900 mb-2',
              'text-lg font-semibold text-white mb-2'
            )}
            numberOfLines={2}
          >
            {meal.name}
          </Text>

          {/* Prep Time */}
          {meal.prep_time && (
            <View className="flex-row items-center mb-2">
              <Clock size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text
                className={themed('text-xs text-gray-500 ml-1', 'text-xs text-gray-400 ml-1')}
              >
                {meal.prep_time}
              </Text>
            </View>
          )}

          {/* Simplified Nutrition Info */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center">
              <View
                className={themed(
                  'w-5 h-5 bg-red-100 rounded-full items-center justify-center mr-1',
                  'w-5 h-5 bg-red-900/30 rounded-full items-center justify-center mr-1'
                )}
              >
                <Beef size={10} color="#EF4444" />
              </View>
              <Text className={themed('text-xs text-gray-600', 'text-xs text-gray-400')}>
                {meal.protein || 0}g
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className={themed(
                  'w-5 h-5 bg-orange-100 rounded-full items-center justify-center mr-1',
                  'w-5 h-5 bg-orange-900/30 rounded-full items-center justify-center mr-1'
                )}
              >
                <Wheat size={10} color="#F59E0B" />
              </View>
              <Text className={themed('text-xs text-gray-600', 'text-xs text-gray-400')}>
                {meal.carbs || 0}g
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className={themed(
                  'w-5 h-5 bg-purple-100 rounded-full items-center justify-center mr-1',
                  'w-5 h-5 bg-purple-900/30 rounded-full items-center justify-center mr-1'
                )}
              >
                <OliveOilIcon size={10} color="#8B5CF6" />
              </View>
              <Text className={themed('text-xs text-gray-600', 'text-xs text-gray-400')}>
                {meal.fat || 0}g
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Action Buttons */}
        {showActions && (
          <View className="items-center justify-center ml-3 gap-1">
            {/* View Button */}
            {onView && (
              <TouchableOpacity
                onPress={() => onView(meal, mealType)}
                className={themed(
                  'w-8 h-8 bg-gray-100 rounded-full items-center justify-center',
                  'w-8 h-8 bg-gray-700 rounded-full items-center justify-center'
                )}
                activeOpacity={0.8}
              >
                <Eye size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}

            {/* Save Button */}
            {onToggleFavorite && (
              <TouchableOpacity
                onPress={() => onToggleFavorite(meal, mealType)}
                className={themed(
                  isSaved
                    ? 'w-8 h-8 bg-pink-100 rounded-full items-center justify-center'
                    : 'w-8 h-8 bg-gray-100 rounded-full items-center justify-center',
                  isSaved
                    ? 'w-8 h-8 bg-pink-900/30 rounded-full items-center justify-center'
                    : 'w-8 h-8 bg-gray-700 rounded-full items-center justify-center'
                )}
                activeOpacity={0.8}
              >
                <Heart
                  size={14}
                  color={isSaved ? '#EC4899' : isDark ? '#9CA3AF' : '#6B7280'}
                  fill={isSaved ? '#EC4899' : 'none'}
                />
              </TouchableOpacity>
            )}

            {/* Add to Log Button */}
            {onAddToLog && (
              <TouchableOpacity
                onPress={() => onAddToLog(meal, mealType)}
                disabled={isAddingToLog || isLogged}
                className={themed(
                  isLogged
                    ? 'w-8 h-8 bg-green-100 rounded-full items-center justify-center'
                    : 'w-8 h-8 bg-green-500 rounded-full items-center justify-center',
                  isLogged
                    ? 'w-8 h-8 bg-green-900/30 rounded-full items-center justify-center'
                    : 'w-8 h-8 bg-green-600 rounded-full items-center justify-center'
                )}
                activeOpacity={0.8}
              >
                {isLogged ? <Check size={14} color="#10B981" /> : <Plus size={14} color="white" />}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}