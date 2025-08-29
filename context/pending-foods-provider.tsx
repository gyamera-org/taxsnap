import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItemWithQuantity } from '@/lib/types/nutrition-tracking';

interface PendingFoodItem extends FoodItemWithQuantity {
  id: string;
  scannedAt: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  confidence: number;
  isAnalyzing?: boolean;
  hasFailed?: boolean;
  imageBase64?: string; // Store for retry
}

interface PendingFoodsContextType {
  pendingFoods: PendingFoodItem[];
  addPendingFood: (food: Omit<PendingFoodItem, 'id' | 'scannedAt'>) => void;
  addAnalyzingFood: (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    imageBase64?: string
  ) => string;
  removePendingFood: (id: string) => void;
  updatePendingFood: (id: string, updates: Partial<PendingFoodItem>) => void;
  markFoodAsFailed: (id: string) => void;
  clearAllPendingFoods: () => void;
  movePendingFoodToMeals: (id: string) => Promise<void>;
}

const PendingFoodsContext = createContext<PendingFoodsContextType | undefined>(undefined);

const PENDING_FOODS_KEY = 'pendingFoods';

export function PendingFoodsProvider({ children }: { children: React.ReactNode }) {
  const [pendingFoods, setPendingFoods] = useState<PendingFoodItem[]>([]);

  // Load pending foods from storage on mount
  useEffect(() => {
    loadPendingFoods();
  }, []);

  // Save to storage whenever pendingFoods changes
  useEffect(() => {
    savePendingFoods();
  }, [pendingFoods]);

  const loadPendingFoods = async () => {
    try {
      const stored = await AsyncStorage.getItem(PENDING_FOODS_KEY);
      if (stored) {
        setPendingFoods(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending foods:', error);
    }
  };

  const savePendingFoods = async () => {
    try {
      await AsyncStorage.setItem(PENDING_FOODS_KEY, JSON.stringify(pendingFoods));
    } catch (error) {
      console.error('Error saving pending foods:', error);
    }
  };

  const addPendingFood = (food: Omit<PendingFoodItem, 'id' | 'scannedAt'>) => {
    const newFood: PendingFoodItem = {
      ...food,
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scannedAt: new Date().toISOString(),
    };
    setPendingFoods((prev) => [...prev, newFood]);
  };

  const addAnalyzingFood = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    imageBase64?: string
  ): string => {
    const analyzingFood: PendingFoodItem = {
      id: `analyzing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scannedAt: new Date().toISOString(),
      mealType,
      confidence: 0,
      isAnalyzing: true,
      food: {
        id: 'analyzing',
        name: 'Analyzing food...',
        brand: 'AI Processing',
        category: 'analyzing',
        servingSize: '1 serving',
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
        },
      },
      quantity: 1,
    };
    setPendingFoods((prev) => [...prev, analyzingFood]);
    return analyzingFood.id;
  };

  const removePendingFood = (id: string) => {
    console.log('🗑️ PendingFoodsProvider: Removing food with ID:', id);
    setPendingFoods((prev) => {
      const filtered = prev.filter((food) => food.id !== id);
      console.log('🗑️ PendingFoodsProvider: Foods before removal:', prev.length);
      console.log('🗑️ PendingFoodsProvider: Foods after removal:', filtered.length);
      return filtered;
    });
  };

  const updatePendingFood = (id: string, updates: Partial<PendingFoodItem>) => {
    setPendingFoods((prev) => {
      const updated = prev.map((food) => {
        if (food.id === id) {
          return { ...food, ...updates };
        }
        return food;
      });
      return updated;
    });
  };

  const clearAllPendingFoods = () => {
    setPendingFoods([]);
  };

  const markFoodAsFailed = (id: string) => {
    updatePendingFood(id, { isAnalyzing: false, hasFailed: true });
  };

  const movePendingFoodToMeals = async (id: string) => {
    // This would integrate with the meal tracking system
    // For now, just remove from pending
    removePendingFood(id);
  };

  return (
    <PendingFoodsContext.Provider
      value={{
        pendingFoods,
        addPendingFood,
        addAnalyzingFood,
        removePendingFood,
        updatePendingFood,
        markFoodAsFailed,
        clearAllPendingFoods,
        movePendingFoodToMeals,
      }}
    >
      {children}
    </PendingFoodsContext.Provider>
  );
}

export function usePendingFoods() {
  const context = useContext(PendingFoodsContext);
  if (context === undefined) {
    throw new Error('usePendingFoods must be used within a PendingFoodsProvider');
  }
  return context;
}
