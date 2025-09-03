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
        <SafeAreaView className="bg-white rounded-t-3xl">
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Add Weight Entry</Text>
              <Pressable onPress={handleClose}>
                <Text className="text-gray-500 font-medium">Cancel</Text>
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-base font-medium text-gray-700 mb-2">
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
                className="border border-gray-200 rounded-xl p-4 text-base"
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">Note (optional)</Text>
              <TextInput
                value={newNote}
                onChangeText={setNewNote}
                placeholder="Add a note..."
                multiline
                className="border border-gray-200 rounded-xl p-4 text-base h-20"
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
