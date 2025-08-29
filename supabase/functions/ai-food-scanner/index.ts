// deno-lint-ignore-file no-explicit-any
import type { FoodAnalysis } from './types.ts';
import { jsonError, validateNutrition, overallConfidence, clamp } from './utils.ts';
import { analyzeImageWithOpenAI, analyzeImageWithGroqFallback } from './ai-analysis.ts';
import { enrichPackagedItems } from './enrichment.ts';
import { upsertMealEntry } from './database.ts';

// ---------- HTTP HANDLER ----------
Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonError('Method Not Allowed', 405);

  try {
    const {
      image_base64,
      context,
      barcode, // optional
      text_hint, // optional: "Fanta Zero" etc.
      meal_type,
      user_id,
      auto_save = false,
      logged_date, // optional YYYY-MM-DD; defaults to UTC today
    } = await req.json();

    if (!image_base64) return jsonError('Image data is required', 400);

    // UTC date if not provided (Supabase standard)
    let logged_date_iso: string;
    if (typeof logged_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(logged_date)) {
      logged_date_iso = logged_date;
    } else {
      // Use UTC timezone (Supabase default)
      const now = new Date();
      logged_date_iso = now.toISOString().slice(0, 10); // YYYY-MM-DD in UTC
    }

    let analysis: FoodAnalysis;
    try {
      analysis = await analyzeImageWithOpenAI(image_base64, context, barcode, text_hint);
    } catch (openaiError) {
      console.warn('OpenAI vision failed:', openaiError);
      try {
        analysis = await analyzeImageWithGroqFallback(image_base64);
      } catch {
        return jsonError(
          'Unable to analyze the image at the moment. Try a clearer photo or enter items manually.',
          502
        );
      }
    }

    // Enrich packaged items (front-of-pack only cases)
    await enrichPackagedItems(analysis.items, { barcode, text_hint });

    // Final clamps
    analysis.items = analysis.items.map((i) => ({
      ...i,
      nutrition: validateNutrition(i.nutrition, i.category),
      confidence: clamp(i.confidence, 10, 100),
    }));
    analysis.overall_confidence = overallConfidence(analysis.items);

    // Optional auto-save
    let meal_entry_id: string | null = null;
    if (auto_save && meal_type && user_id) {
      try {
        meal_entry_id = await upsertMealEntry(
          analysis,
          { user_id, meal_type, logged_date_iso },
          context
            ? `AI scan (${analysis.overall_confidence}%) • ${context}`
            : `AI scan (${analysis.overall_confidence}%)`
        );
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        meal_entry_id,
        auto_saved: Boolean(meal_entry_id),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    console.error('Scanner error:', err);
    return jsonError(msg, 500);
  }
});
