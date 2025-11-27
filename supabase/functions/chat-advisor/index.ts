import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getSupabaseClient(authHeader: string | null) {
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

async function getAuthenticatedUser(supabaseClient: any) {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    return { user: null, error: error || new Error("Unauthorized") };
  }

  return { user, error: null };
}

interface ChatPayload {
  message: string;
}

interface Debt {
  id: string;
  name: string;
  category: string;
  current_balance: number;
  original_balance: number;
  interest_rate: number;
  minimum_payment: number;
  status: string;
}

function buildSystemPrompt(debts: Debt[], totalBalance: number, totalMinPayment: number): string {
  const debtSummary = debts.map((d) =>
    `- ${d.name} (${d.category}): $${d.current_balance.toLocaleString()} at ${(d.interest_rate * 100).toFixed(2)}% APR, min payment $${d.minimum_payment}`
  ).join("\n");

  return `You are a helpful debt advisor assistant for a personal finance app. You help users understand their debt situation and make informed financial decisions.

CURRENT USER'S DEBT SITUATION:
Total Debt: $${totalBalance.toLocaleString()}
Total Minimum Monthly Payment: $${totalMinPayment.toLocaleString()}
Number of Debts: ${debts.length}

${debts.length > 0 ? `INDIVIDUAL DEBTS:\n${debtSummary}` : "The user has no debts recorded yet."}

GUIDELINES:
- Be encouraging but realistic about debt payoff
- Explain the avalanche method (paying highest interest first) and snowball method (paying smallest balance first)
- When asked about consolidation, consider their current interest rates
- Provide specific advice based on their actual debt data
- Keep responses concise and actionable (2-3 paragraphs max)
- Never provide investment advice or guarantee specific outcomes
- If they ask about something unrelated to debt/personal finance, politely redirect
- Use simple language, avoid jargon`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req.headers.get("Authorization"));
    const { user, error: authError } = await getAuthenticatedUser(supabase);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message }: ChatPayload = await req.json();

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch user's debts for context
    const { data: debts, error: debtsError } = await supabase
      .from("debts")
      .select("*")
      .eq("account_id", user.id)
      .eq("status", "active");

    if (debtsError) {
      console.error("Error fetching debts:", debtsError);
    }

    const userDebts: Debt[] = debts || [];
    const totalBalance = userDebts.reduce((sum, d) => sum + Number(d.current_balance), 0);
    const totalMinPayment = userDebts.reduce((sum, d) => sum + Number(d.minimum_payment), 0);

    // Get recent chat history for context (last 10 messages)
    const { data: recentMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("account_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const chatHistory = (recentMessages || [])
      .reverse()
      .map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

    // Call OpenAI API
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompt = buildSystemPrompt(userDebts, totalBalance, totalMinPayment);

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory,
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI error:", errorData);
      throw new Error("Failed to get AI response");
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";

    // Save AI response to database
    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        account_id: user.id,
        role: "assistant",
        content: aiResponse,
      });

    if (insertError) {
      console.error("Error saving AI response:", insertError);
    }

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Chat advisor error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
