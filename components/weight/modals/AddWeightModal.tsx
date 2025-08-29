import React from 'react';
import { View, Text, Modal, SafeAreaView, Pressable, TextInput } from 'react-native';
import { Button } from '@/components/ui/button';
import { type BodyMeasurements } from '@/lib/hooks/use-weight-tracking';

interface AddWeightModalProps {
  visible: boolean;
  bodyMeasurements: BodyMeasurements | null;
  newWeight: string;
  newNote: string;
  onClose: () => void;
  onWeightChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onAddEntry: () => void;
}

export function AddWeightModal({
  visible,
  bodyMeasurements,
  newWeight,
  newNote,
  onClose,
  onWeightChange,
  onNoteChange,
  onAddEntry,
}: AddWeightModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <SafeAreaView className="bg-white rounded-t-3xl">
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Add Weight Entry</Text>
              <Pressable onPress={onClose}>
                <Text className="text-gray-500 font-medium">Cancel</Text>
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-base font-medium text-gray-700 mb-2">
                Weight ({bodyMeasurements?.units || 'kg'})
              </Text>
              <TextInput
                value={newWeight}
                onChangeText={onWeightChange}
                placeholder={`Enter weight in ${bodyMeasurements?.units || 'kg'}`}
                keyboardType="numeric"
                className="border border-gray-200 rounded-xl p-4 text-base"
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">Note (optional)</Text>
              <TextInput
                value={newNote}
                onChangeText={onNoteChange}
                placeholder="Add a note..."
                multiline
                className="border border-gray-200 rounded-xl p-4 text-base h-20"
              />
            </View>

            <Button
              title="Add Entry"
              onPress={onAddEntry}
              className="w-full"
              disabled={!newWeight}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
