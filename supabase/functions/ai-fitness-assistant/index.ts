import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.24.0';
import Groq from 'https://esm.sh/groq-sdk@0.3.0';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
function jsonError(message, status = 400) {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }
  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonError('Missing authorization header', 401);
    }
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );
    // Verify user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonError('Unauthorized', 401);
    }
    // Parse request body
    const { message, context = 'fitness' } = await req.json();
    if (!message || typeof message !== 'string') {
      return jsonError('Message is required and must be a string');
    }
    // Get user's fitness goals for context
    let userContext = '';
    try {
      const { data: fitnessGoals } = await supabaseClient
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (fitnessGoals) {
        userContext = `User's current fitness goals: Primary goal is ${fitnessGoals.primary_goal}, works out ${fitnessGoals.workout_frequency} times per week, experience level is ${fitnessGoals.experience_level}.`;
      }
    } catch (error) {}
    // Create AI client (OpenAI primary, Groq fallback)
    let aiClient;
    let model;
    try {
      aiClient = new OpenAI({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      });
      model = 'gpt-4o-mini';
    } catch (error) {
      aiClient = new Groq({
        apiKey: Deno.env.get('GROQ_API_KEY'),
      });
      model = 'llama-3.1-8b-instant';
    }
    // System prompt for women's fitness assistant
    const systemPrompt = `You are a friendly women's fitness assistant. Keep responses SHORT, conversational, and helpful.

RULES:
- Max 2-3 sentences per response
- Use casual, supportive tone like talking to a friend
- Focus on realistic, achievable advice for women
- NO medical advice or extreme approaches
- If asked about non-fitness topics, politely redirect

STYLE:
- Start with empathy ("I get it!" "That's totally normal!")
- Give 1-2 specific, actionable tips
- End with encouragement
- Use "you" and "your" 
- NO formal bullet points or lengthy explanations

${userContext ? `USER INFO: ${userContext}` : ''}

Keep it friendly, brief, and practical!`;
    // Generate response
    const completion = await aiClient.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return jsonError('Failed to generate response');
    }
    return new Response(
      JSON.stringify({
        response,
        context: 'women_fitness_assistant',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in AI fitness assistant:', error);
    return jsonError('Internal server error', 500);
  }
});
