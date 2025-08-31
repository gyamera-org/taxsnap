import OpenAI from 'npm:openai';
import type { FoodAnalysis, FoodItemAnalysis } from './types.ts';
import {
  normalizeServingSize,
  validateNutrition,
  overallConfidence,
  clamp,
  extractJSON,
} from './utils.ts';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') ?? '' });

// ---------- OPENAI ANALYSIS ----------
export async function analyzeImageWithOpenAI(
  imageBase64: string,
  context?: string,
  barcode?: string,
  text_hint?: string
): Promise<FoodAnalysis> {
  // Handle both full data URLs and raw base64 strings
  console.log('🔍 Received image format:', imageBase64.substring(0, 100) + '...');

  let imageUrl: string;
  if (imageBase64.startsWith('data:image/')) {
    // Already a complete data URL
    console.log('✅ Using complete data URL');
    imageUrl = imageBase64;
  } else {
    // Raw base64 - default to JPEG (most common from mobile cameras)
    console.log('⚠️ Converting raw base64 to JPEG data URL');
    imageUrl = `data:image/jpeg;base64,${imageBase64}`;
  }
  const prompt = `
You are a nutrition vision expert. Analyze the image and detect 1–5 distinct food/beverage items.

If only the FRONT OF PACKAGE is visible (no nutrition panel), still:
- OCR brand/product and flavor (e.g., "Fanta Zero Orange").
- Set is_packaged=true.
- Estimate category (likely "beverage") and a realistic serving_size (e.g., 330 ml can, 500 ml bottle).
- Keep nutrition empty/zero if unsure. We'll try to enrich later.

Output JSON only in this schema:

{
  "items": [
    {
      "food_name": "string",
      "brand": "string|null",
      "category": "string",
      "serving_size": "string",
      "units": { "mass_g": number|null, "volume_ml": number|null, "count": number|null },
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium_mg": number
      },
      "confidence": number,
      "is_packaged": boolean,
      "notes": "string",
      "sources": { "label_text": "string|null" }
    }
  ],
  "overall_confidence": number,
  "description": "short overview"
}

Be conservative. Keep calories consistent with macros (cal≈4c+4p+9f within ~25%).
${context ? `Context: ${context}` : ''}
${barcode ? `Barcode hint: ${barcode}` : ''}
${text_hint ? `User text hint: ${text_hint}` : ''}
`;

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.2,
    max_tokens: 1200,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const content = resp.choices[0]?.message?.content;
  if (!content) throw new Error('No response from OpenAI');

  let raw: any;
  try {
    raw = extractJSON(content);
  } catch {
    throw new Error('Failed to parse JSON from OpenAI');
  }

  const items: any[] = Array.isArray(raw.items) ? raw.items : raw.food_name ? [raw] : [];
  if (!items.length) throw new Error('No items found in analysis');

  const fixed: FoodItemAnalysis[] = items.map((it) => {
    const { serving, units } = normalizeServingSize(it.serving_size);
    const nutrition = validateNutrition(it.nutrition ?? {}, it.category ?? 'mixed');

    const derived = Math.round(nutrition.carbs * 4 + nutrition.protein * 4 + nutrition.fat * 9);
    let conf = clamp(it.confidence, 10, 100);
    const diffPct =
      nutrition.calories > 0
        ? Math.abs(nutrition.calories - derived) / Math.max(1, nutrition.calories)
        : 0;
    if (diffPct > 0.2) conf = clamp(conf - 15, 10, 100);
    if (it.is_packaged && (it.sources?.label_text?.length ?? 0) > 20)
      conf = clamp(conf + 10, 10, 100);

    return {
      food_name: String(it.food_name ?? 'Unknown item'),
      brand: it.brand ?? null,
      category: String(it.category ?? 'mixed'),
      serving_size: serving,
      units,
      nutrition,
      confidence: conf,
      is_packaged: Boolean(it.is_packaged),
      notes: it.notes ?? '',
      sources: { label_text: it.sources?.label_text ?? null },
    };
  });

  return {
    items: fixed,
    overall_confidence: overallConfidence(fixed),
    description: typeof raw.description === 'string' ? raw.description : '',
  };
}

export async function analyzeImageWithGroqFallback(_imageBase64: string): Promise<FoodAnalysis> {
  throw new Error('Vision fallback unavailable (Groq).');
}
