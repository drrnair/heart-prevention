/**
 * Profile routes: GET (fetch own profile), PUT (update profile).
 */

import { NextRequest } from 'next/server';
import { profileInputSchema } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';
import { DISCLAIMERS } from '@heart/shared';

export const GET = withAuth(async (_req, user) => {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return errorResponse(error.message, error.code === 'PGRST116' ? 404 : 500);
  }

  const age = Math.floor(
    (Date.now() - new Date(data.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  return jsonResponse({ ...data, computed: { age } }, 200, DISCLAIMERS.general);
});

export const PUT = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = profileInputSchema.partial().safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const supabase = await createUserClient();

  // Convert camelCase to snake_case for database
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    updates[snakeKey] = value;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data);
});
