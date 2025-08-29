import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Check, Edit3, Trash2 } from 'lucide-react-native';
import { toast } from 'sonner-native';

interface MealData {
  id: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

interface MealEditModalProps {
  isVisible: boolean;
  meal: MealData | null;
  onClose: () => void;
  onSave: (mealId: string, updates: Partial<MealData>) => void;
  onDelete: (mealId: string) => void;
}

const getMealTypeColor = (type: string) => {
  switch (type) {
    case 'breakfast':
      return '#F59E0B';
    case 'lunch':
      return '#10B981';
    case 'dinner':
      return '#8B5CF6';
    case 'snack':
      return '#EC4899';
    default:
      return '#6B7280';
  }
};

export default function MealEditModal({
  isVisible,
  meal,
  onClose,
  onSave,
  onDelete,
}: MealEditModalProps) {
  const [editValues, setEditValues] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // Update edit values when meal changes
  useEffect(() => {
    if (meal) {
      setEditValues({
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
      });
    }
  }, [meal]);

  const handleSave = () => {
    if (!meal) return;

    onSave(meal.id, editValues);
    onClose();
  };

  const handleDelete = () => {
    if (!meal) return;

    Alert.alert('Delete Meal', `Are you sure you want to delete "${meal.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(meal.id);
          onClose();
        },
      },
    ]);
  };

  if (!meal) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="max-h-[90%]"
        >
          <ScrollView
            className="bg-white rounded-t-3xl"
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">{meal.name}</Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getMealTypeColor(meal.type) }}
                  />
                  <Text
                    className="text-sm font-medium capitalize"
                    style={{ color: getMealTypeColor(meal.type) }}
                  >
                    {meal.type}
                  </Text>
                  <Text className="text-gray-500 text-sm ml-2">• {meal.time}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2">
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Editable Nutrition Values */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Edit3 size={16} color="#6B7280" />
                <Text className="text-base font-semibold text-gray-900 ml-2">Edit Nutrition</Text>
              </View>

              <View className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row justify-between mb-4">
                  <View className="items-center flex-1">
                    <Text className="text-gray-500 text-xs mb-2">Calories</Text>
                    <TextInput
                      value={editValues.calories.toString()}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, calories: parseInt(text) || 0 }))
                      }
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-center font-medium text-base min-w-[70px]"
                      keyboardType="numeric"
                      selectTextOnFocus
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>

                  <View className="items-center flex-1">
                    <Text className="text-gray-500 text-xs mb-2">Protein (g)</Text>
                    <TextInput
                      value={editValues.protein.toString()}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, protein: parseInt(text) || 0 }))
                      }
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-center font-medium text-base min-w-[70px]"
                      keyboardType="numeric"
                      selectTextOnFocus
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>

                  <View className="items-center flex-1">
                    <Text className="text-gray-500 text-xs mb-2">Carbs (g)</Text>
                    <TextInput
                      value={editValues.carbs.toString()}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, carbs: parseInt(text) || 0 }))
                      }
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-center font-medium text-base min-w-[70px]"
                      keyboardType="numeric"
                      selectTextOnFocus
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>

                  <View className="items-center flex-1">
                    <Text className="text-gray-500 text-xs mb-2">Fat (g)</Text>
                    <TextInput
                      value={editValues.fat.toString()}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, fat: parseInt(text) || 0 }))
                      }
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-center font-medium text-base min-w-[70px]"
                      keyboardType="numeric"
                      selectTextOnFocus
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 bg-red-100 py-4 rounded-xl flex-row items-center justify-center"
              >
                <Trash2 size={16} color="#DC2626" />
                <Text className="text-red-600 font-medium ml-2">Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-green-500 py-4 rounded-xl flex-row items-center justify-center"
              >
                <Check size={16} color="white" />
                <Text className="text-white font-medium ml-2">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
