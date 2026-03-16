/**
 * Single lifestyle plan: GET.
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const GET = withAuth<{ id: string }>(async (_req, user, { id }) => {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('lifestyle_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return errorResponse(
      error.code === 'PGRST116' ? 'Plan not found' : error.message,
      error.code === 'PGRST116' ? 404 : 500,
    );
  }

  return jsonResponse(data, 200, DISCLAIMERS.lifestyle);
});
