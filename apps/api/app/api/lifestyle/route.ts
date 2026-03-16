/**
 * Lifestyle plan routes: POST (generate new plan), GET (current plan).
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { generateLifestylePlan } from '@/lib/ai';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

export const POST = withAuth(async (_req: NextRequest, user) => {
  const supabase = await createUserClient();

  // Fetch profile, latest scores, labs, and preferences
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return errorResponse('Profile not found', 404);
  }

  const { data: scores } = await supabase
    .from('risk_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .limit(5);

  const { data: labs } = await supabase
    .from('lab_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('extraction_status', 'confirmed')
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  const profileSummary = {
    biologicalSex: profile.biological_sex,
    age: Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
    smokingStatus: profile.smoking_status,
    diabetesStatus: profile.diabetes_status,
    activityLevel: profile.activity_level,
    cuisinePreferences: profile.cuisine_preferences,
  };

  const preferences = {
    cuisinePreferences: profile.cuisine_preferences ?? [],
    activityLevel: profile.activity_level,
  };

  try {
    const plan = await generateLifestylePlan(
      profileSummary,
      { recentScores: scores ?? [] },
      { latestLabs: labs ?? null },
      preferences,
    );

    // Store the plan
    const { data: stored, error: storeErr } = await supabase
      .from('lifestyle_plans')
      .insert({
        user_id: user.id,
        category: 'diet',
        title: '12-Week Cardiometabolic Reset',
        description: plan.clinicalSummary,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goals: Object.values(plan.targets),
        plan_data: plan,
        disclaimer: DISCLAIMERS.lifestyle,
      })
      .select()
      .single();

    if (storeErr) {
      return errorResponse(storeErr.message, 500);
    }

    return jsonResponse(
      { plan: stored, details: plan },
      201,
      DISCLAIMERS.lifestyle,
    );
  } catch (err) {
    return errorResponse(
      `Plan generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500,
    );
  }
});

export const GET = withAuth(async (_req: NextRequest, user) => {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from('lifestyle_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return jsonResponse(null, 200, DISCLAIMERS.lifestyle);
    }
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data, 200, DISCLAIMERS.lifestyle);
});
