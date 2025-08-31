import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X, Globe, Check } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { supabase } from '@/lib/supabase/client';
import { Exercise } from '@/data/exercisesData';
import { DropdownField } from './dropdown-field';
import { IconDropdownField } from './icon-dropdown-field';
import {
  MUSCLE_GROUPS,
  EQUIPMENT_OPTIONS,
  DIFFICULTY_LEVELS,
  EXERCISE_CATEGORIES,
} from './exercise-form-constants';

interface CreateExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onExerciseCreated: (exercise: Exercise) => void;
}

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  visible,
  onClose,
  onExerciseCreated,
}) => {
  // Form state
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseType, setNewExerciseType] = useState('');
  const [newExerciseIcon, setNewExerciseIcon] = useState('Globe');
  const [newExerciseMuscleGroups, setNewExerciseMuscleGroups] = useState<string[]>([]);
  const [newExerciseEquipment, setNewExerciseEquipment] = useState('bodyweight');
  const [newExerciseDifficulty, setNewExerciseDifficulty] = useState('beginner');
  const [newExerciseCaloriesPerMinute, setNewExerciseCaloriesPerMinute] = useState('5');
  const [newExerciseInstructions, setNewExerciseInstructions] = useState('');
  const [shareWithCommunity, setShareWithCommunity] = useState(false);

  // Dropdown visibility states
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMuscleGroupDropdown, setShowMuscleGroupDropdown] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  const resetForm = () => {
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
      onExerciseCreated(newExercise);

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
            const moderationTime = Date.now() - moderationStart;
            if (moderationError) {
              console.error('❌ AI moderation call failed:', moderationError);
              toast.error(
                'Failed to submit for community review, but exercise was created successfully'
              );
            }
          }
        } catch (error) {
          console.error('Error during AI moderation:', error);
          toast.error(
            'Failed to submit for community review, but exercise was created successfully'
          );
        }
      }

      resetForm();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-white">
        <View className="flex-1 p-6 pt-16">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-semibold text-black">Create New Exercise</Text>
            <TouchableOpacity onPress={handleClose}>
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
            <IconDropdownField
              selectedIcon={newExerciseIcon}
              onSelect={setNewExerciseIcon}
              isVisible={showIconDropdown}
              setIsVisible={setShowIconDropdown}
            />

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
              <Text className="text-base font-medium text-black mb-2">Instructions (Optional)</Text>
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
                    shareWithCommunity ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
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
  );
};
