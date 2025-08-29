// ---------- TYPES ----------
export type Numberish = number | null | undefined;

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium_mg?: number;
}

export interface FoodItemAnalysis {
  food_name: string;
  brand?: string | null;
  category: string; // fruit | vegetable | protein | grain | dairy | snack | beverage | dessert | mixed
  serving_size: string;
  units?: { mass_g?: number; volume_ml?: number; count?: number };
  nutrition: NutritionInfo;
  confidence: number; // 0-100
  is_packaged: boolean;
  notes?: string;
  sources?: { label_text?: string | null };
}

export interface FoodAnalysis {
  items: FoodItemAnalysis[];
  overall_confidence: number;
  description: string;
}

export interface UpsertOptions {
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | string;
  logged_date_iso: string; // YYYY-MM-DD
}
