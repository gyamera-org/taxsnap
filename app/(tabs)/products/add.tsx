import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui';
import { SubPageLayout } from '@/components/layouts/sub-page';
import { PRODUCT_TYPE } from '@/constants/product-type';
import { SelectButton } from '@/components/ui/select-button';
import { Chip } from '@/components/ui/chip';
import { Plus } from 'lucide-react-native';

export default function AddProductScreen() {
  const [productType, setProductType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    size: '',
  });
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);

  const productTypeOptions = Object.entries(PRODUCT_TYPE).map(([key, value]) => ({
    label: value.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: value,
  }));

  const handleAddIngredient = () => {
    if (ingredient.trim()) {
      setIngredients([...ingredients, ingredient.trim()]);
      setIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <SubPageLayout title="Add Product">
      <ScrollView className="flex-1 px-6">
        <View className="flex gap-4">
          <View>
            <Text className="text-gray-600 text-lg mb-2">Product Type</Text>
            <SelectButton
              value={productType}
              onSelect={setProductType}
              options={productTypeOptions}
              placeholder="Select product type"
            />
          </View>

          <View>
            <Text className="text-gray-600 text-lg mb-2">Product Name</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              placeholder="Enter product name"
              className="border border-gray-200"
            />
          </View>

          <View>
            <Text className="text-gray-600 text-lg mb-2">Brand</Text>
            <TextInput
              value={formData.brand}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, brand: text }))}
              placeholder="Enter brand name"
              className="border border-gray-200"
            />
          </View>

          <View>
            <Text className="text-gray-600 text-lg mb-2">Size</Text>
            <TextInput
              value={formData.size}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, size: text }))}
              placeholder="e.g., 16 fl oz"
              className="border border-gray-200"
            />
          </View>

          <View>
            <Text className="text-gray-600 text-lg mb-2">Ingredients</Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <TextInput
                  value={ingredient}
                  onChangeText={setIngredient}
                  placeholder="Add ingredient"
                  onSubmitEditing={handleAddIngredient}
                  returnKeyType="done"
                  className="border border-gray-200"
                />
              </View>
              <Pressable
                onPress={handleAddIngredient}
                className="bg-black w-12 h-12 rounded-2xl items-center justify-center"
              >
                <Plus size={24} color="white" />
              </Pressable>
            </View>

            {ingredients.length > 0 && (
              <View className="flex-row flex-wrap mt-3">
                {ingredients.map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <Chip key={index} label={item} onRemove={() => handleRemoveIngredient(index)} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="px-6">
        <Button
          variant="primary"
          label="Add Product"
          onPress={() => {
            console.log({ ...formData, type: productType, ingredients });
            router.back();
          }}
          disabled={!formData.name || !formData.brand || !productType}
        />
      </View>
    </SubPageLayout>
  );
}
