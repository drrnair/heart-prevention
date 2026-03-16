/**
 * Imaging routes: POST (create), GET (list).
 */

import { NextRequest } from 'next/server';
import { imagingInputSchema, DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = imagingInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const input = parsed.data;
  const record: Record<string, unknown> = { user_id: user.id };

  for (const [key, value] of Object.entries(input)) {
    const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    record[snakeKey] = value;
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('imaging_results')
    .insert(record)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data, 201, DISCLAIMERS.imaging);
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const supabase = await createUserClient();
  const { data, error, count } = await supabase
    .from('imaging_results')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('performed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ items: data, total: count, limit, offset }, 200, DISCLAIMERS.imaging);
});
