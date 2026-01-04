import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client for user operations
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get deletion reason from request body
    const body = await req.json().catch(() => ({}));
    const { reason, additional_comments } = body;

    // Save deletion feedback before deleting account
    if (reason) {
      await supabaseClient.from('deletion_feedback').insert({
        account_id: user.id,
        deletion_reason: reason,
        additional_comments: additional_comments || null,
      });
    }

    // Delete user's storage files (avatars)
    const { data: avatarFiles } = await supabaseClient.storage.from('avatars').list(user.id);

    if (avatarFiles && avatarFiles.length > 0) {
      const filesToDelete = avatarFiles.map((file) => `${user.id}/${file.name}`);
      await supabaseClient.storage.from('avatars').remove(filesToDelete);
    }

    // Delete user's scan images
    const { data: scanFiles } = await supabaseClient.storage.from('scans').list(user.id);

    if (scanFiles && scanFiles.length > 0) {
      const filesToDelete = scanFiles.map((file) => `${user.id}/${file.name}`);
      await supabaseClient.storage.from('scans').remove(filesToDelete);
    }

    // Delete the user from auth (this will cascade delete related data due to ON DELETE CASCADE)
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
