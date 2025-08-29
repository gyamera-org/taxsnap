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
      return dayInCycle > 21 ? 'low' : 'moderate'; // Days 17-28: Moderate to lowd
    default:
      return 'moderate';
  }
}

async function saveWeeklyPlan(userId: string, plan: any) {
  try {
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

// Get users who need a new weekly plan
async function getUsersNeedingPlans(): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Find users who:
  // 1. Don't have an active plan for tomorrow, OR
  // 2. Their current plan ends today/tomorrow
  const { data: usersWithoutPlans, error } = await supabase.rpc('get_users_needing_weekly_plans', {
    target_date: tomorrowStr,
  });

  if (error) {
    console.error('Error getting users needing plans:', error);
    return [];
  }

  return usersWithoutPlans || [];
}

// Generate weekly plan with AI (OpenAI primary, Groq backup)
async function generateWeeklyPlanWithAI(
  fitnessGoals: any,
  bodyMeasurements: any,
  currentCyclePhase: any,
  startDate: Date
) {
  const week = getNext7Days(startDate);
  const restDays = [2, 5]; // Wednesday and Saturday indices

  const prompt = `Generate a 7-day personalized exercise plan and return ONLY valid JSON.

User Profile:
- Fitness Goals: ${JSON.stringify(fitnessGoals)}
- Body Measurements: ${JSON.stringify(bodyMeasurements)}
- Cycle Phase: ${currentCyclePhase?.phase || 'unknown'}
- Days in Cycle: ${currentCyclePhase?.day_in_cycle || 'unknown'}

Return this exact structure:
{
  "plan_name": string,
  "total_duration_week": number,
  "plan_description": string,
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day_name": string,
      "is_rest_day": boolean,
      "workout_type": string,
      "duration_minutes": number,
      "intensity": "low" | "moderate" | "high",
      "exercises": [
        {
          "name": string,
          "category": string,
          "duration_minutes": number,
          "sets": number,
          "reps": string,
          "rest_seconds": number,
          "calories_estimate": number,
          "instructions": string
        }
      ],
      "rest_day_activities": string[] (only if is_rest_day is true),
      "cycle_considerations": string,
      "daily_tips": string[]
    }
  ],
  "weekly_goals": {
    "total_workouts": number,
    "total_minutes": number,
    "estimated_calories": number,
    "focus_areas": string[]
  },
  "progression_notes": string,
  "safety_reminders": string[]
}

IMPORTANT REQUIREMENTS:
- Schedule rest days on Wednesday (index 2) and Saturday (index 5)
- Adjust intensity based on menstrual cycle phase
- If cycle phase is menstrual or premenstrual, reduce intensity
- Include variety: strength, cardio, flexibility, sports
- Consider fitness goals (weight loss, muscle gain, general fitness)
- Provide cycle-aware recommendations
- Each workout should be 20-60 minutes
- Include proper rest day activities (yoga, walking, stretching)
- Estimate realistic calorie burns
- Provide clear, safe instructions`;

  const userContent = `Create a weekly exercise plan starting ${startDate.toDateString()} for goals: ${fitnessGoals?.primary_goal || 'general fitness'}. Current cycle phase: ${currentCyclePhase?.phase || 'unknown'} (day ${currentCyclePhase?.day_in_cycle || '?'}).`;

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

      // Ensure dates are properly formatted
      plan.days = plan.days.map((day: any, index: number) => ({
        ...day,
        date: week[index].toISOString().split('T')[0],
        day_name: week[index].toLocaleDateString('en-US', { weekday: 'long' }),
        is_rest_day: restDays.includes(index),
        intensity: getCycleAwareIntensity(
          currentCyclePhase?.phase,
          currentCyclePhase?.day_in_cycle + index
        ),
      }));

      return { plan, provider: 'openai' };
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

        // Ensure dates are properly formatted
        plan.days = plan.days.map((day: any, index: number) => ({
          ...day,
          date: week[index].toISOString().split('T')[0],
          day_name: week[index].toLocaleDateString('en-US', { weekday: 'long' }),
          is_rest_day: restDays.includes(index),
          intensity: getCycleAwareIntensity(
            currentCyclePhase?.phase,
            currentCyclePhase?.day_in_cycle + index
          ),
        }));

        return { plan, provider: 'groq' };
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

// Generate plan for a specific user
async function generatePlanForUser(userId: string): Promise<any> {
  try {
    // Get user's fitness data
    const [fitnessGoals, bodyMeasurements, cyclePhase] = await Promise.all([
      supabase.from('fitness_goals').select('*').eq('user_id', userId).single(),
      supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase.from('cycle_settings').select('*').eq('user_id', userId).single(),
    ]);

    // Calculate current cycle phase if available
    let currentCyclePhase = null;
    if (cyclePhase.data && cyclePhase.data.last_period_start) {
      const lastPeriod = new Date(cyclePhase.data.last_period_start);
      const today = new Date();
      const daysSinceLastPeriod = Math.floor(
        (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
      );
      const cycleLength = cyclePhase.data.average_cycle_length || 28;
      const dayInCycle = (daysSinceLastPeriod % cycleLength) + 1;

      // Determine phase
      let phase = 'follicular';
      if (dayInCycle <= 5) phase = 'menstrual';
      else if (dayInCycle <= 13) phase = 'follicular';
      else if (dayInCycle <= 16) phase = 'ovulatory';
      else phase = 'luteal';

      currentCyclePhase = {
        phase,
        day_in_cycle: dayInCycle,
      };
    }

    // Generate the plan starting tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await generateWeeklyPlanWithAI(
      fitnessGoals.data,
      bodyMeasurements.data,
      currentCyclePhase,
      tomorrow
    );

    // Save the plan to database
    const savedPlan = await saveWeeklyPlan(userId, result.plan);

    return {
      success: true,
      plan: result.plan,
      provider: result.provider,
      saved: !!savedPlan,
      plan_id: savedPlan?.id,
    };
  } catch (error) {
    console.error(`Failed to generate plan for user ${userId}:`, error);
    throw error;
  }
}

// Main auto-generation function
async function autoGeneratePlans(
  triggerType: 'scheduled' | 'on-demand' | 'user-specific',
  userId?: string
): Promise<any> {
  const results = {
    trigger_type: triggerType,
    timestamp: new Date().toISOString(),
    users_processed: 0,
    plans_generated: 0,
    errors: [] as string[],
    success_users: [] as string[],
  };

  try {
    let usersToProcess: string[] = [];

    if (triggerType === 'user-specific' && userId) {
      // Generate for specific user
      usersToProcess = [userId];
    } else {
      // Get all users who need plans
      const usersNeedingPlans = await getUsersNeedingPlans();
      usersToProcess = usersNeedingPlans.map((user) => user.user_id);
    }

    results.users_processed = usersToProcess.length;

    // Generate plans for each user
    for (const userId of usersToProcess) {
      try {
        const planResult = await generatePlanForUser(userId);

        if (planResult.success) {
          results.plans_generated++;
          results.success_users.push(userId);
        } else {
          results.errors.push(`Failed to generate plan for user ${userId}`);
        }
      } catch (error) {
        results.errors.push(`Error for user ${userId}: ${error.message}`);
        console.error(`❌ Error generating plan for user ${userId}:`, error);
      }
    }

    return results;
  } catch (error) {
    results.errors.push(`Auto-generation error: ${error.message}`);
    return results;
  }
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const triggerType =
      (url.searchParams.get('trigger') as 'scheduled' | 'on-demand' | 'user-specific') ||
      'on-demand';
    const userId = url.searchParams.get('user_id');
    const debug = url.searchParams.get('debug') === 'true';

    // If debug mode, run diagnostics
    if (debug) {
      try {
        // Test database connection
        const { data: testData, error: testError } = await supabase
          .from('accounts')
          .select('id')
          .limit(1);

        if (testError) {
          console.error('❌ Database connection failed:', testError);
          return jsonError(`Database connection failed: ${testError.message}`);
        }

        // Check required tables
        const tables = [
          'weekly_exercise_plans',
          'fitness_goals',
          'body_measurements',
          'cycle_settings',
        ];
        const tableResults: any = {};

        for (const table of tables) {
          try {
            const { data, error } = await supabase.from(table).select('id').limit(1);
            tableResults[table] = error ? `❌ ${error.message}` : '✅ Exists';
          } catch (e) {
            tableResults[table] = `❌ ${e.message}`;
          }
        }

        // Check RPC functions
        const rpcResults: any = {};
        try {
          const { data, error } = await supabase.rpc('get_users_needing_weekly_plans', {
            target_date: new Date().toISOString().split('T')[0],
          });
          rpcResults.get_users_needing_weekly_plans = error ? `❌ ${error.message}` : '✅ Exists';
        } catch (e) {
          rpcResults.get_users_needing_weekly_plans = `❌ ${e.message}`;
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Diagnostic completed',
            diagnostics: {
              database_connection: '✅ Working',
              tables: tableResults,
              rpc_functions: rpcResults,
              environment_vars: {
                SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
                SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
                OPENAI_API_KEY: !!Deno.env.get('OPENAI_API_KEY'),
                GROQ_API_KEY: !!Deno.env.get('GROQ_API_KEY'),
              },
            },
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (diagError) {
        console.error('💥 Diagnostic error:', diagError);
        return jsonError(`Diagnostic failed: ${diagError.message}`);
      }
    }

    // Validate trigger type
    if (!['scheduled', 'on-demand', 'user-specific'].includes(triggerType)) {
      return jsonError('Invalid trigger type. Use: scheduled, on-demand, or user-specific', 400);
    }

    // Validate user-specific requests
    if (triggerType === 'user-specific' && !userId) {
      return jsonError('user_id is required for user-specific trigger', 400);
    }

    const results = await autoGeneratePlans(triggerType, userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-generation completed: ${results.plans_generated}/${results.users_processed} plans generated`,
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('💥 Auto-generation error:', err);
    return jsonError(err.message || 'Internal server error');
  }
});
