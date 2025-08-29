import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { InfiniteScrollList } from '@/components/common/infinite-scroll-list';
import { Exercise } from '@/data/exercisesData';
import { getIconComponent } from '@/lib/utils/get-icon-component';

interface ExerciseListProps {
  exercises: Exercise[];
  onExercisePress: (exercise: Exercise) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onExercisePress,
  isLoading = false,
  hasNextPage = false,
  onLoadMore,
  refreshing = false,
  onRefresh,
}) => {
  const renderExerciseItem = ({ item: exercise }: { item: Exercise }) => {
    const IconComponent = getIconComponent(exercise.icon);

    // Create lighter background color based on exercise category
    const getLightBackgroundColor = (category: string) => {
      switch (category.toLowerCase()) {
        case 'cardio':
          return '#EBF8FF'; // Light blue
        case 'strength':
          return '#F0FDF4'; // Light green
        case 'flexibility':
          return '#FEF3C7'; // Light yellow
        case 'sports':
          return '#DBEAFE'; // Light indigo
        case 'balance':
          return '#FCE7F3'; // Light pink
        default:
          return '#F3F4F6'; // Light gray
      }
    };

    // Get icon color based on category
    const getIconColor = (category: string) => {
      switch (category.toLowerCase()) {
        case 'cardio':
          return '#3B82F6'; // Blue
        case 'strength':
          return '#10B981'; // Green
        case 'flexibility':
          return '#F59E0B'; // Yellow
        case 'sports':
          return '#6366F1'; // Indigo
        case 'balance':
          return '#EC4899'; // Pink
        default:
          return '#6B7280'; // Gray
      }
    };

    return (
      <TouchableOpacity
        onPress={() => onExercisePress(exercise)}
        className="bg-white rounded-2xl p-4 border border-gray-100 mb-3"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: getLightBackgroundColor(exercise.category) }}
          >
            <IconComponent size={20} color={getIconColor(exercise.category)} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-black">{exercise.name}</Text>
            <Text className="text-sm text-gray-600 capitalize mt-1">{exercise.category}</Text>
            {exercise.description && (
              <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
                {exercise.description}
              </Text>
            )}
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500 capitalize">{exercise.metrics.primary}</Text>
            <Text className="text-xs text-gray-400">{exercise.metrics.units.primary}</Text>
            {exercise.caloriesPerMinute && (
              <Text className="text-xs text-orange-600 mt-1">
                {exercise.caloriesPerMinute} cal/min
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <InfiniteScrollList
      data={exercises}
      renderItem={renderExerciseItem}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      onLoadMore={onLoadMore}
      refreshing={refreshing}
      onRefresh={onRefresh}
      emptyStateTitle="No exercises found"
      emptyStateSubtitle="Tap 'Create' to add your first community exercise"
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
};
