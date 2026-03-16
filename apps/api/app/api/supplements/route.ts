/**
 * Supplements routes: POST (add supplement/medication), GET (list user's).
 * On medication add: checks medication_condition_mappings for inferred conditions.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const supplementInputSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  status: z.enum(['active', 'paused', 'stopped']).default('active'),
  reason: z.string().max(500).nullable().optional(),
  startedAt: z.string().date(),
  isMedication: z.boolean().default(false),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = supplementInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const input = parsed.data;

  const supabase = await createUserClient();

  const { data, error } = await supabase
    .from('user_supplements')
    .insert({
      user_id: user.id,
      name: input.name,
      dosage: input.dosage,
      frequency: input.frequency,
      status: input.status,
      reason: input.reason ?? null,
      started_at: input.startedAt,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  // Check for medication-condition inferences
  let inferences: unknown[] = [];
  if (input.isMedication) {
    const { data: mappings } = await supabase
      .from('medication_condition_mappings')
      .select('*')
      .ilike('medication_name', `%${input.name}%`);

    if (mappings && mappings.length > 0) {
      inferences = mappings.map((m) => ({
        condition: m.condition_name,
        confidence: m.confidence,
        suggestion: `Taking ${input.name} may indicate ${m.condition_name}. Consider updating your profile if applicable.`,
      }));
    }
  }

  return jsonResponse(
    {
      supplement: data,
      ...(inferences.length > 0 ? { conditionInferences: inferences } : {}),
    },
    201,
    DISCLAIMERS.supplements,
  );
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const supabase = await createUserClient();
  let query = supabase
    .from('user_supplements')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data, 200, DISCLAIMERS.supplements);
});
