// AI Weekly Planner - Main Edge Function
// Handles all AI-powered planning and insights generation

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';
import { aggregateUserData } from './data-aggregator.ts';
import { LLMEngine } from './llm-engine.ts';
import { checkForPlanAdaptation } from './auto-generation.ts';
import {
  AIWeeklyPlanResponse,
  AIInsightResponse,
  AIAdaptationResponse,
  AIWeeklyPlan,
} from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const llmEngine = new LLMEngine(Deno.env.get('OPENAI_API_KEY') ?? '');

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has premium subscription
    const { data: account } = await supabase
      .from('accounts')
      .select('subscription_status')
      .eq('user_id', user.id)
      .single();

    if (account?.subscription_status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Premium subscription required for AI features' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'generate_weekly_plan':
        return await handleGenerateWeeklyPlan(user.id);

      case 'generate_daily_insight':
        const date = url.searchParams.get('date');
        return await handleGenerateDailyInsight(user.id, date);

      case 'adapt_plan':
        return await handleAdaptPlan(user.id, req);

      case 'get_current_plan':
        return await handleGetCurrentPlan(user.id);

      case 'check_adaptation':
        return await handleCheckAdaptation(req);

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('AI Weekly Planner error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleGenerateWeeklyPlan(userId: string): Promise<Response> {
  const startTime = Date.now();

  try {
    // Check for existing active plan for this week
    const weekStart = getWeekStart(new Date());
    const { data: existingPlan } = await supabase
      .from('ai_weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    if (existingPlan) {
      return new Response(
        JSON.stringify({
          success: true,
          plan: existingPlan.plan_data,
          cost_estimate: 0,
          generation_time_ms: Date.now() - startTime,
          cached: true,
        } as AIWeeklyPlanResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Aggregate user data
    console.log('Aggregating user data for:', userId);
    const userData = await aggregateUserData(userId);

    // Generate AI plan
    console.log('Generating AI weekly plan...');
    const aiPlan = await llmEngine.generateWeeklyPlan(userData);

    // Save plan to database
    const { data: savedPlan, error } = await supabase
      .from('ai_weekly_plans')
      .insert({
        user_id: userId,
        week_start: weekStart,
        plan_data: aiPlan,
        generation_context: aiPlan.generation_context,
        ai_model_used: 'gpt-4-1106-preview',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving plan:', error);
    }

    // Track usage for billing
    await trackAIUsage(userId, 'weekly_plan_generation', 0.15); // Estimated cost

    const response: AIWeeklyPlanResponse = {
      success: true,
      plan: aiPlan,
      cost_estimate: 0.15,
      generation_time_ms: Date.now() - startTime,
      cached: false,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating weekly plan:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate weekly plan',
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGenerateDailyInsight(userId: string, date: string | null): Promise<Response> {
  const startTime = Date.now();
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // Check for cached insight
    const { data: cachedInsight } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('insight_type', 'daily')
      .eq('target_date', targetDate)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .single();

    if (cachedInsight) {
      return new Response(
        JSON.stringify({
          success: true,
          insights: cachedInsight.insights_data,
          cost_estimate: 0,
          generation_time_ms: Date.now() - startTime,
          cached: true,
        } as AIInsightResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Aggregate user data
    const userData = await aggregateUserData(userId);

    // Generate AI insight
    console.log('Generating daily insight for:', targetDate);
    const insight = await llmEngine.generateDailyInsight(userData, targetDate);

    // Save insight to database
    await supabase.from('ai_insights').insert({
      user_id: userId,
      insight_type: 'daily',
      target_date: targetDate,
      insights_data: insight,
      relevance_score: 0.8,
    });

    // Track usage
    await trackAIUsage(userId, 'daily_insight_generation', 0.02);

    const response: AIInsightResponse = {
      success: true,
      insights: insight,
      cost_estimate: 0.02,
      generation_time_ms: Date.now() - startTime,
      cached: false,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating daily insight:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate daily insight',
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleAdaptPlan(userId: string, req: Request): Promise<Response> {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { adaptation_reason, current_plan_id } = body;

    if (!adaptation_reason) {
      return new Response(JSON.stringify({ error: 'adaptation_reason is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current plan
    const { data: currentPlan } = await supabase
      .from('ai_weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('id', current_plan_id)
      .single();

    if (!currentPlan) {
      return new Response(JSON.stringify({ error: 'Current plan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get fresh user data
    const userData = await aggregateUserData(userId);

    // Generate adaptation
    const adaptation = await llmEngine.adaptPlan(
      currentPlan.plan_data,
      userData,
      adaptation_reason
    );

    // Update plan in database
    const updatedPlanData = {
      ...currentPlan.plan_data,
      ...adaptation.adapted_plan,
    };

    await supabase
      .from('ai_weekly_plans')
      .update({
        plan_data: updatedPlanData,
        adaptation_history: [
          ...(currentPlan.adaptation_history || []),
          {
            timestamp: new Date().toISOString(),
            reason: adaptation_reason,
            changes: adaptation.changes_made,
          },
        ],
      })
      .eq('id', current_plan_id);

    // Track usage
    await trackAIUsage(userId, 'plan_adaptation', 0.05);

    const response: AIAdaptationResponse = {
      success: true,
      adapted_plan: adaptation.adapted_plan,
      adaptation_reason,
      changes_made: adaptation.changes_made,
      cost_estimate: 0.05,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adapting plan:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to adapt plan',
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGetCurrentPlan(userId: string): Promise<Response> {
  try {
    const weekStart = getWeekStart(new Date());

    const { data: currentPlan } = await supabase
      .from('ai_weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    if (!currentPlan) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No plan found for current week',
          suggestion: 'Generate a new weekly plan',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: currentPlan.plan_data,
        plan_id: currentPlan.id,
        created_at: currentPlan.created_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting current plan:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to get current plan',
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper functions
function getWeekStart(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
  return start.toISOString().split('T')[0];
}

async function handleCheckAdaptation(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { trigger_data } = body;

    if (!trigger_data?.user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id in trigger_data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Checking adaptation for user:', trigger_data.user_id);
    const adapted = await checkForPlanAdaptation(trigger_data.user_id, trigger_data);

    return new Response(
      JSON.stringify({
        success: true,
        adapted,
        message: adapted ? 'Plan adapted successfully' : 'No adaptation needed',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Adaptation check error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Adaptation check failed',
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function trackAIUsage(userId: string, featureType: string, costEstimate: number) {
  try {
    const today = new Date().toISOString().split('T')[0];

    await supabase.from('ai_usage_tracking').upsert(
      {
        user_id: userId,
        feature_type: featureType,
        usage_date: today,
        usage_count: 1,
        cost_estimate: costEstimate,
      },
      {
        onConflict: 'user_id,feature_type,usage_date',
        ignoreDuplicates: false,
      }
    );
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    // Don't fail the main request if usage tracking fails
  }
}
