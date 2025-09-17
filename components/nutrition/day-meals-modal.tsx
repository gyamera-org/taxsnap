import React from 'react';
import { View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Calendar, Flame, Beef, Wheat, Plus, Clock } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';
import { useCreateMealEntry } from '@/lib/hooks/use-meal-tracking';
import { toast } from 'sonner-native';

interface DayMealsModalProps {
  isVisible: boolean;
  onClose: () => void;
  day: any;
}

export default function DayMealsModal({ isVisible, onClose, day }: DayMealsModalProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();
  const createMealEntry = useCreateMealEntry();

  if (!day) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAddMealToLog = (meal: any, mealType: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    const mealEntryData = {
      meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      food_items: [
        {
          quantity: 1,
          food: {
            id: `meal-plan-${Date.now()}`,
            name: meal.name,
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
        },
      ],
      logged_date: today,
      logged_time: now,
      notes: `Added from meal plan: ${meal.name}`,
    };

    createMealEntry.mutate(mealEntryData, {
      onSuccess: () => {
        // toast.success(`${meal.name} added to today's log!`);
      },
      onError: (error) => {
        toast.error('Failed to add meal to log');
        console.error('Error adding meal to log:', error);
      },
    });
  };

  const renderMeal = (meal: any, mealType: string) => {
    if (!meal) return null;

    return (
      <View
        key={mealType}
        className={themed(
          'bg-white rounded-xl p-4 mb-3 border border-gray-100',
          'bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700'
        )}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text
              className={themed(
                'text-sm font-medium text-gray-500 uppercase tracking-wide',
                'text-sm font-medium text-gray-400 uppercase tracking-wide'
              )}
            >
              {mealType}
            </Text>
            <Text
              className={themed(
                'text-lg font-semibold text-gray-900 mt-1',
                'text-lg font-semibold text-white mt-1'
              )}
            >
              {meal.name}
            </Text>
          </View>
          {meal.prep_time && (
            <View className="flex-row items-center">
              <Clock size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className={themed('text-xs text-gray-500 ml-1', 'text-xs text-gray-400 ml-1')}>
                {meal.prep_time}
              </Text>
            </View>
          )}
        </View>

        {/* Nutrition Row */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View
              className={themed(
                'w-6 h-6 bg-yellow-100 rounded-full items-center justify-center mr-1',
                'w-6 h-6 bg-yellow-900/30 rounded-full items-center justify-center mr-1'
              )}
            >
              <Flame size={12} color="#EAB308" />
            </View>
            <Text
              className={themed(
                'text-sm font-medium text-gray-900',
                'text-sm font-medium text-white'
              )}
            >
              {meal.calories || 0}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View
              className={themed(
                'w-5 h-5 bg-red-100 rounded-full items-center justify-center mr-1',
                'w-5 h-5 bg-red-900/30 rounded-full items-center justify-center mr-1'
              )}
            >
              <Beef size={10} color="#EF4444" />
            </View>
            <Text className={themed('text-sm text-gray-600', 'text-sm text-gray-400')}>
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
            <Text className={themed('text-sm text-gray-600', 'text-sm text-gray-400')}>
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
            <Text className={themed('text-sm text-gray-600', 'text-sm text-gray-400')}>
              {meal.fat || 0}g
            </Text>
          </View>
        </View>

        {/* Add to Log Button */}
        <TouchableOpacity
          onPress={() => handleAddMealToLog(meal, mealType)}
          disabled={createMealEntry.isPending}
          className={themed(
            'bg-green-500 rounded-xl py-3 px-4 flex-row items-center justify-center',
            'bg-green-600 rounded-xl py-3 px-4 flex-row items-center justify-center'
          )}
          activeOpacity={0.8}
        >
          <Plus size={16} color="white" />
          <Text className="text-white font-medium ml-2">Add to Today's Log</Text>
        </TouchableOpacity>
      </View>
    );
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
            <View className="flex-row items-center flex-1">
              <Calendar size={20} color="#10B981" />
              <View className="ml-3 flex-1">
                <Text
                  className={themed(
                    'text-xl font-bold text-gray-900',
                    'text-xl font-bold text-white'
                  )}
                >
                  {day.day}
                </Text>
                <Text className={themed('text-sm text-gray-600', 'text-sm text-gray-400')}>
                  {formatDate(day.date)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Daily Totals */}
          {day.daily_totals && (
            <View
              className={themed(
                'bg-green-50 rounded-xl p-3 mt-4',
                'bg-green-900/20 rounded-xl p-3 mt-4'
              )}
            >
              <Text
                className={themed(
                  'text-green-800 font-medium text-center mb-2',
                  'text-green-200 font-medium text-center mb-2'
                )}
              >
                Daily Totals
              </Text>
              <View className="flex-row justify-center gap-6">
                <View className="items-center">
                  <View
                    className={themed(
                      'w-6 h-6 bg-yellow-100 rounded-full items-center justify-center mb-1',
                      'w-6 h-6 bg-yellow-900/30 rounded-full items-center justify-center mb-1'
                    )}
                  >
                    <Flame size={12} color="#EAB308" />
                  </View>
                  <Text className={themed('text-green-700 font-bold', 'text-green-300 font-bold')}>
                    {day.daily_totals.calories || 0}
                  </Text>
                </View>
                <View className="items-center">
                  <View
                    className={themed(
                      'w-6 h-6 bg-red-100 rounded-full items-center justify-center mb-1',
                      'w-6 h-6 bg-red-900/30 rounded-full items-center justify-center mb-1'
                    )}
                  >
                    <Beef size={12} color="#EF4444" />
                  </View>
                  <Text className={themed('text-green-700 font-bold', 'text-green-300 font-bold')}>
                    {day.daily_totals.protein || 0}g
                  </Text>
                </View>
                <View className="items-center">
                  <View
                    className={themed(
                      'w-6 h-6 bg-orange-100 rounded-full items-center justify-center mb-1',
                      'w-6 h-6 bg-orange-900/30 rounded-full items-center justify-center mb-1'
                    )}
                  >
                    <Wheat size={12} color="#F59E0B" />
                  </View>
                  <Text className={themed('text-green-700 font-bold', 'text-green-300 font-bold')}>
                    {day.daily_totals.carbs || 0}g
                  </Text>
                </View>
                <View className="items-center">
                  <View
                    className={themed(
                      'w-6 h-6 bg-purple-100 rounded-full items-center justify-center mb-1',
                      'w-6 h-6 bg-purple-900/30 rounded-full items-center justify-center mb-1'
                    )}
                  >
                    <OliveOilIcon size={12} color="#8B5CF6" />
                  </View>
                  <Text className={themed('text-green-700 font-bold', 'text-green-300 font-bold')}>
                    {day.daily_totals.fat || 0}g
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {day.meals?.breakfast && renderMeal(day.meals.breakfast, 'breakfast')}
          {day.meals?.lunch && renderMeal(day.meals.lunch, 'lunch')}
          {day.meals?.dinner && renderMeal(day.meals.dinner, 'dinner')}
          {day.meals?.snacks?.map((snack: any) => renderMeal(snack, `snack`))}
        </ScrollView>
      </View>
    </Modal>
  );
}
