/**
 * Recommendations route: GET current recommendations for user.
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { generateRecommendations, determineDataLevel } from '@heart/risk-engine';
import type { Demographics, Vitals, Labs, Imaging } from '@heart/risk-engine';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const GET = withAuth(async (_req: NextRequest, user) => {
  const supabase = await createUserClient();

  // Fetch profile
  const { data: profile, error: profileErr } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    return errorResponse('Profile not found', 404);
  }

  const age = Math.floor(
    (Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  const ethnicityMap: Record<string, string> = {
    white: 'white', black: 'black', hispanic: 'hispanic',
    south_asian: 'south_asian', east_asian: 'east_asian',
    southeast_asian: 'other', middle_eastern: 'other', other: 'other',
  };

  const demographics: Demographics = {
    age,
    sex: profile.biological_sex,
    ethnicity: (ethnicityMap[profile.ethnicity] ?? 'other') as Demographics['ethnicity'],
  };

  // Latest assessment
  const { data: assessment } = await supabase
    .from('health_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('assessed_at', { ascending: false })
    .limit(1)
    .single();

  const vitals: Vitals = {
    systolicBp: assessment?.systolic_bp ?? 120,
    onBpMedication: profile.on_bp_meds,
    isSmoker: profile.smoking_status === 'current',
    hasDiabetes: profile.diabetes_status !== 'none',
    weightKg: assessment?.weight_kg,
    heightCm: assessment?.height_cm,
    waistCm: assessment?.waist_cm ?? undefined,
    hipCm: assessment?.hip_cm ?? undefined,
  };

  // Latest labs
  const { data: labResult } = await supabase
    .from('lab_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('extraction_status', 'confirmed')
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  let labs: Labs | undefined;
  if (labResult?.total_cholesterol != null) {
    labs = {
      basicLipids: {
        totalCholesterol: labResult.total_cholesterol,
        ldl: labResult.ldl_cholesterol,
        hdl: labResult.hdl_cholesterol,
        triglycerides: labResult.triglycerides,
      },
      extendedLabs: {
        lpa: labResult.lipoprotein_a ?? undefined,
        apoB: labResult.apolipoprotein_b ?? undefined,
        hsCrp: labResult.hs_crp ?? undefined,
        hba1c: labResult.hba1c ?? undefined,
      },
    };
  }

  // Latest imaging
  const { data: imgResult } = await supabase
    .from('imaging_results')
    .select('*')
    .eq('user_id', user.id)
    .order('performed_at', { ascending: false })
    .limit(1)
    .single();

  const imaging: Imaging | undefined = imgResult
    ? {
        cacScore: imgResult.agatston_scores?.total ?? undefined,
        cacDate: imgResult.performed_at ?? undefined,
        ctcaPerformed: imgResult.imaging_type === 'ctca',
      }
    : undefined;

  // Latest risk score
  const { data: latestScore } = await supabase
    .from('risk_scores')
    .select('score_value')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single();

  const recommendations = generateRecommendations({
    demographics,
    vitals,
    riskScore: latestScore?.score_value,
    labs,
    imaging,
    lpaEverMeasured: labResult?.lipoprotein_a != null,
    familyHistory: profile.family_history_premature_cvd,
  });

  const dataLevel = determineDataLevel({ age, sex: demographics.sex, vitals }, labs, imaging);

  return jsonResponse(
    { recommendations, dataLevel },
    200,
    DISCLAIMERS.general,
  );
});
