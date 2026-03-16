/**
 * Single supplement routes: PUT, DELETE.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const supplementUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  dosage: z.string().min(1).max(100).optional(),
  frequency: z.string().min(1).max(100).optional(),
  status: z.enum(['active', 'paused', 'stopped']).optional(),
  reason: z.string().max(500).nullable().optional(),
  stoppedAt: z.string().date().nullable().optional(),
});

export const PUT = withAuth<{ id: string }>(async (req, user, { id }) => {
  const body = await req.json();
  const parsed = supplementUpdateSchema.safeParse(body);

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
    .from('user_supplements')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, error.code === 'PGRST116' ? 404 : 500);
  }

  return jsonResponse(data, 200, DISCLAIMERS.supplements);
});

export const DELETE = withAuth<{ id: string }>(async (_req, user, { id }) => {
  const supabase = await createUserClient();
  const { error } = await supabase
    .from('user_supplements')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ deleted: true });
});
