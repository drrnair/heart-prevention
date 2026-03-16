/**
 * Single lab result routes: GET, PUT, DELETE.
 */

import { NextRequest } from 'next/server';
import { labResultInputSchema, DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const GET = withAuth<{ id: string }>(async (_req, user, { id }) => {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return errorResponse(
      error.code === 'PGRST116' ? 'Lab result not found' : error.message,
      error.code === 'PGRST116' ? 404 : 500,
    );
  }

  return jsonResponse(data, 200, DISCLAIMERS.general);
});

export const PUT = withAuth<{ id: string }>(async (req, user, { id }) => {
  const body = await req.json();
  const parsed = labResultInputSchema.partial().safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    updates[snakeKey] = value;
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('lab_results')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, error.code === 'PGRST116' ? 404 : 500);
  }

  return jsonResponse(data, 200, DISCLAIMERS.general);
});

export const DELETE = withAuth<{ id: string }>(async (_req, user, { id }) => {
  const supabase = await createUserClient();
  const { error } = await supabase
    .from('lab_results')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ deleted: true });
});
