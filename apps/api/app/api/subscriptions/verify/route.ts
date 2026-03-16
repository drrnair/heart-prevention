import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const verifySchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  receipt: z.string().min(1, 'Receipt is required'),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const { receipt, platform } = parsed.data;

  // TODO: Replace with real RevenueCat server-side verification
  // 1. Call RevenueCat REST API: GET https://api.revenuecat.com/v1/subscribers/{user_id}
  //    Headers: { Authorization: 'Bearer REVENUECAT_API_KEY' }
  // 2. Validate the receipt against the subscriber record
  // 3. Extract entitlements, expiration date, and subscription status
  // 4. Map RevenueCat entitlements to app subscription tiers

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const supabase = await createUserClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: 'premium',
      subscription_expires_at: expiresAt,
    })
    .eq('id', user.id)
    .select('subscription_tier, subscription_expires_at')
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({
    verified: true,
    subscription: {
      tier: data.subscription_tier,
      expiresAt: data.subscription_expires_at,
      isActive: true,
    },
  });
});
