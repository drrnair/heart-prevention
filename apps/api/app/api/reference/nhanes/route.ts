/**
 * NHANES reference: GET population medians by age/sex/ethnicity.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { lookupNhanesMedians, NHANES_LIPID_MEDIANS, DISCLAIMERS } from '@heart/shared';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const querySchema = z.object({
  age: z.coerce.number().int().min(18).max(100),
  sex: z.enum(['male', 'female']),
  ethnicity: z.enum([
    'white', 'black', 'hispanic', 'south_asian',
    'east_asian', 'southeast_asian', 'middle_eastern', 'other',
  ]),
});

export const GET = withAuth(async (req: NextRequest, _user) => {
  const { searchParams } = new URL(req.url);

  const params = {
    age: searchParams.get('age'),
    sex: searchParams.get('sex'),
    ethnicity: searchParams.get('ethnicity'),
  };

  // If no params, return the full reference table
  if (!params.age && !params.sex && !params.ethnicity) {
    return jsonResponse(
      { medians: NHANES_LIPID_MEDIANS },
      200,
      DISCLAIMERS.preliminary,
    );
  }

  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const result = lookupNhanesMedians(parsed.data.age, parsed.data.sex, parsed.data.ethnicity);

  if (!result) {
    return errorResponse('No reference data found for the given demographics', 404);
  }

  return jsonResponse(result, 200, DISCLAIMERS.preliminary);
});
