// deno-lint-ignore-file no-explicit-any
import type { FoodAnalysis } from './types.ts';
import { jsonError, validateNutrition, overallConfidence, clamp } from './utils.ts';
import { analyzeImageWithOpenAI, analyzeImageWithGroqFallback } from './ai-analysis.ts';
import { enrichPackagedItems } from './enrichment.ts';
import { upsertMealEntry } from './database.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ---------- IMAGE STORAGE ----------
async function uploadFoodImage(imageBase64: string, userId: string): Promise<string | null> {
  try {
    // Handle both full data URLs and raw base64 strings
    let base64Data: string;
    let mimeType: string;

    if (imageBase64.startsWith('data:image/')) {
      // Extract base64 data and mime type from data URL
      const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (!match) throw new Error('Invalid data URL format');
      [, mimeType, base64Data] = match;
    } else {
      // Raw base64 - assume JPEG (most common from mobile cameras)
      base64Data = imageBase64;
      mimeType = 'image/jpeg';
    }

    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate unique filename
    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `${userId}/food-scan-${Date.now()}.${ext}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage.from('food-images').upload(filename, bytes, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      console.error('Image upload error:', error);

      // Try to create the bucket if it doesn't exist
      if (error.message.includes('Bucket not found')) {
        console.log('🪣 Creating food-images bucket...');
        const { error: bucketError } = await supabase.storage.createBucket('food-images', {
          public: true,
        });

        if (!bucketError) {
          console.log('✅ Bucket created, retrying upload...');
          // Retry upload after creating bucket
          const { data: retryData, error: retryError } = await supabase.storage
            .from('food-images')
            .upload(filename, bytes, {
              contentType: mimeType,
              upsert: false,
            });

          if (!retryError) {
            const { data: urlData } = supabase.storage.from('food-images').getPublicUrl(filename);
            return urlData.publicUrl;
          }
        }
      }

      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('food-images').getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload food image:', error);
    return null;
  }
}

// ---------- HTTP HANDLER ----------
Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonError('Method Not Allowed', 405);

  let meal_entry_id: string | undefined;

  try {
    console.log('📥 Received AI food scanner request');
    const requestBody = await req.json();
    const {
      image_base64,
      context,
      barcode, // optional
      text_hint, // optional: "Fanta Zero" etc.
      meal_type,
      user_id,
      auto_save = false,
      logged_date, // optional YYYY-MM-DD; defaults to UTC today
      meal_entry_id: request_meal_entry_id, // optional: for realtime progress updates
    } = requestBody;

    // Store meal_entry_id in outer scope for error handling
    meal_entry_id = request_meal_entry_id;

    console.log('🔍 Request parameters:', {
      has_image: !!image_base64,
      image_size: image_base64 ? image_base64.length : 0,
      context,
      barcode,
      text_hint,
      meal_type,
      user_id,
      auto_save,
      logged_date,
      meal_entry_id: request_meal_entry_id,
    });

    if (!image_base64) return jsonError('Image data is required', 400);

    // UTC date if not provided (Supabase standard)
    let logged_date_iso: string;
    if (typeof logged_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(logged_date)) {
      logged_date_iso = logged_date;
    } else {
      // Use UTC timezone (Supabase default)
      const now = new Date();
      logged_date_iso = now.toISOString().slice(0, 10); // YYYY-MM-DD in UTC
    }

    // Upload image to storage (if user_id provided)
    let imageUrl: string | null = null;
    if (user_id) {
      console.log('📸 Uploading food image to storage...');
      imageUrl = await uploadFoodImage(image_base64, user_id);
      if (imageUrl) {
        console.log('✅ Image uploaded successfully:', imageUrl);
      } else {
        console.warn('⚠️ Image upload failed, continuing without image');
      }
    }

    // Helper function to update analysis progress via realtime
    const updateProgress = async (mealEntryId: string, progress: number, stage: string) => {
      if (!mealEntryId) {
        console.log('⚠️ No meal_entry_id provided for progress update');
        return;
      }

      console.log(
        `🔄 Calling update_meal_analysis_progress RPC: ${mealEntryId}, ${progress}%, ${stage}`
      );

      try {
        const { data, error } = await supabase.rpc('update_meal_analysis_progress', {
          meal_entry_id: mealEntryId,
          progress,
          stage,
        });

        if (error) {
          console.error('❌ RPC update_meal_analysis_progress failed:', error);
        } else {
          console.log(`✅ Successfully updated progress: ${progress}% (${stage})`);
          console.log('RPC response data:', data);
        }
      } catch (err) {
        console.error('❌ Exception during progress update:', err);
      }
    };

    // Use meal_entry_id from request body for progress updates

    let analysis: FoodAnalysis;
    try {
      console.log('🔍 Starting AI analysis...');

      // Update progress at the start of analysis
      if (request_meal_entry_id) {
        console.log(`📊 Updating progress for meal ${request_meal_entry_id}: 20% (analyzing)`);
        await updateProgress(request_meal_entry_id, 20, 'analyzing');
      }

      console.log('🤖 Calling OpenAI vision API...');
      analysis = await analyzeImageWithOpenAI(image_base64, context, barcode, text_hint);
      console.log('✅ OpenAI analysis completed:', JSON.stringify(analysis, null, 2));

      // Update progress after successful analysis
      if (request_meal_entry_id) {
        console.log(`📊 Updating progress for meal ${request_meal_entry_id}: 70% (processing)`);
        await updateProgress(request_meal_entry_id, 70, 'processing');
      }
    } catch (openaiError) {
      console.error('❌ OpenAI vision failed:', openaiError);
      try {
        console.log('🔄 Trying Groq fallback...');
        analysis = await analyzeImageWithGroqFallback(image_base64);
        console.log('✅ Groq analysis completed:', JSON.stringify(analysis, null, 2));

        // Update progress after fallback analysis
        if (request_meal_entry_id) {
          console.log(`📊 Updating progress for meal ${request_meal_entry_id}: 70% (processing)`);
          await updateProgress(request_meal_entry_id, 70, 'processing');
        }
      } catch (groqError) {
        console.error('❌ Groq fallback also failed:', groqError);

        // Mark as failed if both analyses fail
        if (request_meal_entry_id) {
          console.log(`❌ Marking meal ${request_meal_entry_id} as failed`);
          await supabase.rpc('update_meal_analysis_progress', {
            meal_entry_id: request_meal_entry_id,
            status: 'failed',
            progress: 0,
          });
        }

        return jsonError(
          'Unable to analyze the image at the moment. Try a clearer photo or enter items manually.',
          502
        );
      }
    }

    console.log('🔧 Enriching packaged items...');
    // Enrich packaged items (front-of-pack only cases)
    await enrichPackagedItems(analysis.items, { barcode, text_hint });

    console.log('⚡ Applying final clamps and validation...');
    // Final clamps
    analysis.items = analysis.items.map((i) => ({
      ...i,
      nutrition: validateNutrition(i.nutrition, i.category),
      confidence: clamp(i.confidence, 10, 100),
    }));
    analysis.overall_confidence = overallConfidence(analysis.items);
    console.log('✅ Final analysis result:', JSON.stringify(analysis, null, 2));

    // Optional auto-save
    let auto_saved_meal_entry_id: string | null = null;
    if (auto_save && meal_type && user_id) {
      console.log('💾 Auto-saving meal entry...');
      try {
        auto_saved_meal_entry_id = await upsertMealEntry(
          analysis,
          { user_id, meal_type, logged_date_iso },
          context
            ? `AI scan (${analysis.overall_confidence}%) • ${context}`
            : `AI scan (${analysis.overall_confidence}%)`,
          imageUrl
        );
        console.log('✅ Auto-saved meal entry:', auto_saved_meal_entry_id);
      } catch (e) {
        console.error('❌ Auto-save failed:', e);
      }
    }

    // Update the analyzing meal with real data and mark as completed
    if (request_meal_entry_id && analysis.items?.[0]) {
      console.log(`🎉 Updating meal ${request_meal_entry_id} with analyzed data`);
      try {
        const analyzedItem = analysis.items[0];

        // Create the updated meal entry data
        const updatedFoodItems = [
          {
            food: {
              id: `scan_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              name: analyzedItem.food_name,
              brand: analyzedItem.brand || 'AI Detected',
              category: analyzedItem.category,
              servingSize: analyzedItem.serving_size,
              units: {},
              nutrition: analyzedItem.nutrition,
              confidence: analyzedItem.confidence,
              isPackaged: false,
              sourceLabel: null,
              detailed_ingredients: (analyzedItem as any).detailed_ingredients,
              image_url: imageUrl,
            },
            quantity: 1,
          },
        ];

        // Calculate nutrition totals
        const totalCalories = analyzedItem.nutrition.calories;
        const totalProtein = analyzedItem.nutrition.protein;
        const totalCarbs = analyzedItem.nutrition.carbs;
        const totalFat = analyzedItem.nutrition.fat;
        const totalFiber = analyzedItem.nutrition.fiber || 0;
        const totalSugar = analyzedItem.nutrition.sugar || 0;

        // Update the meal entry with real data
        const { error: updateError } = await supabase
          .from('meal_entries')
          .update({
            food_items: updatedFoodItems,
            total_calories: totalCalories,
            total_protein: totalProtein,
            total_carbs: totalCarbs,
            total_fat: totalFat,
            total_fiber: totalFiber,
            total_sugar: totalSugar,
            notes: context
              ? `AI scan (${analyzedItem.confidence}%) • ${context}`
              : `AI scan (${analyzedItem.confidence}%)`,
            image_url: imageUrl,
            analysis_status: 'completed',
            analysis_progress: 100,
            analysis_stage: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', request_meal_entry_id);

        if (updateError) {
          console.error('❌ Failed to update meal with analyzed data:', updateError);
          // Fallback to just marking as completed
          await supabase.rpc('update_meal_analysis_progress', {
            meal_entry_id: request_meal_entry_id,
            status: 'completed',
            progress: 100,
          });
        } else {
          console.log('✅ Successfully updated meal with analyzed data');
        }
      } catch (updateError) {
        console.error('❌ Failed to update meal with analyzed data:', updateError);
        // Fallback to just marking as completed
        await supabase.rpc('update_meal_analysis_progress', {
          meal_entry_id: request_meal_entry_id,
          status: 'completed',
          progress: 100,
        });
      }
    }

    console.log('🎯 Returning final response...');
    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        meal_entry_id: auto_saved_meal_entry_id,
        auto_saved: Boolean(auto_saved_meal_entry_id),
        image_url: imageUrl,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    console.error('💥 CRITICAL ERROR in AI food scanner:', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack available');

    // Try to mark the meal as failed if we have a meal_entry_id
    if (meal_entry_id) {
      try {
        console.log(`❌ Marking meal ${meal_entry_id} as failed due to critical error`);
        await supabase.rpc('update_meal_analysis_progress', {
          meal_entry_id: meal_entry_id,
          status: 'failed',
          progress: 0,
        });
      } catch (cleanupError) {
        console.error('Failed to mark meal as failed during cleanup:', cleanupError);
      }
    }

    return jsonError(msg, 500);
  }
});
