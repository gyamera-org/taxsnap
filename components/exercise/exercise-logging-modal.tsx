import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X, Timer } from 'lucide-react-native';
import { Exercise } from '@/data/exercisesData';
import { getIconComponent } from '@/lib/utils/get-icon-component';

interface ExerciseLoggingModalProps {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  onLogExercise: (data: {
    exercise_name: string;
    exercise_type: string;
    duration_minutes?: number;
    calories_burned?: number;
    intensity?: string;
    notes?: string;
  }) => void;
}

export const ExerciseLoggingModal: React.FC<ExerciseLoggingModalProps> = ({
  visible,
  exercise,
  onClose,
  onLogExercise,
}) => {
  const [primaryValue, setPrimaryValue] = useState('');
  const [secondaryValue, setSecondaryValue] = useState('');

  const handleLogExercise = () => {
    if (!exercise) return;

    const duration = parseInt(primaryValue) || 0;
    const caloriesPerMinute = exercise.caloriesPerMinute || 5;
    const calculatedCalories = Math.round(duration * caloriesPerMinute);

    onLogExercise({
      exercise_name: exercise.name,
      exercise_type: exercise.category,
      duration_minutes: duration,
      calories_burned: calculatedCalories,
      intensity: 'moderate',
      notes: secondaryValue,
    });

    setPrimaryValue('');
    setSecondaryValue('');
    onClose();
  };

  if (!exercise) return null;

  const IconComponent = getIconComponent(exercise.icon);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-black">Log {exercise.name}</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-6">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
                style={{ backgroundColor: exercise.color }}
              >
                <IconComponent size={28} color="#FFFFFF" />
              </View>
              <Text className="text-lg font-medium text-black">{exercise.name}</Text>
              <Text className="text-sm text-gray-600 capitalize">{exercise.category}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-base font-medium text-black mb-2">
                Duration ({exercise.metrics.units.primary})
              </Text>
              <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex-row items-center">
                <Timer size={20} color="#6B7280" />
                <TextInput
                  value={primaryValue}
                  onChangeText={setPrimaryValue}
                  placeholder={`Enter ${exercise.metrics.primary}`}
                  keyboardType="numeric"
                  className="text-base text-black ml-3 flex-1"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {exercise.metrics.secondary && (
              <View className="mb-6">
                <Text className="text-base font-medium text-black mb-2">Notes (Optional)</Text>
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <TextInput
                    value={secondaryValue}
                    onChangeText={setSecondaryValue}
                    placeholder="Add any notes about your workout..."
                    className="text-base text-black"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            )}

            <Button
              title="Log Exercise"
              onPress={handleLogExercise}
              variant="primary"
              size="large"
              disabled={!primaryValue.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
