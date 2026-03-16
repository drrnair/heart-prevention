/**
 * Subscription verification: POST (stub for RevenueCat).
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const verifySchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  receiptData: z.string().min(1),
  productId: z.string().min(1),
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

  // TODO: Integrate with RevenueCat API
  // 1. Send receiptData to RevenueCat for verification
  // 2. Get subscription status, expiration, entitlements
  // 3. Update user profile with subscription tier and expiration

  const supabase = await createUserClient();

  // Stub: Update subscription status
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: 'premium',
      subscription_expires_at: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    })
    .eq('id', user.id)
    .select('subscription_tier, subscription_expires_at')
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({
    verified: true,
    subscription: data,
    message: 'Subscription verified successfully (stub implementation)',
  });
});
