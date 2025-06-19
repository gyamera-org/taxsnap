import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

function jsonSuccess(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

interface AppleReceiptData {
  receipt: string;
  productId: string;
  platform: string;
  transactionId: string;
}

async function verifyAppleReceipt(receiptData: string, isProduction = false): Promise<any> {
  const appleUrl = isProduction
    ? 'https://buy.itunes.apple.com/verifyReceipt'
    : 'https://sandbox.itunes.apple.com/verifyReceipt';

  const response = await fetch(appleUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'receipt-data': receiptData,
      password: Deno.env.get('APPLE_SHARED_SECRET'), // Your App Store Connect shared secret
      'exclude-old-transactions': true,
    }),
  });

  const result = await response.json();

  // If we get a sandbox receipt error in production, try sandbox
  if (result.status === 21007 && isProduction) {
    return verifyAppleReceipt(receiptData, false);
  }

  return result;
}

function getSubscriptionInfo(appleResponse: any) {
  const receipt = appleResponse.receipt;
  const latestReceiptInfo = appleResponse.latest_receipt_info;

  if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
    throw new Error('No subscription info found in receipt');
  }

  // Get the most recent subscription
  const subscription = latestReceiptInfo.sort(
    (a: any, b: any) => parseInt(b.purchase_date_ms) - parseInt(a.purchase_date_ms)
  )[0];

  const now = Date.now();
  const expiresDate = parseInt(subscription.expires_date_ms);
  const isActive = expiresDate > now;

  return {
    productId: subscription.product_id,
    transactionId: subscription.transaction_id,
    originalTransactionId: subscription.original_transaction_id,
    purchaseDate: new Date(parseInt(subscription.purchase_date_ms)),
    expiresDate: new Date(expiresDate),
    isActive,
    environment: appleResponse.environment, // 'Sandbox' or 'Production'
    receiptData: appleResponse.latest_receipt || receipt.receipt_data,
  };
}

async function updateUserSubscription(userId: string, subscriptionInfo: any) {
  const plan = subscriptionInfo.productId.includes('yearly') ? 'yearly' : 'weekly';
  const status = subscriptionInfo.isActive ? 'active' : 'expired';

  const { error } = await supabase
    .from('accounts')
    .update({
      subscription_status: status,
      subscription_plan: plan,
      subscription_platform: 'ios',
      subscription_expires: subscriptionInfo.expiresDate.toISOString(),
      subscription_billing_frequency: plan === 'yearly' ? 'yearly' : 'weekly',
      subscription_receipt_id: subscriptionInfo.transactionId,
      subscription_original_purchase: subscriptionInfo.originalTransactionId,
      subscription_product: subscriptionInfo.productId,
      subscription_last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'POST') {
    return jsonError('Method Not Allowed', 405);
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonError('Missing or invalid authorization header', 401);
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the JWT token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonError('Invalid or expired token', 401);
    }

    const { receipt, productId, platform, transactionId }: AppleReceiptData = await req.json();

    if (!receipt || !productId || !platform) {
      return jsonError('Missing required fields: receipt, productId, platform', 400);
    }

    if (platform !== 'ios') {
      return jsonError('Currently only iOS receipts are supported', 400);
    }

    // Verify with Apple
    const appleResponse = await verifyAppleReceipt(receipt, true); // Start with production

    if (appleResponse.status !== 0) {
      const errorMessages: { [key: number]: string } = {
        21000: 'The App Store could not read the JSON object you provided.',
        21002: 'The data in the receipt-data property was malformed or missing.',
        21003: 'The receipt could not be authenticated.',
        21004: 'The shared secret you provided does not match the shared secret on file.',
        21005: 'The receipt server is not currently available.',
        21006: 'This receipt is valid but the subscription has expired.',
        21007: 'This receipt is from the sandbox environment.',
        21008: 'This receipt is from the production environment.',
        21010: 'This receipt could not be authorized.',
      };

      const errorMessage =
        errorMessages[appleResponse.status] || `Unknown error: ${appleResponse.status}`;
      return jsonError(`Receipt verification failed: ${errorMessage}`, 400);
    }

    // Parse subscription info
    const subscriptionInfo = getSubscriptionInfo(appleResponse);

    // Update user's subscription in database
    await updateUserSubscription(user.id, subscriptionInfo);

    return jsonSuccess({
      message: 'Receipt verified and subscription updated',
      subscription: {
        productId: subscriptionInfo.productId,
        plan: subscriptionInfo.productId.includes('yearly') ? 'yearly' : 'weekly',
        status: subscriptionInfo.isActive ? 'active' : 'expired',
        expiresAt: subscriptionInfo.expiresDate.toISOString(),
        environment: subscriptionInfo.environment,
      },
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Receipt verification error:', error);
    return jsonError(error.message || 'Internal server error', 500);
  }
});
