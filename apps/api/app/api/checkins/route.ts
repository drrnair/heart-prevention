/**
 * Weekly check-in routes: POST (create), GET (list).
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const checkinInputSchema = z.object({
  weekStarting: z.string().date(),
  moodLevel: z.enum(['very_low', 'low', 'neutral', 'good', 'great']).nullable().optional(),
  exerciseMinutes: z.number().int().min(0).nullable().optional(),
  sleepHoursAvg: z.number().min(0).max(24).nullable().optional(),
  stressLevel: z.number().int().min(1).max(10).nullable().optional(),
  medicationAdherence: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = checkinInputSchema.safeParse(body);

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
    .from('weekly_checkins')
    .insert(record)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data, 201, DISCLAIMERS.general);
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const supabase = await createUserClient();
  const { data, error, count } = await supabase
    .from('weekly_checkins')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('week_starting', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ items: data, total: count, limit, offset });
});
