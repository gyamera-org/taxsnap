// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'npm:openai';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
});

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface FoodItem {
  food: {
    name: string;
    brand?: string;
    category?: string;
    servingSize: string;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      sugar?: number;
    };
  };
  quantity: number;
}

interface ModerationResult {
  approved: boolean;
  confidence: number;
  reason: string;
  food_name: string;
  suggested_category?: string;
}

async function moderateFoodWithAI(foodItem: FoodItem): Promise<ModerationResult> {
  const { food } = foodItem;

  const prompt = `
You are a nutrition expert moderating food submissions for a community database. 
Analyze this food submission and determine if it should be approved for the public database.

Food Details:
- Name: ${food.name}
- Brand: ${food.brand || 'Not specified'}
- Category: ${food.category || 'Not specified'}
- Serving Size: ${food.servingSize}
- Nutrition per serving:
  - Calories: ${food.nutrition.calories}
  - Protein: ${food.nutrition.protein}g
  - Carbs: ${food.nutrition.carbs}g
  - Fat: ${food.nutrition.fat}g
  - Fiber: ${food.nutrition.fiber || 0}g
  - Sugar: ${food.nutrition.sugar || 0}g

APPROVAL CRITERIA:
✅ APPROVE if:
- Food name is clear and descriptive
- Nutrition values are realistic for the food type
- All required fields are present
- No offensive/inappropriate content
- Values are within reasonable ranges

❌ REJECT if:
- Offensive, inappropriate, or spam content
- Clearly fake or impossible nutrition values
- Missing critical information
- Duplicate of existing common foods
- Non-food items

Return ONLY valid JSON:
{
  "approved": boolean,
  "confidence": number (0-100),
  "reason": "Brief explanation of decision",
  "food_name": "Clean version of food name",
  "suggested_category": "suggested category if original is unclear"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI moderator');
    }

    const result = JSON.parse(content);
    return {
      approved: Boolean(result.approved),
      confidence: Math.max(0, Math.min(100, Number(result.confidence) || 0)),
      reason: String(result.reason || 'No reason provided'),
      food_name: String(result.food_name || food.name),
      suggested_category: result.suggested_category || food.category,
    };
  } catch (error) {
    console.error('AI moderation failed:', error);
    // Conservative default: require manual review
    return {
      approved: false,
      confidence: 0,
      reason: 'AI moderation failed - requires manual review',
      food_name: food.name,
      suggested_category: food.category,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonError('Method Not Allowed', 405);
  }

  try {
    const { meal_entry_id, food_items, user_id } = await req.json();

    if (!meal_entry_id || !food_items || !user_id) {
      return jsonError('Missing required fields: meal_entry_id, food_items, user_id', 400);
    }

    const results = [];

    // Process each food item
    for (const foodItem of food_items) {
      try {
        // Check if this food already exists in the database
        const { data: existingFood } = await supabase
          .from('food_database')
          .select('id')
          .eq('name', foodItem.food.name)
          .eq('brand', foodItem.food.brand || null)
          .limit(1)
          .single();

        if (existingFood) {
          console.log(`Food "${foodItem.food.name}" already exists, skipping`);
          continue;
        }

        // Get AI moderation decision
        const moderation = await moderateFoodWithAI(foodItem);

        if (moderation.approved && moderation.confidence >= 70) {
          // Auto-approve high-confidence submissions
          const { data: newFood, error: insertError } = await supabase
            .from('food_database')
            .insert({
              name: moderation.food_name,
              brand: foodItem.food.brand,
              category: moderation.suggested_category?.toLowerCase() || 'other',
              serving_size: foodItem.food.servingSize,
              calories: foodItem.food.nutrition.calories,
              protein: foodItem.food.nutrition.protein,
              carbs: foodItem.food.nutrition.carbs,
              fat: foodItem.food.nutrition.fat,
              fiber: foodItem.food.nutrition.fiber || 0,
              sugar: foodItem.food.nutrition.sugar || 0,
              sodium_mg: 0,
              source: 'user_contribution',
              contributor_id: user_id,
              verified: true, // Auto-verify high-confidence AI approvals
            })
            .select()
            .single();

          if (insertError) {
            console.error('Failed to insert approved food:', insertError);
          } else {
            // Create contribution record
            await supabase.from('user_food_contributions').insert({
              user_id,
              food_id: newFood.id,
              contribution_type: 'new_food',
              status: 'approved',
            });

            results.push({
              food_name: moderation.food_name,
              status: 'approved',
              reason: moderation.reason,
            });
          }
        } else {
          // Queue for manual review
          const { data: pendingFood, error: insertError } = await supabase
            .from('food_database')
            .insert({
              name: moderation.food_name,
              brand: foodItem.food.brand,
              category: moderation.suggested_category?.toLowerCase() || 'other',
              serving_size: foodItem.food.servingSize,
              calories: foodItem.food.nutrition.calories,
              protein: foodItem.food.nutrition.protein,
              carbs: foodItem.food.nutrition.carbs,
              fat: foodItem.food.nutrition.fat,
              fiber: foodItem.food.nutrition.fiber || 0,
              sugar: foodItem.food.nutrition.sugar || 0,
              sodium_mg: 0,
              source: 'user_contribution',
              contributor_id: user_id,
              verified: false, // Requires manual review
            })
            .select()
            .single();

          if (insertError) {
            console.error('Failed to insert pending food:', insertError);
          } else {
            // Create contribution record
            await supabase.from('user_food_contributions').insert({
              user_id,
              food_id: pendingFood.id,
              contribution_type: 'new_food',
              status: 'pending',
            });

            results.push({
              food_name: moderation.food_name,
              status: 'pending_review',
              reason: moderation.reason,
              confidence: moderation.confidence,
            });
          }
        }
      } catch (error) {
        console.error(`Failed to process food item:`, error);
        results.push({
          food_name: foodItem.food.name,
          status: 'error',
          reason: 'Processing failed',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
        meal_entry_id,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Food moderation error:', error);
    return jsonError(errorMessage, 500);
  }
});
