/**
 * Single assessment routes: GET, PUT, DELETE.
 */

import { NextRequest } from 'next/server';
import { assessmentInputSchema, computeBmi, computeWaistToHip, computeWaistToHeight, DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const GET = withAuth<{ id: string }>(async (_req, user, { id }) => {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('health_assessments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return errorResponse(
      error.code === 'PGRST116' ? 'Assessment not found' : error.message,
      error.code === 'PGRST116' ? 404 : 500,
    );
  }

  return jsonResponse(data, 200, DISCLAIMERS.general);
});

export const PUT = withAuth<{ id: string }>(async (req, user, { id }) => {
  const body = await req.json();
  const parsed = assessmentInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      400,
    );
  }

  const input = parsed.data;
  const bmi = computeBmi(input.heightCm, input.weightKg);
  const waistToHip = computeWaistToHip(input.waistCm, input.hipCm);
  const waistToHeight = computeWaistToHeight(input.waistCm, input.heightCm);

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('health_assessments')
    .update({
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
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, error.code === 'PGRST116' ? 404 : 500);
  }

  return jsonResponse(data, 200, DISCLAIMERS.general);
});

export const DELETE = withAuth<{ id: string }>(async (_req, user, { id }) => {
  const supabase = await createUserClient();
  const { error } = await supabase
    .from('health_assessments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ deleted: true });
});
