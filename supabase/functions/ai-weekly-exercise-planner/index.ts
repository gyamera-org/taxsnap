import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'npm:openai';
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

function getNext7Days(startDate: Date): Date[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
}

function getCycleAwareIntensity(cyclePhase: string, dayInCycle: number): string {
  if (!cyclePhase) return 'moderate';

  switch (cyclePhase.toLowerCase()) {
    case 'menstrual':
      return 'low'; // Days 1-5: Low intensity, gentle movement
    case 'follicular':
      return 'moderate'; // Days 6-13: Building energy
    case 'ovulatory':
      return 'high'; // Days 14-16: Peak energy, high intensity
    case 'luteal':
      return dayInCycle > 21 ? 'low' : 'moderate'; // Days 17-28: Moderate to low
    default:
      return 'moderate';
  }
}

async function generateWeeklyPlanWithAI(
  fitnessGoals: any,
  bodyMeasurements: any,
  currentCyclePhase: any,
  startDate: Date,
  exerciseHistory: any[]
) {
  const week = getNext7Days(startDate);
  const restDays = [2, 5]; // Wednesday and Saturday indices

  // Analyze exercise history
  const recentWorkouts = exerciseHistory
    .map((ex) => `${ex.exercise_name} (${ex.duration_minutes}min)`)
    .join(', ');
  const totalRecentMinutes = exerciseHistory.reduce(
    (sum, ex) => sum + (ex.duration_minutes || 0),
    0
  );

  const prompt = `Generate a simple 7-day exercise plan and return ONLY valid JSON.

User:
- Goal: ${fitnessGoals?.primary_goal || 'general fitness'}
- Level: ${fitnessGoals?.experience_level || 'beginner'}
- Frequency: ${fitnessGoals?.workout_frequency || '3-4'} per week
- Cycle: ${currentCyclePhase?.phase || 'unknown'} (day ${currentCyclePhase?.day_in_cycle || '?'})
- Recent workouts: ${recentWorkouts || 'None'} (${totalRecentMinutes} total minutes)

Return this structure:
{
  "plan_name": "Simple plan name",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day_name": "Monday",
      "is_rest_day": boolean,
      "workout_type": "Cardio" or "Strength" or "",
      "duration_minutes": number,
      "exercises": [
        {
          "name": "Exercise name",
          "duration_minutes": number,
          "instructions": "Simple instruction",
          "completed": false
        }
      ]
    }
  ],
  "weekly_goals": {
    "total_workouts": number,
    "total_minutes": number,
    "estimated_calories": number
  }
}

RULES:
- Rest days Wednesday & Saturday (is_rest_day: true, exercises: [])
- Workouts 20-45 minutes max
- If user did similar exercises recently, vary the routine
- 2-3 simple exercises per workout
- Clear, short instructions
- Lower intensity during menstrual phase`;

  const userContent = `Plan for ${fitnessGoals?.primary_goal || 'fitness'} starting ${startDate.toDateString()}.`;

  // Try OpenAI first
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userContent },
      ],
    });

    const message = completion.choices[0]?.message?.content ?? '';
    const match = message.match(/\{[\s\S]*\}/);

    if (match) {
      const plan = JSON.parse(match[0]);

      // Ensure dates are properly formatted and add completion status
      plan.days = plan.days.map((day: any, index: number) => ({
        ...day,
        date: week[index].toISOString().split('T')[0],
        day_name: week[index].toLocaleDateString('en-US', { weekday: 'long' }),
        is_rest_day: restDays.includes(index),
        intensity: getCycleAwareIntensity(
          currentCyclePhase?.phase,
          currentCyclePhase?.day_in_cycle + index
        ),
        exercises:
          day.exercises?.map((exercise: any) => ({
            ...exercise,
            completed: false, // Ensure all exercises start as not completed
            calories_estimate:
              exercise.calories_estimate || Math.round(exercise.duration_minutes * 3), // Estimate calories if not provided
          })) || [],
      }));

      return plan;
    }

    throw new Error('No valid JSON found in OpenAI response');
  } catch (openaiError) {
    console.warn('⚠️ OpenAI failed, falling back to Groq:', openaiError.message);

    // Fallback to Groq
    try {
      const chat = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: userContent },
        ],
      });

      const message = chat.choices[0]?.message?.content ?? '';
      const match = message.match(/\{[\s\S]*\}/);

      if (match) {
        const plan = JSON.parse(match[0]);

        // Ensure dates are properly formatted and add completion status
        plan.days = plan.days.map((day: any, index: number) => ({
          ...day,
          date: week[index].toISOString().split('T')[0],
          day_name: week[index].toLocaleDateString('en-US', { weekday: 'long' }),
          is_rest_day: restDays.includes(index),
          intensity: getCycleAwareIntensity(
            currentCyclePhase?.phase,
            currentCyclePhase?.day_in_cycle + index
          ),
          exercises:
            day.exercises?.map((exercise: any) => ({
              ...exercise,
              completed: false, // Ensure all exercises start as not completed
              calories_estimate:
                exercise.calories_estimate || Math.round(exercise.duration_minutes * 3), // Estimate calories if not provided
            })) || [],
        }));

        return plan;
      }

      throw new Error('No valid JSON found in Groq response');
    } catch (groqError) {
      console.error('❌ Both OpenAI and Groq failed:', { openaiError, groqError });
      throw new Error(
        `AI plan generation failed. OpenAI: ${openaiError.message}, Groq: ${groqError.message}`
      );
    }
  }
}

async function saveWeeklyPlan(userId: string, plan: any) {
  try {
    // First, deactivate any existing active plans for this user
    await supabase
      .from('weekly_exercise_plans')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Save to a weekly_exercise_plans table
    const { data, error } = await supabase
      .from('weekly_exercise_plans')
      .insert({
        user_id: userId,
        plan_name: plan.plan_name,
        start_date: plan.days[0].date,
        end_date: plan.days[6].date,
        total_duration_minutes: plan.weekly_goals.total_minutes,
        estimated_calories: plan.weekly_goals.estimated_calories,
        plan_data: plan,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to save weekly plan:', error);
    // Don't throw here, just log - we still want to return the plan
    return null;
  }
}

Deno.serve(async (req) => {
  // Check environment variables
  const requiredEnvVars = {
    SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY'),
    GROQ_API_KEY: Deno.env.get('GROQ_API_KEY'),
  };

  if (!requiredEnvVars.OPENAI_API_KEY && !requiredEnvVars.GROQ_API_KEY) {
    console.error('❌ No AI API keys found');
    return jsonError('AI API keys not configured', 500);
  }

  if (req.method !== 'POST') return jsonError('Method Not Allowed', 405);

  try {
    const requestBody = await req.json();

    const { user_id, fitness_goals, body_measurements, current_cycle_phase, start_date } =
      requestBody;

    if (!user_id) {
      console.error('❌ Missing user_id');
      return jsonError('user_id is required', 400);
    }

    const startDate = start_date ? new Date(start_date) : new Date();

    // Get user's exercise history from the past 7 days
    const sevenDaysAgo = new Date(startDate);
    sevenDaysAgo.setDate(startDate.getDate() - 7);

    const { data: exerciseHistory, error: historyError } = await supabase
      .from('exercise_entries')
      .select('exercise_name, exercise_type, duration_minutes, calories_burned, logged_date')
      .eq('user_id', user_id)
      .gte('logged_date', sevenDaysAgo.toISOString().split('T')[0])
      .lt('logged_date', startDate.toISOString().split('T')[0])
      .order('logged_date', { ascending: false });

    if (historyError) {
      console.warn('⚠️ Could not fetch exercise history:', historyError.message);
    }

    // Generate the weekly plan
    const weeklyPlan = await generateWeeklyPlanWithAI(
      fitness_goals,
      body_measurements,
      current_cycle_phase,
      startDate,
      exerciseHistory || []
    );

    // Try to save the plan to the database (optional, continues if it fails)
    let savedPlan = null;
    try {
      savedPlan = await saveWeeklyPlan(user_id, weeklyPlan);
    } catch (saveError) {
      console.warn(
        '⚠️ Failed to save plan to database (continuing without saving):',
        saveError.message
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: weeklyPlan,
        saved: !!savedPlan,
        plan_id: savedPlan?.id,
        message: savedPlan ? 'Plan generated and saved' : 'Plan generated (not saved to database)',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Weekly exercise plan generation error:', err);
    return jsonError(err.message || 'Internal server error');
  }
});
