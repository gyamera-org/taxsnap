import 'https://deno.land/x/xhr@0.3.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IRS Schedule C categories for the AI to choose from
const VALID_CATEGORIES = [
  'advertising',
  'car_truck',
  'commissions_fees',
  'contract_labor',
  'depletion',
  'depreciation',
  'employee_benefits',
  'insurance',
  'interest_mortgage',
  'interest_other',
  'legal_professional',
  'office_expense',
  'pension_profit_sharing',
  'rent_equipment',
  'rent_property',
  'repairs_maintenance',
  'supplies',
  'taxes_licenses',
  'travel',
  'meals',
  'utilities',
  'wages',
  'other',
  'energy_efficient',
  'home_office',
  'cost_of_goods',
];

const EXTRACTION_PROMPT = `Analyze this receipt image and extract the following information. Be precise and only extract what you can clearly see.

Extract:
1. Vendor/Merchant name (the store or business name)
2. Date of purchase (format as YYYY-MM-DD)
3. Total amount (the final total paid, as a number without currency symbol)
4. Currency (default to USD if not visible)
5. Suggest ONE category from this list that best fits this purchase: ${VALID_CATEGORIES.join(', ')}

Important:
- For the total, extract the FINAL total including tax, not subtotals
- If you cannot clearly read a field, set it to null
- The date must be in YYYY-MM-DD format
- The total should be a number (e.g., 42.50, not "$42.50")

Respond ONLY with a valid JSON object in this exact format:
{
  "vendor": "Store Name" or null,
  "date": "YYYY-MM-DD" or null,
  "total": 42.50 or null,
  "currency": "USD",
  "suggestedCategory": "category_id" or null,
  "confidence": 0.85
}

The confidence should be between 0 and 1, representing how confident you are in the overall extraction accuracy.`;

interface ExtractedData {
  vendor: string | null;
  date: string | null;
  total: number | null;
  currency: string;
  suggestedCategory: string | null;
  confidence: number;
}

// Try OpenAI GPT-4o Vision
async function tryOpenAI(imageBase64: string, mimeType: string): Promise<ExtractedData> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  console.log('Attempting OpenAI GPT-4o extraction...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return parseAIResponse(content);
}

// Try Anthropic Claude Vision
async function tryClaude(imageBase64: string, mimeType: string): Promise<ExtractedData> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  console.log('Attempting Claude Vision extraction...');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', errorText);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error('No response from Claude');
  }

  return parseAIResponse(content);
}

// Parse AI response to ExtractedData
function parseAIResponse(content: string): ExtractedData {
  // Try to extract JSON from the response (in case AI adds extra text)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('No JSON found in response:', content);
    throw new Error('No JSON found in response');
  }

  const extracted = JSON.parse(jsonMatch[0]);

  return {
    vendor: extracted.vendor || null,
    date: extracted.date || null,
    total: extracted.total ? Math.round(extracted.total * 100) : null, // Convert to cents
    currency: extracted.currency || 'USD',
    suggestedCategory: VALID_CATEGORIES.includes(extracted.suggestedCategory || '')
      ? extracted.suggestedCategory
      : null,
    confidence:
      typeof extracted.confidence === 'number'
        ? Math.min(1, Math.max(0, extracted.confidence))
        : 0.5,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with the request's auth
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');

    // Create a Supabase client that will verify the JWT
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader || '' },
      },
    });

    // If we have an auth header, verify it by getting the user
    let userId: string | null = null;

    if (authHeader) {
      // Extract token and verify with Supabase
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

      if (userError || !user) {
        console.error('Auth error:', userError?.message);
        return new Response(JSON.stringify({
          error: 'Authentication failed',
          details: userError?.message
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = user.id;
      console.log('Authenticated user:', userId);
    } else {
      // No auth header - return error
      return new Response(JSON.stringify({
        error: 'No authorization header',
        hint: 'Authorization header not found in request'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageBase64, mimeType = 'image/jpeg' } = await req.json();

    if (!imageBase64) {
      throw new Error('imageBase64 is required');
    }

    let result: ExtractedData;
    let usedProvider: string;

    // Try OpenAI first, fall back to Claude
    try {
      result = await tryOpenAI(imageBase64, mimeType);
      usedProvider = 'openai';
      console.log('Successfully extracted with OpenAI');
    } catch (openaiError) {
      console.error('OpenAI failed, trying Claude:', openaiError.message);

      try {
        result = await tryClaude(imageBase64, mimeType);
        usedProvider = 'anthropic';
        console.log('Successfully extracted with Claude');
      } catch (claudeError) {
        console.error('Claude also failed:', claudeError.message);
        throw new Error(
          `Both AI providers failed. OpenAI: ${openaiError.message}, Claude: ${claudeError.message}`
        );
      }
    }

    return new Response(JSON.stringify({ ...result, provider: usedProvider }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process receipt',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
