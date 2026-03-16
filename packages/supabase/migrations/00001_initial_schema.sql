-- =============================================================================
-- Heart Prevention App — Initial Schema
-- Migration: 00001_initial_schema.sql
-- Description: Enums, tables, indexes, constraints
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Updated_at trigger function (defined early, before any table references it)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('user', 'clinician', 'admin');
CREATE TYPE biological_sex AS ENUM ('male', 'female');
CREATE TYPE smoking_status AS ENUM ('current', 'former', 'never');
CREATE TYPE diabetes_status AS ENUM ('none', 'prediabetes', 'type1', 'type2');
CREATE TYPE extraction_status AS ENUM ('pending', 'extracted', 'confirmed', 'rejected');
CREATE TYPE score_type AS ENUM (
  'ascvd_pce_10yr',
  'ascvd_pce_lifetime',
  'framingham_10yr',
  'score2_10yr',
  'score2_op_10yr'
);
CREATE TYPE risk_category AS ENUM ('low', 'borderline', 'intermediate', 'high');
CREATE TYPE data_level_enum AS ENUM ('level_1', 'level_2', 'level_3', 'level_4');
CREATE TYPE recommendation_status AS ENUM ('pending', 'scheduled', 'completed', 'declined', 'snoozed');
CREATE TYPE imaging_type AS ENUM ('cac_score', 'ctca', 'carotid_ultrasound');
CREATE TYPE plan_status AS ENUM ('active', 'archived', 'superseded');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'premium_trial');

-- ---------------------------------------------------------------------------
-- 1. profiles — extends auth.users
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            user_role        NOT NULL DEFAULT 'user',
  display_name    text,
  date_of_birth   date,
  biological_sex  biological_sex,
  ethnicity       text,            -- free-text; app normalises for scoring
  country         text,
  smoking_status  smoking_status,
  diabetes_status diabetes_status  DEFAULT 'none',
  family_history_premature_cvd boolean DEFAULT false,
  on_bp_treatment boolean         DEFAULT false,
  on_statin       boolean         DEFAULT false,
  on_aspirin      boolean         DEFAULT false,
  on_anticoagulant boolean        DEFAULT false,
  eGFR_known      numeric(6,2),
  hs_crp_known    numeric(6,2),
  lpa_known       numeric(8,2),
  advanced_insights_opt_in boolean DEFAULT false,

  -- Subscription
  subscription_tier      subscription_tier NOT NULL DEFAULT 'free',
  trial_expires_at       timestamptz,
  subscription_expires_at timestamptz,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_date_of_birth CHECK (
    date_of_birth IS NULL OR (date_of_birth > '1900-01-01' AND date_of_birth < CURRENT_DATE)
  )
);

CREATE INDEX idx_profiles_role ON profiles(role);

-- ---------------------------------------------------------------------------
-- 2. clinician_patient_links
-- ---------------------------------------------------------------------------
CREATE TABLE clinician_patient_links (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  linked_at    timestamptz NOT NULL DEFAULT now(),
  revoked_at   timestamptz,

  CONSTRAINT uq_clinician_patient UNIQUE (clinician_id, patient_id),
  CONSTRAINT chk_not_self_link CHECK (clinician_id <> patient_id)
);

CREATE INDEX idx_cpl_clinician ON clinician_patient_links(clinician_id);
CREATE INDEX idx_cpl_patient   ON clinician_patient_links(patient_id);

-- ---------------------------------------------------------------------------
-- 3. health_assessments — biometric questionnaire snapshot
-- ---------------------------------------------------------------------------
CREATE TABLE health_assessments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data_level      data_level_enum NOT NULL DEFAULT 'level_1',

  -- Vitals
  age_at_assessment smallint,
  systolic_bp     smallint,
  diastolic_bp    smallint,
  pulse_rate      smallint,
  height_cm       numeric(5,1),
  weight_kg       numeric(5,1),
  waist_cm        numeric(5,1),
  hip_cm          numeric(5,1),

  -- Computed columns
  bmi             numeric(5,2) GENERATED ALWAYS AS (
                    CASE WHEN height_cm > 0 AND weight_kg > 0
                         THEN weight_kg / ((height_cm / 100.0) * (height_cm / 100.0))
                         ELSE NULL END
                  ) STORED,
  waist_to_hip    numeric(5,3) GENERATED ALWAYS AS (
                    CASE WHEN hip_cm > 0 AND waist_cm > 0
                         THEN waist_cm / hip_cm
                         ELSE NULL END
                  ) STORED,
  waist_to_height numeric(5,3) GENERATED ALWAYS AS (
                    CASE WHEN height_cm > 0 AND waist_cm > 0
                         THEN waist_cm / height_cm
                         ELSE NULL END
                  ) STORED,

  -- Snapshot of profile flags at assessment time
  smoking_status  smoking_status,
  diabetes_status diabetes_status,
  on_bp_treatment boolean,
  on_statin       boolean,
  family_history_premature_cvd boolean,

  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_age       CHECK (age_at_assessment IS NULL OR (age_at_assessment BETWEEN 18 AND 120)),
  CONSTRAINT chk_systolic  CHECK (systolic_bp IS NULL OR (systolic_bp BETWEEN 60 AND 300)),
  CONSTRAINT chk_diastolic CHECK (diastolic_bp IS NULL OR (diastolic_bp BETWEEN 30 AND 200)),
  CONSTRAINT chk_pulse     CHECK (pulse_rate IS NULL OR (pulse_rate BETWEEN 30 AND 250)),
  CONSTRAINT chk_height    CHECK (height_cm IS NULL OR (height_cm BETWEEN 50 AND 280)),
  CONSTRAINT chk_weight    CHECK (weight_kg IS NULL OR (weight_kg BETWEEN 20 AND 400)),
  CONSTRAINT chk_waist     CHECK (waist_cm IS NULL OR (waist_cm BETWEEN 40 AND 200)),
  CONSTRAINT chk_hip       CHECK (hip_cm IS NULL OR (hip_cm BETWEEN 50 AND 200))
);

CREATE INDEX idx_ha_user       ON health_assessments(user_id);
CREATE INDEX idx_ha_created    ON health_assessments(created_at DESC);
CREATE INDEX idx_ha_user_created ON health_assessments(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. lab_results — blood work
-- ---------------------------------------------------------------------------
CREATE TABLE lab_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id   uuid REFERENCES health_assessments(id) ON DELETE SET NULL,

  lab_date        date,
  fasting         boolean,
  extraction_status extraction_status NOT NULL DEFAULT 'pending',
  source_image_path text,           -- storage bucket path

  -- Lipid Panel (mg/dL)
  total_cholesterol   numeric(6,2),
  hdl_cholesterol     numeric(6,2),
  ldl_cholesterol     numeric(6,2),
  triglycerides       numeric(7,2),
  vldl                numeric(6,2),
  non_hdl_cholesterol numeric(6,2),
  tc_hdl_ratio        numeric(5,2),

  -- Extended Lipids
  apolipoprotein_b    numeric(6,2),  -- mg/dL
  lipoprotein_a       numeric(8,2),  -- nmol/L
  sdldl               numeric(6,2),  -- mg/dL (small dense LDL)
  lp_pla2             numeric(6,2),  -- ng/mL

  -- Glycemic
  fasting_glucose     numeric(6,2),  -- mg/dL
  hba1c               numeric(4,2),  -- %
  fasting_insulin     numeric(7,2),  -- µU/mL
  homa_ir             numeric(5,2),

  -- Renal
  creatinine          numeric(5,2),  -- mg/dL
  egfr                numeric(6,2),  -- mL/min/1.73m²
  bun                 numeric(6,2),  -- mg/dL
  uric_acid           numeric(5,2),  -- mg/dL
  microalbumin        numeric(7,2),  -- mg/L
  acr                 numeric(7,2),  -- mg/g (albumin-to-creatinine ratio)

  -- Hepatic
  alt                 numeric(6,2),  -- U/L
  ast                 numeric(6,2),  -- U/L
  ggt                 numeric(6,2),  -- U/L
  alkaline_phosphatase numeric(6,2), -- U/L
  total_bilirubin     numeric(5,2),  -- mg/dL

  -- Inflammatory
  hs_crp              numeric(6,2),  -- mg/L
  esr                 numeric(6,2),  -- mm/hr
  il6                 numeric(6,2),  -- pg/mL
  homocysteine        numeric(6,2),  -- µmol/L
  fibrinogen          numeric(6,2),  -- mg/dL

  -- Hematology
  hemoglobin          numeric(5,2),  -- g/dL
  wbc                 numeric(7,2),  -- × 10³/µL
  platelet_count      numeric(7,0),  -- × 10³/µL
  neutrophil_pct      numeric(5,2),
  lymphocyte_pct      numeric(5,2),
  nlr                 numeric(5,2),  -- neutrophil-to-lymphocyte ratio

  -- Thyroid
  tsh                 numeric(6,3),  -- mIU/L
  free_t4             numeric(5,2),  -- ng/dL
  free_t3             numeric(5,2),  -- pg/mL

  -- Electrolytes
  sodium              numeric(5,1),  -- mEq/L
  potassium           numeric(4,2),  -- mEq/L
  calcium             numeric(5,2),  -- mg/dL
  magnesium           numeric(4,2),  -- mg/dL
  phosphorus          numeric(4,2),  -- mg/dL

  -- Vitamin D
  vitamin_d_25oh      numeric(6,2),  -- ng/mL

  -- Catch-all for non-standard values
  additional_values   jsonb DEFAULT '{}',

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_tc   CHECK (total_cholesterol IS NULL OR (total_cholesterol BETWEEN 50 AND 600)),
  CONSTRAINT chk_hdl  CHECK (hdl_cholesterol IS NULL OR (hdl_cholesterol BETWEEN 10 AND 200)),
  CONSTRAINT chk_ldl  CHECK (ldl_cholesterol IS NULL OR (ldl_cholesterol BETWEEN 10 AND 500)),
  CONSTRAINT chk_trig CHECK (triglycerides IS NULL OR (triglycerides BETWEEN 20 AND 5000)),
  CONSTRAINT chk_hba1c CHECK (hba1c IS NULL OR (hba1c BETWEEN 3.0 AND 20.0)),
  CONSTRAINT chk_egfr CHECK (egfr IS NULL OR (egfr BETWEEN 2 AND 200)),
  CONSTRAINT chk_hscrp CHECK (hs_crp IS NULL OR (hs_crp BETWEEN 0.01 AND 200))
);

CREATE INDEX idx_lr_user       ON lab_results(user_id);
CREATE INDEX idx_lr_assessment ON lab_results(assessment_id);
CREATE INDEX idx_lr_created    ON lab_results(created_at DESC);
CREATE INDEX idx_lr_user_created ON lab_results(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. imaging_results
-- ---------------------------------------------------------------------------
CREATE TABLE imaging_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id   uuid REFERENCES health_assessments(id) ON DELETE SET NULL,
  imaging_type    imaging_type NOT NULL,
  imaging_date    date,
  source_image_path text,

  -- CAC Score fields
  agatston_total       numeric(8,1),
  agatston_lad         numeric(7,1),
  agatston_lcx         numeric(7,1),
  agatston_rca         numeric(7,1),
  agatston_lm          numeric(7,1),
  cac_percentile       numeric(5,1),
  cac_risk_category    risk_category,

  -- CTCA fields
  cad_rads             text,         -- e.g., '3' or '4A'
  max_stenosis_pct     smallint,
  plaque_type          text,         -- calcified, non-calcified, mixed
  high_risk_plaque     boolean DEFAULT false,
  napkin_ring_sign     boolean DEFAULT false,
  low_attenuation_plaque boolean DEFAULT false,
  positive_remodeling  boolean DEFAULT false,
  spotty_calcification boolean DEFAULT false,
  segment_findings     jsonb DEFAULT '[]',  -- per-segment detail
  lvef                 numeric(4,1),         -- % from CTCA if available

  -- Carotid ultrasound
  right_cimt           numeric(4,2),  -- mm
  left_cimt            numeric(4,2),  -- mm
  max_cimt             numeric(4,2),  -- mm
  plaque_present       boolean,

  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_cac_total  CHECK (agatston_total IS NULL OR agatston_total >= 0),
  CONSTRAINT chk_cac_pctile CHECK (cac_percentile IS NULL OR (cac_percentile BETWEEN 0 AND 100)),
  CONSTRAINT chk_stenosis   CHECK (max_stenosis_pct IS NULL OR (max_stenosis_pct BETWEEN 0 AND 100)),
  CONSTRAINT chk_lvef       CHECK (lvef IS NULL OR (lvef BETWEEN 5 AND 95))
);

CREATE INDEX idx_ir_user       ON imaging_results(user_id);
CREATE INDEX idx_ir_assessment ON imaging_results(assessment_id);
CREATE INDEX idx_ir_type       ON imaging_results(imaging_type);
CREATE INDEX idx_ir_user_created ON imaging_results(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 6. risk_scores
-- ---------------------------------------------------------------------------
CREATE TABLE risk_scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id   uuid REFERENCES health_assessments(id) ON DELETE SET NULL,

  score_type      score_type NOT NULL,
  score_value     numeric(6,2) NOT NULL,       -- percentage
  lower_bound     numeric(6,2),                -- 95% CI lower
  upper_bound     numeric(6,2),                -- 95% CI upper
  risk_category   risk_category NOT NULL,

  data_level      data_level_enum NOT NULL,
  imputed_tc      boolean DEFAULT false,
  imputed_hdl     boolean DEFAULT false,
  imputed_ldl     boolean DEFAULT false,
  imputed_sbp     boolean DEFAULT false,
  imputation_note text,

  -- MESA CAC adjustment
  mesa_adjusted   boolean DEFAULT false,
  mesa_cac_score  numeric(8,1),
  mesa_reclassified_category risk_category,

  -- Full input snapshot for reproducibility
  input_snapshot  jsonb NOT NULL DEFAULT '{}',

  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_score_val CHECK (score_value BETWEEN 0 AND 100),
  CONSTRAINT chk_bounds    CHECK (lower_bound IS NULL OR lower_bound <= score_value),
  CONSTRAINT chk_bounds_up CHECK (upper_bound IS NULL OR upper_bound >= score_value)
);

CREATE INDEX idx_rs_user       ON risk_scores(user_id);
CREATE INDEX idx_rs_assessment ON risk_scores(assessment_id);
CREATE INDEX idx_rs_type       ON risk_scores(score_type);
CREATE INDEX idx_rs_user_created ON risk_scores(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 7. investigation_recommendations
-- ---------------------------------------------------------------------------
CREATE TABLE investigation_recommendations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id   uuid REFERENCES health_assessments(id) ON DELETE SET NULL,

  test_code       text NOT NULL,               -- e.g., 'CAC', 'ApoB', 'Lp(a)'
  category        text NOT NULL,               -- e.g., 'imaging', 'blood_test'
  tier            data_level_enum NOT NULL,     -- which data level this unlocks
  priority        smallint NOT NULL DEFAULT 3,  -- 1 = highest
  rationale       text NOT NULL,
  guideline_reference text NOT NULL,           -- e.g., 'ACC/AHA 2019 §4.3'

  status          recommendation_status NOT NULL DEFAULT 'pending',
  result_lab_id   uuid REFERENCES lab_results(id) ON DELETE SET NULL,
  result_imaging_id uuid REFERENCES imaging_results(id) ON DELETE SET NULL,
  completed_at    timestamptz,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_priority CHECK (priority BETWEEN 1 AND 5)
);

CREATE INDEX idx_rec_user       ON investigation_recommendations(user_id);
CREATE INDEX idx_rec_assessment ON investigation_recommendations(assessment_id);
CREATE INDEX idx_rec_status     ON investigation_recommendations(status);
CREATE INDEX idx_rec_user_status ON investigation_recommendations(user_id, status);

-- ---------------------------------------------------------------------------
-- 8. lifestyle_plans
-- ---------------------------------------------------------------------------
CREATE TABLE lifestyle_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id   uuid REFERENCES health_assessments(id) ON DELETE SET NULL,

  plan_status     plan_status NOT NULL DEFAULT 'active',
  plan_name       text NOT NULL DEFAULT 'Personalised Wellness Plan',

  exercise_plan   jsonb NOT NULL DEFAULT '{}',   -- structured exercise prescription
  diet_plan       jsonb NOT NULL DEFAULT '{}',   -- structured dietary guidance
  stress_plan     jsonb DEFAULT '{}',
  sleep_plan      jsonb DEFAULT '{}',
  general_advice  text,

  disclaimer      text NOT NULL DEFAULT 'This is not medical advice. Please consult your healthcare provider before making changes to your diet, exercise, or lifestyle.',

  valid_from      date NOT NULL DEFAULT CURRENT_DATE,
  valid_until     date,
  superseded_by   uuid REFERENCES lifestyle_plans(id) ON DELETE SET NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lp_user       ON lifestyle_plans(user_id);
CREATE INDEX idx_lp_status     ON lifestyle_plans(plan_status);
CREATE INDEX idx_lp_user_active ON lifestyle_plans(user_id, plan_status) WHERE plan_status = 'active';

-- ---------------------------------------------------------------------------
-- 9. weekly_checkins
-- ---------------------------------------------------------------------------
CREATE TABLE weekly_checkins (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  week_of         date NOT NULL,

  -- Weight & vitals
  weight_kg       numeric(5,1),
  systolic_bp     smallint,
  diastolic_bp    smallint,
  resting_hr      smallint,

  -- Exercise
  exercise_days   smallint,            -- days active this week
  exercise_minutes_total smallint,     -- total minutes this week
  exercise_types  text[],              -- e.g., {'walking', 'swimming'}

  -- Diet adherence (1-10 self-rated)
  diet_adherence  smallint,
  alcohol_units   numeric(4,1),

  -- Wellbeing (1-10)
  mood_score      smallint,
  energy_score    smallint,
  sleep_quality   smallint,
  sleep_hours_avg numeric(3,1),
  stress_score    smallint,

  -- Supplement / medication adherence (1-10)
  supplement_adherence smallint,

  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_user_week UNIQUE (user_id, week_of),
  CONSTRAINT chk_wk_weight CHECK (weight_kg IS NULL OR (weight_kg BETWEEN 20 AND 400)),
  CONSTRAINT chk_wk_sys    CHECK (systolic_bp IS NULL OR (systolic_bp BETWEEN 60 AND 300)),
  CONSTRAINT chk_wk_dia    CHECK (diastolic_bp IS NULL OR (diastolic_bp BETWEEN 30 AND 200)),
  CONSTRAINT chk_wk_hr     CHECK (resting_hr IS NULL OR (resting_hr BETWEEN 30 AND 250)),
  CONSTRAINT chk_wk_exdays CHECK (exercise_days IS NULL OR (exercise_days BETWEEN 0 AND 7)),
  CONSTRAINT chk_wk_diet   CHECK (diet_adherence IS NULL OR (diet_adherence BETWEEN 1 AND 10)),
  CONSTRAINT chk_wk_mood   CHECK (mood_score IS NULL OR (mood_score BETWEEN 1 AND 10)),
  CONSTRAINT chk_wk_energy CHECK (energy_score IS NULL OR (energy_score BETWEEN 1 AND 10)),
  CONSTRAINT chk_wk_sleep  CHECK (sleep_quality IS NULL OR (sleep_quality BETWEEN 1 AND 10)),
  CONSTRAINT chk_wk_stress CHECK (stress_score IS NULL OR (stress_score BETWEEN 1 AND 10)),
  CONSTRAINT chk_wk_supp   CHECK (supplement_adherence IS NULL OR (supplement_adherence BETWEEN 1 AND 10))
);

CREATE INDEX idx_wc_user       ON weekly_checkins(user_id);
CREATE INDEX idx_wc_week       ON weekly_checkins(week_of DESC);
CREATE INDEX idx_wc_user_week  ON weekly_checkins(user_id, week_of DESC);

-- ---------------------------------------------------------------------------
-- 10. user_supplements
-- ---------------------------------------------------------------------------
CREATE TABLE user_supplements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name            text NOT NULL,
  category        text NOT NULL CHECK (category IN ('supplement', 'medication')),
  dose            text,              -- e.g., '2000 IU', '10 mg'
  frequency       text,              -- e.g., 'daily', 'twice daily'
  reason          text,
  started_at      date,
  stopped_at      date,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_dates CHECK (stopped_at IS NULL OR stopped_at >= started_at)
);

CREATE INDEX idx_us_user ON user_supplements(user_id);
CREATE INDEX idx_us_active ON user_supplements(user_id) WHERE stopped_at IS NULL;

-- ---------------------------------------------------------------------------
-- 11. supplement_reference — static curated data
-- ---------------------------------------------------------------------------
CREATE TABLE supplement_reference (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL UNIQUE,
  category        text NOT NULL,     -- e.g., 'lipid', 'anti-inflammatory', 'glycemic'
  evidence_tier   text NOT NULL CHECK (evidence_tier IN ('A', 'B', 'C', 'D')),
  mechanism       text NOT NULL,
  target_markers  text[],            -- which lab markers it affects
  typical_dose    text,
  interactions    text[],            -- known drug/supplement interactions
  contraindications text[],
  key_references  text[],            -- PubMed IDs or guideline refs
  notes           text,

  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 12. medication_condition_mappings
-- ---------------------------------------------------------------------------
CREATE TABLE medication_condition_mappings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name_pattern text NOT NULL,   -- regex or ILIKE pattern
  inferred_condition    text NOT NULL,
  profile_field_to_update text,            -- e.g., 'on_statin', 'diabetes_status'
  profile_value_to_set  text,              -- e.g., 'true', 'type2'
  confidence            numeric(3,2) NOT NULL DEFAULT 0.90,

  created_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_confidence CHECK (confidence BETWEEN 0 AND 1),
  CONSTRAINT uq_med_pattern UNIQUE (medication_name_pattern)
);

-- ---------------------------------------------------------------------------
-- 13. ai_chat_messages
-- ---------------------------------------------------------------------------
CREATE TABLE ai_chat_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant')),
  content         text NOT NULL,
  metadata        jsonb DEFAULT '{}',

  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_user     ON ai_chat_messages(user_id);
CREATE INDEX idx_chat_user_ts  ON ai_chat_messages(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 14. nhanes_reference_lipids — population percentile data
-- ---------------------------------------------------------------------------
CREATE TABLE nhanes_reference_lipids (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group_lower smallint NOT NULL,
  age_group_upper smallint NOT NULL,
  sex             biological_sex NOT NULL,
  ethnicity       text NOT NULL,

  -- Total Cholesterol percentiles (mg/dL)
  tc_p25          numeric(5,1),
  tc_p50          numeric(5,1),
  tc_p75          numeric(5,1),

  -- HDL percentiles (mg/dL)
  hdl_p25         numeric(5,1),
  hdl_p50         numeric(5,1),
  hdl_p75         numeric(5,1),

  -- LDL (p50 only)
  ldl_p50         numeric(5,1),

  -- Triglycerides (p50 only)
  tg_p50          numeric(6,1),

  sample_size     integer,

  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_age_range CHECK (age_group_lower < age_group_upper),
  CONSTRAINT uq_nhanes UNIQUE (age_group_lower, age_group_upper, sex, ethnicity)
);

-- ---------------------------------------------------------------------------
-- 15. mesa_cac_reference — CAC percentile and hazard data
-- ---------------------------------------------------------------------------
CREATE TABLE mesa_cac_reference (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group_lower smallint NOT NULL,
  age_group_upper smallint NOT NULL,
  sex             biological_sex NOT NULL,
  ethnicity       text NOT NULL,

  -- CAC percentiles (Agatston score)
  cac_p25         numeric(8,1),
  cac_p50         numeric(8,1),
  cac_p75         numeric(8,1),
  cac_p90         numeric(8,1),

  -- Hazard ratios by CAC category (relative to CAC = 0)
  hr_cac_1_100    numeric(4,2),      -- CAC 1-100
  hr_cac_101_300  numeric(4,2),      -- CAC 101-300
  hr_cac_gt_300   numeric(5,2),      -- CAC > 300

  sample_size     integer,

  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_mesa_age_range CHECK (age_group_lower < age_group_upper),
  CONSTRAINT uq_mesa UNIQUE (age_group_lower, age_group_upper, sex, ethnicity)
);

-- ---------------------------------------------------------------------------
-- 16. generated_reports
-- ---------------------------------------------------------------------------
CREATE TABLE generated_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id   uuid REFERENCES health_assessments(id) ON DELETE SET NULL,

  report_type     text NOT NULL DEFAULT 'comprehensive',  -- comprehensive, summary, clinician
  storage_path    text NOT NULL,
  file_format     text NOT NULL DEFAULT 'pdf',

  generated_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gr_user       ON generated_reports(user_id);
CREATE INDEX idx_gr_assessment ON generated_reports(assessment_id);
CREATE INDEX idx_gr_user_created ON generated_reports(user_id, created_at DESC);

-- Apply updated_at triggers (function defined above, before table creation)
CREATE TRIGGER trg_profiles_updated        BEFORE UPDATE ON profiles                     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_health_assessments_upd  BEFORE UPDATE ON health_assessments           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_lab_results_updated     BEFORE UPDATE ON lab_results                  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_imaging_results_updated BEFORE UPDATE ON imaging_results              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inv_rec_updated         BEFORE UPDATE ON investigation_recommendations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_lifestyle_plans_updated BEFORE UPDATE ON lifestyle_plans              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_user_supplements_upd    BEFORE UPDATE ON user_supplements             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
