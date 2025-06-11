import { View, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Trash2, Edit, Package, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { Button, ConfirmationModal } from '@/components/ui';
import SubPageLayout from '@/components/layouts/sub-page';
import { useCustomProduct, useDeleteCustomProduct } from '@/lib/hooks/use-api';
import { ProductItemSkeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/empty-state';
import { Accordion } from '@/components/ui/accordion';
import { useState } from 'react';
import type { CreateCustomProductData, CustomProduct } from '@/lib/api/types';

interface IngredientForm {
  name: string;
  purpose: string;
  effect: string;
}

export default function CustomProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();

  // Ensure id is a string and handle array case
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // Early return if no id parameter
  if (!id) {
    return (
      <SubPageLayout title="Product Not Found">
        <EmptyState
          icon={Package}
          title="Invalid Product ID"
          description="The product URL is invalid or malformed."
          action={{
            label: 'Go Back',
            onPress: () => router.back(),
            icon: Package,
          }}
        />
      </SubPageLayout>
    );
  }

  const { data: product, isLoading, error } = useCustomProduct(id);
  const deleteProductMutation = useDeleteCustomProduct();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
  });
  const [editIngredients, setEditIngredients] = useState<IngredientForm[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<IngredientForm>({
    name: '',
    purpose: '',
    effect: '',
  });

  // Initialize edit form when product loads or modal opens
  const initializeEditForm = (product: CustomProduct) => {
    setEditFormData({
      name: product.name,
      description: product.description || '',
    });
    setEditIngredients(product.ingredients || []);
    setCurrentIngredient({ name: '', purpose: '', effect: '' });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteProductMutation.mutate(id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.back();
      },
      onError: () => {
        setShowDeleteModal(false);
      },
    });
  };

  const handleEdit = () => {
    if (product) {
      initializeEditForm(product);
      setShowEditModal(true);
    }
  };

  const handleAddIngredient = () => {
    if (
      currentIngredient.name.trim() &&
      currentIngredient.purpose.trim() &&
      currentIngredient.effect.trim()
    ) {
      setEditIngredients([...editIngredients, { ...currentIngredient }]);
      setCurrentIngredient({ name: '', purpose: '', effect: '' });
    } else {
      Alert.alert(
        'Missing Information',
        'Please fill in all ingredient fields (name, purpose, and effect)'
      );
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setEditIngredients(editIngredients.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editFormData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter a product name');
      return;
    }

    if (editIngredients.length === 0) {
      Alert.alert('Missing Ingredients', 'Please add at least one ingredient');
      return;
    }

    // Since there's no update endpoint, we'll delete and recreate
    // This is a workaround - ideally you'd have a PATCH/PUT endpoint
    try {
      const updateData: CreateCustomProductData = {
        name: editFormData.name.trim(),
        description: editFormData.description.trim() || undefined,
        ingredients: editIngredients,
      };

      // For now, just close the modal and show a message
      // You would implement the actual update logic here
      setShowEditModal(false);
      Alert.alert(
        'Note',
        'Product editing will be available in a future update. For now, please create a new product with your changes.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  if (isLoading) {
    return (
      <SubPageLayout title="Custom Product">
        <ProductItemSkeleton />
      </SubPageLayout>
    );
  }

  if (error || !product) {
    return (
      <SubPageLayout title="Custom Product">
        <EmptyState
          icon={Package}
          title="Product not found"
          description="This custom product could not be found or has been deleted."
          action={{
            label: 'Go Back',
            onPress: () => router.back(),
            icon: Package,
          }}
        />
      </SubPageLayout>
    );
  }

  const isIngredientValid =
    currentIngredient.name.trim() &&
    currentIngredient.purpose.trim() &&
    currentIngredient.effect.trim();

  return (
    <>
      <SubPageLayout
        title="Product Details"
        rightElement={
          <View className="flex-row items-center">
            <Pressable onPress={handleEdit} className="mr-2 p-2 rounded-full bg-gray-100">
              <Edit size={18} color="#6B7280" />
            </Pressable>
            <Pressable onPress={handleDelete} className="p-2 rounded-full bg-red-100">
              <Trash2 size={18} color="#EF4444" />
            </Pressable>
          </View>
        }
      >
        <ScrollView className="flex-1">
          <View className="px-6">
            <Text className="text-2xl font-semibold mb-2">{product.name}</Text>
            <Text className="text-lg text-gray-600 mb-6">Custom Product</Text>

            {/* Product Type Info */}
            <View className="mb-6">
              <Text className="text-lg font-medium mb-4">Product Type</Text>
              <View className="flex-row gap-4">
                <View className="p-4 rounded-xl flex-1 items-center bg-purple-100">
                  <Text className="text-sm mb-1 text-purple-700">Type</Text>
                  <Text className="text-base font-medium text-purple-800">Custom</Text>
                </View>
                <View className="p-4 rounded-xl flex-1 items-center bg-blue-100">
                  <Text className="text-sm mb-1 text-blue-700">Ingredients</Text>
                  <Text className="text-base font-medium text-blue-800">
                    {product.ingredients?.length || 0}
                  </Text>
                </View>
                <View className="p-4 rounded-xl flex-1 items-center bg-green-100">
                  <Text className="text-sm mb-1 text-green-700">Personalized</Text>
                  <Text className="text-base font-medium text-green-800">Yes</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {product.description && (
              <View className="mb-6">
                <Text className="text-xl mb-4 font-semibold">Description</Text>
                <View className="bg-slate-100 p-4 rounded-2xl">
                  <Text className="text-gray-800 leading-6">{product.description}</Text>
                </View>
              </View>
            )}

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <View className="mb-6">
                <Text className="text-xl mb-4 font-semibold">Ingredients</Text>
                <View className="bg-slate-100 rounded-2xl overflow-hidden">
                  {product.ingredients.map((ingredient, index) => (
                    <View key={index} className="border-b border-gray-200 last:border-b-0">
                      <Accordion title={ingredient.name}>
                        <View className="flex flex-col gap-2">
                          <View>
                            <Text className="text-sm font-medium text-gray-700">Purpose:</Text>
                            <Text className="text-sm text-gray-600">{ingredient.purpose}</Text>
                          </View>
                          <View>
                            <Text className="text-sm font-medium text-gray-700">Effect:</Text>
                            <Text className="text-sm text-gray-600">{ingredient.effect}</Text>
                          </View>
                        </View>
                      </Accordion>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Base Product Info */}
            {product.baseProductId && (
              <View className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-200">
                <Text className="text-lg font-medium mb-2 text-blue-800">Based On Product</Text>
                <Text className="text-blue-700">
                  This custom product is based on an existing product in our database.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SubPageLayout>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Custom Product"
        message="Are you sure you want to delete this custom product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
        destructive={true}
      />

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Edit Custom Product</Text>
            <Pressable onPress={() => setShowEditModal(false)}>
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Modal Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="flex gap-6 px-6 py-6">
              {/* Product Name */}
              <View>
                <Text className="text-gray-700 text-lg font-medium mb-2">Product Name *</Text>
                <TextInput
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData((prev) => ({ ...prev, name: text }))}
                  placeholder="Enter custom product name"
                />
              </View>

              {/* Description */}
              <View>
                <Text className="text-gray-700 text-lg font-medium mb-2">Description</Text>
                <TextInput
                  value={editFormData.description}
                  onChangeText={(text) =>
                    setEditFormData((prev) => ({ ...prev, description: text }))
                  }
                  placeholder="Describe your custom product (optional)"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Add Ingredient Section */}
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

              {/* Current Ingredients */}
              {editIngredients.length > 0 && (
                <View>
                  <Text className="text-gray-700 text-lg font-medium mb-3">
                    Current Ingredients ({editIngredients.length})
                  </Text>
                  <View className="flex flex-col gap-2">
                    {editIngredients.map((ingredient, index) => (
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

          {/* Modal Footer */}
          <View className="p-4 border-t border-gray-200 flex-row gap-3">
            <Button
              variant="secondary"
              label="Cancel"
              onPress={() => setShowEditModal(false)}
              className="flex-1"
            />
            <Button
              variant="primary"
              label="Save Changes"
              onPress={handleSaveEdit}
              disabled={!editFormData.name.trim() || editIngredients.length === 0}
              className="flex-1"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
