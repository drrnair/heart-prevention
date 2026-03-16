/**
 * Confirm AI-extracted lab values.
 * Updates extraction_status to 'confirmed' and triggers risk recalculation.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const confirmSchema = z.object({
  /** Optional corrections to extracted values before confirming. */
  corrections: z.record(z.string(), z.number().nullable()).optional(),
});

export const POST = withAuth<{ id: string }>(async (req, user, { id }) => {
  const body = await req.json();
  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const supabase = await createUserClient();

  // Fetch the existing lab result
  const { data: existing, error: fetchErr } = await supabase
    .from('lab_results')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !existing) {
    return errorResponse('Lab result not found', 404);
  }

  if (existing.extraction_status === 'confirmed') {
    return errorResponse('Lab result already confirmed', 400);
  }

  // Apply corrections if provided
  const updates: Record<string, unknown> = {
    extraction_status: 'confirmed',
  };

  if (parsed.data.corrections) {
    for (const [key, value] of Object.entries(parsed.data.corrections)) {
      const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      updates[snakeKey] = value;
    }
  }

  const { data: confirmed, error: updateErr } = await supabase
    .from('lab_results')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateErr) {
    return errorResponse(updateErr.message, 500);
  }

  // Determine data level based on available data
  const hasBasicLipids =
    confirmed.total_cholesterol != null &&
    confirmed.ldl_cholesterol != null &&
    confirmed.hdl_cholesterol != null &&
    confirmed.triglycerides != null;

  const hasExtendedLabs =
    confirmed.lipoprotein_a != null ||
    confirmed.apolipoprotein_b != null ||
    confirmed.hs_crp != null ||
    confirmed.hba1c != null;

  let dataLevel = 1;
  if (hasBasicLipids) dataLevel = 2;
  if (hasBasicLipids && hasExtendedLabs) dataLevel = 3;

  return jsonResponse(
    {
      labResult: confirmed,
      dataLevel,
      message: 'Lab values confirmed. Risk scores will be recalculated at the new data level.',
    },
    200,
    DISCLAIMERS.general,
  );
});
