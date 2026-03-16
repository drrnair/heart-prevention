/**
 * Assessments routes: POST (create), GET (list user's assessments).
 */

import { NextRequest } from 'next/server';
import { assessmentInputSchema, computeBmi, computeWaistToHip, computeWaistToHeight, classifyBmi, classifyBp } from '@heart/shared';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = assessmentInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const input = parsed.data;

  // Compute derived metrics server-side (immutable)
  const bmi = computeBmi(input.heightCm, input.weightKg);
  const waistToHip = computeWaistToHip(input.waistCm, input.hipCm);
  const waistToHeight = computeWaistToHeight(input.waistCm, input.heightCm);

  const record = {
    user_id: user.id,
    assessed_at: input.assessedAt,
    systolic_bp: input.systolicBp,
    diastolic_bp: input.diastolicBp,
    pulse_rate: input.pulseRate ?? null,
    height_cm: input.heightCm,
    weight_kg: input.weightKg,
    waist_cm: input.waistCm ?? null,
    hip_cm: input.hipCm ?? null,
    bmi,
    waist_to_hip: waistToHip,
    waist_to_height: waistToHeight,
    notes: input.notes ?? null,
  };

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('health_assessments')
    .insert(record)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 500);
  }

  const interpretation = {
    bmiCategory: classifyBmi(bmi),
    bpCategory: classifyBp(input.systolicBp, input.diastolicBp),
  };

  return jsonResponse(
    { ...data, interpretation },
    201,
    DISCLAIMERS.general,
  );
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const supabase = await createUserClient();
  const { data, error, count } = await supabase
    .from('health_assessments')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('assessed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ items: data, total: count, limit, offset }, 200, DISCLAIMERS.general);
});
