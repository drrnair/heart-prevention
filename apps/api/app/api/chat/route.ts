/**
 * AI wellness chat: POST.
 * Premium-only, 5 queries/day limit.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS } from '@heart/shared';
import { handleWellnessChat } from '@/lib/ai';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const chatInputSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = chatInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const supabase = await createUserClient();

  // Check subscription tier
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_expires_at, trial_expires_at')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return errorResponse('Profile not found', 404);
  }

  const isPremium = profile.subscription_tier === 'premium' ||
    (profile.subscription_tier === 'trial' &&
      profile.trial_expires_at &&
      new Date(profile.trial_expires_at) > new Date());

  if (!isPremium) {
    return errorResponse('AI chat requires a premium subscription', 403);
  }

  // Check daily query limit
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: todayCount } = await supabase
    .from('ai_chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('role', 'user')
    .gte('created_at', todayStart.toISOString());

  if ((todayCount ?? 0) >= 5) {
    return errorResponse('Daily chat limit reached (5 queries per day). Try again tomorrow.', 429);
  }

  // Fetch conversation history
  const conversationId = parsed.data.conversationId ?? crypto.randomUUID();

  const { data: history } = await supabase
    .from('ai_chat_messages')
    .select('role, content')
    .eq('user_id', user.id)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20);

  // Fetch user supplements for context
  const { data: supplements } = await supabase
    .from('user_supplements')
    .select('name, dosage, frequency, status')
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Fetch profile for context
  const { data: fullProfile } = await supabase
    .from('user_profiles')
    .select('activity_level, cuisine_preferences')
    .eq('id', user.id)
    .single();

  // Build message list
  const messages = [
    ...(history ?? []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: parsed.data.message },
  ];

  // Store user message
  await supabase.from('ai_chat_messages').insert({
    user_id: user.id,
    conversation_id: conversationId,
    role: 'user',
    content: parsed.data.message,
  });

  try {
    const response = await handleWellnessChat(
      messages,
      fullProfile ?? {},
      supplements ?? [],
    );

    // Store assistant response
    await supabase.from('ai_chat_messages').insert({
      user_id: user.id,
      conversation_id: conversationId,
      role: 'assistant',
      content: response.content,
    });

    return jsonResponse(
      {
        conversationId,
        message: response.content,
        remainingQueries: Math.max(0, 5 - (todayCount ?? 0) - 1),
      },
      200,
      DISCLAIMERS.chat,
    );
  } catch (err) {
    return errorResponse(
      `Chat failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500,
    );
  }
});
