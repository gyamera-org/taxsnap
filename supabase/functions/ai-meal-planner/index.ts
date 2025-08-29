import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Groq from 'npm:groq-sdk';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY') ?? '',
});

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function generateMealPlanWithAI(
  dailyCalories: number,
  dietaryRestrictions: string[],
  healthConditions: string[],
  days: number
) {
  const prompt = `Generate a ${days}-day meal plan and return ONLY valid JSON.

Return this exact structure:
{
  "plan_duration_days": number,
  "daily_calorie_target": number,
  "dietary_restrictions": string[],
  "health_conditions": string[],
  "days": [
    {
      "day": number,
      "date": string (YYYY-MM-DD),
      "total_calories": number,
      "meals": [
        {
          "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
          "name": string,
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "fiber": number,
          "ingredients": string[],
          "instructions": string[],
          "prep_time": number (minutes),
          "allergens": string[]
        }
      ],
      "daily_totals": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number
      },
      "shopping_list": string[]
    }
  ],
  "weekly_shopping_list": string[],
  "meal_prep_tips": string[],
  "nutrition_notes": string
}

IMPORTANT:
- Target ${dailyCalories} calories per day
- Respect dietary restrictions: ${dietaryRestrictions.join(', ') || 'none'}
- Consider health conditions: ${healthConditions.join(', ') || 'none'}
- Provide balanced nutrition across meals
- Include realistic prep times
- Generate grocery shopping lists`;

  const userContent = `Create a ${days}-day meal plan for ${dailyCalories} calories/day. Dietary restrictions: ${dietaryRestrictions.join(', ') || 'none'}. Health conditions: ${healthConditions.join(', ') || 'none'}.`;

  const chat = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: userContent },
    ],
  });

  const message = chat.choices[0]?.message?.content ?? '';

  try {
    const match = message.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No valid JSON found');
  } catch {
    throw new Error('Failed to parse JSON from Groq');
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonError('Method Not Allowed', 405);

  try {
    const {
      daily_calories = 2000,
      dietary_restrictions = [],
      health_conditions = [],
      days = 7,
    } = await req.json();

    const mealPlan = await generateMealPlanWithAI(
      daily_calories,
      dietary_restrictions,
      health_conditions,
      days
    );

    return new Response(JSON.stringify(mealPlan), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Meal plan generation error:', err);
    return jsonError(err.message || 'Internal server error');
  }
});
