import type { NutritionInfo } from './types.ts';

// ---------- OPENFOODFACTS HELPERS ----------
export async function fetchOFFByBarcode(barcode: string) {
  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j?.product ?? null;
  } catch {
    return null;
  }
}

export async function fetchOFFByName(name: string, countryPref = 'en') {
  try {
    const params = new URLSearchParams({
      search_terms: name,
      search_simple: '1',
      action: 'process',
      json: '1',
      countries: countryPref,
      page_size: '5',
    });
    const r = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`);
    if (!r.ok) return null;
    const j = await r.json();
    const products = Array.isArray(j?.products) ? j.products : [];
    products.sort((a: any, b: any) => (b?.nutriments ? 1 : 0) - (a?.nutriments ? 1 : 0));
    return products.find((p: any) => p?.nutriments) ?? products[0] ?? null;
  } catch {
    return null;
  }
}

export function offToPer100(n: any): NutritionInfo {
  const get = (k100g: string, k100ml: string) => {
    const v = n?.[k100g] ?? n?.[k100ml];
    return typeof v === 'number' ? v : v ? parseFloat(v) : 0;
  };
  const kcal = get('energy-kcal_100g', 'energy-kcal_100ml');
  const kJ = get('energy_100g', 'energy_100ml');
  return {
    calories: kcal || (kJ ? kJ / 4.184 : 0),
    protein: get('proteins_100g', 'proteins_100ml'),
    carbs: get('carbohydrates_100g', 'carbohydrates_100ml'),
    sugar: get('sugars_100g', 'sugars_100ml'),
    fat: get('fat_100g', 'fat_100ml'),
    fiber: get('fiber_100g', 'fiber_100ml'),
    sodium_mg: (get('sodium_100g', 'sodium_100ml') || 0) * 1000,
  };
}

export function scalePerServing(
  per100: NutritionInfo,
  units: { mass_g?: number | null; volume_ml?: number | null }
) {
  const qty100 = units?.mass_g ? units.mass_g / 100 : units?.volume_ml ? units.volume_ml / 100 : 1;
  const s = (x?: number) => Math.round((x ?? 0) * qty100 * 10) / 10;
  const cal = Math.round((per100.calories ?? 0) * qty100);
  return {
    calories: cal,
    protein: s(per100.protein),
    carbs: s(per100.carbs),
    fat: s(per100.fat),
    fiber: s(per100.fiber),
    sugar: s(per100.sugar),
    sodium_mg: Math.round((per100.sodium_mg ?? 0) * qty100),
  };
}
