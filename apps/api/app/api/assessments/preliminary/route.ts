/**
 * Preliminary assessment (Path B): demographics + vitals only.
 * Uses NHANES-imputed lipids for initial risk estimate.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS, lookupNhanesMedians } from '@heart/shared';
import {
  calculatePreliminaryAscvd,
  generateRecommendations,
} from '@heart/risk-engine';
import type { NhanesLipidPercentiles, PreliminaryInput, Demographics, Vitals } from '@heart/risk-engine';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const preliminaryInputSchema = z.object({
  systolicBp: z.number().int().min(60).max(300),
  diastolicBp: z.number().int().min(30).max(200),
  heightCm: z.number().min(50).max(300),
  weightKg: z.number().min(20).max(500),
  waistCm: z.number().min(30).max(300).nullable().optional(),
  hipCm: z.number().min(30).max(300).nullable().optional(),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = preliminaryInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const input = parsed.data;

  // Fetch user profile for demographics
  const supabase = await createUserClient();
  const { data: profile, error: profileErr } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    return errorResponse('Profile not found. Complete onboarding first.', 404);
  }

  const age = Math.floor(
    (Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  // Map ethnicity to risk-engine compatible type
  const ethnicityMap: Record<string, string> = {
    white: 'white',
    black: 'black',
    hispanic: 'hispanic',
    south_asian: 'south_asian',
    east_asian: 'east_asian',
    southeast_asian: 'other',
    middle_eastern: 'other',
    other: 'other',
  };

  const demographics: Demographics = {
    age,
    sex: profile.biological_sex as 'male' | 'female',
    ethnicity: (ethnicityMap[profile.ethnicity] ?? 'other') as Demographics['ethnicity'],
  };

  const vitals: Vitals = {
    systolicBp: input.systolicBp,
    onBpMedication: profile.on_bp_meds,
    isSmoker: profile.smoking_status === 'current',
    hasDiabetes: profile.diabetes_status !== 'none',
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    waistCm: input.waistCm ?? undefined,
    hipCm: input.hipCm ?? undefined,
  };

  // NHANES lookup adapter
  const nhanesLookup = (lookupAge: number, sex: 'male' | 'female', ethnicity: string): NhanesLipidPercentiles => {
    const result = lookupNhanesMedians(
      lookupAge,
      sex,
      ethnicity as Parameters<typeof lookupNhanesMedians>[2],
    );

    if (!result) {
      // Fallback to 'other' ethnicity
      const fallback = lookupNhanesMedians(lookupAge, sex, 'other');
      if (!fallback) throw new Error('NHANES lookup failed');
      return {
        p25TotalCholesterol: fallback.tcP25,
        p50TotalCholesterol: fallback.tcP50,
        p75TotalCholesterol: fallback.tcP75,
        p25Hdl: fallback.hdlP25,
        p50Hdl: fallback.hdlP50,
        p75Hdl: fallback.hdlP75,
      };
    }

    return {
      p25TotalCholesterol: result.tcP25,
      p50TotalCholesterol: result.tcP50,
      p75TotalCholesterol: result.tcP75,
      p25Hdl: result.hdlP25,
      p50Hdl: result.hdlP50,
      p75Hdl: result.hdlP75,
    };
  };

  const prelimInput: PreliminaryInput = { demographics, vitals };
  const prelimResult = calculatePreliminaryAscvd(prelimInput, nhanesLookup);

  // Generate investigation recommendations
  const recommendations = generateRecommendations({
    demographics,
    vitals,
    riskScore: prelimResult.midpointRisk,
    familyHistory: profile.family_history_premature_cvd,
  });

  // Store the risk score
  const { data: scoreRecord, error: scoreErr } = await supabase
    .from('risk_scores')
    .insert({
      user_id: user.id,
      score_type: 'ascvd_pce_10yr',
      data_level: 1,
      score_value: prelimResult.midpointRisk,
      risk_category: prelimResult.riskCategory,
      input_snapshot: {
        demographics,
        vitals: { systolicBp: input.systolicBp },
        imputed: {
          totalCholesterol: prelimResult.imputedTotalCholesterol,
          hdl: prelimResult.imputedHdl,
        },
        used_imputed_lipids: true,
      },
      calculated_at: new Date().toISOString(),
      notes: 'Preliminary estimate using NHANES-imputed lipids',
    })
    .select()
    .single();

  if (scoreErr) {
    return errorResponse(scoreErr.message, 500);
  }

  return jsonResponse(
    {
      riskScore: scoreRecord,
      preliminary: {
        midpointRisk: prelimResult.midpointRisk,
        lowerBound: prelimResult.lowerBound,
        upperBound: prelimResult.upperBound,
        riskCategory: prelimResult.riskCategory,
        imputedTotalCholesterol: prelimResult.imputedTotalCholesterol,
        imputedHdl: prelimResult.imputedHdl,
      },
      recommendations,
    },
    201,
    DISCLAIMERS.preliminary,
  );
});
