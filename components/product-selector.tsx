import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '@/lib/api/types';

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProducts,
  onSelectProduct,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Products</Text>
      <View style={styles.productList}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.productItem,
              selectedProducts.some((p) => p.id === product.id) && styles.selectedProduct,
            ]}
            onPress={() => onSelectProduct(product)}
          >
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productBrand}>{product.brand}</Text>
            <Text style={styles.productType}>{product.type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productList: {
    gap: 8,
  },
  productItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  selectedProduct: {
    backgroundColor: '#e6f3ff',
    borderColor: '#007AFF',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
  },
  productType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
});
