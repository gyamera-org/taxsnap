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

interface ExerciseItem {
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: string;
  instructions: string;
  caloriesPerMinute: number;
}

interface ModerationResult {
  approved: boolean;
  confidence: number;
  reason: string;
  exercise_name: string;
  suggested_category?: string;
  suggested_muscle_groups?: string[];
  suggested_equipment?: string;
}

async function moderateExerciseWithAI(exercise: ExerciseItem): Promise<ModerationResult> {
  const prompt = `
You are a fitness expert moderating exercise submissions for a community database. 
Analyze this exercise submission and determine if it should be approved for the public database.

Exercise Details:
- Name: ${exercise.name}
- Category: ${exercise.category}
- Muscle Groups: ${exercise.muscleGroups.join(', ')}
- Equipment: ${exercise.equipment}
- Difficulty: ${exercise.difficulty}
- Instructions: ${exercise.instructions}
- Calories per Minute: ${exercise.caloriesPerMinute}

APPROVAL CRITERIA:
✅ APPROVE if:
- Exercise name is clear and describes a real exercise
- Category is appropriate (cardio, strength, flexibility, sports, balance, other)
- Muscle groups are accurate for the exercise
- Equipment is realistic and appropriate
- Instructions are safe and helpful
- Calories per minute is reasonable (1-20 range typically)
- No offensive/inappropriate content
- Exercise is actually possible to perform

❌ REJECT if:
- Offensive, inappropriate, or spam content
- Dangerous or unsafe exercise instructions
- Clearly fake or impossible exercises
- Missing critical safety information
- Unrealistic calorie estimates (over 25 or under 0.5 per minute)
- Non-exercise activities
- Duplicate of very common exercises

CATEGORIES:
- cardio: Running, cycling, swimming, jumping, etc.
- strength: Weight lifting, resistance training, bodyweight strength
- flexibility: Stretching, yoga, mobility work
- sports: Sport-specific activities
- balance: Balance and stability exercises
- other: Miscellaneous activities

MUSCLE GROUPS:
chest, back, shoulders, arms, legs, glutes, core, cardiovascular, flexibility, full_body

EQUIPMENT:
bodyweight, dumbbells, barbell, kettlebell, resistance_band, machine, cable, cardio_machine, mat, ball, other

DIFFICULTY:
beginner, intermediate, advanced

Return ONLY valid JSON:
{
  "approved": boolean,
  "confidence": number (0-100),
  "reason": "Brief explanation of decision",
  "exercise_name": "Clean version of exercise name",
  "suggested_category": "suggested category if original is unclear",
  "suggested_muscle_groups": ["array", "of", "muscle", "groups"],
  "suggested_equipment": "suggested equipment if original is unclear"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI moderator');
    }

    const result = JSON.parse(content);

    const moderationResult = {
      approved: Boolean(result.approved),
      confidence: Math.max(0, Math.min(100, Number(result.confidence) || 0)),
      reason: String(result.reason || 'No reason provided'),
      exercise_name: String(result.exercise_name || exercise.name),
      suggested_category: result.suggested_category || exercise.category,
      suggested_muscle_groups: Array.isArray(result.suggested_muscle_groups)
        ? result.suggested_muscle_groups
        : exercise.muscleGroups,
      suggested_equipment: result.suggested_equipment || exercise.equipment,
    };

    return moderationResult;
  } catch (error) {
    // Conservative default: require manual review
    const fallbackResult = {
      approved: false,
      confidence: 0,
      reason: 'AI moderation failed - requires manual review',
      exercise_name: exercise.name,
      suggested_category: exercise.category,
      suggested_muscle_groups: exercise.muscleGroups,
      suggested_equipment: exercise.equipment,
    };

    return fallbackResult;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonError('Method Not Allowed', 405);
  }

  try {
    const requestBody = await req.json();
    const { exercise_entry_id, exercise_items, user_id } = requestBody;

    if (!exercise_entry_id || !exercise_items || !user_id) {
      return jsonError('Missing required fields: exercise_entry_id, exercise_items, user_id', 400);
    }

    const results = [];

    // Process each exercise item
    for (let i = 0; i < exercise_items.length; i++) {
      const exerciseItem = exercise_items[i];

      try {
        // Check if this exercise already exists in the database
        const { data: existingExercise } = await supabase
          .from('exercise_database')
          .select('id')
          .eq('name', exerciseItem.name)
          .limit(1)
          .single();

        if (existingExercise) {
          results.push({
            exercise_name: exerciseItem.name,
            status: 'duplicate',
            reason: 'Exercise already exists in database',
          });
          continue;
        }

        // Get AI moderation decision
        const moderation = await moderateExerciseWithAI(exerciseItem);

        if (moderation.approved && moderation.confidence >= 70) {
          // Auto-approve high-confidence submissions

          const exerciseData = {
            name: moderation.exercise_name,
            category: moderation.suggested_category?.toLowerCase() || 'other',
            muscle_groups: moderation.suggested_muscle_groups || [],
            equipment: moderation.suggested_equipment?.toLowerCase() || 'bodyweight',
            difficulty: exerciseItem.difficulty?.toLowerCase() || 'beginner',
            instructions: exerciseItem.instructions || '',
            calories_per_minute: Math.max(0.5, Math.min(25, exerciseItem.caloriesPerMinute || 5)),
            source: 'user_contribution',
            contributor_id: user_id,
            verified: true, // Auto-verify high-confidence AI approvals
          };

          const { data: newExercise } = await supabase
            .from('exercise_database')
            .insert(exerciseData)
            .select()
            .single();

          await supabase.from('user_exercise_contributions').insert({
            user_id,
            exercise_id: newExercise.id,
            contribution_type: 'new_exercise',
            status: 'approved',
          });

          results.push({
            exercise_name: moderation.exercise_name,
            status: 'approved',
            reason: moderation.reason,
          });
        } else {
          const pendingExerciseData = {
            name: moderation.exercise_name,
            category: moderation.suggested_category?.toLowerCase() || 'other',
            muscle_groups: moderation.suggested_muscle_groups || [],
            equipment: moderation.suggested_equipment?.toLowerCase() || 'bodyweight',
            difficulty: exerciseItem.difficulty?.toLowerCase() || 'beginner',
            instructions: exerciseItem.instructions || '',
            calories_per_minute: Math.max(0.5, Math.min(25, exerciseItem.caloriesPerMinute || 5)),
            source: 'user_contribution',
            contributor_id: user_id,
            verified: false, // Requires manual review
          };

          const { data: pendingExercise, error: insertError } = await supabase
            .from('exercise_database')
            .insert(pendingExerciseData)
            .select()
            .single();

          await supabase.from('user_exercise_contributions').insert({
            user_id,
            exercise_id: pendingExercise.id,
            contribution_type: 'new_exercise',
            status: 'pending',
          });

          results.push({
            exercise_name: moderation.exercise_name,
            status: 'pending_review',
            reason: moderation.reason,
            confidence: moderation.confidence,
          });
        }
      } catch (error) {
        results.push({
          exercise_name: exerciseItem.name,
          status: 'error',
          reason: 'Processing failed',
        });
      }
    }

    const summary = {
      total: results.length,
      approved: results.filter((r) => r.status === 'approved').length,
      pending: results.filter((r) => r.status === 'pending_review').length,
      duplicates: results.filter((r) => r.status === 'duplicate').length,
      errors: results.filter((r) => r.status === 'error').length,
    };

    const response = {
      success: true,
      processed: results.length,
      results,
      exercise_entry_id,
      summary,
    };

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(errorMessage, 500);
  }
});
