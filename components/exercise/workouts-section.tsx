import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
// import { router } from 'expo-router';
import {
  Edit3,
  X,
  Save,
  Dumbbell,
  Heart,
  Bike,
  Waves,
  RotateCcw,
  Zap,
  TreePine,
  CheckCircle,
  Clock,
  Flame,
} from 'lucide-react-native';
import {
  useDeleteExerciseEntry,
  useUpdateExerciseEntry,
  useCreateExerciseEntry,
} from '@/lib/hooks/use-exercise-tracking';
import { getLocalDateString, getLocalTimeString } from '@/lib/utils/date-helpers';
import { Button } from '../ui';

// Exercise type icons mapping
const getExerciseIcon = (exerciseType: string) => {
  const type = exerciseType.toLowerCase();
  switch (type) {
    case 'cardio':
    case 'running':
    case 'jogging':
      return Heart;
    case 'strength':
    case 'weightlifting':
    case 'resistance':
      return Dumbbell;
    case 'cycling':
    case 'bike':
      return Bike;
    case 'swimming':
      return Waves;
    case 'yoga':
    case 'stretching':
    case 'flexibility':
      return RotateCcw;
    case 'hiit':
    case 'interval':
      return Zap;
    case 'outdoor':
    case 'hiking':
      return TreePine;
    default:
      return Dumbbell;
  }
};

const getExerciseColor = (exerciseType: string) => {
  const type = exerciseType.toLowerCase();
  switch (type) {
    case 'cardio':
    case 'running':
    case 'jogging':
      return '#DC2626'; // Red
    case 'strength':
    case 'weightlifting':
    case 'resistance':
      return '#8B5CF6'; // Purple
    case 'cycling':
    case 'bike':
      return '#059669'; // Green
    case 'swimming':
      return '#0891B2'; // Cyan
    case 'yoga':
    case 'stretching':
    case 'flexibility':
      return '#7C3AED'; // Violet
    case 'hiit':
    case 'interval':
      return '#F59E0B'; // Orange
    case 'outdoor':
    case 'hiking':
      return '#059669'; // Green
    default:
      return '#8B5CF6'; // Purple
  }
};

interface WorkoutsSectionProps {
  exerciseEntries?: any[];
  currentWeeklyPlan?: any;
  isLoading: boolean;
  selectedDate: Date;
  onNavigateToLogExercise?: () => void;
}

export function WorkoutsSection({
  exerciseEntries,
  currentWeeklyPlan,
  isLoading,
  selectedDate,
  onNavigateToLogExercise,
}: WorkoutsSectionProps) {
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExercise, setViewingExercise] = useState<any>(null);

  const deleteExerciseEntry = useDeleteExerciseEntry();
  const updateExerciseEntry = useUpdateExerciseEntry();
  const createExerciseEntry = useCreateExerciseEntry();

  const handleDeleteExercise = (exerciseId: string) => {
    Alert.alert('Delete Exercise', 'Are you sure you want to delete this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteExerciseEntry.mutate(exerciseId);
          setShowEditModal(false);
        },
      },
    ]);
  };

  const handleEditExercise = (exercise: any) => {
    setEditingExercise(exercise);
    setShowEditModal(true);
  };

  const handleViewExercise = (exercise: any) => {
    setViewingExercise(exercise);
    setShowViewModal(true);
  };

  const handleMarkDone = (exercise: any) => {
    const exerciseData = {
      exercise_name: exercise.name,
      exercise_type: exercise.category || 'General',
      duration_minutes: exercise.duration_minutes,
      calories_burned: exercise.calories_estimate || 0,
      intensity: 'moderate' as const,
      notes: `Completed from weekly plan: ${exercise.instructions}`,
      logged_date: getLocalDateString(selectedDate),
      logged_time: getLocalTimeString(),
    };

    createExerciseEntry.mutate(exerciseData, {
      onSuccess: () => {
        // Mark exercise as completed locally to prevent duplication
        exercise.completed = true;
      },
      onError: (error) => {
        console.error('Failed to log exercise:', error);
        Alert.alert('Error', 'Failed to log exercise. Please try again.');
      },
    });
  };

  // Get planned workouts for selected date
  const getTodaysPlannedWorkout = () => {
    if (!currentWeeklyPlan?.plan_data?.days) return null;

    const dateString = getLocalDateString(selectedDate);
    const selectedDayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    console.log('🔍 Looking for date:', dateString);
    console.log('🔍 Selected day of week:', selectedDayOfWeek);
    console.log(
      '🔍 Available days:',
      currentWeeklyPlan.plan_data.days.map((d: any) => ({
        date: d.date,
        day_name: d.day_name,
        is_rest_day: d.is_rest_day,
      }))
    );

    // First try to match by exact date
    let todaysWorkout = currentWeeklyPlan.plan_data.days.find(
      (day: any) => day.date === dateString
    );

    // If no exact match, try to match by day of week
    if (!todaysWorkout) {
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const selectedDayName = dayNames[selectedDayOfWeek];

      todaysWorkout = currentWeeklyPlan.plan_data.days.find(
        (day: any) => day.day_name?.toLowerCase() === selectedDayName.toLowerCase()
      );

      console.log('🔍 Trying day name match:', selectedDayName);
    }

    console.log('🔍 Found workout for date:', todaysWorkout);
    return todaysWorkout;
  };

  const todaysPlannedWorkout = getTodaysPlannedWorkout();
  const plannedExercises = todaysPlannedWorkout?.exercises || [];

  // Check if a planned exercise has been completed (logged) today
  const isPlannedExerciseCompleted = (plannedExercise: any) => {
    if (!exerciseEntries || exerciseEntries.length === 0) return false;

    return exerciseEntries.some((loggedExercise: any) => {
      // Check if the logged exercise matches the planned one
      const nameMatch =
        loggedExercise.exercise_name?.toLowerCase() === plannedExercise.name?.toLowerCase();
      const typeMatch =
        loggedExercise.exercise_type?.toLowerCase() === plannedExercise.category?.toLowerCase();

      return nameMatch && typeMatch;
    });
  };

  // Filter out planned exercises that have already been logged to prevent duplication
  const unloggedPlannedExercises = plannedExercises.filter(
    (exercise: any) => !exercise.completed && !isPlannedExerciseCompleted(exercise)
  );

  // Show both logged entries AND unlogged planned exercises
  const allExercises = [...(exerciseEntries || []), ...unloggedPlannedExercises];

  if (isLoading) {
    return (
      <View className="mx-4 mb-6">
        <View className="h-6 bg-gray-200 rounded w-40 mb-4" />
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <View className="gap-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <View key={index} className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <View className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <View className="h-3 bg-gray-200 rounded w-24" />
                  </View>
                  <View className="h-4 w-4 bg-gray-200 rounded" />
                </View>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <View className="h-3 bg-gray-200 rounded w-12 mb-1" />
                    <View className="h-4 bg-gray-200 rounded w-8" />
                  </View>
                  <View className="items-center">
                    <View className="h-3 bg-gray-200 rounded w-12 mb-1" />
                    <View className="h-4 bg-gray-200 rounded w-8" />
                  </View>
                  <View className="items-center">
                    <View className="h-3 bg-gray-200 rounded w-12 mb-1" />
                    <View className="h-4 bg-gray-200 rounded w-8" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-6">
      {/* <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900">Today's Workouts</Text>
        <TouchableOpacity onPress={() => router.push('/log-exercise')}>
          <Text className="text-purple-600 font-medium">Add Exercise</Text>
        </TouchableOpacity>
      </View> */}

      <Text className="text-xl font-bold text-gray-900 mb-4">
        {selectedDate.toDateString() === new Date().toDateString()
          ? "Today's Workouts"
          : `Workouts for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
      </Text>

      {allExercises.length > 0 ? (
        <View className="gap-3">
          {allExercises.map((exercise: any, index: number) => {
            const isPlanned = !exercise.id; // Logged exercises have IDs, planned don't
            const exerciseType = exercise.exercise_type || exercise.category || 'general';
            const exerciseName = exercise.exercise_name || exercise.name;
            const ExerciseIcon = getExerciseIcon(exerciseType);
            const exerciseColor = getExerciseColor(exerciseType);

            return (
              <View
                key={exercise.id || `planned-${index}`}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: `${exerciseColor}20` }}
                    >
                      <ExerciseIcon size={20} color={exerciseColor} />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-semibold text-gray-900">
                          {exerciseName}
                        </Text>
                        {!isPlanned && (
                          <View className="bg-green-100 px-2 py-1 rounded-full">
                            <Text className="text-green-700 text-xs font-medium">Completed</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-gray-500 capitalize">{exerciseType}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {isPlanned ? (
                      <TouchableOpacity
                        onPress={() => handleMarkDone(exercise)}
                        className="w-8 h-8 bg-green-100 rounded-full items-center justify-center"
                      >
                        <CheckCircle size={16} color="#10B981" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleEditExercise(exercise)}
                        className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center"
                      >
                        <Edit3 size={16} color="#3B82F6" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Bottom details */}
                <View className="pt-3 border-t border-gray-50">
                  <Text className="text-sm text-gray-600">
                    {exercise.calories_burned || exercise.calories_estimate || 0} cal •{' '}
                    {exercise.duration_minutes} min
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        /* Empty State */
        <View className="bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-50">
          <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-4">
            <Dumbbell size={24} color="#8B5CF6" />
          </View>
          <Text className="text-gray-500 text-center mb-2">
            No exercises planned or logged today
          </Text>
          <TouchableOpacity
            onPress={onNavigateToLogExercise}
            className="bg-purple-500 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-medium">Log Your First Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Exercise Modal - Similar to nutrition's edit modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Edit Exercise</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {editingExercise && (
              <View>
                <View className="bg-purple-50 rounded-2xl p-4 mb-4">
                  <Text className="text-purple-900 text-lg font-bold">
                    {editingExercise.exercise_name || editingExercise.name}
                  </Text>
                  <Text className="text-purple-700 text-sm mt-1 capitalize">
                    {editingExercise.exercise_type || editingExercise.category}
                  </Text>
                </View>

                {/* Editable Values */}
                <View className="mb-6">
                  <View className="bg-gray-50 rounded-xl p-4">
                    <View className="flex-row gap-3 mb-4">
                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs mb-2">Duration (min)</Text>
                        <TextInput
                          value={editingExercise.duration_minutes?.toString()}
                          onChangeText={(text) =>
                            setEditingExercise({
                              ...editingExercise,
                              duration_minutes: parseInt(text) || 0,
                            })
                          }
                          className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-center font-medium text-base min-w-[70px]"
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-gray-500 text-xs mb-2">Calories</Text>
                        <TextInput
                          value={(
                            editingExercise.calories_burned || editingExercise.calories_estimate
                          )?.toString()}
                          onChangeText={(text) =>
                            setEditingExercise({
                              ...editingExercise,
                              calories_burned: parseInt(text) || 0,
                              calories_estimate: parseInt(text) || 0,
                            })
                          }
                          className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-center font-medium text-base min-w-[70px]"
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-500 text-xs mb-2">Notes</Text>
                      <TextInput
                        value={editingExercise.notes || ''}
                        onChangeText={(text) =>
                          setEditingExercise({
                            ...editingExercise,
                            notes: text,
                          })
                        }
                        className="bg-white border border-slate-100 rounded-lg px-3 py-3"
                        placeholder="Add notes..."
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </View>
                </View>
                <Button
                  title="Save Changes"
                  onPress={() => {
                    updateExerciseEntry.mutate({
                      id: editingExercise.id,
                      data: {
                        duration_minutes: editingExercise.duration_minutes,
                        calories_burned: editingExercise.calories_burned,
                        notes: editingExercise.notes,
                      },
                    });
                    setShowEditModal(false);
                    setEditingExercise(null);
                  }}
                  variant="primary"
                  size="large"
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* View Exercise Details Modal */}
      <Modal visible={showViewModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm" style={{ maxHeight: '70%' }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Exercise Details</Text>
              <TouchableOpacity onPress={() => setShowViewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {viewingExercise && (
              <>
                <ScrollView
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {/* Exercise Header */}
                  <View className="bg-purple-50 rounded-2xl p-4 mb-6">
                    <Text className="text-purple-900 text-lg font-bold">
                      {viewingExercise.exercise_name || viewingExercise.name}
                    </Text>
                    <Text className="text-purple-700 text-sm mt-1 capitalize">
                      {viewingExercise.exercise_type || viewingExercise.category}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <View
                        className={`px-2 py-1 rounded-full ${
                          !viewingExercise.id ? 'bg-yellow-100' : 'bg-green-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            !viewingExercise.id ? 'text-yellow-700' : 'text-green-700'
                          }`}
                        >
                          {!viewingExercise.id ? 'Planned' : 'Completed'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Exercise Stats */}
                  <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                      <Clock size={20} color="#6B7280" />
                      <Text className="text-gray-500 text-xs mt-1">Duration</Text>
                      <Text className="text-gray-900 text-lg font-bold">
                        {viewingExercise.duration_minutes}m
                      </Text>
                    </View>
                    <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                      <Flame size={20} color="#F59E0B" />
                      <Text className="text-gray-500 text-xs mt-1">
                        {!viewingExercise.id ? 'Est. Calories' : 'Calories'}
                      </Text>
                      <Text className="text-gray-900 text-lg font-bold">
                        {viewingExercise.calories_burned || viewingExercise.calories_estimate || 0}
                      </Text>
                    </View>
                    {viewingExercise.intensity && (
                      <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                        <Zap size={20} color="#8B5CF6" />
                        <Text className="text-gray-500 text-xs mt-1">Intensity</Text>
                        <Text className="text-gray-900 text-lg font-bold capitalize">
                          {viewingExercise.intensity}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Instructions */}
                  {viewingExercise.instructions && (
                    <View className="bg-blue-50 rounded-xl p-4 mb-6">
                      <Text className="text-blue-900 font-semibold mb-2">Instructions</Text>
                      <Text className="text-blue-800 leading-relaxed">
                        {viewingExercise.instructions}
                      </Text>
                    </View>
                  )}

                  {/* Notes */}
                  {viewingExercise.notes && (
                    <View className="bg-gray-50 rounded-xl p-4 mb-6">
                      <Text className="text-gray-900 font-semibold mb-2">Notes</Text>
                      <Text className="text-gray-700 leading-relaxed">{viewingExercise.notes}</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
