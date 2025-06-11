import { View, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui';
import SubPageLayout from '@/components/layouts/sub-page';
import { Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCreateCustomProduct } from '@/lib/hooks/use-api';
import type { CreateCustomProductData } from '@/lib/api/types';

interface IngredientForm {
  name: string;
  purpose: string;
  effect: string;
}

export default function AddCustomProductScreen() {
  const router = useRouter();
  const createProductMutation = useCreateCustomProduct();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseProductId: '', // Optional - for future enhancement
  });

  const [currentIngredient, setCurrentIngredient] = useState<IngredientForm>({
    name: '',
    purpose: '',
    effect: '',
  });

  const [ingredients, setIngredients] = useState<IngredientForm[]>([]);

  const handleAddIngredient = () => {
    if (
      currentIngredient.name.trim() &&
      currentIngredient.purpose.trim() &&
      currentIngredient.effect.trim()
    ) {
      setIngredients([...ingredients, { ...currentIngredient }]);
      setCurrentIngredient({ name: '', purpose: '', effect: '' });
    } else {
      Alert.alert(
        'Missing Information',
        'Please fill in all ingredient fields (name, purpose, and effect)'
      );
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter a product name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Missing Ingredients', 'Please add at least one ingredient');
      return;
    }

    const productData: CreateCustomProductData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      ingredients: ingredients,
    };

    createProductMutation.mutate(productData, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  const isFormValid = formData.name.trim() && ingredients.length > 0;
  const isIngredientValid =
    currentIngredient.name.trim() &&
    currentIngredient.purpose.trim() &&
    currentIngredient.effect.trim();

  return (
    <SubPageLayout title="Add Custom Product" onBack={handleGoBack}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View className="flex gap-6 px-6 pb-6">
            {/* Product Name */}
            <View>
              <Text className="text-gray-700 text-lg font-medium mb-2">Product Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="Enter custom product name"
                className="border border-gray-200 rounded-xl"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            {/* Description */}
            <View>
              <Text className="text-gray-700 text-lg font-medium mb-2">Description</Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                placeholder="Describe your custom product (optional)"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="border border-gray-200 rounded-xl"
                returnKeyType="done"
                blurOnSubmit={true}
                scrollEnabled={true}
              />
            </View>

            <View>
              <Text className="text-gray-700 text-lg font-medium mb-4">Add Ingredients *</Text>

              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="mb-3">
                  <Text className="text-gray-600 text-sm font-medium mb-2">Ingredient Name</Text>
                  <TextInput
                    value={currentIngredient.name}
                    onChangeText={(text) =>
                      setCurrentIngredient((prev) => ({ ...prev, name: text }))
                    }
                    placeholder="e.g., Shea Butter"
                    className="border border-gray-200 rounded-lg bg-white"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View className="mb-3">
                  <Text className="text-gray-600 text-sm font-medium mb-2">Purpose</Text>
                  <TextInput
                    value={currentIngredient.purpose}
                    onChangeText={(text) =>
                      setCurrentIngredient((prev) => ({ ...prev, purpose: text }))
                    }
                    placeholder="e.g., Moisturizer, Cleansing Agent"
                    className="border border-gray-200 rounded-lg bg-white"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-600 text-sm font-medium mb-2">Effect</Text>
                  <TextInput
                    value={currentIngredient.effect}
                    onChangeText={(text) =>
                      setCurrentIngredient((prev) => ({ ...prev, effect: text }))
                    }
                    placeholder="e.g., Hydrates and softens hair"
                    className="border border-gray-200 rounded-lg bg-white"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>

                <Button
                  variant="secondary"
                  label="Add Ingredient"
                  onPress={handleAddIngredient}
                  disabled={!isIngredientValid}
                />
              </View>
            </View>

            {/* Added Ingredients List */}
            {ingredients.length > 0 && (
              <View>
                <Text className="text-gray-700 text-lg font-medium mb-3">
                  Added Ingredients ({ingredients.length})
                </Text>
                <View className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <View key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="font-semibold text-lg flex-1">{ingredient.name}</Text>
                        <Pressable
                          onPress={() => handleRemoveIngredient(index)}
                          className="p-2 -mr-2 -mt-2"
                          hitSlop={8}
                        >
                          <Trash2 size={20} color="#ef4444" />
                        </Pressable>
                      </View>
                      <Text className="text-gray-600 text-sm mb-1">
                        <Text className="font-medium">Purpose:</Text> {ingredient.purpose}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        <Text className="font-medium">Effect:</Text> {ingredient.effect}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View className="px-6 py-4 bg-white border-t border-gray-100">
          <Button
            variant="primary"
            label={createProductMutation.isPending ? 'Creating...' : 'Create Custom Product'}
            onPress={handleSubmit}
            disabled={!isFormValid || createProductMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </SubPageLayout>
  );
}
