/**
 * Chat history: GET conversation history.
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);

  const supabase = await createUserClient();

  if (conversationId) {
    // Get specific conversation
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return jsonResponse({ conversationId, messages: data }, 200, DISCLAIMERS.chat);
  }

  // List recent conversations
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .select('conversation_id, content, created_at')
    .eq('user_id', user.id)
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return errorResponse(error.message, 500);
  }

  // Group by conversation
  const conversations = new Map<string, { firstMessage: string; lastActivity: string }>();
  for (const msg of data ?? []) {
    if (!conversations.has(msg.conversation_id)) {
      conversations.set(msg.conversation_id, {
        firstMessage: msg.content.slice(0, 100),
        lastActivity: msg.created_at,
      });
    }
  }

  const conversationList = Array.from(conversations.entries()).map(([id, info]) => ({
    conversationId: id,
    ...info,
  }));

  return jsonResponse({ conversations: conversationList }, 200, DISCLAIMERS.chat);
});
