import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'npm:openai';
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
});
function jsonError(message, status = 500) {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
async function uploadBase64Image(dataUrl) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 image format');
  const [, mimeType, base64] = match;
  const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const ext = mimeType.split('/')[1];
  const filename = `scan-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(filename, buffer, {
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  await new Promise((res) => setTimeout(res, 500));
  const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
  if (!data || !data.publicUrl) throw new Error('Could not get public URL for uploaded image.');
  return data.publicUrl;
}
async function searchWithSerper(imageUrl) {
  const serperApiKey = Deno.env.get('SERPER_API_KEY');
  if (!serperApiKey) throw new Error('SERPER_API_KEY is not set');
  try {
    new URL(imageUrl);
  } catch {
    throw new Error(`Invalid URL format: ${imageUrl}`);
  }
  const res = await fetch('https://google.serper.dev/lens', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: imageUrl,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Serper error: ${err}`);
  }
  const result = await res.json();
  const product_links = (result.organic ?? [])
    .slice(0, 3)
    .map((item) => ({
      title: item.title || 'Product',
      url: item.link || '',
      source: item.source || 'Unknown',
      thumbnailUrl: item.thumbnailUrl || item.imageUrl || null,
    }))
    .filter((link) => link.title && link.url);
  const productName = product_links.length > 0 ? product_links[0].title : 'Unknown Product';
  return {
    productName,
    product_links,
  };
}
async function enrichWithGPT(productName, product_links) {
  const prompt = `You are a friendly beauty product expert. Your job is to explain each ingredient in simple, clear, everyday language that anyone can understand. Avoid scientific jargon. Be warm, helpful, and conversational, like you're talking to a friend.

  Based on the product name and links, return only valid JSON in the structure below:
  
  {
    "name": string,
    "brand": string,
    "category": string,
    "safety_score": number (1-10),
    "ingredients": string[],
    "key_ingredients": [
      {
        "name": string,
        "type": "beneficial" | "harmful" | "neutral",
        "description": string, // use plain language here!
        "effect": string        // explain exactly what it does to skin or hair
      }
    ],
    "product_links": [
      {
        "title": string,
        "url": string,
        "source": string,
        "thumbnailUrl": string
      }
    ]
  }
  
  Instructions:
  - Only return JSON. No commentary.
  - For each key ingredient, describe what it does and how it affects the skin or hair. Use plain language. For example:
    "Sulfates: While they’re great at cleaning, they can also strip your hair’s natural oils and make it dry or frizzy."
  - Don't use technical or scientific terms unless they’re explained simply.
  - Limit key_ingredients to 10 max, prioritizing the most impactful ones.
  `;

  const userContent = `Product Name: ${productName}
Product Links:\n${JSON.stringify(product_links, null, 2)}`;
  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: userContent,
      },
    ],
  });
  const message = chat.choices[0]?.message?.content ?? '';
  try {
    const match = message.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No valid JSON found');
  } catch {
    throw new Error('Failed to parse JSON from OpenAI');
  }
}
Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonError('Method Not Allowed', 405);
  try {
    const { image_url } = await req.json();
    if (!image_url) return jsonError('image_url is required', 400);
    if (!image_url.startsWith('data:image/') && !/^https?:\/\//.test(image_url)) {
      return jsonError('Invalid image_url format', 400);
    }
    const finalImageUrl = image_url.startsWith('data:image/')
      ? await uploadBase64Image(image_url)
      : image_url;
    const { productName, product_links } = await searchWithSerper(finalImageUrl);
    let gptResult = {};
    try {
      gptResult = await enrichWithGPT(productName, product_links);
      const beautyKeywords = [
        'skin',
        'hair',
        'body',
        'face',
        'fragrance',
        'makeup',
        'cosmetic',
        'nail',
        'shaving',
        'deodorant',
        'beauty',
        'lotion',
        'cream',
        'gel',
        'serum',
        'moisturizer',
        'cleanser',
        'mask',
        'scrub',
        'oil',
        'balm',
        'toner',
        'conditioner',
        'shampoo',
        'sunscreen',
      ];
      const checkText = `${gptResult.category ?? ''} ${gptResult.name ?? ''}`.toLowerCase();
      const isBeauty = beautyKeywords.some((keyword) => checkText.includes(keyword));
      if (!isBeauty) {
        return jsonError(
          `We currently only support scanning beauty and personal care products. Detected: "${gptResult.category ?? 'Unknown'}".`,
          400
        );
      }
    } catch {
      gptResult = {};
    }
    const keyIngredients = Array.isArray(gptResult.key_ingredients)
      ? gptResult.key_ingredients.slice(0, 10)
      : [];
    const totalAnalyzed = keyIngredients.length;
    const harmfulCount = keyIngredients.filter((k) => k.type === 'harmful').length;
    let computedSafetyScore = 10;
    if (totalAnalyzed > 0) {
      const cautionRatio = harmfulCount / totalAnalyzed;
      computedSafetyScore = Math.round((1 - cautionRatio) * 10);
    }
    const result = {
      id: crypto.randomUUID(),
      name: gptResult.name || productName || 'Unknown Product',
      brand: gptResult.brand || 'Unknown Brand',
      category: gptResult.category || 'Other',
      safety_score: computedSafetyScore,
      ingredients: Array.isArray(gptResult.ingredients) ? gptResult.ingredients : [],
      key_ingredients: Array.isArray(gptResult.key_ingredients)
        ? gptResult.key_ingredients.map((k) => ({
            name: k.name ?? 'Unknown',
            type: ['beneficial', 'harmful', 'neutral'].includes(k.type) ? k.type : 'neutral',
            description: k.description ?? '',
            effect: k.effect ?? '',
          }))
        : [],
      product_links:
        Array.isArray(gptResult.product_links) && gptResult.product_links.length > 0
          ? gptResult.product_links
          : product_links,
      image_url: finalImageUrl,
      isFavorite: false,
      scannedAt: new Date().toISOString(),
      savedAt: null,
    };
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return jsonError(err.message || 'Internal server error');
  }
});
