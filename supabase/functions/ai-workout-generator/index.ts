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

async function generateWorkoutWithAI(
  fitnessLevel: string,
  availableTime: number,
  equipment: string[],
  goals: string[]
) {
  const prompt = `Generate a personalized workout plan and return ONLY valid JSON.

Return this exact structure:
{
  "workout_name": string,
  "duration_minutes": number,
  "difficulty": string,
  "estimated_calories": number,
  "exercises": [
    {
      "name": string,
      "sets": number,
      "reps": number | string (e.g., "30 seconds"),
      "rest_seconds": number,
      "instructions": string,
      "target_muscles": string[],
      "equipment_needed": string[]
    }
  ],
  "warm_up": [
    {
      "name": string,
      "duration": string,
      "instructions": string
    }
  ],
  "cool_down": [
    {
      "name": string,
      "duration": string,
      "instructions": string
    }
  ],
  "tips": string[],
  "progression_notes": string
}

IMPORTANT:
- Match exercises to fitness level (${fitnessLevel})
- Use only available equipment: ${equipment.join(', ') || 'bodyweight only'}
- Target goals: ${goals.join(', ')}
- Keep within ${availableTime} minutes total
- Include proper warm-up and cool-down
- Provide clear, safe instructions`;

  const userContent = `Create a ${availableTime}-minute ${fitnessLevel} workout for goals: ${goals.join(', ')}. Available equipment: ${equipment.join(', ') || 'none (bodyweight only)'}`;

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
      fitness_level = 'beginner',
      available_time = 30,
      equipment = [],
      goals = [],
    } = await req.json();

    const workout = await generateWorkoutWithAI(fitness_level, available_time, equipment, goals);

    return new Response(JSON.stringify(workout), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Workout generation error:', err);
    return jsonError(err.message || 'Internal server error');
  }
});
