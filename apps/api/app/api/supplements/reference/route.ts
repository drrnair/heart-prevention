/**
 * Supplement reference: GET top 10 + full supplement reference (public data).
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const GET = withAuth(async (req: NextRequest, _user) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 100);
  const category = searchParams.get('category');

  const supabase = await createUserClient();

  let query = supabase
    .from('supplement_reference')
    .select('*')
    .order('priority_rank', { ascending: true })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data, 200, DISCLAIMERS.supplements);
});
