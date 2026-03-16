/**
 * AI explanation of risk scores.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS } from '@heart/shared';
import { explainRiskScore } from '@/lib/ai';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const explainSchema = z.object({
  scoreIds: z.array(z.string().uuid()).min(1).max(10),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = explainSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const supabase = await createUserClient();

  // Fetch the requested scores
  const { data: scores, error: scoresErr } = await supabase
    .from('risk_scores')
    .select('*')
    .in('id', parsed.data.scoreIds)
    .eq('user_id', user.id);

  if (scoresErr || !scores?.length) {
    return errorResponse('No scores found', 404);
  }

  // Fetch profile summary
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('biological_sex, date_of_birth, smoking_status, diabetes_status, on_bp_meds, ethnicity')
    .eq('id', user.id)
    .single();

  const dataLevel = Math.max(...scores.map((s) => s.data_level ?? 1));

  const scoresMap: Record<string, unknown> = {};
  for (const s of scores) {
    scoresMap[s.score_type] = {
      value: s.score_value,
      category: s.risk_category,
      dataLevel: s.data_level,
    };
  }

  try {
    const explanation = await explainRiskScore(scoresMap, profile ?? {}, dataLevel);

    return jsonResponse(explanation, 200, DISCLAIMERS.riskScore);
  } catch (err) {
    return errorResponse(
      `AI explanation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500,
    );
  }
});
