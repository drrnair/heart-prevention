/**
 * Risk scores routes: POST (calculate at any level), GET (history).
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DISCLAIMERS } from '@heart/shared';
import {
  calculateAscvd,
  classifyRisk,
  calculateFramingham,
  calculateScore2,
  adjustRiskByCac,
  determineDataLevel,
} from '@heart/risk-engine';
import type { Demographics, Vitals, Labs, Imaging, RiskInput } from '@heart/risk-engine';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const calculateSchema = z.object({
  assessmentId: z.string().uuid().optional(),
  labResultId: z.string().uuid().optional(),
  imagingId: z.string().uuid().optional(),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = calculateSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

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

  // Fetch latest assessment
  const assessmentQuery = parsed.data.assessmentId
    ? supabase.from('health_assessments').select('*').eq('id', parsed.data.assessmentId).eq('user_id', user.id).single()
    : supabase.from('health_assessments').select('*').eq('user_id', user.id).order('assessed_at', { ascending: false }).limit(1).single();

  const { data: assessment } = await assessmentQuery;

  if (!assessment) {
    return errorResponse('No assessment found. Submit vitals first.', 400);
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

  const vitals: Vitals = {
    systolicBp: assessment.systolic_bp,
    onBpMedication: profile.on_bp_meds,
    isSmoker: profile.smoking_status === 'current',
    hasDiabetes: profile.diabetes_status !== 'none',
    weightKg: assessment.weight_kg,
    heightCm: assessment.height_cm,
    waistCm: assessment.waist_cm ?? undefined,
    hipCm: assessment.hip_cm ?? undefined,
  };

  // Fetch labs if available
  let labs: Labs | undefined;
  const labQuery = parsed.data.labResultId
    ? supabase.from('lab_results').select('*').eq('id', parsed.data.labResultId).eq('user_id', user.id).single()
    : supabase.from('lab_results').select('*').eq('user_id', user.id).eq('extraction_status', 'confirmed').order('report_date', { ascending: false }).limit(1).single();

  const { data: labResult } = await labQuery;

  if (labResult) {
    const hasBasicLipids =
      labResult.total_cholesterol != null &&
      labResult.ldl_cholesterol != null &&
      labResult.hdl_cholesterol != null &&
      labResult.triglycerides != null;

    if (hasBasicLipids) {
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
          fastingGlucose: labResult.fasting_glucose ?? undefined,
        },
      };
    }
  }

  // Fetch imaging if available
  let imaging: Imaging | undefined;
  const imgQuery = parsed.data.imagingId
    ? supabase.from('imaging_results').select('*').eq('id', parsed.data.imagingId).eq('user_id', user.id).single()
    : supabase.from('imaging_results').select('*').eq('user_id', user.id).order('performed_at', { ascending: false }).limit(1).single();

  const { data: imgResult } = await imgQuery;

  if (imgResult) {
    imaging = {
      cacScore: imgResult.agatston_scores?.total ?? undefined,
      cacDate: imgResult.performed_at ?? undefined,
      ctcaPerformed: imgResult.imaging_type === 'ctca',
    };
  }

  // Determine data level
  const dataLevel = determineDataLevel(
    { age, sex: demographics.sex, vitals },
    labs,
    imaging,
  );

  // Calculate all applicable scores
  const scores: Record<string, unknown> = {};
  const inputSnapshot = { demographics, vitals, labs, imaging, dataLevel };

  // ASCVD PCE (requires basic lipids)
  if (labs?.basicLipids) {
    try {
      const ascvd = calculateAscvd({
        demographics,
        vitals,
        labs,
      });
      scores.ascvd_pce_10yr = {
        value: ascvd.tenYearRisk,
        category: ascvd.riskCategory,
      };
    } catch {
      // Skip if validation fails
    }
  }

  // Framingham
  if (labs?.basicLipids) {
    try {
      const framingham = calculateFramingham({
        demographics,
        vitals,
        labs,
      });
      scores.framingham_10yr = {
        value: framingham.tenYearRisk,
        category: framingham.riskCategory,
      };
    } catch {
      // Skip if validation fails
    }
  }

  // SCORE2 (European)
  if (labs?.basicLipids && profile.score2_region) {
    try {
      const score2 = calculateScore2({
        demographics,
        vitals,
        labs,
      });
      scores.score2_10yr = {
        value: score2.tenYearRisk,
        category: score2.riskCategory,
        algorithm: score2.algorithm,
      };
    } catch {
      // Skip if validation fails
    }
  }

  // MESA CAC adjustment
  if (imaging?.cacScore != null && scores.ascvd_pce_10yr) {
    try {
      const adjusted = adjustRiskByCac(
        (scores.ascvd_pce_10yr as { value: number }).value,
        imaging.cacScore,
        age,
        demographics.sex,
        demographics.ethnicity,
      );
      scores.mesa_cac_adjusted = {
        baselineRisk: adjusted.baselineRisk,
        adjustedRisk: adjusted.adjustedRisk,
        cacPercentile: adjusted.cacPercentile,
        reclassified: adjusted.reclassified,
        adjustedCategory: adjusted.adjustedCategory,
      };
    } catch {
      // Skip
    }
  }

  // Store all scores
  const storedScores = [];
  for (const [scoreType, scoreData] of Object.entries(scores)) {
    const sd = scoreData as { value: number; category: string };
    const { data: stored, error: storeErr } = await supabase
      .from('risk_scores')
      .insert({
        user_id: user.id,
        score_type: scoreType,
        data_level: dataLevel,
        score_value: sd.value,
        risk_category: sd.category,
        input_snapshot: inputSnapshot,
        calculated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!storeErr && stored) {
      storedScores.push(stored);
    }
  }

  return jsonResponse(
    { scores, storedScores, dataLevel },
    201,
    DISCLAIMERS.riskScore,
  );
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);
  const scoreType = searchParams.get('scoreType');

  const supabase = await createUserClient();
  let query = supabase
    .from('risk_scores')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (scoreType) {
    query = query.eq('score_type', scoreType);
  }

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ items: data, total: count, limit, offset }, 200, DISCLAIMERS.riskScore);
});
