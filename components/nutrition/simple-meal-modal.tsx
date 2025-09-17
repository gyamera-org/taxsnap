import React from 'react';
import { View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Clock, Flame, Beef, Wheat, Plus } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';
import { useCreateMealEntry } from '@/lib/hooks/use-meal-tracking';
import { toast } from 'sonner-native';

interface SimpleMealModalProps {
  isVisible: boolean;
  onClose: () => void;
  meal: any;
  mealType: string;
}

export default function SimpleMealModal({
  isVisible,
  onClose,
  meal,
  mealType,
}: SimpleMealModalProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();
  const createMealEntry = useCreateMealEntry();

  if (!meal) return null;

  const handleAddToLog = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Create meal entry data with proper structure
    const mealEntryData = {
      meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      food_items: [
        {
          food: {
            id: `planned-meal-${Date.now()}`,
            name: meal.name,
            brand: 'Meal Plan',
            category: 'Planned Meal',
            servingSize: '1 serving',
            nutrition: {
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs || 0,
              fat: meal.fat || 0,
              fiber: 0,
              sugar: 0,
            },
          },
          quantity: 1,
        },
      ],
      logged_date: today,
      logged_time: now,
      notes: `Added from meal plan: ${meal.name}`,
    };

    createMealEntry.mutate(mealEntryData, {
      onSuccess: () => {
        // toast.success("Meal added to today's log!");
        onClose();
      },
      onError: (error) => {
        toast.error('Failed to add meal to log');
        console.error('Error adding meal to log:', error);
      },
    });
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <View className={themed('flex-1 bg-gray-50', 'flex-1 bg-gray-950')}>
        {/* Header */}
        <View
          className={themed(
            'bg-white border-b border-gray-200 pt-12 pb-4 px-4',
            'bg-gray-900 border-b border-gray-700 pt-12 pb-4 px-4'
          )}
        >
          <View className="flex-row items-center justify-between">
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
                  'text-xl font-bold text-gray-900',
                  'text-xl font-bold text-white'
                )}
              >
                {meal.name}
              </Text>
              {meal.prep_time && (
                <View className="flex-row items-center mt-2">
                  <Clock size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text
                    className={themed('text-sm text-gray-600 ml-1', 'text-sm text-gray-400 ml-1')}
                  >
                    {meal.prep_time}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Nutrition Summary - Simplified */}
          <View
            className={themed(
              'bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm',
              'bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-700 shadow-sm'
            )}
          >
            {/* Single row with all nutrition info */}
            <View className="flex-row items-center justify-between">
              {/* Calories */}
              <View className="items-center flex-1">
                <View
                  className={themed(
                    'w-12 h-12 bg-yellow-50 rounded-xl items-center justify-center mb-2',
                    'w-12 h-12 bg-yellow-900/30 rounded-xl items-center justify-center mb-2'
                  )}
                >
                  <Flame size={16} color="#EAB308" />
                </View>
                <Text
                  className={themed(
                    'text-lg font-bold text-gray-900',
                    'text-lg font-bold text-white'
                  )}
                >
                  {meal.calories || 0}
                </Text>
                <Text
                  className={themed(
                    'text-xs text-gray-600',
                    'text-xs text-gray-400'
                  )}
                >
                  cal
                </Text>
              </View>

              {/* Protein */}
              <View className="items-center flex-1">
                <View
                  className={themed(
                    'w-12 h-12 bg-red-50 rounded-xl items-center justify-center mb-2',
                    'w-12 h-12 bg-red-900/30 rounded-xl items-center justify-center mb-2'
                  )}
                >
                  <Beef size={16} color="#EF4444" />
                </View>
                <Text
                  className={themed(
                    'text-lg font-bold text-gray-900',
                    'text-lg font-bold text-white'
                  )}
                >
                  {meal.protein || 0}g
                </Text>
                <Text
                  className={themed(
                    'text-xs text-gray-600',
                    'text-xs text-gray-400'
                  )}
                >
                  protein
                </Text>
              </View>

              {/* Carbs */}
              <View className="items-center flex-1">
                <View
                  className={themed(
                    'w-12 h-12 bg-orange-50 rounded-xl items-center justify-center mb-2',
                    'w-12 h-12 bg-orange-900/30 rounded-xl items-center justify-center mb-2'
                  )}
                >
                  <Wheat size={16} color="#F59E0B" />
                </View>
                <Text
                  className={themed(
                    'text-lg font-bold text-gray-900',
                    'text-lg font-bold text-white'
                  )}
                >
                  {meal.carbs || 0}g
                </Text>
                <Text
                  className={themed(
                    'text-xs text-gray-600',
                    'text-xs text-gray-400'
                  )}
                >
                  carbs
                </Text>
              </View>

              {/* Fat */}
              <View className="items-center flex-1">
                <View
                  className={themed(
                    'w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mb-2',
                    'w-12 h-12 bg-purple-900/30 rounded-xl items-center justify-center mb-2'
                  )}
                >
                  <OliveOilIcon size={16} color="#8B5CF6" />
                </View>
                <Text
                  className={themed(
                    'text-lg font-bold text-gray-900',
                    'text-lg font-bold text-white'
                  )}
                >
                  {meal.fat || 0}g
                </Text>
                <Text
                  className={themed(
                    'text-xs text-gray-600',
                    'text-xs text-gray-400'
                  )}
                >
                  fat
                </Text>
              </View>
            </View>
          </View>

          {/* Ingredients */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <View
              className={themed(
                'bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm',
                'bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-700 shadow-sm'
              )}
            >
              <Text
                className={themed(
                  'font-semibold text-gray-900 mb-3',
                  'font-semibold text-white mb-3'
                )}
              >
                Ingredients
              </Text>
              {meal.ingredients.map((ingredient: string, index: number) => (
                <View key={index} className="flex-row items-center py-2">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <Text className={themed('text-gray-700', 'text-gray-300')}>{ingredient}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Instructions */}
          {meal.instructions && (
            <View
              className={themed(
                'bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm',
                'bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-700 shadow-sm'
              )}
            >
              <Text
                className={themed(
                  'font-semibold text-gray-900 mb-3',
                  'font-semibold text-white mb-3'
                )}
              >
                Instructions
              </Text>
              <Text
                className={themed('text-gray-700 leading-relaxed', 'text-gray-300 leading-relaxed')}
              >
                {meal.instructions}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <View className={themed('p-4 border-t border-gray-200', 'p-4 border-t border-gray-700')}>
          <TouchableOpacity
            onPress={handleAddToLog}
            disabled={createMealEntry.isPending}
            className={themed(
              'bg-green-500 rounded-2xl py-4 px-6 flex-row items-center justify-center',
              'bg-green-600 rounded-2xl py-4 px-6 flex-row items-center justify-center'
            )}
            style={{ opacity: createMealEntry.isPending ? 0.6 : 1 }}
            activeOpacity={0.8}
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-lg">
              {createMealEntry.isPending ? 'Adding...' : "Add to Today's Log"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
