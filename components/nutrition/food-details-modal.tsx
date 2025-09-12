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
import {
  X,
  Trash2,
  Check,
  Flame,
  Beef,
  Wheat,
  Edit3,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react-native';
import { OliveOilIcon } from '@/components/icons/olive-oil-icon';
import { MacroCard } from './macro-card';
import { useThemedStyles } from '@/lib/utils/theme';

interface MealData {
  id: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  image_url?: string;
  food_items?: any[];
  [key: string]: any;
}

interface FoodDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  meal: MealData | null;
  onDelete?: (mealId: string) => void;
  onSave?: (mealId: string, updates: any) => void;
  onDone?: () => void; // Called when Done is pressed (for refreshing data)
  onRetry?: (meal: MealData) => void; // Called when retry is pressed for failed analysis
}

export function FoodDetailsModal({
  visible,
  onClose,
  meal,
  onDelete,
  onSave,
  onDone,
  onRetry,
}: FoodDetailsModalProps) {
  const themed = useThemedStyles();
  const [quantity, setQuantity] = useState(1);
  const [originalQuantity, setOriginalQuantity] = useState(1); // Track original quantity for change detection
  const [editableCalories, setEditableCalories] = useState<number | null>(null);
  const [editableProtein, setEditableProtein] = useState<number | null>(null);
  const [editableCarbs, setEditableCarbs] = useState<number | null>(null);
  const [editableFat, setEditableFat] = useState<number | null>(null);

  React.useEffect(() => {
    if (meal) {
      let calculatedQuantity = 1;

      if (meal.food_items && Array.isArray(meal.food_items) && meal.food_items.length > 0) {
        const foodItem = meal.food_items[0];
        if (foodItem?.food?.nutrition) {
          const originalNutrition = foodItem.food.nutrition;
          // Use calories as the reference for calculating quantity (most reliable)
          if (originalNutrition.calories && originalNutrition.calories > 0) {
            calculatedQuantity = Math.max(0.1, (meal.calories || 0) / originalNutrition.calories);
            calculatedQuantity = Math.round(calculatedQuantity * 4) / 4; // Round to nearest 0.25
          }
        }
      }

      setQuantity(calculatedQuantity);
      setOriginalQuantity(calculatedQuantity); // Store original for change detection
      setEditableCalories(null);
      setEditableProtein(null);
      setEditableCarbs(null);
      setEditableFat(null);
    }
  }, [meal?.id]); // Only reset when meal ID changes

  if (!visible || !meal) {
    return null;
  }

  // Handle both structured food items and direct meal nutrition data
  let food: any = {};
  let baseNutrition: any = {};

  if (meal.food_items && Array.isArray(meal.food_items) && meal.food_items.length > 0) {
    // Structured food data from AI analysis
    const foodItem = meal.food_items[0];
    if (foodItem?.food) {
      food = foodItem.food;
      // Use original food.nutrition values for base calculation since we now calculate quantity correctly
      // This allows the quantity * baseNutrition to equal the current meal totals
      baseNutrition = food.nutrition || {
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
      };
    }
  } else {
    // Direct meal data - use meal properties directly as base (quantity will be 1)
    food = {
      name: meal.name,
      brand: meal.type,
      image_url: meal.image_url,
    };
    baseNutrition = {
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
    };
  }

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
    Alert.alert(
      'Delete Food',
      `Are you sure you want to delete "${food.name || meal.name || 'this food'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.(meal.id);
            // Don't call onClose() here - the hook handles modal closure after successful delete
          },
        },
      ]
    );
  };

  const handleSave = () => {
    // Check if any changes were made (quantity changed from original or any macro was edited)
    const hasChanges =
      quantity !== originalQuantity ||
      editableCalories !== null ||
      editableProtein !== null ||
      editableCarbs !== null ||
      editableFat !== null;

    if (hasChanges && onSave && meal) {
      // Call onSave with meal ID and nutrition updates in the expected format
      onSave(meal.id, {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
      });
      // onSave handler will close modal and refresh data
    } else {
      // No changes made, just refresh data and close modal

      if (onDone) {
        onDone(); // Trigger data refresh
      }
      onClose(); // Close modal manually since no save occurred
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        className={themed("flex-1 bg-white", "flex-1 bg-gray-900")}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className={themed("flex-row items-center justify-between p-6 bg-white", "flex-row items-center justify-between p-6 bg-gray-900")}>
          <Text className={themed("text-xl font-bold text-gray-900", "text-xl font-bold text-white")}>Food Details</Text>
          <TouchableOpacity
            onPress={onClose}
            className={themed("w-10 h-10 bg-gray-100 rounded-full items-center justify-center", "w-10 h-10 bg-gray-700 rounded-full items-center justify-center")}
          >
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Food Image */}
        {(food.image_url || meal.image_url) && (
          <View className={themed("h-48 bg-gray-100", "h-48 bg-gray-800")}>
            <Image
              source={{ uri: food.image_url || meal.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}

        <ScrollView className="flex-1 px-6 py-4">
          {/* Food Title and Quantity */}
          <View className={themed("mb-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm", "mb-6 bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-sm")}>
            <Text className={themed("text-3xl font-bold text-gray-900 mb-2", "text-3xl font-bold text-white mb-2")}>
              {food.name || meal.name || 'Unknown Food'}
            </Text>
            {food.brand && food.brand !== 'AI Detected' && (
              <Text className={themed("text-gray-600 mb-4 text-lg", "text-gray-300 mb-4 text-lg")}>{food.brand}</Text>
            )}

            {/* Quantity Input */}
            <View className={themed("flex-row items-center justify-between border border-slate-200 rounded-xl p-3", "flex-row items-center justify-between border border-gray-600 rounded-xl p-3")}>
              <View className="flex-row items-center">
                <View className={themed("w-8 h-8 bg-slate-100 rounded-full items-center justify-center mr-2", "w-8 h-8 bg-gray-700 rounded-full items-center justify-center mr-2")}>
                  <Text className={themed("text-slate-600 font-bold text-sm", "text-gray-300 font-bold text-sm")}>#</Text>
                </View>
                <Text className={themed("text-base font-semibold text-slate-800", "text-base font-semibold text-gray-200")}>Servings</Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(0.1, quantity - 0.5))}
                  className={themed("w-8 h-8 bg-slate-100 rounded-full items-center justify-center", "w-8 h-8 bg-gray-700 rounded-full items-center justify-center")}
                >
                  <Minus size={14} color="#64748B" />
                </TouchableOpacity>
                <Text className={themed("mx-4 text-lg font-bold text-slate-700 min-w-[40px] text-center", "mx-4 text-lg font-bold text-gray-200 min-w-[40px] text-center")}>
                  {quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => setQuantity(quantity + 0.5)}
                  className={themed("w-8 h-8 bg-slate-100 rounded-full items-center justify-center", "w-8 h-8 bg-gray-700 rounded-full items-center justify-center")}
                >
                  <Plus size={14} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Calories */}
          <View className="mb-6">
            <View className={themed("rounded-2xl p-4 border border-yellow-200 bg-white shadow-sm", "rounded-2xl p-4 border border-yellow-800/30 bg-gray-800 shadow-sm")}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={themed("w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3", "w-10 h-10 bg-yellow-900/30 rounded-full items-center justify-center mr-3")}>
                    <Flame size={18} color="#EAB308" />
                  </View>
                  <View className="flex-1">
                    <Text className={themed("text-lg font-semibold text-gray-800", "text-lg font-semibold text-gray-200")}>Calories</Text>
                    {editableCalories !== null ? (
                      <TextInput
                        value={nutrition.calories.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text) || 0;
                          setEditableCalories(num);
                        }}
                        keyboardType="numeric"
                        className={themed("text-2xl font-bold bg-gray-50 rounded-lg px-3 py-1 mt-1 text-yellow-500", "text-2xl font-bold bg-gray-700 rounded-lg px-3 py-1 mt-1 text-yellow-500")}
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
                  className={themed("w-8 h-8 bg-gray-50 rounded-full items-center justify-center ml-3", "w-8 h-8 bg-gray-700 rounded-full items-center justify-center ml-3")}
                >
                  <Edit3 size={14} color="#EAB308" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Macros */}
          <View className="mb-8">
            <Text className={themed("text-xl font-bold text-gray-900 mb-4", "text-xl font-bold text-white mb-4")}>Macronutrients</Text>
            <View className="flex flex-col gap-4">
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
                      {Math.round((ingredient.calories || 0) * quantity)} cal
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {Math.round((ingredient.nutrition?.protein || 0) * quantity * 10) / 10}p •{' '}
                      {Math.round((ingredient.nutrition?.carbs || 0) * quantity * 10) / 10}c •{' '}
                      {Math.round((ingredient.nutrition?.fat || 0) * quantity * 10) / 10}f
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
        <View className={themed("flex-row gap-4 p-6 border-t border-gray-100", "flex-row gap-4 p-6 border-t border-gray-700")}>
          {/* Retry Button (only show for failed analysis) */}
          {meal?.analysis_status === 'failed' && onRetry && (
            <TouchableOpacity
              onPress={() => {
                onRetry(meal);
                onClose();
              }}
              className="flex-row items-center justify-center bg-orange-100 px-6 py-3 rounded-xl"
            >
              <RotateCcw size={18} color="#F97316" />
              <Text className="text-orange-600 font-medium ml-2">Retry Scan</Text>
            </TouchableOpacity>
          )}

          {/* Delete Button (only show if onDelete is provided) */}
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center justify-center bg-red-100 px-6 py-3 rounded-xl"
            >
              <Trash2 size={18} color="#EF4444" />
              <Text className="text-red-600 font-medium ml-2">Delete</Text>
            </TouchableOpacity>
          )}

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
