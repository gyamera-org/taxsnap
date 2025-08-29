import type { Numberish, FoodItemAnalysis, NutritionInfo } from './types.ts';

// ---------- UTIL FUNCTIONS ----------
export function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function clamp(n: Numberish, lo: number, hi: number, def = 0) {
  const v = typeof n === 'number' && isFinite(n) ? n : def;
  return Math.min(Math.max(v, lo), hi);
}

export function normalizeServingSize(raw: string | null | undefined): {
  serving: string;
  units: FoodItemAnalysis['units'];
} {
  if (!raw) return { serving: '1 serving', units: {} };
  const s = raw.trim();

  const gMatch = s.match(/(\d+(\.\d+)?)\s?g\b/i);
  const mlMatch = s.match(/(\d+(\.\d+)?)\s?ml\b/i);
  const can355 = /can|lata|33cl/i.test(s) && (/\b355\b/.test(s) || /\b330\b/.test(s));
  const countMatch = s.match(/(\d+)\s?(x|pcs?|pieces?|cookies?|bars?|eggs?|slices?)/i);

  const units: FoodItemAnalysis['units'] = {};
  if (gMatch) units.mass_g = parseFloat(gMatch[1]);
  if (mlMatch) units.volume_ml = parseFloat(mlMatch[1]);
  if (countMatch) units.count = parseInt(countMatch[1]);
  if (can355 && !units.volume_ml) units.volume_ml = 355;

  return { serving: s, units };
}

export function boundsFor(category: string) {
  const c = category.toLowerCase();
  if (c.includes('beverage') || c.includes('drink'))
    return { cal: 350, carbs: 75, sugar: 75, fat: 10, protein: 25, fiber: 15, sodium: 1500 };
  if (c.includes('fruit'))
    return { cal: 250, carbs: 65, sugar: 55, fat: 5, protein: 6, fiber: 15, sodium: 300 };
  if (c.includes('snack') || c.includes('dessert'))
    return { cal: 800, carbs: 120, sugar: 80, fat: 60, protein: 25, fiber: 20, sodium: 1800 };
  if (c.includes('vegetable'))
    return { cal: 200, carbs: 40, sugar: 20, fat: 15, protein: 15, fiber: 20, sodium: 1200 };
  if (c.includes('dairy'))
    return { cal: 600, carbs: 60, sugar: 55, fat: 40, protein: 40, fiber: 5, sodium: 1800 };
  if (c.includes('protein'))
    return { cal: 900, carbs: 50, sugar: 20, fat: 60, protein: 100, fiber: 10, sodium: 2200 };
  if (c.includes('grain'))
    return { cal: 900, carbs: 160, sugar: 35, fat: 30, protein: 40, fiber: 30, sodium: 2200 };
  return { cal: 1000, carbs: 160, sugar: 120, fat: 80, protein: 100, fiber: 30, sodium: 3000 };
}

export function validateNutrition(
  nutrition: Partial<NutritionInfo>,
  category: string
): NutritionInfo {
  const b = boundsFor(category);
  const n: NutritionInfo = {
    calories: clamp(Math.round(nutrition.calories ?? 0), 0, b.cal),
    protein: clamp(Math.round((nutrition.protein ?? 0) * 10) / 10, 0, b.protein),
    carbs: clamp(Math.round((nutrition.carbs ?? 0) * 10) / 10, 0, b.carbs),
    fat: clamp(Math.round((nutrition.fat ?? 0) * 10) / 10, 0, b.fat),
    fiber: clamp(Math.round((nutrition.fiber ?? 0) * 10) / 10, 0, b.fiber),
    sugar: clamp(Math.round((nutrition.sugar ?? 0) * 10) / 10, 0, b.sugar),
    sodium_mg: clamp(Math.round(nutrition.sodium_mg ?? 0), 0, b.sodium),
  };

  const derived = Math.round(n.carbs * 4 + n.protein * 4 + n.fat * 9);
  if (n.calories === 0 && (n.carbs > 0 || n.protein > 0 || n.fat > 0))
    n.calories = clamp(derived, 0, b.cal);

  if (n.calories > 0) {
    const delta = Math.abs(n.calories - derived);
    if (derived > 0 && delta / n.calories > 0.25) n.calories = clamp(derived, 0, b.cal);
  }
  return n;
}

export function overallConfidence(items: FoodItemAnalysis[]) {
  if (!items.length) return 0;
  const avg = items.reduce((a, x) => a + x.confidence, 0) / items.length;
  const penalty = Math.max(0, items.length - 2) * 3;
  return clamp(Math.round(avg - penalty), 10, 100);
}

export function extractJSON(text: string): any {
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : (text.match(/\{[\s\S]*\}[\s\S]*$/)?.[0] ?? text);
  return JSON.parse(body);
}
