import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, TextInput } from '@/components/ui';
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  Search,
  Brain,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyzeIngredients, type IngredientAnalysis } from '@/lib/services/ingredient-analysis';
import { toast } from 'sonner-native';
import { useCreateCustomProduct } from '@/lib/hooks/use-api';

interface Props {
  visible: boolean;
  onClose: () => void;
  imageUri: string | null;
  extractedText: string;
  isTextMode?: boolean;
}

export function IngredientAnalysisSheet({
  visible,
  onClose,
  imageUri,
  extractedText,
  isTextMode = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const [ingredients, setIngredients] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [productType, setProductType] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasOcrText, setHasOcrText] = useState(false);
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null);
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());
  const [showTooltip, setShowTooltip] = useState(false);
  const [extractingText, setExtractingText] = useState(false);
  const [canAnalyze, setCanAnalyze] = useState(false);
  const createProductMutation = useCreateCustomProduct();

  const spinValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

  useEffect(() => {
    if (isAnalyzing || extractingText) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinValue.setValue(0);
      pulseValue.setValue(1);
    }
  }, [isAnalyzing, extractingText]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (visible) {
      if (extractedText && extractedText.trim().length > 0) {
        setExtractingText(true);
        setTimeout(() => {
          setIngredients(extractedText);
          setHasOcrText(true);
          setExtractingText(false);
          setCanAnalyze(true);
          performAnalysis(extractedText.trim());
        }, 2000);
      } else if (isTextMode) {
        setIngredients('');
        setHasOcrText(false);
        setAnalysis(null);
        setCanAnalyze(false);
        setExtractingText(false);
      } else {
        setIngredients('');
        setHasOcrText(false);
        setAnalysis(null);
        setCanAnalyze(false);
      }

      setProductName('');
      setBrand('');
      setProductType('');
      setExpandedIngredients(new Set());
      setShowTooltip(false);
    }
  }, [visible, extractedText, isTextMode]);

  useEffect(() => {
    if (isTextMode) {
      setCanAnalyze(ingredients.trim().length > 10);
    }
  }, [ingredients, isTextMode]);

  const performAnalysis = async (ingredientsText: string) => {
    if (!ingredientsText.trim()) {
      toast.error('Please enter ingredients to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeIngredients(ingredientsText);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze ingredients. Please try again.');
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAnalyze = () => {
    if (ingredients.trim().length < 10) {
      toast.error('Please enter a valid ingredients list');
      return;
    }
    performAnalysis(ingredients.trim());
  };

  const handleSaveProduct = async () => {
    if (!productName.trim() || !brand.trim() || !productType.trim() || !analysis) {
      toast.error('Please fill in all product details and analyze ingredients first');
      return;
    }

    if (isTextMode && !ingredients.trim()) {
      toast.error('Please enter ingredients before saving');
      return;
    }

    setIsSaving(true);
    try {
      await createProductMutation.mutateAsync({
        name: productName.trim(),
        description: `${brand.trim()} - ${productType.trim()}\n\n${analysis.analysis.overallRecommendation}`,
        ingredients: analysis.keyIngredients.map((ingredient) => ({
          name: ingredient.name,
          purpose: ingredient.purpose,
          effect: ingredient.effect,
        })),
      });

      toast.success('Product saved to your collection!');
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Unable to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleIngredient = (ingredientName: string) => {
    const newExpanded = new Set(expandedIngredients);
    if (newExpanded.has(ingredientName)) {
      newExpanded.delete(ingredientName);
    } else {
      newExpanded.add(ingredientName);
    }
    setExpandedIngredients(newExpanded);
  };

  const renderIngredientItem = (ingredient: any, index: number) => {
    const isExpanded = expandedIngredients.has(ingredient.name);

    return (
      <View key={index} className="mb-3">
        <Pressable
          onPress={() => toggleIngredient(ingredient.name)}
          className="bg-gray-100 rounded-xl p-4 flex-row justify-between items-center"
        >
          <Text className="text-gray-900 font-medium flex-1">{ingredient.name}</Text>
          {isExpanded ? (
            <ChevronUp size={20} color="#6b7280" />
          ) : (
            <ChevronDown size={20} color="#6b7280" />
          )}
        </Pressable>

        {isExpanded && (
          <View className="bg-gray-50 rounded-b-xl px-4 pb-4">
            <View className="pt-3">
              <Text className="text-gray-600 text-sm mb-1">Purpose:</Text>
              <Text className="text-gray-800 mb-3">{ingredient.purpose}</Text>

              <Text className="text-gray-600 text-sm mb-1">Effect:</Text>
              <Text className="text-gray-800">{ingredient.effect}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (!visible) {
    return null;
  }

  const canSave =
    analysis &&
    productName.trim() &&
    brand.trim() &&
    productType.trim() &&
    (!isTextMode || ingredients.trim());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="text-gray-900 text-xl font-semibold">Product Analysis</Text>
            <Pressable onPress={onClose}>
              <X size={24} color="#374151" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            {/* Text Mode - Manual Ingredient Input */}
            {isTextMode && (
              <View className="mt-6 mb-6">
                <Text className="text-gray-900 text-lg font-semibold mb-4">
                  Product Information
                </Text>

                {/* Product Details Form - Moved to top for text mode */}
                <View className="flex-col gap-4 mb-6">
                  <View>
                    <Text className="text-gray-700 text-sm mb-2">Product Name *</Text>
                    <TextInput
                      placeholder="e.g., Curl Defining Cream"
                      value={productName}
                      onChangeText={setProductName}
                      className="text-gray-900"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 text-sm mb-2">Brand *</Text>
                    <TextInput
                      placeholder="e.g., Shea Moisture"
                      value={brand}
                      onChangeText={setBrand}
                      className="text-gray-900"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 text-sm mb-2">Product Type *</Text>
                    <TextInput
                      placeholder="e.g., Leave-in Conditioner, Shampoo, Styling Gel"
                      value={productType}
                      onChangeText={setProductType}
                      className="text-gray-900"
                    />
                  </View>
                </View>

                {/* Ingredients Input */}
                <View>
                  <Text className="text-gray-700 text-sm mb-2">Ingredients List *</Text>
                  <TextInput
                    placeholder="Enter the full ingredients list here... (e.g., Water, Cetyl Alcohol, Stearyl Alcohol, Behentrimonium Chloride...)"
                    value={ingredients}
                    onChangeText={setIngredients}
                    multiline
                    numberOfLines={6}
                    className="text-gray-900 min-h-[120px]"
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    scrollEnabled={true}
                  />
                  <Text className="text-gray-500 text-xs mt-1">
                    Separate ingredients with commas. The more complete the list, the better the
                    analysis.
                  </Text>
                </View>

                {/* Analyze Button */}
                {!analysis && !isAnalyzing && (
                  <View className="mt-6">
                    <Button
                      variant="primary"
                      label="🧠 Analyze Ingredients"
                      onPress={handleManualAnalyze}
                      disabled={!canAnalyze}
                      className="w-full"
                    />
                    {!canAnalyze && (
                      <Text className="text-gray-500 text-xs text-center mt-2">
                        Enter ingredients to enable analysis
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Text Extraction Loading State */}
            {extractingText && !isTextMode && (
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 mt-6">
                <View className="items-center">
                  <Animated.View
                    style={{
                      transform: [{ scale: pulseValue }],
                    }}
                  >
                    <Search size={32} color="#2563eb" />
                  </Animated.View>
                  <Text className="text-purple-800 font-medium text-lg mt-4 mb-2 text-center">
                    Extracting Ingredients
                  </Text>
                  <Text className="text-purple-600 text-sm text-center">
                    Our AI is scanning your product label...
                  </Text>
                  <View className="flex-row items-center justify-center mt-4 space-x-2">
                    <View
                      className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <View
                      className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                    <View
                      className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: '600ms' }}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* OCR Success Indicator */}
            {hasOcrText && !isAnalyzing && !extractingText && !isTextMode && (
              <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 mt-6">
                <View className="flex-row items-center mb-2">
                  <Check size={20} color="#059669" className="mr-2" />
                  <Text className="text-green-800 font-medium">
                    Ingredients Extracted Successfully!
                  </Text>
                </View>
                <Text className="text-green-700 text-sm">
                  We've identified the ingredients. Now analyzing their properties...
                </Text>
              </View>
            )}

            {/* Analysis Loading State */}
            {isAnalyzing && (
              <View className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6 mt-6">
                <View className="items-center">
                  <Animated.View
                    style={{
                      transform: [{ rotate: spin }],
                    }}
                  >
                    <Brain size={32} color="#7c3aed" />
                  </Animated.View>
                  <Text className="text-purple-800 font-medium text-lg mt-4 mb-2 text-center">
                    Analyzing Ingredients
                  </Text>
                  <Text className="text-purple-600 text-sm text-center">
                    Our AI is examining each ingredient for:{'\n'}
                    Sulfates • Silicones • Moisturizing Properties • Hair Type Compatibility
                  </Text>
                  <View className="mt-4">
                    <Animated.View
                      style={{
                        transform: [{ scale: pulseValue }],
                      }}
                    >
                      <Sparkles size={24} color="#7c3aed" />
                    </Animated.View>
                  </View>
                </View>
              </View>
            )}

            {/* Analysis Results */}
            {analysis && !isAnalyzing && (
              <View className="mt-6">
                <Text className="text-gray-900 text-lg font-semibold mb-4">Analysis Results</Text>

                {/* Properties Pills */}
                <View className="flex-row flex-wrap gap-2 mb-6">
                  <View
                    className={`px-3 py-1 rounded-full ${analysis.sulfateFree ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    <Text
                      className={`text-xs font-medium ${analysis.sulfateFree ? 'text-green-800' : 'text-red-800'}`}
                    >
                      {analysis.sulfateFree ? 'Sulfate-Free' : 'Contains Sulfates'}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${analysis.siliconeFree ? 'bg-green-100' : 'bg-orange-100'}`}
                  >
                    <Text
                      className={`text-xs font-medium ${analysis.siliconeFree ? 'text-green-800' : 'text-orange-800'}`}
                    >
                      {analysis.siliconeFree ? 'Silicone-Free' : 'Contains Silicones'}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${analysis.coilyHairFriendly ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    <Text
                      className={`text-xs font-medium ${analysis.coilyHairFriendly ? 'text-green-800' : 'text-red-800'}`}
                    >
                      {analysis.coilyHairFriendly
                        ? 'Coily Hair Friendly'
                        : 'Not Ideal for Coily Hair'}
                    </Text>
                  </View>
                </View>

                {/* Ingredients List */}
                <Text className="text-gray-900 text-lg font-semibold mb-4">Ingredients</Text>
                {analysis.keyIngredients.map((ingredient, index) =>
                  renderIngredientItem(ingredient, index)
                )}

                {/* Overall Recommendation */}
                <View className="bg-purple-50 rounded-xl p-4 mb-6">
                  <Text className="text-purple-900 font-medium mb-2">Recommendation</Text>
                  <Text className="text-purple-800 text-sm">
                    {analysis.analysis.overallRecommendation}
                  </Text>
                </View>
              </View>
            )}

            {/* Product Details Form - Only show for non-text modes */}
            {!isTextMode && (
              <View className="flex-col gap-4 mb-8 mt-6">
                <Text className="text-gray-900 text-lg font-semibold mb-3">Product Details</Text>

                <View>
                  <Text className="text-gray-700 text-sm mb-2">Product Name *</Text>
                  <TextInput
                    placeholder="e.g., Curl Defining Cream"
                    value={productName}
                    onChangeText={setProductName}
                    className="text-gray-900"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-2">Brand *</Text>
                  <TextInput
                    placeholder="e.g., Shea Moisture"
                    value={brand}
                    onChangeText={setBrand}
                    className="text-gray-900"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-2">Product Type *</Text>
                  <TextInput
                    placeholder="e.g., Leave-in Conditioner, Shampoo, Styling Gel"
                    value={productType}
                    onChangeText={setProductType}
                    className="text-gray-900"
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Save Options */}
          <View
            className="px-6 py-4 border-t border-gray-200"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <Button
              variant="primary"
              label={isSaving ? 'Saving...' : 'Save to My Products'}
              onPress={handleSaveProduct}
              disabled={isSaving || !canSave}
              loading={isSaving}
              className="w-full mb-3"
            />

            {!canSave && (
              <Text className="text-gray-500 text-xs text-center mt-2">
                {isTextMode
                  ? 'Please fill in all product details, enter ingredients, and analyze to save'
                  : 'Please fill in all product details to save'}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
