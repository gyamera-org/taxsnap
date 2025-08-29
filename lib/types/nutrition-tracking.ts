// Types for nutrition tracking (meals and water)

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  servingSize: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
}

export interface FoodItemWithQuantity {
  food: FoodItem;
  quantity: number;
}

export interface MealEntry {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: FoodItemWithQuantity[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sugar: number;
  notes?: string;
  logged_date: string; // YYYY-MM-DD format
  logged_time: string; // HH:mm:ss format
  created_at: string;
  updated_at: string;
}

export interface WaterEntry {
  id: string;
  user_id: string;
  amount_ml: number;
  drink_type: string;
  notes?: string;
  logged_date: string; // YYYY-MM-DD format
  logged_time: string; // HH:mm:ss format
  created_at: string;
  updated_at: string;
}

export interface CreateMealEntryData {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: FoodItemWithQuantity[];
  notes?: string;
  logged_date?: string;
  logged_time?: string;
  share_with_community?: boolean;
}

export interface CreateWaterEntryData {
  amount_ml: number;
  drink_type?: string;
  notes?: string;
  logged_date?: string;
  logged_time?: string;
}

export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sugar: number;
  total_water_ml: number;
  meal_count: number;
  water_entries_count: number;
  meals_by_type: {
    breakfast: MealEntry[];
    lunch: MealEntry[];
    dinner: MealEntry[];
    snack: MealEntry[];
  };
  water_entries: WaterEntry[];
}

export interface NutritionProgress {
  calories: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  protein: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  carbs: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  fat: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  water: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
}
