/**
 * Single check-in routes: GET, PUT, DELETE.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const checkinUpdateSchema = z.object({
  moodLevel: z.enum(['very_low', 'low', 'neutral', 'good', 'great']).nullable().optional(),
  exerciseMinutes: z.number().int().min(0).nullable().optional(),
  sleepHoursAvg: z.number().min(0).max(24).nullable().optional(),
  stressLevel: z.number().int().min(1).max(10).nullable().optional(),
  medicationAdherence: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const GET = withAuth<{ id: string }>(async (_req, user, { id }) => {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('weekly_checkins')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return errorResponse(
      error.code === 'PGRST116' ? 'Check-in not found' : error.message,
      error.code === 'PGRST116' ? 404 : 500,
    );
  }

  return jsonResponse(data);
});

export const PUT = withAuth<{ id: string }>(async (req, user, { id }) => {
  const body = await req.json();
  const parsed = checkinUpdateSchema.safeParse(body);

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
    .from('weekly_checkins')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, error.code === 'PGRST116' ? 404 : 500);
  }

  return jsonResponse(data);
});

export const DELETE = withAuth<{ id: string }>(async (_req, user, { id }) => {
  const supabase = await createUserClient();
  const { error } = await supabase
    .from('weekly_checkins')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ deleted: true });
});
