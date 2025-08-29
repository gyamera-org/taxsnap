import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts';
import Groq from 'npm:groq-sdk';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
});

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY') ?? '',
});

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function analyzeNutritionWithAI(foodDescription: string, servingSize?: string) {
  const prompt = `Analyze this food item and return ONLY valid JSON with detailed nutrition information.

Return this exact structure:
{
  "food_name": string,
  "serving_size": string,
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (mg),
  "confidence": number (0-1),
  "ingredients": string[],
  "allergens": string[],
  "health_score": number (1-10, where 1=unhealthy, 10=very healthy),
  "nutritional_benefits": string[],
  "health_concerns": string[],
  "diet_compatibility": {
    "vegetarian": boolean,
    "vegan": boolean,
    "gluten_free": boolean,
    "keto": boolean,
    "paleo": boolean
  }
}

IMPORTANT:
- Be accurate with nutrition values
- Include common allergens if present
- Health score should reflect overall nutritional value
- List 3-5 key nutritional benefits
- Mention any health concerns (high sodium, sugar, etc.)`;

  const userContent = `Food: ${foodDescription}${servingSize ? `\nServing Size: ${servingSize}` : ''}`;

  // Try OpenAI first
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userContent },
      ],
    });

    const message = completion.choices[0]?.message?.content ?? '';
    const match = message.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No valid JSON from OpenAI');
  } catch (openaiError) {
    console.warn('OpenAI failed, falling back to Groq:', openaiError);

    // Fallback to Groq
    const chat = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userContent },
      ],
    });

    const message = chat.choices[0]?.message?.content ?? '';
    const match = message.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse JSON from both OpenAI and Groq');
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonError('Method Not Allowed', 405);

  try {
    const { food_description, serving_size } = await req.json();

    if (!food_description) {
      return jsonError('food_description is required', 400);
    }

    const analysis = await analyzeNutritionWithAI(food_description, serving_size);

    return new Response(JSON.stringify(analysis), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Nutrition analysis error:', err);
    return jsonError(err.message || 'Internal server error');
  }
});
