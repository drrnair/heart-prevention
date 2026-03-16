/**
 * Wearable sync routes: POST (batch insert), GET (latest readings).
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const readingSchema = z.object({
  dataType: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  recordedAt: z.string().datetime(),
});

const syncInputSchema = z.object({
  source: z.enum(['apple_health', 'google_fit']),
  readings: z.array(readingSchema).min(1).max(500),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = syncInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const { source, readings } = parsed.data;

  const records = readings.map((r) => ({
    user_id: user.id,
    source,
    data_type: r.dataType,
    value: r.value,
    unit: r.unit,
    recorded_at: r.recordedAt,
  }));

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('wearable_syncs')
    .upsert(records, { onConflict: 'user_id,source,data_type,recorded_at', ignoreDuplicates: true })
    .select();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ synced: data?.length ?? 0 }, 201);
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const dataType = searchParams.get('dataType');
  const since = searchParams.get('since');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);

  const supabase = await createUserClient();
  let query = supabase
    .from('wearable_syncs')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (dataType) {
    query = query.eq('data_type', dataType);
  }

  if (since) {
    query = query.gte('recorded_at', since);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ items: data });
});
