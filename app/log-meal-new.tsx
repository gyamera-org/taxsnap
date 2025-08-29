import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
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
import * as ImagePicker from 'expo-image-picker';

// Components
import { MealTypeSelector } from '@/components/meal/meal-type-selector';
import { QuickActions } from '@/components/meal/quick-actions';
import { SelectedFoodsList } from '@/components/meal/selected-foods-list';
import { NutritionSummary } from '@/components/meal/nutrition-summary';
import { CommunityShareToggle } from '@/components/meal/community-share-toggle';
import { SearchModal } from '@/components/meal/search-modal';
import { CustomFoodModal } from '@/components/meal/custom-food-modal';
import { ScannerModal } from '@/components/meal/scanner-modal';

export default function LogMealScreen() {
  const router = useRouter();
  const createMealEntry = useCreateMealEntry();
  const scanFood = useScanFood();

  // Form state
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [selectedFoods, setSelectedFoods] = useState<FoodItemWithQuantity[]>([]);
  const [shareWithCommunity, setShareWithCommunity] = useState(false);

  // Modal states
  const [showScanner, setShowScanner] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState({
    quantity: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // Custom food state
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

  // Search state
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory, hasActiveSearch } =
    useSearchState();
  const searchResults = useOptimizedFoodSearch(searchQuery);
  const popularFoodsQuery = usePopularFoodsCache();
  const searchData = useFlattenedResults(searchResults);
  const popularFoods = popularFoodsQuery.data?.map(convertToFoodItem) || [];

  // Data for search modal
  const displayFoods = hasActiveSearch
    ? searchData.map((item) => convertToFoodItem(item as any))
    : popularFoods;

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

  const handleEditingValueChange = (field: string, value: number) => {
    setEditingValues((prev) => ({ ...prev, [field]: value }));
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

  const handleScanFood = () => {
    router.push(`/scan-food?mealType=${selectedMealType}`);
  };

  const handleAIScan = () => {
    router.push(`/scan-food?mealType=${selectedMealType}`);
  };

  // Image scanning functions
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

    setSelectedFoods([...selectedFoods, { food: newFood, quantity: 1 }]);
    resetCustomFood();
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

  const handleCustomFoodChange = (field: keyof typeof customFood, value: string) => {
    setCustomFood((prev) => ({ ...prev, [field]: value }));
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

      router.push('/(tabs)/nutrition');
    } catch (error) {
      console.error('Failed to save meal:', error);
    }
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <SubPageLayout title="Log Meal" onBack={() => router.back()}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Meal Type Selection */}
        <MealTypeSelector
          selectedMealType={selectedMealType}
          onMealTypeChange={setSelectedMealType}
        />

        {/* Quick Actions */}
        <QuickActions
          selectedMealType={selectedMealType}
          onScanFood={handleScanFood}
          onSearch={() => setShowSearch(true)}
          onAddCustomFood={() => setShowCustomFood(true)}
          onAIScan={handleAIScan}
        />

        {/* Selected Foods */}
        <SelectedFoodsList
          selectedFoods={selectedFoods}
          editingItemId={editingItemId}
          editingValues={editingValues}
          onUpdateQuantity={updateQuantity}
          onStartEditing={startEditing}
          onSaveEditing={saveEditing}
          onEditingValueChange={handleEditingValueChange}
        />

        {/* Nutrition Summary */}
        {selectedFoods.length > 0 && <NutritionSummary totalNutrition={totalNutrition} />}

        {/* Community Contribution Option */}
        {selectedFoods.length > 0 && (
          <CommunityShareToggle
            shareWithCommunity={shareWithCommunity}
            onToggle={() => setShareWithCommunity(!shareWithCommunity)}
          />
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

      {/* Scanner Modal */}
      <ScannerModal
        showScanner={showScanner}
        onClose={() => setShowScanner(false)}
        onTakePhoto={handleTakePhoto}
        onUploadPhoto={handleUploadPhoto}
        isAnalyzing={isAnalyzing}
      />

      {/* Search Modal */}
      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        foods={displayFoods}
        onAddFood={handleAddFood}
        isLoading={searchResults.isLoading}
        hasNextPage={searchResults.hasNextPage || false}
        onLoadMore={() => {
          if (searchResults.hasNextPage && !searchResults.isFetchingNextPage) {
            searchResults.fetchNextPage();
          }
        }}
        error={searchResults.error}
        hasActiveSearch={hasActiveSearch}
        popularFoodsLoading={popularFoodsQuery.isLoading}
      />

      {/* Custom Food Modal */}
      <CustomFoodModal
        visible={showCustomFood}
        onClose={() => {
          setShowCustomFood(false);
          resetCustomFood();
        }}
        customFood={customFood}
        onCustomFoodChange={handleCustomFoodChange}
        onReset={resetCustomFood}
        onAddCustomFood={handleAddCustomFood}
      />
    </SubPageLayout>
  );
}
