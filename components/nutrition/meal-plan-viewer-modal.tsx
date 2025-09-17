import { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  X,
  Calendar,
  ShoppingCart,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Flame,
  Sparkles,
  RotateCcw,
} from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import { useGroceryList } from '@/lib/hooks/use-meal-plans';
import SimpleMealModal from './simple-meal-modal';
import PlannedMealsSection from './planned-meals-section';

interface MealPlanViewerModalProps {
  isVisible: boolean;
  onClose: () => void;
  mealPlan: any;
  onRegeneratePlan?: () => void;
  onRegenerateDay?: (dayIndex: number) => void;
}

export default function MealPlanViewerModal({
  isVisible,
  onClose,
  mealPlan,
  onRegeneratePlan,
  onRegenerateDay,
}: MealPlanViewerModalProps) {
  const themed = useThemedStyles();
  const { isDark } = useTheme();
  // Debug logging can be removed since PlannedMealsSection handles all the logic
  const [selectedTab, setSelectedTab] = useState<'meals' | 'grocery'>('meals');
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0])); // First day expanded by default
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [showMealModal, setShowMealModal] = useState(false);
  const { data: groceryList } = useGroceryList(mealPlan?.id);

  if (!mealPlan) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
      } else {
        newSet.add(dayIndex);
      }
      return newSet;
    });
  };


  // All meal logic is now handled by PlannedMealsSection

  const renderGroceryCategory = (categoryName: string, items: any[]) => {
    return (
      <View key={categoryName} className="mb-6">
        <Text
          className={themed('font-semibold text-gray-900 mb-3', 'font-semibold text-white mb-3')}
        >
          {categoryName}
        </Text>
        {items.map((item, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-2 border-b border-gray-200"
          >
            <View className="flex-1">
              <Text className={themed('text-gray-900', 'text-white')}>{item.name}</Text>
              <Text className={themed('text-sm text-gray-600', 'text-sm text-gray-400')}>
                {item.quantity}
              </Text>
            </View>
            <Text className={themed('font-medium text-gray-900', 'font-medium text-white')}>
              ${item.estimatedPrice}
            </Text>
          </View>
        ))}
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
            <View className="flex-1">
              <Text
                className={themed(
                  'text-xl font-bold text-gray-900',
                  'text-xl font-bold text-white'
                )}
              >
                {mealPlan.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className={themed('text-sm text-gray-600', 'text-sm text-gray-400')}>
                  {mealPlan.meals_data?.days?.length || 0} days
                </Text>
                <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                <Text className={themed('text-sm text-gray-600', 'text-sm text-gray-400')}>
                  ${mealPlan.estimated_cost || 0}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={() => setSelectedTab('meals')}
              className={`flex-1 py-2 px-4 rounded-lg mr-2 ${
                selectedTab === 'meals'
                  ? themed('bg-green-100', 'bg-green-900/20')
                  : themed('bg-gray-100', 'bg-gray-800')
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  selectedTab === 'meals'
                    ? themed('text-green-700', 'text-green-300')
                    : themed('text-gray-700', 'text-gray-300')
                }`}
              >
                Meals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('grocery')}
              className={`flex-1 py-2 px-4 rounded-lg ml-2 ${
                selectedTab === 'grocery'
                  ? themed('bg-green-100', 'bg-green-900/20')
                  : themed('bg-gray-100', 'bg-gray-800')
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  selectedTab === 'grocery'
                    ? themed('text-green-700', 'text-green-300')
                    : themed('text-gray-700', 'text-gray-300')
                }`}
              >
                Grocery List
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {selectedTab === 'meals' ? (
            /* Meals Tab - Accordion Layout */
            <View>
              {mealPlan.meals_data?.days?.map((day: any, dayIndex: number) => {
                const isExpanded = expandedDays.has(dayIndex);

                return (
                  <View key={dayIndex} className="mb-4">
                    {/* Accordion Header */}
                    <TouchableOpacity
                      onPress={() => toggleDay(dayIndex)}
                      className={themed(
                        'bg-white rounded-xl p-4 mb-2 border border-gray-100 shadow-sm',
                        'bg-gray-800 rounded-xl p-4 mb-2 border border-gray-700 shadow-sm'
                      )}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <Calendar size={16} color="#10B981" />
                          <View className="ml-3 flex-1">
                            <Text
                              className={themed(
                                'font-semibold text-gray-900',
                                'font-semibold text-white'
                              )}
                            >
                              {day.day} - {formatDate(day.date)}
                            </Text>
                            <View className="flex-row items-center">
                              <View
                                className={themed(
                                  'w-5 h-5 bg-yellow-100 rounded-full items-center justify-center mr-1',
                                  'w-5 h-5 bg-yellow-900/30 rounded-full items-center justify-center mr-1'
                                )}
                              >
                                <Flame size={10} color="#EAB308" />
                              </View>
                              <Text
                                className={themed('text-sm text-gray-600', 'text-sm text-gray-400')}
                              >
                                {day.daily_totals?.calories || 0}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className="flex-row items-center">
                          {onRegenerateDay && (
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                onRegenerateDay(dayIndex);
                              }}
                              className={themed(
                                'w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3',
                                'w-8 h-8 bg-green-900/30 rounded-full items-center justify-center mr-3'
                              )}
                              activeOpacity={0.7}
                            >
                              <RotateCcw size={14} color="#10B981" />
                            </TouchableOpacity>
                          )}
                          {isExpanded ? (
                            <ChevronDown size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                          ) : (
                            <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <PlannedMealsSection
                        dayData={day}
                        showHeader={false}
                        showViewAllButton={false}
                        onShowMealDetails={(meal, mealType) => {
                          setSelectedMeal(meal);
                          setSelectedMealType(mealType);
                          setShowMealModal(true);
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            /* Grocery List Tab */
            <View>
              {groceryList ? (
                <>
                  <View
                    className={themed(
                      'bg-green-50 rounded-xl p-4 mb-6',
                      'bg-green-900/20 rounded-xl p-4 mb-6'
                    )}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={themed(
                          'font-semibold text-green-800',
                          'font-semibold text-green-200'
                        )}
                      >
                        {groceryList.name}
                      </Text>
                      <Text
                        className={themed('font-bold text-green-800', 'font-bold text-green-200')}
                      >
                        Total: ${groceryList.total_estimated_cost}
                      </Text>
                    </View>
                  </View>

                  {groceryList.items?.categories &&
                    Object.entries(groceryList.items.categories).map(
                      ([category, items]: [string, any]) => renderGroceryCategory(category, items)
                    )}
                </>
              ) : (
                <View className="items-center py-8">
                  <ShoppingCart size={48} color="#9CA3AF" />
                  <Text className={themed('text-gray-600 mt-4', 'text-gray-400 mt-4')}>
                    Grocery list not available
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Regenerate Button */}
        {onRegeneratePlan && (
          <View className={themed('p-4 border-t border-gray-200', 'p-4 border-t border-gray-700')}>
            <TouchableOpacity
              onPress={() => {
                onRegeneratePlan();
                onClose();
              }}
              className={themed(
                'bg-green-500 rounded-xl py-4 px-6 flex-row items-center justify-center',
                'bg-green-600 rounded-xl py-4 px-6 flex-row items-center justify-center'
              )}
              activeOpacity={0.8}
            >
              <Sparkles size={20} color="white" />
              <Text className="text-white font-semibold ml-3 text-lg">Regenerate Meal Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Simple Meal Modal */}
      <SimpleMealModal
        isVisible={showMealModal}
        onClose={() => setShowMealModal(false)}
        meal={selectedMeal}
        mealType={selectedMealType}
      />
    </Modal>
  );
}
