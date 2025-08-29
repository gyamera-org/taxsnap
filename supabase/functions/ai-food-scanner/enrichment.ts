import type { FoodItemAnalysis, NutritionInfo } from './types.ts';
import {
  fetchOFFByBarcode,
  fetchOFFByName,
  offToPer100,
  scalePerServing,
} from './openfoodfacts.ts';
import { validateNutrition } from './utils.ts';

// ---------- ENRICH PACKAGED ITEMS (OFF + HEURISTIC) ----------
export async function enrichPackagedItems(
  items: FoodItemAnalysis[],
  { barcode, text_hint }: { barcode?: string; text_hint?: string }
) {
  for (const it of items) {
    if (!it.is_packaged) continue;

    const looksEmpty =
      (it.nutrition.calories ?? 0) === 0 &&
      (it.nutrition.carbs ?? 0) === 0 &&
      (it.nutrition.fat ?? 0) === 0 &&
      (it.nutrition.protein ?? 0) === 0 &&
      (it.nutrition.sugar ?? 0) === 0;

    if (!looksEmpty && it.confidence >= 60) continue;

    let off: any = null;
    if (barcode) off = await fetchOFFByBarcode(barcode);
    if (!off) {
      const nameForSearch = [text_hint, it.food_name, it.brand].filter(Boolean).join(' ').trim();
      if (nameForSearch) off = await fetchOFFByName(nameForSearch, 'en');
    }

    if (off?.nutriments) {
      if (!it.units?.volume_ml && /beverage|drink|soda|soft/i.test(it.category)) {
        const label = (it.sources?.label_text ?? '').toLowerCase();
        const hinted = /500|0\.5l|500ml/.test(label)
          ? 500
          : /330|33cl|lata|can/.test(label)
            ? 330
            : undefined;
        it.units = { ...it.units, volume_ml: it.units?.volume_ml ?? hinted ?? 330 };
        it.serving_size = it.serving_size || `${it.units.volume_ml} ml`;
      }

      const per100 = offToPer100(off.nutriments);
      const scaled = scalePerServing(per100, it.units ?? {});
      it.nutrition = validateNutrition({ ...it.nutrition, ...scaled }, it.category);

      it.sources = {
        label_text:
          it.sources?.label_text ?? `OpenFoodFacts: ${off.brands || ''} ${off.product_name || ''}`,
      };
      it.brand = it.brand ?? off.brands ?? null;
      it.food_name = it.food_name || off.product_name || 'Packaged product';
      it.confidence = Math.max(it.confidence, 80);
      if (
        !/beverage/.test(it.category.toLowerCase()) &&
        /beverage|drink|soda|soft/i.test(off?.categories || '')
      ) {
        it.category = 'beverage';
      }
    } else {
      // Fallback heuristics for common items
      await applyHeuristics(it);
    }
  }
}

async function applyHeuristics(item: FoodItemAnalysis) {
  const name = `${item.brand ?? ''} ${item.food_name ?? ''}`.toLowerCase();

  // Zero/diet soda heuristic
  const isZeroSoda =
    /zero|diet|sin azúcar|sugar free|light/i.test(name) &&
    /(fanta|coca|sprite|pepsi|cola|coke)/i.test(name);

  if (isZeroSoda) {
    if (!item.units?.volume_ml) item.units = { ...item.units, volume_ml: 330 };
    item.serving_size = item.serving_size || `${item.units.volume_ml} ml`;

    const per100: NutritionInfo = {
      calories: 1,
      protein: 0,
      carbs: 0.1,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium_mg: 10,
    };
    const scaled = scalePerServing(per100, item.units);
    item.nutrition = validateNutrition(scaled, 'beverage');
    item.confidence = Math.max(60, item.confidence);
    item.notes = [item.notes, 'Estimated via zero-soda heuristic'].filter(Boolean).join(' | ');
    item.sources = { label_text: item.sources?.label_text ?? 'Heuristic: zero/diet soda profile' };
    item.category = item.category || 'beverage';
    return;
  }

  // Regular soda heuristic
  const isRegularSoda =
    /(fanta|coca|sprite|pepsi|cola|coke)/i.test(name) && !/zero|diet|light/i.test(name);

  if (isRegularSoda) {
    if (!item.units?.volume_ml) item.units = { ...item.units, volume_ml: 330 };
    item.serving_size = item.serving_size || `${item.units.volume_ml} ml`;

    const per100: NutritionInfo = {
      calories: 42,
      protein: 0,
      carbs: 10.6,
      fat: 0,
      fiber: 0,
      sugar: 10.6,
      sodium_mg: 2,
    };
    const scaled = scalePerServing(per100, item.units);
    item.nutrition = validateNutrition(scaled, 'beverage');
    item.confidence = Math.max(70, item.confidence);
    item.notes = [item.notes, 'Estimated via regular soda heuristic'].filter(Boolean).join(' | ');
    item.sources = { label_text: item.sources?.label_text ?? 'Heuristic: regular soda profile' };
    item.category = item.category || 'beverage';
  }
}
