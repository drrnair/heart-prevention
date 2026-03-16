/**
 * Trends: GET longitudinal time series data.
 * Returns risk scores, lab values, vitals over time with data level annotations.
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const months = Math.min(parseInt(searchParams.get('months') ?? '12', 10), 60);
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const sinceIso = since.toISOString();

  const supabase = await createUserClient();

  // Fetch risk scores over time
  const { data: riskScores } = await supabase
    .from('risk_scores')
    .select('score_type, score_value, risk_category, data_level, calculated_at')
    .eq('user_id', user.id)
    .gte('calculated_at', sinceIso)
    .order('calculated_at', { ascending: true });

  // Fetch lab values over time
  const { data: labResults } = await supabase
    .from('lab_results')
    .select('report_date, total_cholesterol, ldl_cholesterol, hdl_cholesterol, triglycerides, hba1c, hs_crp, apolipoprotein_b, lipoprotein_a')
    .eq('user_id', user.id)
    .eq('extraction_status', 'confirmed')
    .gte('report_date', sinceIso.split('T')[0])
    .order('report_date', { ascending: true });

  // Fetch vitals over time
  const { data: assessments } = await supabase
    .from('health_assessments')
    .select('assessed_at, systolic_bp, diastolic_bp, bmi, weight_kg, waist_to_hip, waist_to_height')
    .eq('user_id', user.id)
    .gte('assessed_at', sinceIso)
    .order('assessed_at', { ascending: true });

  // Fetch check-ins
  const { data: checkins } = await supabase
    .from('weekly_checkins')
    .select('week_starting, exercise_minutes, sleep_hours_avg, stress_level, mood_level')
    .eq('user_id', user.id)
    .gte('week_starting', sinceIso.split('T')[0])
    .order('week_starting', { ascending: true });

  return jsonResponse(
    {
      period: { months, since: sinceIso },
      riskScores: riskScores ?? [],
      labValues: labResults ?? [],
      vitals: assessments ?? [],
      checkins: checkins ?? [],
    },
    200,
    DISCLAIMERS.riskScore,
  );
});
