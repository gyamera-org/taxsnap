import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function getSupabaseClient(authHeader: string | null) {
  return createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: {
      headers: { Authorization: authHeader! },
    },
  });
}

export async function getAuthenticatedUser(supabaseClient: any) {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    return { user: null, error: error || new Error('Unauthorized') };
  }

  return { user, error: null };
}

interface RecordPaymentPayload {
  debt_id: string;
  amount: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req.headers.get('Authorization'));
    const { user, error: authError } = await getAuthenticatedUser(supabase);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { debt_id, amount }: RecordPaymentPayload = await req.json();

    if (!debt_id || !amount) {
      return new Response(JSON.stringify({ error: 'debt_id and amount are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the debt and verify ownership
    const { data: debt, error: debtError } = await supabase
      .from('debts')
      .select('*')
      .eq('id', debt_id)
      .eq('account_id', user.id)
      .single();

    if (debtError || !debt) {
      return new Response(JSON.stringify({ error: 'Debt not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate interest/principal split
    // If paying full balance or more, treat as full payoff
    const currentBalance = Number(debt.current_balance);
    let principalPaid: number;
    let interestPaid: number;

    if (amount >= currentBalance) {
      // Full payoff - all of current balance is principal, rest is interest
      principalPaid = currentBalance;
      interestPaid = amount - currentBalance;
    } else {
      // Partial payment - calculate interest first, then principal
      const monthlyInterest = (currentBalance * Number(debt.interest_rate)) / 100 / 12;
      interestPaid = Math.min(monthlyInterest, amount);
      principalPaid = amount - interestPaid;
    }

    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from('debt_payments')
      .insert({
        debt_id,
        amount,
        principal_paid: principalPaid,
        interest_paid: interestPaid,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update debt balance
    const newBalance = Math.max(0, currentBalance - principalPaid);
    const updateData: any = {
      current_balance: newBalance,
    };

    // Auto mark as paid off when balance reaches 0
    if (newBalance === 0) {
      updateData.status = 'paid_off';
      updateData.paid_off_date = new Date().toISOString();
      updateData.minimum_payment = 0;
    }

    const { error: updateError } = await supabase
      .from('debts')
      .update(updateData)
      .eq('id', debt_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      data: payment,
      debt_paid_off: newBalance === 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
