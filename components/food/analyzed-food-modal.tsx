import React, { useState } from 'react';
import {
  View,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X, Trash2, Check, Apple, Beef, Wheat, Edit3, Plus, Minus } from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';

interface AnalyzedFoodModalProps {
  visible: boolean;
  onClose: () => void;
  meal: any; // The completed meal entry
  onEdit?: (meal: any) => void;
  onDelete?: (mealId: string) => void;
  onSave?: (meal: any) => void;
}

export function AnalyzedFoodModal({
  visible,
  onClose,
  meal,
  onEdit,
  onDelete,
  onSave,
}: AnalyzedFoodModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [editableCalories, setEditableCalories] = useState<number | null>(null);
  const [editableProtein, setEditableProtein] = useState<number | null>(null);
  const [editableCarbs, setEditableCarbs] = useState<number | null>(null);
  const [editableFat, setEditableFat] = useState<number | null>(null);

  // Modern Macro Card Component
  const MacroCard = ({
    title,
    value,
    color,
    bgColor,
    borderColor,
    iconBgColor,
    icon: Icon,
    isEditing,
    onEdit,
    onValueChange,
  }: {
    title: string;
    value: number;
    color: string;
    bgColor: string;
    borderColor: string;
    iconBgColor: string;
    icon: React.ElementType;
    isEditing: boolean;
    onEdit: () => void;
    onValueChange: (value: number) => void;
  }) => (
    <View className="mb-3">
      <View
        className="rounded-2xl p-4 border shadow-sm"
        style={{ backgroundColor: bgColor, borderColor: borderColor }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: iconBgColor }}
            >
              {Icon === OliveOilIcon ? (
                <OliveOilIcon size={18} color={color} />
              ) : (
                <Icon size={18} color={color} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">{title}</Text>
              {isEditing ? (
                <TextInput
                  value={value.toString()}
                  onChangeText={(text) => {
                    const num = parseFloat(text) || 0;
                    onValueChange(num);
                  }}
                  keyboardType="decimal-pad"
                  className="text-2xl font-bold bg-gray-50 rounded-lg px-3 py-1 mt-1"
                  style={{ color }}
                  selectTextOnFocus
                  autoFocus
                  onBlur={onEdit}
                />
              ) : (
                <TouchableOpacity onPress={onEdit}>
                  <Text className="text-2xl font-bold mt-1" style={{ color }}>
                    {value}g
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={onEdit}
            className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center ml-3"
          >
            <Edit3 size={14} color={color} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!visible || !meal) {
    return null;
  }

  // Defensive checks for meal data
  if (!meal.food_items || !Array.isArray(meal.food_items) || meal.food_items.length === 0) {
    console.warn('AnalyzedFoodModal: Invalid meal data - no food items');
    return null;
  }

  const foodItem = meal.food_items[0];
  if (!foodItem || !foodItem.food) {
    console.warn('AnalyzedFoodModal: Invalid food item data');
    return null;
  }

  const food = foodItem.food;
  const baseNutrition = food.nutrition || {};

  // Calculate nutrition based on quantity with safe defaults, allowing individual edits
  const nutrition = {
    calories: editableCalories ?? Math.round((baseNutrition.calories || 0) * quantity),
    protein: editableProtein ?? Math.round((baseNutrition.protein || 0) * quantity * 10) / 10,
    carbs: editableCarbs ?? Math.round((baseNutrition.carbs || 0) * quantity * 10) / 10,
    fat: editableFat ?? Math.round((baseNutrition.fat || 0) * quantity * 10) / 10,
    fiber: Math.round((baseNutrition.fiber || 0) * quantity * 10) / 10,
    sugar: Math.round((baseNutrition.sugar || 0) * quantity * 10) / 10,
  };

  const handleDelete = () => {
    Alert.alert('Delete Food', `Are you sure you want to delete "${food.name || 'this food'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete?.(meal.id);
          onClose();
        },
      },
    ]);
  };

  const handleSave = () => {
    if (onSave) {
      const updatedMeal = {
        ...meal,
        food_items: [
          {
            ...foodItem,
            quantity,
          },
        ],
      };
      onSave(updatedMeal);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Food Details</Text>
          <View className="w-10" />
        </View>

        {/* Food Image */}
        {food.image_url && (
          <View className="h-48 bg-gray-100">
            <Image source={{ uri: food.image_url }} className="w-full h-full" resizeMode="cover" />
          </View>
        )}

        <ScrollView className="flex-1 px-6 py-4">
          {/* Food Title and Quantity */}
          <View className="mb-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {food.name || 'Unknown Food'}
            </Text>
            {food.brand && food.brand !== 'AI Detected' && (
              <Text className="text-gray-600 mb-4 text-lg">{food.brand}</Text>
            )}

            {/* Quantity Input */}
            <View className="flex-row items-center justify-between border border-slate-200 rounded-xl p-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center mr-2">
                  <Text className="text-slate-600 font-bold text-sm">#</Text>
                </View>
                <Text className="text-base font-semibold text-slate-800">Servings</Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(0.1, quantity - 0.5))}
                  className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
                >
                  <Minus size={14} color="#64748B" />
                </TouchableOpacity>
                <Text className="mx-4 text-lg font-bold text-slate-700 min-w-[40px] text-center">
                  {quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => setQuantity(quantity + 0.5)}
                  className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
                >
                  <Plus size={14} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Calories */}
          <View className="mb-6">
            <View className="rounded-2xl p-4 border border-yellow-200 bg-white shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                    <Apple size={18} color="#EAB308" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">Calories</Text>
                    {editableCalories !== null ? (
                      <TextInput
                        value={nutrition.calories.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text) || 0;
                          setEditableCalories(num);
                        }}
                        keyboardType="numeric"
                        className="text-2xl font-bold bg-gray-50 rounded-lg px-3 py-1 mt-1 text-yellow-500"
                        selectTextOnFocus
                        autoFocus
                        onBlur={() => setEditableCalories(null)}
                      />
                    ) : (
                      <TouchableOpacity onPress={() => setEditableCalories(nutrition.calories)}>
                        <Text className="text-2xl font-bold mt-1 text-yellow-500">
                          {nutrition.calories}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setEditableCalories(editableCalories !== null ? null : nutrition.calories)
                  }
                  className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center ml-3"
                >
                  <Edit3 size={14} color="#EAB308" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Macros */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Macronutrients</Text>
            <View className="space-y-3">
              <MacroCard
                title="Protein"
                value={nutrition.protein}
                color="#EF4444"
                bgColor="#FFFFFF"
                borderColor="#FEF2F2"
                iconBgColor="#FEF2F2"
                icon={Beef}
                isEditing={editableProtein !== null}
                onEdit={() =>
                  setEditableProtein(editableProtein !== null ? null : nutrition.protein)
                }
                onValueChange={setEditableProtein}
              />
              <MacroCard
                title="Carbs"
                value={nutrition.carbs}
                color="#F59E0B"
                bgColor="#FFFFFF"
                borderColor="#FFFBEB"
                iconBgColor="#FFFBEB"
                icon={Wheat}
                isEditing={editableCarbs !== null}
                onEdit={() => setEditableCarbs(editableCarbs !== null ? null : nutrition.carbs)}
                onValueChange={setEditableCarbs}
              />
              <MacroCard
                title="Fat"
                value={nutrition.fat}
                color="#8B5CF6"
                bgColor="#FFFFFF"
                borderColor="#FAF5FF"
                iconBgColor="#FAF5FF"
                icon={OliveOilIcon}
                isEditing={editableFat !== null}
                onEdit={() => setEditableFat(editableFat !== null ? null : nutrition.fat)}
                onValueChange={setEditableFat}
              />
            </View>
          </View>

          {/* Detailed Ingredients */}
          {food.detailed_ingredients && food.detailed_ingredients.length > 0 && (
            <View className="mb-8">
              <Text className="text-xl font-bold text-gray-900 mb-4">Ingredients</Text>

              {food.detailed_ingredients.map((ingredient: any, index: number) => (
                <View
                  key={index}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-100 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 mb-1">{ingredient.name}</Text>
                    <Text className="text-gray-600 text-sm">{ingredient.portion}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-gray-900">
                      {Math.round(ingredient.calories * quantity)} cal
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {Math.round(ingredient.nutrition.protein * quantity * 10) / 10}p •{' '}
                      {Math.round(ingredient.nutrition.carbs * quantity * 10) / 10}c •{' '}
                      {Math.round(ingredient.nutrition.fat * quantity * 10) / 10}f
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* AI Confidence */}
          {food.confidence && (
            <View className="bg-green-50 rounded-xl p-4 mb-8">
              <Text className="text-green-800 font-medium text-center">
                AI Confidence: {food.confidence}%
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className="flex-row gap-4 p-6 border-t border-gray-100">
          {/* <Button
            title="Delete"
            variant="secondary"
            onPress={handleDelete}
            preIcon={<Trash2 size={18} color="#EF4444" />}
            className="px-6"
          /> */}

          <View className="flex-1">
            <Button
              title="Done"
              variant="primary"
              onPress={handleSave}
              preIcon={<Check size={18} color="white" />}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default AnalyzedFoodModal;
