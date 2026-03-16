-- =============================================================================
-- Heart Prevention App — Development Seed Data
-- File: seed.sql
-- Description: Test user with sample assessments for local development
-- WARNING: Do NOT run in production. Uses a fixed UUID for testing.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Test user profile
-- Note: In local dev, create this user in Supabase Auth first via the
-- dashboard or `supabase auth signup` with email: test@heartprevention.dev
-- The UUID below must match the auth.users id.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000001';
  assessment_1_id uuid;
  assessment_2_id uuid;
  lab_1_id uuid;
  imaging_1_id uuid;
BEGIN

-- Insert test profile (idempotent)
INSERT INTO profiles (
  id, role, display_name, date_of_birth, biological_sex, ethnicity, country,
  smoking_status, diabetes_status, family_history_premature_cvd,
  on_bp_treatment, on_statin, on_aspirin, on_anticoagulant,
  advanced_insights_opt_in, subscription_tier
) VALUES (
  test_user_id, 'user', 'Test User', '1975-06-15', 'male', 'south_asian', 'IN',
  'never', 'none', true,
  false, false, false, false,
  true, 'premium_trial'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Assessment 1 — Level 1 (demographics + vitals only)
-- ---------------------------------------------------------------------------
INSERT INTO health_assessments (
  user_id, data_level, age_at_assessment,
  systolic_bp, diastolic_bp, pulse_rate,
  height_cm, weight_kg, waist_cm, hip_cm,
  smoking_status, diabetes_status, on_bp_treatment, on_statin,
  family_history_premature_cvd
) VALUES (
  test_user_id, 'level_1', 50,
  138, 88, 72,
  175.0, 85.0, 96.0, 102.0,
  'never', 'none', false, false,
  true
)
RETURNING id INTO assessment_1_id;

-- Risk score for Assessment 1 (imputed lipids)
INSERT INTO risk_scores (
  user_id, assessment_id, score_type, score_value, lower_bound, upper_bound,
  risk_category, data_level,
  imputed_tc, imputed_hdl, imputed_ldl, imputed_sbp,
  imputation_note, input_snapshot
) VALUES (
  test_user_id, assessment_1_id, 'ascvd_pce_10yr', 12.4, 8.2, 18.1,
  'borderline', 'level_1',
  true, true, false, false,
  'TC and HDL imputed from NHANES median for 50-59 south_asian male',
  '{"age": 50, "sex": "male", "ethnicity": "south_asian", "systolic_bp": 138, "smoking": false, "diabetes": false, "on_bp_treatment": false, "tc_imputed": 205, "hdl_imputed": 44}'::jsonb
);

-- Investigation recommendations for Assessment 1
INSERT INTO investigation_recommendations (
  user_id, assessment_id, test_code, category, tier, priority,
  rationale, guideline_reference, status
) VALUES
(test_user_id, assessment_1_id, 'LIPID_PANEL', 'blood_test', 'level_2', 1,
 'Fasting lipid panel required for accurate ASCVD risk calculation. Current estimate uses imputed values.',
 'ACC/AHA 2019 Guideline §4.1', 'pending'),
(test_user_id, assessment_1_id, 'HBA1C', 'blood_test', 'level_2', 2,
 'HbA1c recommended for diabetes screening given family history of premature CVD and South Asian ethnicity.',
 'ADA Standards of Care 2024 §2', 'pending'),
(test_user_id, assessment_1_id, 'HS_CRP', 'blood_test', 'level_3', 3,
 'hs-CRP may help reclassify borderline risk patients per ACC/AHA guidelines.',
 'ACC/AHA 2019 §4.3.2', 'pending');

-- ---------------------------------------------------------------------------
-- Assessment 2 — Level 2 (demographics + basic labs)
-- ---------------------------------------------------------------------------
INSERT INTO health_assessments (
  user_id, data_level, age_at_assessment,
  systolic_bp, diastolic_bp, pulse_rate,
  height_cm, weight_kg, waist_cm, hip_cm,
  smoking_status, diabetes_status, on_bp_treatment, on_statin,
  family_history_premature_cvd
) VALUES (
  test_user_id, 'level_2', 50,
  136, 86, 70,
  175.0, 84.5, 95.0, 102.0,
  'never', 'none', false, false,
  true
)
RETURNING id INTO assessment_2_id;

-- Lab results for Assessment 2
INSERT INTO lab_results (
  user_id, assessment_id, lab_date, fasting, extraction_status,
  total_cholesterol, hdl_cholesterol, ldl_cholesterol, triglycerides,
  vldl, non_hdl_cholesterol, tc_hdl_ratio,
  fasting_glucose, hba1c,
  creatinine, egfr,
  alt, ast,
  hemoglobin, wbc, platelet_count,
  tsh
) VALUES (
  test_user_id, assessment_2_id, '2026-03-10', true, 'confirmed',
  228, 42, 148, 190,
  38, 186, 5.4,
  108, 5.8,
  0.95, 92,
  28, 24,
  14.8, 7.2, 245,
  2.4
)
RETURNING id INTO lab_1_id;

-- Risk score for Assessment 2 (actual lipids)
INSERT INTO risk_scores (
  user_id, assessment_id, score_type, score_value, lower_bound, upper_bound,
  risk_category, data_level,
  imputed_tc, imputed_hdl, imputed_ldl, imputed_sbp,
  input_snapshot
) VALUES (
  test_user_id, assessment_2_id, 'ascvd_pce_10yr', 14.8, 10.5, 20.2,
  'intermediate', 'level_2',
  false, false, false, false,
  '{"age": 50, "sex": "male", "ethnicity": "south_asian", "systolic_bp": 136, "smoking": false, "diabetes": false, "on_bp_treatment": false, "tc": 228, "hdl": 42, "ldl": 148}'::jsonb
);

-- Investigation recommendations for Assessment 2
INSERT INTO investigation_recommendations (
  user_id, assessment_id, test_code, category, tier, priority,
  rationale, guideline_reference, status
) VALUES
(test_user_id, assessment_2_id, 'LPA', 'blood_test', 'level_3', 1,
 'Lp(a) screening recommended once in lifetime, especially for South Asian ethnicity with intermediate risk and family history of premature CVD.',
 'ESC/EAS 2019 §4.5; AHA/ACC 2019 Risk Enhancer', 'pending'),
(test_user_id, assessment_2_id, 'APOB', 'blood_test', 'level_3', 2,
 'ApoB provides better estimate of atherogenic particle burden than LDL-C alone. Recommended when TG elevated (190 mg/dL).',
 'ACC/AHA 2019 §4.3; AACC Lipid Panel Recs', 'pending'),
(test_user_id, assessment_2_id, 'CAC_SCORE', 'imaging', 'level_4', 2,
 'CAC score recommended for intermediate-risk patients to guide statin therapy discussion. MESA reclassification may move to high risk.',
 'ACC/AHA 2019 §4.3.3; SCCT 2017', 'pending'),
(test_user_id, assessment_2_id, 'HOMA_IR', 'blood_test', 'level_3', 3,
 'Fasting insulin/HOMA-IR recommended to assess insulin resistance given elevated fasting glucose (108), HbA1c 5.8% (prediabetes range), and central obesity.',
 'ADA Standards 2024 §2; IDF Consensus', 'pending');

-- Lifestyle plan for Assessment 2
INSERT INTO lifestyle_plans (
  user_id, assessment_id, plan_status, plan_name,
  exercise_plan, diet_plan, stress_plan, sleep_plan,
  general_advice, disclaimer
) VALUES (
  test_user_id, assessment_2_id, 'active', '12-Week Cardiometabolic Reset',
  '{
    "weeks_1_4": {
      "aerobic": "Brisk walking 30 min × 5 days/week. Target HR 110-125 bpm.",
      "resistance": "2× per week full-body (bodyweight or light resistance bands)",
      "flexibility": "Daily 10 min stretching or yoga"
    },
    "weeks_5_8": {
      "aerobic": "Increase to 40 min × 5 days. Add one interval session (4×4 min at 80% max HR).",
      "resistance": "3× per week, progressive overload",
      "flexibility": "Continue daily"
    },
    "weeks_9_12": {
      "aerobic": "45 min × 5 days. Two interval sessions per week.",
      "resistance": "3× per week",
      "flexibility": "Continue daily",
      "target": "150-300 min moderate or 75-150 min vigorous per week (ACC/AHA)"
    }
  }'::jsonb,
  '{
    "pattern": "Mediterranean-style with South Asian adaptations",
    "key_changes": [
      "Replace refined oils with cold-pressed mustard/olive oil",
      "Increase soluble fibre: oats, psyllium, dal (5-10g/day)",
      "2 servings fatty fish per week (or algal omega-3 supplement)",
      "Reduce refined carbohydrates (white rice → brown rice, millets)",
      "Nuts: 30g/day (almonds, walnuts)",
      "Limit added sugar to <25g/day"
    ],
    "specific_targets": {
      "sodium": "<2300 mg/day (ideally <1500 mg)",
      "fibre": "25-30 g/day",
      "saturated_fat": "<7% of calories",
      "omega3": "1-2g EPA+DHA/day from food + supplement"
    }
  }'::jsonb,
  '{"recommendations": ["10 min daily mindfulness/pranayama", "Limit screen time 1h before bed"]}'::jsonb,
  '{"target_hours": "7-8 hours", "recommendations": ["Consistent sleep schedule", "Cool dark room", "No caffeine after 2pm"]}'::jsonb,
  'Based on your intermediate ASCVD risk (14.8% 10-year) and metabolic profile, this plan focuses on reducing modifiable risk factors: central adiposity, borderline glucose, and atherogenic dyslipidemia (high TG, low HDL). Aim for 5-7% weight loss over 12 weeks.',
  'This is a wellness plan, not medical advice. Please discuss any lifestyle changes with your healthcare provider, especially if you have existing medical conditions or are taking medications.'
);

-- Weekly check-in samples
INSERT INTO weekly_checkins (user_id, week_of, weight_kg, systolic_bp, diastolic_bp, resting_hr, exercise_days, exercise_minutes_total, exercise_types, diet_adherence, mood_score, energy_score, sleep_quality, sleep_hours_avg, stress_score, supplement_adherence, notes) VALUES
(test_user_id, '2026-03-03', 85.0, 138, 88, 72, 3, 90, ARRAY['walking', 'stretching'], 6, 7, 6, 7, 6.5, 5, 7, 'Started the plan this week. Walking feels good.'),
(test_user_id, '2026-03-10', 84.5, 136, 86, 70, 4, 130, ARRAY['walking', 'stretching', 'bodyweight'], 7, 7, 7, 7, 7.0, 4, 8, 'Added bodyweight exercises. Feeling more energetic.');

-- User supplements
INSERT INTO user_supplements (user_id, name, category, dose, frequency, reason, started_at) VALUES
(test_user_id, 'Omega-3 (EPA/DHA)', 'supplement', '2000 mg', 'daily', 'Triglyceride reduction', '2026-03-03'),
(test_user_id, 'Vitamin D3', 'supplement', '2000 IU', 'daily', 'Deficiency prevention', '2026-03-03'),
(test_user_id, 'Psyllium Husk', 'supplement', '5 g', 'twice daily', 'LDL reduction, fibre intake', '2026-03-03'),
(test_user_id, 'Magnesium Glycinate', 'supplement', '400 mg', 'daily', 'BP support, sleep quality', '2026-03-03');

-- AI chat messages
INSERT INTO ai_chat_messages (user_id, role, content) VALUES
(test_user_id, 'user', 'My total cholesterol is 228 and HDL is 42. How concerned should I be?'),
(test_user_id, 'assistant', 'Your total cholesterol of 228 mg/dL is above the desirable range (<200 mg/dL), and your HDL of 42 mg/dL is below the target for men (>40, ideally >50 mg/dL). The combination — especially your non-HDL cholesterol of 186 mg/dL — suggests an atherogenic lipid pattern that is common in South Asian populations.

Key context:
- Your TC/HDL ratio of 5.4 puts you above the 75th percentile for your age/ethnicity group
- Your triglycerides at 190 mg/dL are elevated, contributing to the low HDL

This pattern responds well to lifestyle changes: Mediterranean-style diet, regular aerobic exercise, omega-3 supplementation, and weight management. Your personalised plan has been updated with specific targets.

This is not medical advice. Please discuss your lipid results and any treatment decisions with your healthcare provider.');

END $$;
