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

async function getUserHealthData(userId: string, daysBack: number) {
  // Get user's recent data from various tables
  const { data: goals } = await supabase.rpc('get_fitness_goals');
  const { data: nutritionGoals } = await supabase.rpc('get_nutrition_goals');
  const { data: weightEntries } = await supabase.rpc('get_weight_entries', { p_limit: daysBack });

  return {
    fitness_goals: goals,
    nutrition_goals: nutritionGoals,
    weight_entries: weightEntries,
    analysis_period: daysBack,
  };
}

async function generateHealthInsightsWithAI(userData: any, daysBack: number) {
  const prompt = `Analyze this user's health data and generate personalized insights. Return ONLY valid JSON.

Return this exact structure:
{
  "analysis_period_days": number,
  "overall_score": number (1-10),
  "insights": [
    {
      "category": "nutrition" | "fitness" | "weight" | "sleep" | "habits",
      "type": "achievement" | "suggestion" | "warning" | "trend",
      "title": string,
      "description": string,
      "confidence": number (0-1),
      "action_items": string[],
      "priority": "high" | "medium" | "low"
    }
  ],
  "progress_summary": {
    "fitness": {
      "score": number (1-10),
      "trend": "improving" | "stable" | "declining",
      "notes": string
    },
    "nutrition": {
      "score": number (1-10),
      "trend": "improving" | "stable" | "declining",
      "notes": string
    },
    "weight": {
      "score": number (1-10),
      "trend": "improving" | "stable" | "declining",
      "notes": string
    }
  },
  "recommendations": {
    "immediate": string[],
    "short_term": string[],
    "long_term": string[]
  },
  "goal_progress": {
    "on_track": boolean,
    "percentage_complete": number,
    "estimated_completion": string,
    "adjustments_needed": string[]
  }
}

IMPORTANT:
- Be encouraging but honest about areas needing improvement
- Provide specific, actionable recommendations
- Consider the user's goals and current habits
- Flag any concerning trends that need attention`;

  const userContent = `User Health Data (${daysBack} days):\n${JSON.stringify(userData, null, 2)}`;

  const chat = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0.4,
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
    const { user_id, days_back = 30 } = await req.json();

    if (!user_id) {
      return jsonError('user_id is required', 400);
    }

    // Get user's health data
    const userData = await getUserHealthData(user_id, days_back);

    // Generate AI insights
    const insights = await generateHealthInsightsWithAI(userData, days_back);

    return new Response(
      JSON.stringify({
        user_id,
        generated_at: new Date().toISOString(),
        ...insights,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Health insights error:', err);
    return jsonError(err.message || 'Internal server error');
  }
});
