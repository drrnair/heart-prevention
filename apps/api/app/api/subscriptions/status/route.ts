/**
 * Subscription status: GET current subscription info.
 */

import { NextRequest } from 'next/server';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const GET = withAuth(async (_req: NextRequest, user) => {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_expires_at, trial_expires_at')
    .eq('id', user.id)
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  const now = new Date();
  const isTrialActive =
    data.subscription_tier === 'trial' &&
    data.trial_expires_at &&
    new Date(data.trial_expires_at) > now;

  const isPremiumActive =
    data.subscription_tier === 'premium' &&
    data.subscription_expires_at &&
    new Date(data.subscription_expires_at) > now;

  const effectiveTier = isPremiumActive
    ? 'premium'
    : isTrialActive
      ? 'trial'
      : 'free';

  const expiresAt = isPremiumActive
    ? data.subscription_expires_at
    : isTrialActive
      ? data.trial_expires_at
      : null;

  return jsonResponse({
    tier: effectiveTier,
    storedTier: data.subscription_tier,
    isActive: effectiveTier !== 'free',
    expiresAt,
    features: {
      aiChat: effectiveTier !== 'free',
      pdfReports: effectiveTier !== 'free',
      lifestylePlan: true,
      riskScores: true,
      labUpload: true,
    },
  });
});
