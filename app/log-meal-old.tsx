import { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/layouts/sub-page';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { useCreateMealEntry } from '@/lib/hooks/use-meal-tracking';
import { useScanFood } from '@/lib/hooks/use-food-scanner';
import { FoodItem, FoodItemWithQuantity } from '@/lib/types/nutrition-tracking';
import { convertToFoodItem } from '@/lib/hooks/use-food-database';
import {
  useOptimizedFoodSearch,
  usePopularFoodsCache,
  useFlattenedResults,
  useSearchState,
} from '@/lib/hooks/use-optimized-search';
import { InfiniteScrollList, SearchBar } from '@/components/common/infinite-scroll-list';
import * as ImagePicker from 'expo-image-picker';
import {
  Scan,
  Camera,
  Plus,
  Minus,
  Clock,
  Coffee,
  Utensils,
  Sandwich,
  Cookie,
  Apple,
  Search,
  X,
  ImageIcon,
  Upload,
  Loader2,
  Edit3,
  Check,
  Sparkles,
  Globe,
} from 'lucide-react-native';

// Remove duplicate interfaces as they're now imported from types

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: '#F59E0B' },
  { id: 'lunch', label: 'Lunch', icon: Utensils, color: '#10B981' },
  { id: 'dinner', label: 'Dinner', icon: Sandwich, color: '#8B5CF6' },
  { id: 'snack', label: 'Snack', icon: Cookie, color: '#EC4899' },
];

// Foods now loaded dynamically from database

export default function LogMealScreen() {
  const router = useRouter();
  const createMealEntry = useCreateMealEntry();
  const scanFood = useScanFood();
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [selectedFoods, setSelectedFoods] = useState<FoodItemWithQuantity[]>([]);
  // Optimized search state
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory, hasActiveSearch } =
    useSearchState();
  const [showScanner, setShowScanner] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState({
    quantity: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    brand: '',
    category: 'other',
    servingSize: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
  });

  // Database food queries
  // Optimized food search
  const searchResults = useOptimizedFoodSearch(searchQuery);
  const popularFoodsQuery = usePopularFoodsCache();

  // Flatten infinite query results
  const searchData = useFlattenedResults(searchResults);
  const popularFoods = popularFoodsQuery.data?.map(convertToFoodItem) || [];

  const handleAddFood = (food: FoodItem) => {
    const existingIndex = selectedFoods.findIndex((item) => item.food.id === food.id);

    if (existingIndex >= 0) {
      const updated = [...selectedFoods];
      updated[existingIndex].quantity += 1;
      setSelectedFoods(updated);
    } else {
      setSelectedFoods([...selectedFoods, { food, quantity: 1 }]);
    }

    setShowSearch(false);
  };

  const updateQuantity = (foodId: string, change: number) => {
    setSelectedFoods((prev) =>
      prev
        .map((item) =>
          item.food.id === foodId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const startEditing = (item: FoodItemWithQuantity) => {
    setEditingItemId(item.food.id);
    setEditingValues({
      quantity: item.quantity,
      calories: item.food.nutrition.calories,
      protein: item.food.nutrition.protein,
      carbs: item.food.nutrition.carbs,
      fat: item.food.nutrition.fat,
    });
  };

  const saveEditing = () => {
    if (!editingItemId) return;

    setSelectedFoods((prev) =>
      prev.map((item) =>
        item.food.id === editingItemId
          ? {
              ...item,
              quantity: editingValues.quantity,
              food: {
                ...item.food,
                nutrition: {
                  ...item.food.nutrition,
                  calories: editingValues.calories,
                  protein: editingValues.protein,
                  carbs: editingValues.carbs,
                  fat: editingValues.fat,
                },
              },
            }
          : item
      )
    );

    setEditingItemId(null);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
  };

  const calculateTotalNutrition = () => {
    return selectedFoods.reduce(
      (total, item) => ({
        calories: total.calories + item.food.nutrition.calories * item.quantity,
        protein: total.protein + item.food.nutrition.protein * item.quantity,
        carbs: total.carbs + item.food.nutrition.carbs * item.quantity,
        fat: total.fat + item.food.nutrition.fat * item.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to scan food items.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please grant photo library permission to upload food images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleScanFood = () => {
    router.push(`/scan-food?mealType=${selectedMealType}`);
  };

  const analyzeFoodImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      const base64Data = await convertImageToBase64(imageUri);
      const response = await scanFood.mutateAsync({ image_base64: base64Data });
      const analysis = response.analysis;

      const detectedFood: FoodItem = {
        id: `scanned_${Date.now()}`,
        name: analysis.food_name,
        brand: analysis.brand || 'AI Detected',
        category: analysis.category,
        servingSize: analysis.serving_size,
        nutrition: {
          calories: analysis.nutrition.calories,
          protein: analysis.nutrition.protein,
          carbs: analysis.nutrition.carbs,
          fat: analysis.nutrition.fat,
          fiber: analysis.nutrition.fiber || 0,
          sugar: analysis.nutrition.sugar || 0,
        },
      };

      setSelectedFoods((prev) => [...prev, { food: detectedFood, quantity: 1 }]);
    } catch (error) {
      console.error('Food scanning failed:', error);
      // Error already handled by the mutation hook
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setShowScanner(false);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to take photo');
    }
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    setShowScanner(false);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      toast.error('Failed to upload photo');
    }
  };

  const handleAddCustomFood = () => {
    const nutrition = {
      calories: parseFloat(customFood.calories) || 0,
      protein: parseFloat(customFood.protein) || 0,
      carbs: parseFloat(customFood.carbs) || 0,
      fat: parseFloat(customFood.fat) || 0,
      fiber: parseFloat(customFood.fiber) || 0,
      sugar: parseFloat(customFood.sugar) || 0,
    };

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customFood.name.trim(),
      brand: customFood.brand.trim() || undefined,
      category: customFood.category,
      servingSize: customFood.servingSize.trim(),
      nutrition,
    };

    // Add to selected foods
    setSelectedFoods([...selectedFoods, { food: newFood, quantity: 1 }]);

    // Reset form and close modal
    setCustomFood({
      name: '',
      brand: '',
      category: 'other',
      servingSize: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
    });
    setShowCustomFood(false);

    toast.success('Custom food added! Will be reviewed for community database.');
  };

  const resetCustomFood = () => {
    setCustomFood({
      name: '',
      brand: '',
      category: 'other',
      servingSize: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
    });
  };

  const handleSaveMeal = async () => {
    if (selectedFoods.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }

    try {
      await createMealEntry.mutateAsync({
        meal_type: selectedMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        food_items: selectedFoods,
        share_with_community: shareWithCommunity,
      });

      if (shareWithCommunity) {
        toast.success('Meal saved and submitted for community review! 🌍');
      }

      // Navigate to nutrition tab to ensure data refresh
      router.push('/(tabs)/nutrition');
    } catch (error) {
      console.error('Failed to save meal:', error);
      // Error is already handled by the mutation hook
    }
  };

  // Use search results if searching, otherwise show popular foods
  // Smart data selection - search results or popular foods
  const displayFoods = hasActiveSearch
    ? searchData.map((item) => convertToFoodItem(item as any))
    : popularFoods;

  const totalNutrition = calculateTotalNutrition();

  return (
    <SubPageLayout title="Log Meal" onBack={() => router.back()}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Meal Type Selection */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Meal Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {mealTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedMealType === type.id;

              return (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedMealType(type.id)}
                  className={`flex-row items-center px-4 py-3 rounded-xl border ${
                    isSelected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <IconComponent size={18} color={isSelected ? '#10B981' : type.color} />
                  <Text
                    className={`ml-2 font-medium ${
                      isSelected ? 'text-green-700' : 'text-gray-700'
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Add Food</Text>
          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity
              onPress={handleScanFood}
              className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
            >
              <Camera size={24} color="#10B981" />
              <Text className="text-gray-900 font-semibold mt-2">Scan Food</Text>
              <Text className="text-gray-500 text-xs">AI nutrition analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowSearch(true)}
              className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 items-center"
            >
              <Search size={24} color="#10B981" />
              <Text className="text-gray-900 font-semibold mt-2">Search</Text>
              <Text className="text-gray-500 text-xs">Find in database</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowCustomFood(true)}
            className="bg-white border border-gray-200 rounded-2xl p-4 items-center"
          >
            <Plus size={24} color="#3B82F6" />
            <Text className="text-gray-900 font-semibold mt-2">Add Custom Food</Text>
            <Text className="text-gray-500 text-xs">Create your own entry</Text>
          </TouchableOpacity>

          {/* Quick Scan Button */}
          <TouchableOpacity
            onPress={() => router.push(`/scan-food?mealType=${selectedMealType}`)}
            className="mt-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 flex-row items-center justify-center"
          >
            <Sparkles size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Or try AI Food Scanner</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Foods */}
        {selectedFoods.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Selected Foods</Text>
            {selectedFoods.map((item) => {
              const isEditing = editingItemId === item.food.id;
              return (
                <View
                  key={item.food.id}
                  className="bg-white rounded-xl p-4 mb-2 border border-gray-100"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">{item.food.name}</Text>
                      <Text className="text-sm text-gray-500">
                        {item.food.brand} • {item.food.servingSize}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      {!isEditing ? (
                        <>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.food.id, -1)}
                            className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                          >
                            <Minus size={16} color="#6B7280" />
                          </TouchableOpacity>

                          <Text className="mx-3 font-semibold text-gray-900">{item.quantity}</Text>

                          <TouchableOpacity
                            onPress={() => updateQuantity(item.food.id, 1)}
                            className="w-8 h-8 bg-green-100 rounded-full items-center justify-center"
                          >
                            <Plus size={16} color="#10B981" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => startEditing(item)}
                            className="ml-2 w-8 h-8 bg-blue-100 rounded-full items-center justify-center"
                          >
                            <Edit3 size={16} color="#3B82F6" />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          onPress={saveEditing}
                          className="w-8 h-8 bg-green-100 rounded-full items-center justify-center"
                        >
                          <Check size={16} color="#10B981" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {isEditing ? (
                    <View className="flex flex-col gap-2">
                      {/* Quantity Input */}
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-gray-700">Quantity:</Text>
                        <TextInput
                          value={editingValues.quantity.toString()}
                          onChangeText={(value) => {
                            const num = parseFloat(value);
                            if (!isNaN(num) && num > 0) {
                              setEditingValues((prev) => ({ ...prev, quantity: num }));
                            }
                          }}
                          keyboardType="numeric"
                          className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 min-w-20 text-center"
                        />
                      </View>

                      {/* Nutrition Inputs */}
                      <View className="flex-row justify-between">
                        <View className="flex-1 mr-2">
                          <Text className="text-xs font-medium text-gray-600 mb-1">Calories</Text>
                          <TextInput
                            value={editingValues.calories.toString()}
                            onChangeText={(value) => {
                              const num = parseFloat(value);
                              if (!isNaN(num) && num >= 0) {
                                setEditingValues((prev) => ({ ...prev, calories: num }));
                              }
                            }}
                            keyboardType="numeric"
                            className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-900 text-center"
                          />
                        </View>

                        <View className="flex-1 mx-1">
                          <Text className="text-xs font-medium text-gray-600 mb-1">
                            Protein (g)
                          </Text>
                          <TextInput
                            value={editingValues.protein.toString()}
                            onChangeText={(value) => {
                              const num = parseFloat(value);
                              if (!isNaN(num) && num >= 0) {
                                setEditingValues((prev) => ({ ...prev, protein: num }));
                              }
                            }}
                            keyboardType="numeric"
                            className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-900 text-center"
                          />
                        </View>

                        <View className="flex-1 mx-1">
                          <Text className="text-xs font-medium text-gray-600 mb-1">Carbs (g)</Text>
                          <TextInput
                            value={editingValues.carbs.toString()}
                            onChangeText={(value) => {
                              const num = parseFloat(value);
                              if (!isNaN(num) && num >= 0) {
                                setEditingValues((prev) => ({ ...prev, carbs: num }));
                              }
                            }}
                            keyboardType="numeric"
                            className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-900 text-center"
                          />
                        </View>

                        <View className="flex-1 ml-2">
                          <Text className="text-xs font-medium text-gray-600 mb-1">Fat (g)</Text>
                          <TextInput
                            value={editingValues.fat.toString()}
                            onChangeText={(value) => {
                              const num = parseFloat(value);
                              if (!isNaN(num) && num >= 0) {
                                setEditingValues((prev) => ({ ...prev, fat: num }));
                              }
                            }}
                            keyboardType="numeric"
                            className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-900 text-center"
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row justify-between pt-2 border-t border-gray-50">
                      <Text className="text-xs text-gray-500">
                        {item.food.nutrition.calories * item.quantity} cal
                      </Text>
                      <Text className="text-xs text-gray-500">
                        P: {item.food.nutrition.protein * item.quantity}g
                      </Text>
                      <Text className="text-xs text-gray-500">
                        C: {item.food.nutrition.carbs * item.quantity}g
                      </Text>
                      <Text className="text-xs text-gray-500">
                        F: {item.food.nutrition.fat * item.quantity}g
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Nutrition Summary */}
        {selectedFoods.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Nutrition Summary</Text>
            <View className="bg-green-50 rounded-xl p-4 border border-green-100">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-green-800 font-semibold text-lg">Total Calories</Text>
                <Text className="text-green-800 font-bold text-2xl">
                  {Math.round(totalNutrition.calories)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-green-700 font-medium">
                    {Math.round(totalNutrition.protein)}g
                  </Text>
                  <Text className="text-green-600 text-xs">Protein</Text>
                </View>
                <View className="items-center">
                  <Text className="text-green-700 font-medium">
                    {Math.round(totalNutrition.carbs)}g
                  </Text>
                  <Text className="text-green-600 text-xs">Carbs</Text>
                </View>
                <View className="items-center">
                  <Text className="text-green-700 font-medium">
                    {Math.round(totalNutrition.fat)}g
                  </Text>
                  <Text className="text-green-600 text-xs">Fat</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Community Contribution Option */}
        {selectedFoods.length > 0 && (
          <View className="mx-4 mb-6">
            <TouchableOpacity
              onPress={() => setShareWithCommunity(!shareWithCommunity)}
              className={`rounded-2xl p-4 border ${
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
                    Help others by contributing your custom foods to our community database
                  </Text>
                </View>
                {shareWithCommunity && (
                  <View className="bg-blue-100 px-3 py-1 rounded-full ml-2">
                    <Text className="text-blue-800 text-xs font-medium">Active</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Save Button */}
        <View className="px-4 pb-8">
          <Button
            title="Save Meal"
            onPress={handleSaveMeal}
            className="w-full bg-green-500"
            disabled={selectedFoods.length === 0}
            loading={createMealEntry.isPending}
          />
        </View>
      </ScrollView>

      {/* AI Scanner Modal */}
      {/* Camera Modal */}
      <Modal visible={showScanner} transparent animationType="slide">
        <View className="flex-1 bg-black/90 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Scan Food</Text>
              <TouchableOpacity onPress={() => setShowScanner(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="bg-green-500 rounded-2xl p-4 flex-row items-center"
                style={{
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Camera size={24} color="white" />
                <View className="flex-1 ml-4">
                  <Text className="text-white font-semibold text-lg">Take Photo</Text>
                  <Text className="text-white/80 text-sm">Use camera to scan food</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUploadPhoto}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center"
              >
                <ImageIcon size={24} color="#10B981" />
                <View className="flex-1 ml-4">
                  <Text className="text-gray-900 font-semibold text-lg">Upload Photo</Text>
                  <Text className="text-gray-500 text-sm">Choose from gallery</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text className="text-center text-gray-400 text-sm mt-6">
              AI will analyze the food and estimate nutrition values
            </Text>
          </View>
        </View>
      </Modal>

      {/* Analyzing Overlay */}
      <Modal visible={isAnalyzing} transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center p-4">
          <View className="bg-white rounded-2xl p-8 items-center min-w-[250px]">
            <View className="relative">
              <Loader2
                size={48}
                color="#10B981"
                style={{
                  transform: [{ rotate: '0deg' }],
                }}
              />
            </View>
            <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">Analyzing Food</Text>
            <Text className="text-gray-600 text-center">
              AI is processing your image and calculating nutrition values...
            </Text>
            <View className="flex-row items-center mt-4">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1 opacity-70" />
              <View className="w-2 h-2 bg-green-500 rounded-full opacity-40" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal visible={showSearch} animationType="slide">
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="px-4 py-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">Search Foods</Text>
              <TouchableOpacity onPress={() => setShowSearch(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mt-4">
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for foods..."
                autoFocus={true}
              />

              {/* Quick Category Filters */}
              <View className="mt-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2 px-1">
                    {['All', 'Fruit', 'Vegetable', 'Protein', 'Grains', 'Dairy', 'Snacks'].map(
                      (category) => (
                        <TouchableOpacity
                          key={category}
                          onPress={() =>
                            setActiveCategory(category === 'All' ? null : category.toLowerCase())
                          }
                          className={`px-3 py-1.5 rounded-full border ${
                            (category === 'All' && !activeCategory) ||
                            activeCategory === category.toLowerCase()
                              ? 'bg-green-100 border-green-200'
                              : 'bg-slate-100 border-slate-200'
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              (category === 'All' && !activeCategory) ||
                              activeCategory === category.toLowerCase()
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }`}
                          >
                            {category}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          <InfiniteScrollList
            data={displayFoods}
            renderItem={({ item: food }) => (
              <TouchableOpacity
                onPress={() => handleAddFood(food)}
                className="bg-white rounded-xl p-4 mb-2 border border-gray-100 mx-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="font-semibold text-gray-900 flex-1">{food.name}</Text>
                      {food.category && (
                        <View className="bg-green-100 px-2 py-1 rounded-full ml-2">
                          <Text className="text-xs text-green-700 font-medium">
                            {food.category}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-gray-500">
                      {food.brand} • {food.servingSize}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      {food.nutrition.calories} cal • P: {food.nutrition.protein}g • C:{' '}
                      {food.nutrition.carbs}g • F: {food.nutrition.fat}g
                    </Text>
                  </View>
                  <Plus size={20} color="#10B981" />
                </View>
              </TouchableOpacity>
            )}
            onLoadMore={() => {
              if (searchResults.hasNextPage && !searchResults.isFetchingNextPage) {
                searchResults.fetchNextPage();
              }
            }}
            isLoading={hasActiveSearch ? searchResults.isLoading : popularFoodsQuery.isLoading}
            isFetchingNextPage={searchResults.isFetchingNextPage || false}
            hasNextPage={searchResults.hasNextPage || false}
            error={searchResults.error}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            emptyMessage={
              searchQuery.length > 0
                ? `No foods found for "${searchQuery}"`
                : 'Start typing to search foods'
            }
            emptySubtitle={
              searchQuery.length > 0
                ? 'Try a different search or scan your food with AI'
                : 'Search our community database or scan with AI'
            }
            estimatedItemSize={100}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </SafeAreaView>
      </Modal>

      {/* Custom Food Modal */}
      <Modal visible={showCustomFood} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl h-[95%]">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <TouchableOpacity
                onPress={() => {
                  setShowCustomFood(false);
                  resetCustomFood();
                }}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-900">Add Custom Food</Text>
              <TouchableOpacity onPress={resetCustomFood}>
                <Text className="text-blue-600 font-medium">Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
              {/* Food Info Section */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Food Information</Text>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Food Name *</Text>
                  <TextInput
                    value={customFood.name}
                    onChangeText={(value) => setCustomFood((prev) => ({ ...prev, name: value }))}
                    placeholder="e.g., Homemade Pasta Salad"
                    placeholderTextColor="#9CA3AF"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Brand (Optional)</Text>
                  <TextInput
                    value={customFood.brand}
                    onChangeText={(value) => setCustomFood((prev) => ({ ...prev, brand: value }))}
                    placeholder="e.g., Homemade, Kraft, etc."
                    placeholderTextColor="#9CA3AF"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Serving Size *</Text>
                  <TextInput
                    value={customFood.servingSize}
                    onChangeText={(value) =>
                      setCustomFood((prev) => ({ ...prev, servingSize: value }))
                    }
                    placeholder="e.g., 1 cup, 100g, 1 slice"
                    placeholderTextColor="#9CA3AF"
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-base"
                  />
                </View>
              </View>

              {/* Nutrition Section */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Nutrition per Serving
                </Text>

                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Calories *</Text>
                    <TextInput
                      value={customFood.calories}
                      onChangeText={(value) =>
                        setCustomFood((prev) => ({ ...prev, calories: value }))
                      }
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Protein (g) *</Text>
                    <TextInput
                      value={customFood.protein}
                      onChangeText={(value) =>
                        setCustomFood((prev) => ({ ...prev, protein: value }))
                      }
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                    />
                  </View>
                </View>

                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Carbs (g) *</Text>
                    <TextInput
                      value={customFood.carbs}
                      onChangeText={(value) => setCustomFood((prev) => ({ ...prev, carbs: value }))}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Fat (g) *</Text>
                    <TextInput
                      value={customFood.fat}
                      onChangeText={(value) => setCustomFood((prev) => ({ ...prev, fat: value }))}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                    />
                  </View>
                </View>

                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Fiber (g)</Text>
                    <TextInput
                      value={customFood.fiber}
                      onChangeText={(value) => setCustomFood((prev) => ({ ...prev, fiber: value }))}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Sugar (g)</Text>
                    <TextInput
                      value={customFood.sugar}
                      onChangeText={(value) => setCustomFood((prev) => ({ ...prev, sugar: value }))}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 text-center text-base"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View className="p-4 border-t border-gray-200">
              <Button
                title="Add Food"
                onPress={handleAddCustomFood}
                className="w-full bg-blue-500"
                disabled={
                  !customFood.name.trim() || !customFood.servingSize.trim() || !customFood.calories
                }
              />
            </View>
          </View>
        </View>
      </Modal>
    </SubPageLayout>
  );
}
