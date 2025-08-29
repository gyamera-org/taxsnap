import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { useState } from 'react';
import { toast } from 'sonner-native';
import SubPageLayout from '@/components/layouts/sub-page';
import { Plus, Search } from 'lucide-react-native';
import { Exercise } from '@/data/exercisesData';
import { useCreateExerciseEntry } from '@/lib/hooks/use-exercise-tracking';
import {
  useOptimizedExerciseSearch,
  usePopularExercisesCache,
  useFlattenedResults,
  useSearchState,
} from '@/lib/hooks/use-optimized-search';
import { SearchBar } from '@/components/common/infinite-scroll-list';
import { convertToExercise } from '@/lib/hooks/use-exercise-database';
import { CreateExerciseModal } from '@/components/exercise/create-exercise-modal';
import { ExerciseLoggingModal } from '@/components/exercise/exercise-logging-modal';
import { ExerciseList } from '@/components/exercise/exercise-list';

export default function LogExerciseScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  const createExerciseEntry = useCreateExerciseEntry();

  // Optimized exercise search
  const { searchQuery, setSearchQuery, hasActiveSearch } = useSearchState();
  const searchResults = useOptimizedExerciseSearch(searchQuery);
  const popularExercisesQuery = usePopularExercisesCache();

  // Flatten infinite query results and convert to Exercise format
  const searchData = useFlattenedResults(searchResults);

  // Get popular exercises for when there's no search
  const popularExercises = popularExercisesQuery.data || [];

  // Combine database exercises with custom exercises
  const allExercises = hasActiveSearch
    ? searchData.map((item) => convertToExercise(item as any))
    : [...popularExercises.map((item: any) => convertToExercise(item)), ...customExercises];

  const openExerciseModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowLogModal(true);
  };

  const logExercise = async (data: {
    exercise_name: string;
    exercise_type: string;
    duration_minutes?: number;
    calories_burned?: number;
    intensity?: string;
    notes?: string;
  }) => {
    try {
      await createExerciseEntry.mutateAsync({
        ...data,
        duration_minutes: data.duration_minutes || 0,
        intensity: (data.intensity as 'low' | 'moderate' | 'high') || 'moderate',
      });
      toast.success(`${data.exercise_name} logged successfully! 💪`);
      router.back();
    } catch (error) {
      console.error('Error logging exercise:', error);
      toast.error('Failed to log exercise. Please try again.');
    }
  };

  const handleExerciseCreated = (exercise: Exercise) => {
    setCustomExercises((prev) => [...prev, exercise]);
  };

  return (
    <SubPageLayout
      title="Log Exercise"
      rightElement={
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-pink-500 px-4 py-2 rounded-xl flex-row items-center"
        >
          <Text className="text-white font-medium ml-1">Create</Text>
        </TouchableOpacity>
      }
    >
      <View className="flex-1 px-4">
        {/* Search Section */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <SearchBar
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Exercise List */}
        <ExerciseList
          exercises={allExercises}
          onExercisePress={openExerciseModal}
          isLoading={hasActiveSearch ? searchResults.isLoading : popularExercisesQuery.isLoading}
          hasNextPage={hasActiveSearch ? searchResults.hasNextPage : false}
          onLoadMore={hasActiveSearch ? searchResults.fetchNextPage : undefined}
          refreshing={hasActiveSearch ? searchResults.isFetching : popularExercisesQuery.isFetching}
          onRefresh={hasActiveSearch ? searchResults.refetch : popularExercisesQuery.refetch}
        />
      </View>

      {/* Create Exercise Modal */}
      <CreateExerciseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExerciseCreated={handleExerciseCreated}
      />

      {/* Exercise Logging Modal */}
      <ExerciseLoggingModal
        visible={showLogModal}
        exercise={selectedExercise}
        onClose={() => {
          setShowLogModal(false);
          setSelectedExercise(null);
        }}
        onLogExercise={logExercise}
      />
    </SubPageLayout>
  );
}
