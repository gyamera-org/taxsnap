// Auto-generation and adaptation logic for AI Weekly Planner

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { aggregateUserData } from './data-aggregator.ts';
import { LLMEngine } from './llm-engine.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const llmEngine = new LLMEngine(Deno.env.get('OPENAI_API_KEY') ?? '');

// Note: Auto-generation removed for MVP
// Users will manually generate plans via the app

/**
 * Check if a plan needs adaptation based on recent user activity
 */
export async function checkForPlanAdaptation(userId: string, triggerData: any): Promise<boolean> {
  console.log(`Checking adaptation need for user: ${userId}`, triggerData);

  try {
    // Get current active plan
    const weekStart = getWeekStart(new Date());
    const { data: currentPlan } = await supabase
      .from('ai_weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    if (!currentPlan) {
      console.log('No current plan found, skipping adaptation');
      return false;
    }

    // Determine if adaptation is needed based on trigger type
    const adaptationReason = determineAdaptationReason(triggerData);

    if (!adaptationReason) {
      console.log('No adaptation needed for this trigger');
      return false;
    }

    // Generate adaptation
    const userData = await aggregateUserData(userId);
    const adaptation = await llmEngine.adaptPlan(currentPlan.plan_data, userData, adaptationReason);

    // Update plan with adaptation
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
            trigger: triggerData,
            reason: adaptationReason,
            changes: adaptation.changes_made,
          },
        ],
      })
      .eq('id', currentPlan.id);

    // Track usage
    await trackAIUsage(userId, 'plan_adaptation', 0.05);

    console.log(`Plan adapted for user ${userId}: ${adaptationReason}`);
    return true;
  } catch (error) {
    console.error('Error checking plan adaptation:', error);
    return false;
  }
}

/**
 * Determine if adaptation is needed based on trigger data
 */
function determineAdaptationReason(triggerData: any): string | null {
  const { table, event_type, new_record, old_record } = triggerData;

  switch (table) {
    case 'period_logs':
      // Check for high symptoms or energy changes
      const symptoms = new_record?.symptoms || [];
      if (symptoms.includes('severe_cramps') || symptoms.includes('extreme_fatigue')) {
        return 'High symptom severity reported - reducing exercise intensity';
      }
      if (new_record?.mood === 'anxious' || new_record?.mood === 'irritable') {
        return 'Mood changes detected - adjusting to stress-relief activities';
      }
      break;

    case 'exercise_entries':
      // Check for missed workouts or low completion
      if (event_type === 'DELETE') {
        return 'Workout skipped - redistributing weekly exercise load';
      }
      if (new_record?.intensity === 'low' && new_record?.duration_minutes < 15) {
        return 'Low energy workout detected - adjusting intensity for rest of week';
      }
      break;

    case 'supplement_logs':
      // Check for missed supplements that might affect energy
      if (!new_record?.taken && old_record?.supplement_name?.includes('iron')) {
        return 'Iron supplement missed - may affect energy, adjusting workout intensity';
      }
      break;

    default:
      return null;
  }

  return null;
}

// Helper functions
function getWeekStart(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
  return start.toISOString().split('T')[0];
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
  }
}
