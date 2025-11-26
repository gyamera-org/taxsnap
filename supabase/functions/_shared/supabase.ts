import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabaseClient(authHeader: string | null) {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authHeader! },
      },
    }
  );
}

export async function getAuthenticatedUser(supabaseClient: any) {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    return { user: null, error: error || new Error("Unauthorized") };
  }

  return { user, error: null };
}
