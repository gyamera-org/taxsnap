import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X, Edit3, Plus, Minus, Check, AlertCircle, Flame, ChefHat } from 'lucide-react-native';
import { FoodAnalysisLoading } from './food-analysis-loading';

interface FoodIngredient {
  name: string;
  portion: string;
  calories: number;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface FoodAnalysisResult {
  food_name: string;
  brand?: string;
  category: string;
  serving_size: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium_mg: number;
  };
  detailed_ingredients?: FoodIngredient[];
  confidence: number;
  image_url?: string;
}

interface FoodAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  analysisResult: FoodAnalysisResult | null;
  isLoading: boolean;
  onSave: (result: FoodAnalysisResult) => void;
  onEdit: (result: FoodAnalysisResult) => void;
  // New props for enhanced loading
  loadingProgress?: number;
  loadingStage?: 'uploading' | 'analyzing' | 'processing' | 'finalizing';
  foodName?: string;
}

export function FoodAnalysisModal({
  visible,
  onClose,
  analysisResult,
  isLoading,
  onSave,
  onEdit,
  loadingProgress = 0,
  loadingStage = 'analyzing',
  foodName,
}: FoodAnalysisModalProps) {
  const [editingQuantity, setEditingQuantity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState<FoodAnalysisResult | null>(null);

  // Animation for loading state
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 8000, // 8 seconds for realistic analysis time
        useNativeDriver: false,
      }).start();

      // Rotate chef hat
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      progressAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [isLoading]);

  const handleEdit = () => {
    setEditedResult(analysisResult);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedResult) {
      onEdit(editedResult);
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    if (analysisResult) {
      // Apply quantity multiplier to nutrition values
      const adjustedResult = {
        ...analysisResult,
        nutrition: {
          calories: Math.round(analysisResult.nutrition.calories * editingQuantity),
          protein: Math.round(analysisResult.nutrition.protein * editingQuantity * 10) / 10,
          carbs: Math.round(analysisResult.nutrition.carbs * editingQuantity * 10) / 10,
          fat: Math.round(analysisResult.nutrition.fat * editingQuantity * 10) / 10,
          fiber: Math.round(analysisResult.nutrition.fiber * editingQuantity * 10) / 10,
          sugar: Math.round(analysisResult.nutrition.sugar * editingQuantity * 10) / 10,
          sodium_mg: Math.round(analysisResult.nutrition.sodium_mg * editingQuantity),
        },
        serving_size:
          editingQuantity === 1
            ? analysisResult.serving_size
            : `${editingQuantity} × ${analysisResult.serving_size}`,
      };
      onSave(adjustedResult);
    }
  };

  const renderLoadingState = () => {
    return (
      <FoodAnalysisLoading progress={loadingProgress} stage={loadingStage} foodName={foodName} />
    );
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    const result = isEditing ? editedResult || analysisResult : analysisResult;

    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Food Image */}
        {result.image_url && (
          <View className="mb-6">
            <Image
              source={{ uri: result.image_url }}
              className="w-full h-48 rounded-2xl"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Food Header */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">{result.food_name}</Text>
              {result.brand && <Text className="text-gray-600 text-sm">{result.brand}</Text>}
            </View>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-800 font-medium text-sm">{result.confidence}%</Text>
            </View>
          </View>

          {/* Calories */}
          <View className="flex-row items-center mb-4">
            <Flame size={20} color="#EF4444" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              {Math.round(result.nutrition.calories * editingQuantity)} calories
            </Text>
          </View>

          {/* Macros */}
          <View className="flex-row justify-between bg-gray-50 rounded-xl p-4">
            <View className="items-center">
              <Text className="text-red-500 text-sm font-medium">Protein</Text>
              <Text className="text-lg font-bold text-gray-900">
                {Math.round(result.nutrition.protein * editingQuantity * 10) / 10}g
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-orange-500 text-sm font-medium">Carbs</Text>
              <Text className="text-lg font-bold text-gray-900">
                {Math.round(result.nutrition.carbs * editingQuantity * 10) / 10}g
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-blue-500 text-sm font-medium">Fats</Text>
              <Text className="text-lg font-bold text-gray-900">
                {Math.round(result.nutrition.fat * editingQuantity * 10) / 10}g
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity Selector */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Quantity</Text>
          <View className="flex-row items-center justify-center bg-gray-50 rounded-xl p-4">
            <TouchableOpacity
              onPress={() => setEditingQuantity(Math.max(0.5, editingQuantity - 0.5))}
              className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
            >
              <Minus size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 mx-6">{editingQuantity}</Text>
            <TouchableOpacity
              onPress={() => setEditingQuantity(editingQuantity + 0.5)}
              className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
            >
              <Plus size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Ingredients */}
        {result.detailed_ingredients && result.detailed_ingredients.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">Ingredients</Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-800 text-xs font-medium">Add More</Text>
              </View>
            </View>

            {result.detailed_ingredients.map((ingredient, index) => (
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
                    {Math.round(ingredient.calories * editingQuantity)} cal
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {Math.round(ingredient.nutrition.protein * editingQuantity * 10) / 10}p •{' '}
                    {Math.round(ingredient.nutrition.carbs * editingQuantity * 10) / 10}c •{' '}
                    {Math.round(ingredient.nutrition.fat * editingQuantity * 10) / 10}f
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={handleEdit}
            className="flex-1 bg-gray-100 rounded-xl p-4 flex-row items-center justify-center"
          >
            <Edit3 size={20} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-2">Fix Issue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            className="flex-1 bg-black rounded-xl p-4 flex-row items-center justify-center"
          >
            <Check size={20} color="white" />
            <Text className="text-white font-medium ml-2">Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            {isLoading ? 'Analyzing Food' : 'Food Analysis'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View className="flex-1 px-6 py-4">
          {isLoading ? renderLoadingState() : renderAnalysisResult()}
        </View>
      </View>
    </Modal>
  );
}
