import React, { useState } from 'react';
import { View, ScrollView, TextInput, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native';

interface ManualNutritionEditProps {
  visible: boolean;
  onClose: () => void;
  initialValues: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onSave: (values: { calories: number; protein: number; carbs: number; fat: number }) => void;
}

export const ManualNutritionEdit: React.FC<ManualNutritionEditProps> = ({
  visible,
  onClose,
  initialValues,
  onSave,
}) => {
  const [values, setValues] = useState(initialValues);

  const handleSave = () => {
    onSave(values);
    onClose();
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    unit,
    color,
  }: {
    label: string;
    value: number;
    onChangeText: (text: string) => void;
    unit: string;
    color: string;
  }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-sm font-medium text-gray-600 mb-2">{label}</Text>
      <View className="flex-row items-center">
        <TextInput
          value={value.toString()}
          onChangeText={onChangeText}
          keyboardType="numeric"
          className="text-2xl font-bold flex-1"
          style={{ color }}
        />
        <Text className="text-lg text-gray-500 ml-2">{unit}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-gray-900">Edit Nutrition Goals</Text>
          </View>
          <View className="flex-row">
            <Button title="Save" onPress={handleSave} className="mr-2" preIcon={<Save />} />
            <Button title="" variant="secondary" onPress={onClose} preIcon={<X />} />
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          <Text className="text-gray-600 mb-6 text-center">
            Manually adjust your daily nutrition targets
          </Text>

          <InputField
            label="Daily Calories"
            value={values.calories}
            onChangeText={(text) => setValues({ ...values, calories: parseInt(text) || 0 })}
            unit="cal"
            color="#000"
          />

          <InputField
            label="Protein"
            value={values.protein}
            onChangeText={(text) => setValues({ ...values, protein: parseInt(text) || 0 })}
            unit="g"
            color="#ef4444"
          />

          <InputField
            label="Carbohydrates"
            value={values.carbs}
            onChangeText={(text) => setValues({ ...values, carbs: parseInt(text) || 0 })}
            unit="g"
            color="#f59e0b"
          />

          <InputField
            label="Fat"
            value={values.fat}
            onChangeText={(text) => setValues({ ...values, fat: parseInt(text) || 0 })}
            unit="g"
            color="#3b82f6"
          />

          {/* Macro Breakdown */}
          <View className="bg-white rounded-xl p-4 mt-4 shadow-sm">
            <Text className="text-sm font-medium text-gray-600 mb-3">Macro Breakdown</Text>
            <View className="flex flex-col gap-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Protein calories:</Text>
                <Text className="font-medium">{values.protein * 4} cal</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Carb calories:</Text>
                <Text className="font-medium">{values.carbs * 4} cal</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Fat calories:</Text>
                <Text className="font-medium">{values.fat * 9} cal</Text>
              </View>
              <View className="border-t border-gray-200 pt-2">
                <View className="flex-row justify-between">
                  <Text className="font-medium text-gray-900">Total:</Text>
                  <Text className="font-bold text-gray-900">
                    {values.protein * 4 + values.carbs * 4 + values.fat * 9} cal
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
