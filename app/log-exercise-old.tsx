import { View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { useState } from 'react';
import { toast } from 'sonner-native';
import SubPageLayout from '@/components/layouts/sub-page';
import {
  Activity,
  Dumbbell,
  Footprints,
  Edit3,
  Plus,
  Search,
  X,
  Timer,
  Bike,
  Waves,
  Anchor,
  RotateCcw,
  Move,
  TrendingUp,
  User,
  Heart,
  Zap,
  ArrowUpDown,
  Brain,
  Circle,
  Hexagon,
  Minus,
  Target,
  ArrowUp,
  Feather,
  Shield,
  Sword,
  Music,
  Volume2,
  Radio,
  Mountain,
  Navigation,
  Wind,
  Snowflake,
  CloudSnow,
  Check,
  Globe,
} from 'lucide-react-native';
import { exercisesData, Exercise } from '@/data/exercisesData';
import { useCreateExerciseEntry } from '@/lib/hooks/use-exercise-tracking';
import {
  useOptimizedExerciseSearch,
  usePopularExercisesCache,
  useFlattenedResults,
  useSearchState,
} from '@/lib/hooks/use-optimized-search';
import { InfiniteScrollList, SearchBar } from '@/components/common/infinite-scroll-list';
import { convertToExercise } from '@/lib/hooks/use-exercise-database';
import { supabase } from '@/lib/supabase/client';

// Exercise form options
const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'glutes',
  'core',
  'cardiovascular',
  'flexibility',
  'full_body',
];

const EQUIPMENT_OPTIONS = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'kettlebell',
  'resistance_band',
  'machine',
  'cable',
  'cardio_machine',
  'mat',
  'ball',
  'other',
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const EXERCISE_CATEGORIES = ['cardio', 'strength', 'flexibility', 'sports', 'balance', 'other'];

const AVAILABLE_ICONS = [
  'Globe',
  'Activity',
  'Dumbbell',
  'Heart',
  'Zap',
  'Target',
  'Shield',
  'Footprints',
  'Bike',
  'Waves',
  'Anchor',
  'RotateCcw',
  'Move',
  'TrendingUp',
  'User',
  'Brain',
  'Circle',
  'Hexagon',
  'Minus',
  'ArrowUp',
  'Feather',
  'Sword',
  'Music',
  'Volume2',
  'Radio',
  'Mountain',
  'Navigation',
  'Wind',
  'Snowflake',
  'CloudSnow',
  'ArrowUpDown',
];

interface LoggedExercise {
  exerciseId: string;
  primaryValue: string;
  secondaryValue?: string;
  date: string;
}

export default function LogExerciseScreen() {
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  // Optimized search state
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory, hasActiveSearch } =
    useSearchState();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [primaryValue, setPrimaryValue] = useState('');
  const [secondaryValue, setSecondaryValue] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseType, setNewExerciseType] = useState('');
  const [newExerciseIcon, setNewExerciseIcon] = useState('Globe');
  const [newExerciseMuscleGroups, setNewExerciseMuscleGroups] = useState<string[]>([]);
  const [newExerciseEquipment, setNewExerciseEquipment] = useState('bodyweight');
  const [newExerciseDifficulty, setNewExerciseDifficulty] = useState('beginner');
  const [newExerciseCaloriesPerMinute, setNewExerciseCaloriesPerMinute] = useState('5');
  const [newExerciseInstructions, setNewExerciseInstructions] = useState('');
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [shareWithCommunity, setShareWithCommunity] = useState(false);

  // Dropdown visibility states
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMuscleGroupDropdown, setShowMuscleGroupDropdown] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  const createExerciseEntry = useCreateExerciseEntry();

  // Dropdown component
  const DropdownField = ({
    label,
    value,
    onSelect,
    options,
    placeholder,
    isVisible,
    setIsVisible,
    isMultiSelect = false,
    selectedValues = [],
    renderValue,
  }: {
    label: string;
    value: string | string[];
    onSelect: (value: any) => void;
    options: string[];
    placeholder: string;
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
    isMultiSelect?: boolean;
    selectedValues?: string[];
    renderValue?: (value: any) => string;
  }) => {
    const displayValue = renderValue
      ? renderValue(value)
      : isMultiSelect
        ? selectedValues.length > 0
          ? `${selectedValues.length} selected`
          : placeholder
        : value || placeholder;

    return (
      <View className="mb-4 relative">
        <Text className="text-base font-medium text-black mb-2">{label}</Text>
        <TouchableOpacity
          onPress={() => setIsVisible(!isVisible)}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex-row items-center justify-between"
        >
          <Text
            className={`text-base ${value || selectedValues.length > 0 ? 'text-black' : 'text-gray-500'}`}
          >
            {displayValue}
          </Text>
          <Text className="text-gray-400">▼</Text>
        </TouchableOpacity>

        {isVisible && (
          <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-48 z-50 shadow-lg">
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    if (isMultiSelect) {
                      const newSelection = selectedValues.includes(option)
                        ? selectedValues.filter((item) => item !== option)
                        : [...selectedValues, option];
                      onSelect(newSelection);
                    } else {
                      onSelect(option);
                      setIsVisible(false);
                    }
                  }}
                  className={`p-3 border-b border-gray-100 flex-row items-center justify-between ${
                    isMultiSelect && selectedValues.includes(option) ? 'bg-blue-50' : ''
                  } ${!isMultiSelect && value === option ? 'bg-blue-50' : ''}`}
                >
                  <Text
                    className={`text-base capitalize ${
                      (isMultiSelect && selectedValues.includes(option)) || value === option
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.replace('_', ' ')}
                  </Text>
                  {((isMultiSelect && selectedValues.includes(option)) || value === option) && (
                    <Text className="text-blue-600">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Icon dropdown component
  const IconDropdownField = () => {
    const IconComponent = getIconComponent(newExerciseIcon);

    return (
      <View className="mb-4 relative">
        <Text className="text-base font-medium text-black mb-2">Icon</Text>
        <TouchableOpacity
          onPress={() => setShowIconDropdown(!showIconDropdown)}
          className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <IconComponent size={20} color="#6B7280" />
            <Text className="text-base text-black ml-2 capitalize">{newExerciseIcon}</Text>
          </View>
          <Text className="text-gray-400">▼</Text>
        </TouchableOpacity>

        {showIconDropdown && (
          <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-48 z-50 shadow-lg">
            <ScrollView showsVerticalScrollIndicator={false}>
              {AVAILABLE_ICONS.map((iconName) => {
                const OptionIconComponent = getIconComponent(iconName);
                return (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => {
                      setNewExerciseIcon(iconName);
                      setShowIconDropdown(false);
                    }}
                    className={`p-3 border-b border-gray-100 flex-row items-center justify-between ${
                      newExerciseIcon === iconName ? 'bg-pink-50' : ''
                    }`}
                  >
                    <View className="flex-row items-center">
                      <OptionIconComponent
                        size={18}
                        color={newExerciseIcon === iconName ? '#EC4899' : '#6B7280'}
                      />
                      <Text
                        className={`text-base ml-2 capitalize ${
                          newExerciseIcon === iconName
                            ? 'text-pink-600 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {iconName}
                      </Text>
                    </View>
                    {newExerciseIcon === iconName && <Text className="text-pink-600">✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Optimized exercise search
  const searchResults = useOptimizedExerciseSearch(searchQuery);
  const popularExercisesQuery = usePopularExercisesCache();

  // Flatten infinite query results and convert to Exercise format
  const searchData = useFlattenedResults(searchResults);
  const popularExercises = popularExercisesQuery.data?.map(convertToExercise) || [];

  // Combine database exercises with custom ones
  const dbExercises = hasActiveSearch
    ? searchData.map((item) => convertToExercise(item as any))
    : popularExercises;
  const allExercises = [...dbExercises, ...customExercises];

  // Get icon component from string
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Footprints':
        return Footprints;
      case 'Dumbbell':
        return Dumbbell;
      case 'Activity':
        return Activity;
      case 'Edit3':
        return Edit3;
      case 'Bike':
        return Bike;
      case 'Waves':
        return Waves;
      case 'Anchor':
        return Anchor;
      case 'RotateCcw':
        return RotateCcw;
      case 'Move':
        return Move;
      case 'TrendingUp':
        return TrendingUp;
      case 'User':
        return User;
      case 'Heart':
        return Heart;
      case 'Zap':
        return Zap;
      case 'ArrowUpDown':
        return ArrowUpDown;
      case 'Brain':
        return Brain;
      case 'Circle':
        return Circle;
      case 'Hexagon':
        return Hexagon;
      case 'Minus':
        return Minus;
      case 'Target':
        return Target;
      case 'ArrowUp':
        return ArrowUp;
      case 'Feather':
        return Feather;
      case 'Shield':
        return Shield;
      case 'Sword':
        return Sword;
      case 'Music':
        return Music;
      case 'Volume2':
        return Volume2;
      case 'Radio':
        return Radio;
      case 'Mountain':
        return Mountain;
      case 'Navigation':
        return Navigation;
      case 'Wind':
        return Wind;
      case 'Snowflake':
        return Snowflake;
      case 'CloudSnow':
        return CloudSnow;
      default:
        return Activity;
    }
  };

  const addCustomExercise = async () => {
    if (newExerciseName.trim() && newExerciseType.trim()) {
      const newId = newExerciseName.toLowerCase().replace(/\s+/g, '_');
      const newExercise: Exercise = {
        id: newId,
        name: newExerciseName.trim(),
        category: newExerciseType.trim(),
        icon: newExerciseIcon,
        color: '#EC4899',
        metrics: {
          primary: 'time',
          units: {
            primary: 'min',
          },
        },
        description: newExerciseInstructions.trim() || 'Community contributed exercise',
        muscleGroups: newExerciseMuscleGroups,
        equipment: newExerciseEquipment,
        difficulty: newExerciseDifficulty,
        caloriesPerMinute: parseFloat(newExerciseCaloriesPerMinute) || 5,
      };

      // Add to local state immediately
      setCustomExercises((prev) => [...prev, newExercise]);

      // If user wants to share with community, invoke AI moderation
      if (shareWithCommunity) {
        try {
          const { data: user } = await supabase.auth.getUser();
          if (user.user) {
            const exerciseEntryId = `custom_${Date.now()}`;
            const exerciseData = {
              name: newExercise.name,
              category: newExercise.category,
              muscleGroups:
                newExerciseMuscleGroups.length > 0 ? newExerciseMuscleGroups : ['full_body'],
              equipment: newExerciseEquipment,
              difficulty: newExerciseDifficulty,
              instructions: newExerciseInstructions.trim() || 'Community contributed exercise',
              caloriesPerMinute: parseFloat(newExerciseCaloriesPerMinute) || 5,
            };

            const moderationStart = Date.now();
            const { data: moderationResponse, error: moderationError } =
              await supabase.functions.invoke('ai-exercise-moderator', {
                body: {
                  exercise_entry_id: exerciseEntryId,
                  exercise_items: [exerciseData],
                  user_id: user.user.id,
                },
              });

            if (moderationError) {
              console.error('❌ AI moderation call failed:', moderationError);
              toast.error(
                'Failed to submit for community review, but exercise was created successfully'
              );
            } else {
              toast.success('Exercise created and submitted for community review! 🌍');
            }
          }
        } catch (moderationError) {
          console.error('❌ AI moderation process failed:', moderationError);
          toast.success('Exercise created successfully!');
        }
      } else {
        toast.success('Exercise created successfully!');
      }

      setNewExerciseName('');
      setNewExerciseType('');
      setNewExerciseIcon('Globe');
      setNewExerciseMuscleGroups([]);
      setNewExerciseEquipment('bodyweight');
      setNewExerciseDifficulty('beginner');
      setNewExerciseCaloriesPerMinute('5');
      setNewExerciseInstructions('');
      setShareWithCommunity(false);
      setShowAddModal(false);
      // Close all dropdowns
      setShowIconDropdown(false);
      setShowCategoryDropdown(false);
      setShowMuscleGroupDropdown(false);
      setShowEquipmentDropdown(false);
      setShowDifficultyDropdown(false);
    }
  };

  const openExerciseModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setPrimaryValue('');
    setSecondaryValue('');
    setShowLogModal(true);
  };

  const closeExerciseModal = () => {
    setShowLogModal(false);
    setSelectedExercise(null);
    setPrimaryValue('');
    setSecondaryValue('');
  };

  const logExercise = async () => {
    if (selectedExercise && primaryValue.trim()) {
      // Convert exercise data to our database format
      const durationMinutes =
        selectedExercise.metrics.primary === 'time'
          ? parseInt(primaryValue) || 0
          : parseInt(secondaryValue) || 30; // Default 30 minutes if time isn't primary

      // Estimate calories burned (rough calculation - 5 calories per minute as baseline)
      const caloriesBurned = Math.round(durationMinutes * 5);

      try {
        await createExerciseEntry.mutateAsync({
          exercise_name: selectedExercise.name,
          exercise_type: selectedExercise.category,
          duration_minutes: durationMinutes,
          calories_burned: caloriesBurned,
          intensity: 'moderate', // Default intensity
          notes: `${selectedExercise.metrics.primary}: ${primaryValue}${selectedExercise.metrics.units.primary}${
            secondaryValue
              ? `, ${selectedExercise.metrics.secondary}: ${secondaryValue}${selectedExercise.metrics.units.secondary}`
              : ''
          }`,
        });

        // Also keep in local state for immediate UI update
        const newLog: LoggedExercise = {
          exerciseId: selectedExercise.id,
          primaryValue: primaryValue.trim(),
          secondaryValue: secondaryValue.trim() || undefined,
          date: new Date().toISOString(),
        };

        setLoggedExercises((prev) => [...prev, newLog]);
        closeExerciseModal();
        // Navigate back to exercise tab after successful log
        router.push('/(tabs)/exercise');
      } catch (error) {
        console.error('Failed to log exercise:', error);
        // Still add to local state as fallback
        const newLog: LoggedExercise = {
          exerciseId: selectedExercise.id,
          primaryValue: primaryValue.trim(),
          secondaryValue: secondaryValue.trim() || undefined,
          date: new Date().toISOString(),
        };

        setLoggedExercises((prev) => [...prev, newLog]);
        closeExerciseModal();
        // Navigate back to exercise tab even on error (fallback)
        router.push('/(tabs)/exercise');
      }
    }
  };

  const handleSave = () => {
    // Exercises are saved individually when logged, so navigate back to exercise tab
    router.push('/(tabs)/exercise');
  };

  // Get today's logged exercises
  const todaysExercises = loggedExercises.filter((log) => {
    const today = new Date().toDateString();
    const logDate = new Date(log.date).toDateString();
    return today === logDate;
  });

  return (
    <SubPageLayout
      title="Exercise"
      onBack={() => router.push('/(tabs)/exercise')}
      rightElement={
        <Button
          title="Log"
          onPress={handleSave}
          variant="primary"
          size="small"
          disabled={todaysExercises.length === 0}
        />
      }
    >
      <View className="flex-1">
        {/* Search */}
        <View className="px-4 mb-6">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            autoFocus={false}
          />
        </View>

        {/* Today's Summary */}
        {todaysExercises.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-6 mx-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <Timer size={16} color="#EC4899" />
              <Text className="text-lg font-semibold text-black ml-2">Today's Exercises</Text>
            </View>
            {todaysExercises.map((log, index) => {
              const exercise = allExercises.find((e) => e.id === log.exerciseId);
              return (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-2 border-b border-gray-50 last:border-b-0"
                >
                  <Text className="text-gray-900 font-medium">{exercise?.name}</Text>
                  <Text className="text-gray-500 text-sm">
                    {log.primaryValue} {exercise?.metrics.units.primary}
                    {log.secondaryValue &&
                      `, ${log.secondaryValue} ${exercise?.metrics.units.secondary}`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Header for Exercises Database */}
        <View className="flex-row items-center justify-between mb-4 px-4">
          <Text className="text-lg font-semibold text-black">Community Exercise Database</Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="flex-row items-center bg-pink-50 px-3 py-2 rounded-xl border border-pink-200"
          >
            <Plus size={16} color="#EC4899" />
            <Text className="text-pink-600 ml-1 font-medium text-sm">Create</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise List with Infinite Scroll */}
        <InfiniteScrollList
          data={allExercises}
          renderItem={({ item: exercise }) => {
            const IconComponent = getIconComponent(exercise.icon);
            return (
              <TouchableOpacity
                onPress={() => openExerciseModal(exercise)}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 mx-4"
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${exercise.color}20` }}
                  >
                    <IconComponent size={24} color={exercise.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-black">{exercise.name}</Text>
                    <Text className="text-gray-500 text-sm">{exercise.category}</Text>
                    {exercise.description && (
                      <Text className="text-gray-400 text-xs mt-1">{exercise.description}</Text>
                    )}
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-gray-400 mb-1">
                      {exercise.metrics.units.primary}
                      {exercise.metrics.secondary && ` • ${exercise.metrics.units.secondary}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          onLoadMore={() => {
            if (searchResults.hasNextPage && !searchResults.isFetchingNextPage) {
              searchResults.fetchNextPage();
            }
          }}
          isLoading={hasActiveSearch ? searchResults.isLoading : popularExercisesQuery.isLoading}
          isFetchingNextPage={searchResults.isFetchingNextPage || false}
          hasNextPage={searchResults.hasNextPage || false}
          error={searchResults.error}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          emptyMessage="No exercises available"
          emptySubtitle="Tap 'Create' to add your first community exercise"
          estimatedItemSize={100}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </View>

      {/* Add Custom Exercise Modal */}
      <Modal
        visible={showAddModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setNewExerciseName('');
          setNewExerciseType('');
          setNewExerciseIcon('Globe');
          setNewExerciseMuscleGroups([]);
          setNewExerciseEquipment('bodyweight');
          setNewExerciseDifficulty('beginner');
          setNewExerciseCaloriesPerMinute('5');
          setNewExerciseInstructions('');
          setShareWithCommunity(false);
          // Close all dropdowns
          setShowIconDropdown(false);
          setShowCategoryDropdown(false);
          setShowMuscleGroupDropdown(false);
          setShowEquipmentDropdown(false);
          setShowDifficultyDropdown(false);
        }}
      >
        <View className="flex-1 bg-white">
          <View className="flex-1 p-6 pt-12">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-black">Create New Exercise</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setNewExerciseName('');
                  setNewExerciseType('');
                  setNewExerciseIcon('Globe');
                  setNewExerciseMuscleGroups([]);
                  setNewExerciseEquipment('bodyweight');
                  setNewExerciseDifficulty('beginner');
                  setNewExerciseCaloriesPerMinute('5');
                  setNewExerciseInstructions('');
                  setShareWithCommunity(false);
                  // Close all dropdowns
                  setShowIconDropdown(false);
                  setShowCategoryDropdown(false);
                  setShowMuscleGroupDropdown(false);
                  setShowEquipmentDropdown(false);
                  setShowDifficultyDropdown(false);
                }}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Exercise Name */}
              <View className="mb-4">
                <Text className="text-base font-medium text-black mb-2">Exercise Name *</Text>
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <TextInput
                    value={newExerciseName}
                    onChangeText={setNewExerciseName}
                    placeholder="e.g., Push-ups, Pilates, Boxing"
                    className="text-base text-black"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Icon Selection Dropdown */}
              <IconDropdownField />

              {/* Category Dropdown */}
              <DropdownField
                label="Category *"
                value={newExerciseType}
                onSelect={setNewExerciseType}
                options={EXERCISE_CATEGORIES}
                placeholder="Select exercise category"
                isVisible={showCategoryDropdown}
                setIsVisible={setShowCategoryDropdown}
              />

              {/* Muscle Groups Dropdown */}
              <DropdownField
                label="Muscle Groups"
                value={newExerciseMuscleGroups}
                onSelect={setNewExerciseMuscleGroups}
                options={MUSCLE_GROUPS}
                placeholder="Select muscle groups"
                isVisible={showMuscleGroupDropdown}
                setIsVisible={setShowMuscleGroupDropdown}
                isMultiSelect={true}
                selectedValues={newExerciseMuscleGroups}
              />

              {/* Equipment Dropdown */}
              <DropdownField
                label="Equipment"
                value={newExerciseEquipment}
                onSelect={setNewExerciseEquipment}
                options={EQUIPMENT_OPTIONS}
                placeholder="Select equipment"
                isVisible={showEquipmentDropdown}
                setIsVisible={setShowEquipmentDropdown}
              />

              {/* Difficulty & Calories Row */}
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <DropdownField
                    label="Difficulty"
                    value={newExerciseDifficulty}
                    onSelect={setNewExerciseDifficulty}
                    options={DIFFICULTY_LEVELS}
                    placeholder="Select difficulty"
                    isVisible={showDifficultyDropdown}
                    setIsVisible={setShowDifficultyDropdown}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-medium text-black mb-2">Calories/Min</Text>
                  <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <TextInput
                      value={newExerciseCaloriesPerMinute}
                      onChangeText={setNewExerciseCaloriesPerMinute}
                      placeholder="5"
                      keyboardType="numeric"
                      className="text-base text-black text-center"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              {/* Instructions */}
              <View className="mb-6">
                <Text className="text-base font-medium text-black mb-2">
                  Instructions (Optional)
                </Text>
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <TextInput
                    value={newExerciseInstructions}
                    onChangeText={setNewExerciseInstructions}
                    placeholder="Describe how to perform this exercise..."
                    className="text-base text-black"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Fixed Bottom Section */}
            <View className="pt-4 border-t border-gray-100">
              {/* Share with Community Option */}
              <TouchableOpacity
                onPress={() => setShareWithCommunity(!shareWithCommunity)}
                className={`rounded-2xl p-4 border mb-4 ${
                  shareWithCommunity ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-6 h-6 rounded-full border mr-4 items-center justify-center ${
                      shareWithCommunity
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {shareWithCommunity && <Check size={14} color="white" />}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Globe size={24} color="#10B981" />
                      <Text
                        className={`text-base font-semibold ml-2 ${
                          shareWithCommunity ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        Share with Community
                      </Text>
                    </View>
                    <Text
                      className={`text-sm ${shareWithCommunity ? 'text-blue-700' : 'text-gray-600'}`}
                    >
                      Contribute this exercise to our community database for everyone to use
                    </Text>
                  </View>
                  {shareWithCommunity && (
                    <View className="bg-blue-100 px-3 py-1 rounded-full ml-2">
                      <Text className="text-blue-800 text-xs font-medium">Active</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <Button
                title="Create Exercise"
                onPress={addCustomExercise}
                variant="primary"
                size="large"
                disabled={!newExerciseName.trim() || !newExerciseType.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Logging Modal */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={closeExerciseModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-black">Log {selectedExercise?.name}</Text>
              <TouchableOpacity onPress={closeExerciseModal}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedExercise && (
              <>
                {/* Exercise Info */}
                <View className="flex-row items-center mb-6 p-4 bg-gray-50 rounded-xl">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${selectedExercise.color}20` }}
                  >
                    {(() => {
                      const IconComponent = getIconComponent(selectedExercise.icon);
                      return <IconComponent size={24} color={selectedExercise.color} />;
                    })()}
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-black">
                      {selectedExercise.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">{selectedExercise.category}</Text>
                  </View>
                </View>

                {/* Primary Metric Input */}
                <View className="mb-4">
                  <Text className="text-base font-medium text-black mb-2">
                    {selectedExercise.metrics.primary === 'time' && 'Duration'}
                    {selectedExercise.metrics.primary === 'distance' && 'Distance'}
                    {selectedExercise.metrics.primary === 'reps' && 'Repetitions'}
                    {selectedExercise.metrics.primary === 'calories' && 'Calories'} (
                    {selectedExercise.metrics.units.primary})
                  </Text>
                  <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <TextInput
                      value={primaryValue}
                      onChangeText={setPrimaryValue}
                      placeholder={`Enter ${selectedExercise.metrics.primary}...`}
                      className="text-base text-black"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Secondary Metric Input (if available) */}
                {selectedExercise.metrics.secondary && (
                  <View className="mb-6">
                    <Text className="text-base font-medium text-black mb-2">
                      {selectedExercise.metrics.secondary === 'time' && 'Duration'}
                      {selectedExercise.metrics.secondary === 'distance' && 'Distance'}
                      {selectedExercise.metrics.secondary === 'reps' && 'Repetitions'}
                      {selectedExercise.metrics.secondary === 'calories' && 'Calories'} (
                      {selectedExercise.metrics.units.secondary}) - Optional
                    </Text>
                    <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <TextInput
                        value={secondaryValue}
                        onChangeText={setSecondaryValue}
                        placeholder={`Enter ${selectedExercise.metrics.secondary}...`}
                        className="text-base text-black"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}

                <Button
                  title="Log Exercise"
                  onPress={logExercise}
                  variant="primary"
                  size="large"
                  disabled={!primaryValue.trim()}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
