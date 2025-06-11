import OpenAI from 'openai';

export interface IngredientAnalysis {
  sulfateFree: boolean;
  siliconeFree: boolean;
  crueltyFree: boolean;
  coilyHairFriendly: boolean;
  keyIngredients: Array<{
    name: string;
    purpose: string;
    effect: string;
    beneficial: boolean;
  }>;
  analysis: {
    moisturizingLevel: 'low' | 'medium' | 'high';
    cleansingStrength: 'gentle' | 'moderate' | 'strong';
    suitableHairTypes: string[];
    potentialConcerns: string[];
    overallRecommendation: string;
  };
}

const analyzeIngredientsFunction = {
  name: 'analyze_ingredients',
  description:
    'Analyze hair care product ingredients and determine product properties, especially for Black hair care (types 3B to 4C).',
  parameters: {
    type: 'object',
    properties: {
      sulfateFree: {
        type: 'boolean',
        description: 'True if product contains no SLS/SLES (Sodium Lauryl/Laureth Sulfate)',
      },
      siliconeFree: {
        type: 'boolean',
        description:
          'True if product contains no silicones (ingredients ending in -cone, -conol, -silane, -siloxane)',
      },
      crueltyFree: {
        type: 'boolean',
        description: 'True if product appears to be cruelty-free based on ingredients',
      },
      coilyHairFriendly: {
        type: 'boolean',
        description: 'True if product is suitable for coily/kinky hair types (4A-4C)',
      },
      keyIngredients: {
        type: 'array',
        description: 'List of 3-5 most important ingredients and their effects',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            purpose: { type: 'string' },
            effect: { type: 'string' },
            beneficial: { type: 'boolean' },
          },
          required: ['name', 'purpose', 'effect', 'beneficial'],
        },
      },
      analysis: {
        type: 'object',
        properties: {
          moisturizingLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description:
              'Level of moisturizing properties based on humectants, emollients, and oils present',
          },
          cleansingStrength: {
            type: 'string',
            enum: ['gentle', 'moderate', 'strong'],
            description: 'Strength of cleansing based on surfactants and cleansing agents',
          },
          suitableHairTypes: {
            type: 'array',
            items: { type: 'string' },
            description:
              'List of hair types this product is suitable for (e.g., ["3A", "3B", "4A"])',
          },
          potentialConcerns: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of potential concerns or warnings about ingredients',
          },
          overallRecommendation: {
            type: 'string',
            description: 'Overall recommendation and summary of product analysis',
          },
        },
        required: [
          'moisturizingLevel',
          'cleansingStrength',
          'suitableHairTypes',
          'potentialConcerns',
          'overallRecommendation',
        ],
      },
    },
    required: [
      'sulfateFree',
      'siliconeFree',
      'crueltyFree',
      'coilyHairFriendly',
      'keyIngredients',
      'analysis',
    ],
  },
};

export async function analyzeIngredients(ingredients: string): Promise<IngredientAnalysis> {
  console.log(
    '🔬 Starting OpenAI analysis for ingredients:',
    ingredients.substring(0, 100) + '...'
  );

  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OpenAI API key not found. Please add EXPO_PUBLIC_OPENAI_API_KEY to your environment variables.'
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional hair care ingredient analyzer specializing in Black hair care (types 3B to 4C).
ANALYSIS GUIDELINES:
- Check for sulfates (SLS/SLES)
- Look for silicones (-cone, -conol, -silane, -siloxane endings)
- Assess moisturizing ingredients (oils, butters, glycerin)
- Identify key ingredients and their effects
- Consider coily hair needs (moisture, gentle cleansing)
- Flag any harsh or drying ingredients
- Focus on textured hair types (3A-4C)`,
        },
        {
          role: 'user',
          content: `Analyze these hair care product ingredients:\n\n${ingredients}`,
        },
      ],
      functions: [analyzeIngredientsFunction],
      function_call: { name: 'analyze_ingredients' },
    });

    const functionCall = response.choices[0]?.message?.function_call;

    if (!functionCall?.arguments) {
      throw new Error('No analysis results in OpenAI response');
    }

    const analysis = JSON.parse(functionCall.arguments);

    return analysis as IngredientAnalysis;
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw new Error(
      `Failed to analyze ingredients: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
