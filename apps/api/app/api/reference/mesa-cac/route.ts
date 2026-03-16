/**
 * MESA CAC reference: GET CAC percentile lookup.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS } from '@heart/shared';
import { lookupCacPercentile } from '@heart/risk-engine';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const querySchema = z.object({
  age: z.coerce.number().int().min(40).max(85),
  sex: z.enum(['male', 'female']),
  ethnicity: z.enum(['white', 'black', 'hispanic', 'south_asian', 'east_asian', 'other']),
  cacScore: z.coerce.number().min(0).max(10000),
});

export const GET = withAuth(async (req: NextRequest, _user) => {
  const { searchParams } = new URL(req.url);

  const parsed = querySchema.safeParse({
    age: searchParams.get('age'),
    sex: searchParams.get('sex'),
    ethnicity: searchParams.get('ethnicity'),
    cacScore: searchParams.get('cacScore'),
  });

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const { age, sex, ethnicity, cacScore } = parsed.data;

  // Build a reference lookup from the database
  const supabase = await createUserClient();
  const { data: refData } = await supabase
    .from('mesa_cac_reference')
    .select('*')
    .gte('age_upper', age)
    .lte('age_lower', age)
    .eq('sex', sex);

  const referenceLookup = (
    _age: number,
    _sex: string,
    _ethnicity: string,
    score: number,
  ): number => {
    if (!refData || refData.length === 0) return 50; // default median if no reference data
    // Find matching row (prefer ethnicity match, fallback to any)
    const match = refData.find((r) => r.ethnicity === _ethnicity) ?? refData[0];
    if (!match) return 50;
    if (score <= match.p25_score) return 25;
    if (score <= match.p50_score) return 50;
    if (score <= match.p75_score) return 75;
    if (score <= match.p90_score) return 90;
    return 95;
  };

  try {
    const percentile = lookupCacPercentile(age, sex, ethnicity, cacScore, referenceLookup);

    return jsonResponse(
      { age, sex, ethnicity, cacScore, percentile },
      200,
      DISCLAIMERS.imaging,
    );
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : 'Lookup failed',
      400,
    );
  }
});
