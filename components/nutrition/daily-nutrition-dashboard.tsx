import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import {
  useDailyNutritionSummary,
  useNutritionProgress,
  formatNutritionValue,
  getNutritionGoalStatus,
} from '@/lib/hooks/use-nutrition-summary';
import {
  Flame,
  Droplets,
  Apple,
  Wheat,
  Milk,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Coffee,
  Utensils,
  Sandwich,
  Cookie,
} from 'lucide-react-native';

interface DailyNutritionDashboardProps {
  date: string;
  showAddButtons?: boolean;
}

const mealTypeIcons = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Sandwich,
  snack: Cookie,
};

const mealTypeColors = {
  breakfast: '#F59E0B',
  lunch: '#10B981',
  dinner: '#8B5CF6',
  snack: '#EC4899',
};

export function DailyNutritionDashboard({
  date,
  showAddButtons = true,
}: DailyNutritionDashboardProps) {
  const { data: dailySummary, isLoading: summaryLoading } = useDailyNutritionSummary(date);
  const { data: progress, isLoading: progressLoading } = useNutritionProgress(date);

  if (summaryLoading || progressLoading) {
    return <DashboardSkeleton />;
  }

  if (!dailySummary || !progress) {
    return <EmptyDashboard date={date} showAddButtons={showAddButtons} />;
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Nutrition Progress Cards */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</Text>

        {/* Calories Card */}
        <NutritionCard
          title="Calories"
          icon={Flame}
          color="#EF4444"
          current={progress.calories.consumed}
          goal={progress.calories.goal}
          remaining={progress.calories.remaining}
          percentage={progress.calories.percentage}
          unit="cal"
        />

        {/* Macros Row */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <NutritionCard
              title="Protein"
              icon={Apple}
              color="#10B981"
              current={progress.protein.consumed}
              goal={progress.protein.goal}
              remaining={progress.protein.remaining}
              percentage={progress.protein.percentage}
              unit="g"
              compact
            />
          </View>
          <View className="flex-1">
            <NutritionCard
              title="Carbs"
              icon={Wheat}
              color="#F59E0B"
              current={progress.carbs.consumed}
              goal={progress.carbs.goal}
              remaining={progress.carbs.remaining}
              percentage={progress.carbs.percentage}
              unit="g"
              compact
            />
          </View>
          <View className="flex-1">
            <NutritionCard
              title="Fat"
              icon={Milk}
              color="#8B5CF6"
              current={progress.fat.consumed}
              goal={progress.fat.goal}
              remaining={progress.fat.remaining}
              percentage={progress.fat.percentage}
              unit="g"
              compact
            />
          </View>
        </View>

        {/* Water Card */}
        <NutritionCard
          title="Water"
          icon={Droplets}
          color="#3B82F6"
          current={progress.water.consumed}
          goal={progress.water.goal}
          remaining={progress.water.remaining}
          percentage={progress.water.percentage}
          unit="ml"
        />
      </View>

      {/* Meals Summary */}
      {dailySummary.meal_count > 0 && (
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Today's Meals</Text>
            <Text className="text-sm text-gray-500">{dailySummary.meal_count} meals logged</Text>
          </View>

          {Object.entries(dailySummary.meals_by_type).map(([mealType, meals]) => {
            if (meals.length === 0) return null;

            const Icon = mealTypeIcons[mealType as keyof typeof mealTypeIcons];
            const color = mealTypeColors[mealType as keyof typeof mealTypeColors];

            return (
              <View key={mealType} className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon size={16} color={color} />
                    </View>
                    <Text className="font-semibold text-gray-900 capitalize">{mealType}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-500 ml-1">
                      {meals[0]?.logged_time?.slice(0, 5)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">
                    {Math.round(meals.reduce((sum, meal) => sum + meal.total_calories, 0))} cal
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {meals.reduce((sum, meal) => sum + meal.food_items.length, 0)} items
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Quick Actions */}
      {showAddButtons && (
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/log-meal')}
              className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
            >
              <Utensils size={24} color="#10B981" />
              <Text className="text-gray-900 font-semibold mt-2">Add Meal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/log-water')}
              className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
            >
              <Droplets size={24} color="#3B82F6" />
              <Text className="text-gray-900 font-semibold mt-2">Add Water</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function NutritionCard({
  title,
  icon: Icon,
  color,
  current,
  goal,
  remaining,
  percentage,
  unit,
  compact = false,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  current: number;
  goal: number;
  remaining: number;
  percentage: number;
  unit: string;
  compact?: boolean;
}) {
  const status = getNutritionGoalStatus(current, goal);
  const StatusIcon =
    percentage > 100 ? TrendingUp : remaining > goal * 0.2 ? TrendingDown : TrendingUp;

  return (
    <View
      className={`bg-white rounded-xl p-4 mb-3 border border-gray-100 ${compact ? 'min-h-[120px]' : ''}`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={16} color={color} />
          </View>
          <Text className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {title}
          </Text>
        </View>

        {!compact && (
          <View className="flex-row items-center">
            <StatusIcon size={14} color={status === 'good' ? '#10B981' : '#EF4444'} />
            <Text
              className={`text-xs ml-1 ${
                status === 'good'
                  ? 'text-green-600'
                  : status === 'low'
                    ? 'text-orange-600'
                    : 'text-red-600'
              }`}
            >
              {status === 'good' ? 'On track' : status === 'low' ? 'Low' : 'Over goal'}
            </Text>
          </View>
        )}
      </View>

      <View className="mb-3">
        <Text className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
          {formatNutritionValue(current, unit)}
        </Text>
        <Text className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          of {formatNutritionValue(goal, unit)}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-2">
        <View className="bg-gray-100 rounded-full h-2">
          <View
            className="h-2 rounded-full"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            }}
          />
        </View>
      </View>

      {!compact && (
        <Text className="text-xs text-gray-500">
          {remaining > 0 ? `${formatNutritionValue(remaining, unit)} remaining` : 'Goal reached!'}
        </Text>
      )}
    </View>
  );
}

function DashboardSkeleton() {
  return (
    <View className="px-4">
      <View className="h-4 bg-gray-200 rounded w-32 mb-4" />
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
          <View className="h-3 bg-gray-200 rounded w-24 mb-3" />
          <View className="h-8 bg-gray-200 rounded w-16 mb-3" />
          <View className="h-2 bg-gray-200 rounded mb-2" />
          <View className="h-3 bg-gray-200 rounded w-20" />
        </View>
      ))}
    </View>
  );
}

function EmptyDashboard({ date, showAddButtons }: { date: string; showAddButtons: boolean }) {
  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <View className="px-4 py-8">
      <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: '#F3E8FF' }}
        >
          <Utensils size={32} color="#8B5CF6" />
        </View>
        <Text className="text-gray-900 font-semibold text-lg mb-2">
          {isToday ? 'No meals logged today' : 'No meals logged'}
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          {isToday ? 'Start tracking your nutrition journey!' : `No nutrition data for ${date}`}
        </Text>

        {showAddButtons && isToday && (
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={() => router.push('/log-meal')}
              className="flex-1 bg-purple-500 rounded-2xl p-3 items-center"
            >
              <Text className="text-white font-semibold">Log First Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/log-water')}
              className="flex-1 bg-blue-500 rounded-2xl p-3 items-center"
            >
              <Text className="text-white font-semibold">Add Water</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
