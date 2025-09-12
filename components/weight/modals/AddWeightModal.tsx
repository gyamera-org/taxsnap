import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { 
  type BodyMeasurements, 
  useAddWeightEntry, 
  useUpdateBodyMeasurements 
} from '@/lib/hooks/use-weight-tracking';
import { useTheme } from '@/context/theme-provider';

interface AddWeightModalProps {
  visible: boolean;
  bodyMeasurements: BodyMeasurements | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddWeightModal({
  visible,
  bodyMeasurements,
  onClose,
  onSuccess,
}: AddWeightModalProps) {
  const [newWeight, setNewWeight] = useState('');
  const [newNote, setNewNote] = useState('');
  const { isDark } = useTheme();
  
  const addWeightEntry = useAddWeightEntry();
  const updateBodyMeasurements = useUpdateBodyMeasurements();

  const handleAddEntry = async () => {
    if (newWeight) {
      try {
        await addWeightEntry.mutateAsync({
          weight: parseFloat(newWeight),
          units:
            bodyMeasurements?.units === 'metric'
              ? 'kg'
              : bodyMeasurements?.units === 'imperial'
                ? 'lbs'
                : bodyMeasurements?.units || 'kg',
          note: newNote || undefined,
        });

        await updateBodyMeasurements.mutateAsync({
          current_weight: parseFloat(newWeight),
          units: bodyMeasurements?.units || 'kg',
        });

        setNewWeight('');
        setNewNote('');
        onClose();
        onSuccess?.();
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleClose = () => {
    setNewWeight('');
    setNewNote('');
    onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/50"
      >
        <SafeAreaView className={`rounded-t-3xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Add Weight Entry</Text>
              <Pressable onPress={handleClose}>
                <Text className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cancel</Text>
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className={`text-base font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Weight (
                {bodyMeasurements?.units === 'metric'
                  ? 'kg'
                  : bodyMeasurements?.units === 'imperial'
                    ? 'lbs'
                    : bodyMeasurements?.units || 'kg'}
                )
              </Text>
              <TextInput
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder={`Enter weight in ${bodyMeasurements?.units === 'metric' ? 'kg' : bodyMeasurements?.units === 'imperial' ? 'lbs' : bodyMeasurements?.units || 'kg'}`}
                keyboardType="numeric"
                className={`rounded-xl p-4 text-base ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-black'} border`}
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              />
            </View>

            <View className="mb-6">
              <Text className={`text-base font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Note (optional)</Text>
              <TextInput
                value={newNote}
                onChangeText={setNewNote}
                placeholder="Add a note..."
                multiline
                className={`rounded-xl p-4 text-base h-20 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-black'} border`}
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              />
            </View>

            <Button
              title="Add Entry"
              onPress={handleAddEntry}
              className="w-full"
              disabled={!newWeight}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
