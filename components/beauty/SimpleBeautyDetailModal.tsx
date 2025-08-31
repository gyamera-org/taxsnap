import React from 'react';
import { View, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';

interface SimpleIngredient {
  name: string;
  effect: 'good' | 'caution' | 'avoid';
  description: string;
}

interface SimpleBeautyProduct {
  id: string;
  name: string;
  image_url: any; // Can be require() or URI
  cycle_compatibility: 'good' | 'caution' | 'avoid';
  key_ingredients: SimpleIngredient[];
  cycle_tip?: string;
}

interface SimpleBeautyDetailModalProps {
  product: SimpleBeautyProduct | null;
  visible: boolean;
  onClose: () => void;
}

export function SimpleBeautyDetailModal({
  product,
  visible,
  onClose,
}: SimpleBeautyDetailModalProps) {
  if (!product) return null;

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'good':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'caution':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'avoid':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getIngredientIcon = (effect: string) => {
    switch (effect) {
      case 'good':
        return <CheckCircle size={16} color="#10B981" />;
      case 'caution':
        return <AlertTriangle size={16} color="#F59E0B" />;
      case 'avoid':
        return <XCircle size={16} color="#EF4444" />;
      default:
        return <CheckCircle size={16} color="#6B7280" />;
    }
  };

  const compatibility = getCompatibilityColor(product.cycle_compatibility);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="h-4/5 bg-white rounded-t-3xl">
          <SafeAreaView className="flex-1" edges={['bottom']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-black flex-1" numberOfLines={1}>
                {product.name}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full ml-4"
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Product Image */}
              <View className="px-6 py-4">
                <Image
                  source={product.image_url}
                  className="w-full h-48 rounded-2xl"
                  resizeMode="cover"
                />
              </View>

              {/* Cycle Compatibility */}
              <View className="px-6 mb-6">
                <View
                  className={`${compatibility.bg} ${compatibility.border} border rounded-2xl p-4`}
                >
                  <Text className={`${compatibility.text} font-semibold text-lg mb-2`}>
                    {product.cycle_compatibility === 'good' && '✅ Good for your cycle'}
                    {product.cycle_compatibility === 'caution' && '⚠️ Use with caution'}
                    {product.cycle_compatibility === 'avoid' && '❌ May disrupt your cycle'}
                  </Text>
                  {product.cycle_tip && (
                    <Text className={`${compatibility.text} text-sm`}>{product.cycle_tip}</Text>
                  )}
                </View>
              </View>

              {/* Key Ingredients */}
              <View className="px-6 mb-6">
                <Text className="text-xl font-bold text-black mb-4">Key Ingredients</Text>
                <View className="gap-3">
                  {product.key_ingredients.map((ingredient, index) => (
                    <View key={index} className="bg-gray-50 rounded-2xl p-4">
                      <View className="flex-row items-center mb-2">
                        {getIngredientIcon(ingredient.effect)}
                        <Text className="font-semibold text-black ml-2 flex-1">
                          {ingredient.name}
                        </Text>
                        <View
                          className={`px-2 py-1 rounded-full ${
                            ingredient.effect === 'good'
                              ? 'bg-green-100'
                              : ingredient.effect === 'caution'
                                ? 'bg-yellow-100'
                                : 'bg-red-100'
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              ingredient.effect === 'good'
                                ? 'text-green-700'
                                : ingredient.effect === 'caution'
                                  ? 'text-yellow-700'
                                  : 'text-red-700'
                            }`}
                          >
                            {ingredient.effect === 'good'
                              ? 'Good'
                              : ingredient.effect === 'caution'
                                ? 'Caution'
                                : 'Avoid'}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-600 text-sm">{ingredient.description}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Bottom spacing */}
              <View className="h-8" />
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
