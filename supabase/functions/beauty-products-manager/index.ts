import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface UserBeautyProduct {
  name: string;
  brand: string;
  category: string;
  product_type: 'skincare' | 'haircare';
  safety_score?: number;
  ingredients?: string[];
  key_ingredients?: Array<{
    name: string;
    type: 'beneficial' | 'harmful' | 'neutral';
    description?: string;
  }>;
  usage_frequency?: 'daily' | 'weekly' | '2-3x/week' | 'as_needed';
  cycle_phase_preference?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'any';
  notes?: string;
  is_active?: boolean;
  scanned_product_id?: string;
}

interface ProductUsageLog {
  product_id: string;
  date: string;
  used: boolean;
  cycle_phase?: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  skin_reaction?: 'positive' | 'neutral' | 'negative';
  notes?: string;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Get cycle-specific beauty product recommendations
function getCycleBeautyRecommendations(
  cyclePhase: string,
  productType: 'skincare' | 'haircare'
): any[] {
  const skincareRecommendations = {
    menstrual: [
      {
        category: 'Cleanser',
        ingredients: ['salicylic acid', 'gentle ceramides'],
        avoid: ['harsh scrubs', 'strong retinoids'],
        reason: 'Gentle cleansing during hormonal sensitivity',
        priority: 'high',
      },
      {
        category: 'Moisturizer',
        ingredients: ['hyaluronic acid', 'niacinamide', 'ceramides'],
        avoid: ['heavy oils'],
        reason: 'Hydration without clogging pores during breakouts',
        priority: 'high',
      },
    ],
    follicular: [
      {
        category: 'Serum',
        ingredients: ['vitamin c', 'peptides', 'antioxidants'],
        avoid: [],
        reason: 'Boost radiance during energy phase',
        priority: 'medium',
      },
      {
        category: 'Exfoliant',
        ingredients: ['aha', 'bha', 'lactic acid'],
        avoid: ['over-exfoliation'],
        reason: 'Skin can handle more active ingredients',
        priority: 'medium',
      },
    ],
    ovulatory: [
      {
        category: 'Sunscreen',
        ingredients: ['zinc oxide', 'titanium dioxide'],
        avoid: ['chemical sunscreens if sensitive'],
        reason: 'Protect glowing skin at peak hormone levels',
        priority: 'high',
      },
      {
        category: 'Treatment',
        ingredients: ['retinol', 'bakuchiol'],
        avoid: [],
        reason: 'Skin tolerance is highest',
        priority: 'medium',
      },
    ],
    luteal: [
      {
        category: 'Cleanser',
        ingredients: ['tea tree', 'salicylic acid'],
        avoid: ['harsh scrubs'],
        reason: 'Combat pre-period breakouts',
        priority: 'high',
      },
      {
        category: 'Face Mask',
        ingredients: ['clay', 'charcoal', 'niacinamide'],
        avoid: ['drying alcohols'],
        reason: 'Control oil and prevent breakouts',
        priority: 'medium',
      },
    ],
  };

  const haircareRecommendations = {
    menstrual: [
      {
        category: 'Shampoo',
        ingredients: ['gentle sulfates', 'keratin'],
        avoid: ['harsh sulfates', 'strong fragrances'],
        reason: 'Gentle cleansing during sensitivity',
        priority: 'high',
      },
    ],
    follicular: [
      {
        category: 'Hair Mask',
        ingredients: ['protein', 'biotin', 'vitamins'],
        avoid: [],
        reason: 'Strengthen hair during growth phase',
        priority: 'medium',
      },
    ],
    ovulatory: [
      {
        category: 'Hair Oil',
        ingredients: ['argan oil', 'coconut oil'],
        avoid: ['heavy silicones'],
        reason: 'Enhance natural shine',
        priority: 'medium',
      },
    ],
    luteal: [
      {
        category: 'Dry Shampoo',
        ingredients: ['rice starch', 'clay'],
        avoid: ['alcohol-heavy formulas'],
        reason: 'Manage increased oil production',
        priority: 'medium',
      },
    ],
  };

  const recommendations =
    productType === 'skincare' ? skincareRecommendations : haircareRecommendations;
  return recommendations[cyclePhase as keyof typeof recommendations] || [];
}

Deno.serve(async (req) => {
  console.log('🚀 Beauty Products Manager - Request received:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  if (req.method === 'OPTIONS') {
    console.log('📝 Handling CORS preflight request');
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const url = new URL(req.url);

    // For POST requests, get the endpoint from the request body
    let path = '';
    let requestBody: any = {};

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      try {
        requestBody = await req.json();
        path = requestBody.endpoint || 'product';
        console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
      } catch (e) {
        console.log('❌ Failed to parse request body:', e);
        return errorResponse('Invalid JSON body');
      }
    } else {
      // For GET requests, use URL path or query params
      const pathParts = url.pathname.split('/');
      path =
        url.searchParams.get('endpoint') ||
        (pathParts[pathParts.length - 1] === 'beauty-products-manager'
          ? 'products'
          : pathParts[pathParts.length - 1]);
    }

    console.log('📍 Parsed request:', {
      fullPath: url.pathname,
      path,
      method: req.method,
      searchParams: Object.fromEntries(url.searchParams),
    });

    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Auth header present:', !!authHeader);

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '');

    if (!user) {
      console.log('❌ No authenticated user found');
      return errorResponse('Unauthorized', 401);
    }

    console.log('✅ User authenticated:', { userId: user.id, email: user.email });

    switch (req.method) {
      case 'GET':
        if (path === 'products') {
          // Get user's beauty products
          const productType = url.searchParams.get('type'); // 'skincare' or 'haircare'
          const category = url.searchParams.get('category');

          let query = supabase
            .from('user_beauty_products')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (productType) {
            query = query.eq('product_type', productType);
          }

          if (category) {
            query = query.eq('category', category);
          }

          const { data: products, error } = await query;

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(products || []);
        }

        if (path === 'recommendations') {
          // Get cycle-specific recommendations
          const cyclePhase = url.searchParams.get('cycle_phase') || 'follicular';
          const productType = (url.searchParams.get('product_type') || 'skincare') as
            | 'skincare'
            | 'haircare';

          const recommendations = getCycleBeautyRecommendations(cyclePhase, productType);
          return jsonResponse(recommendations);
        }

        if (path === 'logs') {
          // Get usage logs for date range
          const startDate =
            url.searchParams.get('start_date') || new Date().toISOString().split('T')[0];
          const endDate = url.searchParams.get('end_date') || startDate;
          const productId = url.searchParams.get('product_id');

          let query = supabase
            .from('beauty_product_logs')
            .select(
              `
              *,
              user_beauty_products!inner(name, brand, category, product_type)
            `
            )
            .eq('user_id', user.id)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

          if (productId) {
            query = query.eq('product_id', productId);
          }

          const { data: logs, error } = await query;

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(logs || []);
        }

        break;

      case 'POST':
        if (path === 'products') {
          // Handle GET-like request for products list (using POST to pass endpoint)
          const productType = new URLSearchParams(requestBody.endpoint.split('?')[1] || '').get(
            'type'
          );
          const category = new URLSearchParams(requestBody.endpoint.split('?')[1] || '').get(
            'category'
          );

          let query = supabase
            .from('user_beauty_products')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (productType) {
            query = query.eq('product_type', productType);
          }

          if (category) {
            query = query.eq('category', category);
          }

          const { data: products, error } = await query;

          if (error) {
            console.log('❌ Database error fetching products:', error);
            return errorResponse(error.message);
          }

          console.log('✅ Products fetched successfully:', products?.length || 0, 'products');
          return jsonResponse(products || []);
        }

        if (path === 'product') {
          console.log('🆕 Adding new beauty product');

          try {
            // Remove the endpoint field from the body since it's not part of the product data
            const { endpoint, ...body } = requestBody as UserBeautyProduct & { endpoint?: string };
            console.log('📦 Product data:', JSON.stringify(body, null, 2));

            const productData = {
              user_id: user.id,
              name: body.name,
              brand: body.brand,
              category: body.category,
              product_type: body.product_type,
              safety_score: body.safety_score || 8,
              ingredients: body.ingredients || [],
              key_ingredients: body.key_ingredients || [],
              usage_frequency: body.usage_frequency || 'daily',
              cycle_phase_preference: body.cycle_phase_preference || 'any',
              notes: body.notes,
              is_active: body.is_active !== false,
              scanned_product_id: body.scanned_product_id,
            };

            console.log('💾 Attempting to insert product:', JSON.stringify(productData, null, 2));

            const { data, error } = await supabase
              .from('user_beauty_products')
              .upsert(productData)
              .select()
              .single();

            if (error) {
              console.log('❌ Database error:', error);
              return errorResponse(error.message);
            }

            console.log('✅ Product added successfully:', JSON.stringify(data, null, 2));
            return jsonResponse(data);
          } catch (parseError) {
            console.log('❌ JSON parse error:', parseError);
            return errorResponse('Invalid JSON body');
          }
        }

        if (path === 'log') {
          // Log product usage
          const body: ProductUsageLog = await req.json();

          const { data, error } = await supabase
            .from('beauty_product_logs')
            .upsert({
              user_id: user.id,
              product_id: body.product_id,
              date: body.date,
              used: body.used,
              cycle_phase: body.cycle_phase,
              skin_reaction: body.skin_reaction,
              notes: body.notes,
            })
            .select()
            .single();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

        if (path === 'import-scan') {
          // Import from scanned product
          const { scanned_product_id } = await req.json();

          // Get the scanned product details
          const { data: scannedProduct, error: scanError } = await supabase
            .from('scanned_products')
            .select('*')
            .eq('id', scanned_product_id)
            .eq('user_id', user.id)
            .single();

          if (scanError || !scannedProduct) {
            return errorResponse('Scanned product not found');
          }

          // Determine product type based on category
          const productType = [
            'shampoo',
            'conditioner',
            'hair mask',
            'hair oil',
            'hair spray',
            'styling cream',
          ].some((hairCategory) => scannedProduct.category.toLowerCase().includes(hairCategory))
            ? 'haircare'
            : 'skincare';

          // Create beauty product from scan
          const { data, error } = await supabase
            .from('user_beauty_products')
            .upsert({
              user_id: user.id,
              name: scannedProduct.name,
              brand: scannedProduct.brand,
              category: scannedProduct.category,
              product_type: productType,
              safety_score: scannedProduct.safety_score,
              ingredients: scannedProduct.ingredients || [],
              key_ingredients: scannedProduct.key_ingredients || [],
              usage_frequency: 'daily',
              cycle_phase_preference: 'any',
              scanned_product_id: scannedProduct.id,
              is_active: true,
            })
            .select()
            .single();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

        break;

      case 'PUT':
        if (path === 'product') {
          // Update existing product
          const body: UserBeautyProduct & { id: string } = await req.json();

          const { data, error } = await supabase
            .from('user_beauty_products')
            .update({
              name: body.name,
              brand: body.brand,
              category: body.category,
              product_type: body.product_type,
              safety_score: body.safety_score,
              ingredients: body.ingredients,
              key_ingredients: body.key_ingredients,
              usage_frequency: body.usage_frequency,
              cycle_phase_preference: body.cycle_phase_preference,
              notes: body.notes,
              is_active: body.is_active,
            })
            .eq('id', body.id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

        break;

      case 'DELETE':
        if (path === 'product') {
          // Delete product
          const { id } = await req.json();

          const { error } = await supabase
            .from('user_beauty_products')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse({ success: true });
        }

        break;

      default:
        return errorResponse('Method not allowed', 405);
    }

    console.log('❓ Endpoint not found:', { method: req.method, path });
    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('💥 Beauty products manager error:', error);
    console.error('💥 Error stack:', error.stack);
    return errorResponse('Internal server error', 500);
  }
});
