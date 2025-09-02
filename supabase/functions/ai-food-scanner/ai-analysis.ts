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
You are a nutrition vision expert. Analyze the image and detect 1–5 distinct food/beverage items with DETAILED ingredient breakdown.

For each food item, identify ALL visible ingredients and components, providing detailed nutritional breakdown:

ANALYSIS REQUIREMENTS:
1. Main food identification (name, brand, category)
2. DETAILED ingredient breakdown with individual portions and calories
3. Accurate nutrition per serving with realistic values
4. High confidence scoring based on visual clarity

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
      "detailed_ingredients": [
        {
          "name": "string",
          "portion": "string",
          "calories": number,
          "nutrition": {
            "protein": number,
            "carbs": number,
            "fat": number
          }
        }
      ],
      "confidence": number,
      "is_packaged": boolean,
      "notes": "string",
      "sources": { "label_text": "string|null" }
    }
  ],
  "overall_confidence": number,
  "description": "short overview"
}

INGREDIENT ANALYSIS EXAMPLES:
- Fried Chicken Sandwich: ["Chicken (Breaded and Fried) • 309 cal • 6½ pieces", "Bread • 250 cal • 3½ regular slice", "Bacon • 122 cal • 4½ thin slice", "Cheddar Cheese • 75 cal • ⅔ slice", "Avocados • 53 cal • 33½g", "Tomatoes • 9 cal • 50g", "Lettuce • 5 cal • ⅝ cup", "Red Onions • 5 cal • 12½g"]
- Pizza: ["Pizza Dough • 200 cal • 1 slice base", "Tomato Sauce • 15 cal • 2 tbsp", "Mozzarella • 80 cal • ¼ cup", "Pepperoni • 140 cal • 10 slices"]

Be conservative with nutrition values. Keep calories consistent with macros (cal≈4c+4p+9f within ~25%).

${context ? `Context: ${context}` : ''}
${barcode ? `Barcode hint: ${barcode}` : ''}
${text_hint ? `User text hint: ${text_hint}` : ''}
`;

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.2,
    max_tokens: 2000, // Increased for detailed ingredient analysis
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
