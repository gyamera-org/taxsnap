import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { FoodAnalysis, UpsertOptions } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ---------- PERSISTENCE ----------
export async function upsertMealEntry(
  analysis: FoodAnalysis,
  { user_id, meal_type, logged_date_iso }: UpsertOptions,
  note?: string
) {
  const { data: existing, error: findErr } = await supabase
    .from('meal_entries')
    .select('*')
    .eq('user_id', user_id)
    .eq('meal_type', meal_type)
    .eq('logged_date', logged_date_iso)
    .limit(1);

  if (findErr) console.warn('find existing meal err', findErr);

  const totals = analysis.items.reduce(
    (t, i) => {
      t.calories += i.nutrition.calories;
      t.protein += i.nutrition.protein;
      t.carbs += i.nutrition.carbs;
      t.fat += i.nutrition.fat;
      t.fiber += i.nutrition.fiber ?? 0;
      t.sugar += i.nutrition.sugar ?? 0;
      return t;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );

  const foodItems = analysis.items.map((i) => ({
    food: {
      id: `scan_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: i.food_name,
      brand: i.brand || 'AI Detected',
      category: i.category,
      servingSize: i.serving_size,
      units: i.units ?? {},
      nutrition: i.nutrition,
      confidence: i.confidence,
      isPackaged: i.is_packaged,
      sourceLabel: i.sources?.label_text ?? null,
    },
    quantity: 1,
  }));

  const now = new Date();
  const payload = {
    user_id,
    meal_type,
    food_items: existing?.[0]?.food_items ? [...existing[0].food_items, ...foodItems] : foodItems,
    total_calories: (existing?.[0]?.total_calories ?? 0) + totals.calories,
    total_protein: (existing?.[0]?.total_protein ?? 0) + totals.protein,
    total_carbs: (existing?.[0]?.total_carbs ?? 0) + totals.carbs,
    total_fat: (existing?.[0]?.total_fat ?? 0) + totals.fat,
    total_fiber: (existing?.[0]?.total_fiber ?? 0) + totals.fiber,
    total_sugar: (existing?.[0]?.total_sugar ?? 0) + totals.sugar,
    logged_date: logged_date_iso,
    logged_time: now.toTimeString().split(' ')[0],
    notes: [existing?.[0]?.notes, note].filter(Boolean).join(' | '),
  };

  if (existing && existing.length) {
    const { data, error } = await supabase
      .from('meal_entries')
      .update(payload)
      .eq('id', existing[0].id)
      .select()
      .single();
    if (error) throw error;
    return data.id as string;
  } else {
    const { data, error } = await supabase.from('meal_entries').insert(payload).select().single();
    if (error) throw error;
    return data.id as string;
  }
}
