// LLM Integration Engine
// Handles all OpenAI API interactions for plan generation and insights

import { UserDataSnapshot, AIWeeklyPlan, AIDailyInsight, AIAdaptationResponse } from './types.ts';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMEngine {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateWeeklyPlan(userData: UserDataSnapshot): Promise<AIWeeklyPlan> {
    const prompt = this.buildWeeklyPlanPrompt(userData);

    const response = await this.callOpenAI(prompt, {
      model: 'gpt-4-1106-preview',
      temperature: 0.7,
      max_tokens: 3000,
    });

    const planData = this.parseJSONResponse(response.choices[0].message.content);

    return this.formatWeeklyPlan(planData, userData);
  }

  async generateDailyInsight(
    userData: UserDataSnapshot,
    targetDate: string
  ): Promise<AIDailyInsight> {
    const prompt = this.buildDailyInsightPrompt(userData, targetDate);

    const response = await this.callOpenAI(prompt, {
      model: 'gpt-3.5-turbo',
      temperature: 0.8,
      max_tokens: 800,
    });

    const insightData = this.parseJSONResponse(response.choices[0].message.content);

    return this.formatDailyInsight(insightData, userData, targetDate);
  }

  async adaptPlan(
    currentPlan: AIWeeklyPlan,
    userData: UserDataSnapshot,
    adaptationReason: string
  ): Promise<AIAdaptationResponse> {
    const prompt = this.buildAdaptationPrompt(currentPlan, userData, adaptationReason);

    const response = await this.callOpenAI(prompt, {
      model: 'gpt-3.5-turbo',
      temperature: 0.6,
      max_tokens: 1500,
    });

    const adaptationData = this.parseJSONResponse(response.choices[0].message.content);

    return {
      success: true,
      adapted_plan: adaptationData.adapted_plan,
      adaptation_reason: adaptationReason,
      changes_made: adaptationData.changes_made || [],
      cost_estimate: this.estimateCost(response.usage?.total_tokens || 0),
    };
  }

  private buildWeeklyPlanPrompt(userData: UserDataSnapshot): string {
    const { cycle_data, exercise_data, nutrition_data, user_preferences } = userData;

    return `You are an expert women's health and fitness AI coach. Create a personalized weekly plan for a user based on their cycle phase and health data.

USER CONTEXT:
- Current cycle: Day ${cycle_data.current_phase.day_in_cycle}, ${cycle_data.current_phase.phase} phase
- Energy level: ${cycle_data.current_phase.energy_level}
- Fitness level: ${exercise_data.current_fitness_level}
- Primary goal: ${exercise_data.fitness_goals.primary_goal}
- Recent symptoms: ${cycle_data.recent_logs
      .slice(0, 3)
      .map((log) => log.symptoms?.join(', '))
      .filter(Boolean)
      .join('; ')}

EXERCISE PATTERNS:
- Completion rate: ${Math.round(exercise_data.workout_patterns.completion_rate * 100)}%
- Preferred duration: ${exercise_data.workout_patterns.preferred_duration} minutes
- Activity level: ${exercise_data.fitness_goals.activity_level}

NUTRITION PATTERNS:
- Daily calories target: ${nutrition_data.nutrition_goals.daily_calories}
- Protein target: ${nutrition_data.nutrition_goals.daily_protein}g
- Recent meal frequency: ${nutrition_data.eating_patterns.meal_frequency} meals/day
- Hydration goal: ${nutrition_data.nutrition_goals.daily_water}ml/day

CYCLE PREDICTIONS (next 7 days):
${this.generateCyclePredictions(cycle_data)
  .map((day, i) => `Day ${i + 1}: ${day.phase} phase, ${day.energy_level} energy`)
  .join('\n')}

Create a comprehensive weekly plan that:
1. Adapts exercise intensity to cycle phases
2. Optimizes nutrition for hormonal fluctuations
3. Provides daily energy management strategies
4. Includes specific cycle-aware recommendations

Return ONLY valid JSON in this exact format:
{
  "weekly_overview": {
    "plan_name": "Week of [date] - Cycle-Optimized Plan",
    "focus_areas": ["energy_management", "cycle_adaptation", "goal_progression"],
    "cycle_considerations": "Key adaptations for current cycle phase"
  },
  "exercise_plan": {
    "weekly_overview": {
      "total_workouts": 4,
      "total_minutes": 180,
      "focus_areas": ["strength", "cardio", "flexibility"],
      "cycle_adaptations": ["Lower intensity during menstrual phase", "Higher intensity during ovulatory phase"]
    },
    "daily_workouts": [
      {
        "date": "2024-01-01",
        "is_rest_day": false,
        "workout_type": "Strength Training",
        "duration_minutes": 45,
        "intensity": "moderate",
        "cycle_optimization": "Adapted for follicular phase energy building",
        "exercises": [
          {
            "name": "Bodyweight Squats",
            "category": "Lower Body",
            "duration_minutes": 10,
            "sets": 3,
            "reps": "12-15",
            "instructions": "Focus on form and controlled movement",
            "cycle_benefit": "Builds strength during energy-building phase"
          }
        ],
        "alternative_options": ["Replace with yoga if energy is low", "Add extra cardio if feeling energetic"]
      }
    ]
  },
  "nutrition_plan": {
    "weekly_overview": {
      "calorie_distribution": {"monday": 2000, "tuesday": 1950},
      "macro_focus_by_phase": {"follicular": ["protein", "complex_carbs"]},
      "hydration_goals": {"monday": 2000, "tuesday": 2000},
      "cycle_nutrition_priorities": ["Iron support during menstrual", "Energy foods during follicular"]
    },
    "daily_nutrition": [
      {
        "date": "2024-01-01",
        "calorie_target": 2000,
        "macro_targets": {"protein": 120, "carbs": 200, "fat": 65},
        "hydration_goal": 2000,
        "cycle_specific_nutrients": ["iron", "magnesium"],
        "meal_timing_suggestions": {"breakfast": "07:30", "lunch": "12:30", "dinner": "18:30"},
        "energy_support_foods": ["quinoa", "sweet potato", "lean protein"],
        "foods_to_emphasize": ["leafy greens", "berries", "nuts"],
        "foods_to_minimize": ["processed sugar", "excessive caffeine"]
      }
    ]
  },
  "daily_insights": [
    {
      "date": "2024-01-01",
      "cycle_day": ${cycle_data.current_phase.day_in_cycle},
      "predicted_energy": "building",
      "key_insights": ["Your energy is building in the follicular phase", "Great time for challenging workouts"],
      "workout_recommendations": ["Focus on strength training", "Try new exercise challenges"],
      "nutrition_focus": ["Emphasize protein and complex carbs", "Stay well hydrated"],
      "energy_management_tips": ["Take advantage of rising energy", "Don't overdo it if you're tired"],
      "symptom_prevention": ["Stay hydrated to prevent headaches", "Get adequate sleep"],
      "motivation_message": "Your body is gearing up for higher energy - perfect time to challenge yourself!"
    }
  ]
}`;
  }

  private buildDailyInsightPrompt(userData: UserDataSnapshot, targetDate: string): string {
    const { cycle_data, exercise_data, nutrition_data } = userData;

    return `Generate a personalized daily insight for ${targetDate} based on the user's cycle and health patterns.

USER CONTEXT:
- Current cycle day: ${cycle_data.current_phase.day_in_cycle}
- Current phase: ${cycle_data.current_phase.phase}
- Energy level: ${cycle_data.current_phase.energy_level}
- Recent symptoms: ${cycle_data.recent_logs
      .slice(0, 2)
      .map((log) => log.symptoms?.join(', '))
      .filter(Boolean)
      .join('; ')}

PATTERNS:
- Exercise completion rate: ${Math.round(exercise_data.workout_patterns.completion_rate * 100)}%
- Nutrition consistency: ${Math.round(nutrition_data.eating_patterns.macro_balance_consistency * 100)}%
- Typical energy in ${cycle_data.current_phase.phase}: ${cycle_data.cycle_patterns.typical_energy_by_phase[cycle_data.current_phase.phase]}

Return ONLY valid JSON:
{
  "date": "${targetDate}",
  "cycle_day": ${cycle_data.current_phase.day_in_cycle},
  "predicted_energy": "moderate",
  "key_insights": ["Today's key insight about cycle and energy"],
  "workout_recommendations": ["Specific workout advice for today"],
  "nutrition_focus": ["Nutrition priorities for today"],
  "energy_management_tips": ["How to optimize energy today"],
  "symptom_prevention": ["Preventive care tips"],
  "motivation_message": "Encouraging message for today"
}`;
  }

  private buildAdaptationPrompt(
    currentPlan: AIWeeklyPlan,
    userData: UserDataSnapshot,
    reason: string
  ): string {
    return `Adapt the current weekly plan based on new information: ${reason}

CURRENT PLAN SUMMARY:
- Exercise: ${currentPlan.exercise_plan.weekly_overview.total_workouts} workouts/week
- Nutrition: ${currentPlan.nutrition_plan.weekly_overview.cycle_nutrition_priorities.join(', ')}

USER CURRENT STATE:
- Cycle: Day ${userData.cycle_data.current_phase.day_in_cycle}, ${userData.cycle_data.current_phase.phase}
- Energy: ${userData.cycle_data.current_phase.energy_level}

ADAPTATION NEEDED: ${reason}

Return ONLY valid JSON with specific changes:
{
  "adapted_plan": {
    "exercise_plan": {
      "daily_workouts": [
        {
          "date": "2024-01-01",
          "intensity": "low",
          "workout_type": "Gentle Yoga",
          "duration_minutes": 20,
          "adaptation_reason": "Reduced intensity due to ${reason}"
        }
      ]
    },
    "nutrition_plan": {
      "daily_nutrition": [
        {
          "date": "2024-01-01",
          "foods_to_emphasize": ["comfort foods", "iron-rich foods"],
          "adaptation_reason": "Modified for symptom management"
        }
      ]
    }
  },
  "changes_made": ["Reduced workout intensity", "Added comfort food options", "Increased rest time"]
}`;
  }

  private async callOpenAI(prompt: string, options: any): Promise<OpenAIResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: [
          {
            role: 'system',
            content:
              "You are a women's health and fitness AI coach. Always respond with valid JSON only.",
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private parseJSONResponse(content: string): any {
    try {
      // Remove any markdown formatting
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Failed to parse JSON response:', content);
      throw new Error('Invalid JSON response from AI');
    }
  }

  private formatWeeklyPlan(planData: any, userData: UserDataSnapshot): AIWeeklyPlan {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week

    return {
      plan_id: crypto.randomUUID(),
      user_id: userData.user_id,
      week_start_date: weekStart.toISOString().split('T')[0],
      generation_context: {
        cycle_phase_at_generation: userData.cycle_data.current_phase.phase,
        predicted_phases: this.generateCyclePredictions(userData.cycle_data),
        user_goals_considered: [userData.exercise_data.fitness_goals.primary_goal],
        ai_model_used: 'gpt-4-1106-preview',
        generation_timestamp: new Date().toISOString(),
      },
      exercise_plan: planData.exercise_plan || this.getDefaultExercisePlan(),
      nutrition_plan: planData.nutrition_plan || this.getDefaultNutritionPlan(),
      daily_insights: planData.daily_insights || [],
      adaptation_triggers: this.generateAdaptationTriggers(userData),
      success_metrics: {
        target_workout_completion: 0.8,
        target_nutrition_adherence: 0.75,
        predicted_energy_correlation: 0.7,
      },
    };
  }

  private formatDailyInsight(
    insightData: any,
    userData: UserDataSnapshot,
    targetDate: string
  ): AIDailyInsight {
    return {
      date: targetDate,
      cycle_day: userData.cycle_data.current_phase.day_in_cycle,
      predicted_energy: insightData.predicted_energy || 'moderate',
      key_insights: insightData.key_insights || ['Stay hydrated and listen to your body'],
      workout_recommendations: insightData.workout_recommendations || [
        'Light exercise based on energy',
      ],
      nutrition_focus: insightData.nutrition_focus || ['Balanced meals'],
      energy_management_tips: insightData.energy_management_tips || ['Get adequate rest'],
      symptom_prevention: insightData.symptom_prevention || ['Stay consistent with healthy habits'],
      motivation_message: insightData.motivation_message || "You're doing great - keep going!",
    };
  }

  private generateCyclePredictions(cycleData: any) {
    const predictions = [];
    const currentDay = cycleData.current_phase.day_in_cycle;
    const cycleLength = cycleData.cycle_settings.cycle_length;

    for (let i = 0; i < 7; i++) {
      const futureDay = ((currentDay + i - 1) % cycleLength) + 1;
      const date = new Date();
      date.setDate(date.getDate() + i);

      let phase: string, energy: string;

      if (futureDay <= 5) {
        phase = 'menstrual';
        energy = 'low';
      } else if (futureDay <= 13) {
        phase = 'follicular';
        energy = 'building';
      } else if (futureDay <= 16) {
        phase = 'ovulatory';
        energy = 'high';
      } else {
        phase = 'luteal';
        energy = 'declining';
      }

      predictions.push({
        date: date.toISOString().split('T')[0],
        phase,
        energy_level: energy,
      });
    }

    return predictions;
  }

  private generateAdaptationTriggers(userData: UserDataSnapshot) {
    return [
      {
        trigger_type: 'symptom_report' as const,
        condition: 'High cramps or fatigue reported',
        adaptation_instructions: 'Reduce exercise intensity, focus on gentle movement',
        priority: 'high' as const,
      },
      {
        trigger_type: 'energy_change' as const,
        condition: 'Energy level drops significantly',
        adaptation_instructions: 'Adjust workout intensity, emphasize rest and nutrition',
        priority: 'medium' as const,
      },
    ];
  }

  private getDefaultExercisePlan() {
    return {
      weekly_overview: {
        total_workouts: 3,
        total_minutes: 120,
        focus_areas: ['flexibility', 'light_cardio'],
        cycle_adaptations: ['Gentle movement during low energy'],
      },
      daily_workouts: [],
    };
  }

  private getDefaultNutritionPlan() {
    return {
      weekly_overview: {
        calorie_distribution: {},
        macro_focus_by_phase: {},
        hydration_goals: {},
        cycle_nutrition_priorities: ['Stay hydrated', 'Eat regular meals'],
      },
      daily_nutrition: [],
    };
  }

  private estimateCost(tokens: number): number {
    // Rough cost estimation based on OpenAI pricing
    // GPT-4: ~$0.03 per 1K tokens
    // GPT-3.5: ~$0.002 per 1K tokens
    return (tokens / 1000) * 0.02; // Average estimate
  }
}
