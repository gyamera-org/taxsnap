import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui';
import { ProductSelector } from '@/components/product-selector';
import { Product } from '@/lib/api/types';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '@/store/routine-store';
import { useAuth } from '@/hooks/use-auth';
import { useHairProfile } from '@/hooks/use-hair-profile';
import { useProducts } from '@/hooks/use-products';

interface HairCondition {
  moisture: number;
  strength: number;
  shine: number;
  manageability: number;
}

interface FormData {
  hairLength: string;
  style: string;
  notes: string;
  photos: string[];
  products: Product[];
  rating: number;
  hairCondition: HairCondition;
}

export default function LogRoutineScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { hairProfile } = useHairProfile();
  const { products } = useProducts();
  const { logRoutine } = useRoutineStore();
  const [formData, setFormData] = useState<FormData>({
    hairLength: '',
    style: '',
    notes: '',
    photos: [],
    products: [],
    rating: 0,
    hairCondition: {
      moisture: 0,
      strength: 0,
      shine: 0,
      manageability: 0,
    },
  });

  const handleProductSelect = (product: Product) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.some((p) => p.id === product.id)
        ? prev.products.filter((p) => p.id !== product.id)
        : [...prev.products, product],
    }));
  };

  const handleLogUpdate = async () => {
    if (!user || !hairProfile) return;

    try {
      await logRoutine({
        userId: user.id,
        hairProfileId: hairProfile.id,
        hairLength: formData.hairLength,
        style: formData.style,
        notes: formData.notes,
        photos: formData.photos,
        products: formData.products.map((p) => p.id),
        rating: formData.rating,
        hairCondition: formData.hairCondition,
      });

      router.back();
    } catch (error) {
      console.error('Error logging routine:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hair Length</Text>
        <TextInput
          value={formData.hairLength}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, hairLength: text }))}
          placeholder="Enter current hair length"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style</Text>
        <TextInput
          value={formData.style}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, style: text }))}
          placeholder="Describe your current style"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products Used</Text>
        <ProductSelector
          products={products}
          selectedProducts={formData.products}
          onSelectProduct={handleProductSelect}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          value={formData.notes}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
          placeholder="Add any notes about your routine"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating</Text>
        <TextInput
          value={formData.rating.toString()}
          onChangeText={(text) => {
            const rating = parseInt(text) || 0;
            setFormData((prev) => ({ ...prev, rating: Math.min(Math.max(rating, 0), 5) }));
          }}
          placeholder="Rate your routine (0-5)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hair Condition</Text>
        {Object.entries(formData.hairCondition).map(([key, value]) => (
          <View key={key} style={styles.conditionRow}>
            <Text style={styles.conditionLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <TextInput
              value={value.toString()}
              onChangeText={(text) => {
                const newValue = parseInt(text) || 0;
                setFormData((prev) => ({
                  ...prev,
                  hairCondition: {
                    ...prev.hairCondition,
                    [key]: Math.min(Math.max(newValue, 0), 10),
                  },
                }));
              }}
              placeholder="0-10"
              keyboardType="numeric"
              style={styles.conditionInput}
            />
          </View>
        ))}
      </View>

      <Button label="Log Routine" onPress={handleLogUpdate} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionLabel: {
    flex: 1,
    fontSize: 16,
  },
  conditionInput: {
    flex: 1,
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
