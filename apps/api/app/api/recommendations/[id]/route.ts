/**
 * Single recommendation: PUT (update status: completed, declined, snoozed).
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const updateSchema = z.object({
  status: z.enum(['pending', 'scheduled', 'completed', 'declined', 'snoozed']),
  snoozedUntil: z.string().datetime().optional(),
});

export const PUT = withAuth<{ id: string }>(async (req, user, { id }) => {
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const updates: Record<string, unknown> = {
    status: parsed.data.status,
  };

  if (parsed.data.status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  if (parsed.data.status === 'snoozed' && parsed.data.snoozedUntil) {
    updates.snoozed_until = parsed.data.snoozedUntil;
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('investigation_recommendations')
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
