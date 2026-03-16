-- =============================================================================
-- Heart Prevention App — Row Level Security Policies
-- Migration: 00002_rls_policies.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on ALL tables
-- ---------------------------------------------------------------------------
ALTER TABLE profiles                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinician_patient_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_assessments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging_results              ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifestyle_plans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checkins              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplements             ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_reference         ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_condition_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhanes_reference_lipids      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesa_cac_reference           ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports            ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles — user can read and update own profile
-- ---------------------------------------------------------------------------
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users should not delete their own profile (handled via auth.users cascade)

-- ---------------------------------------------------------------------------
-- clinician_patient_links — each party can see their own links
-- ---------------------------------------------------------------------------
CREATE POLICY cpl_select_own ON clinician_patient_links
  FOR SELECT TO authenticated USING (clinician_id = auth.uid() OR patient_id = auth.uid());

-- FUTURE: clinician can create links (requires clinician role check)
-- FUTURE: CREATE POLICY cpl_insert_clinician ON clinician_patient_links
--   FOR INSERT WITH CHECK (clinician_id = auth.uid() AND EXISTS (
--     SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'clinician'
--   ));

-- FUTURE: either party can revoke
-- FUTURE: CREATE POLICY cpl_update_revoke ON clinician_patient_links
--   FOR UPDATE USING (clinician_id = auth.uid() OR patient_id = auth.uid());

-- ---------------------------------------------------------------------------
-- health_assessments — own data only
-- ---------------------------------------------------------------------------
CREATE POLICY ha_select_own ON health_assessments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY ha_insert_own ON health_assessments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY ha_update_own ON health_assessments
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ha_delete_own ON health_assessments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- lab_results — own data only
-- ---------------------------------------------------------------------------
CREATE POLICY lr_select_own ON lab_results
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY lr_insert_own ON lab_results
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY lr_update_own ON lab_results
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY lr_delete_own ON lab_results
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- imaging_results — own data only
-- ---------------------------------------------------------------------------
CREATE POLICY ir_select_own ON imaging_results
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY ir_insert_own ON imaging_results
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY ir_update_own ON imaging_results
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ir_delete_own ON imaging_results
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- risk_scores — own data only (read + insert; no user updates)
-- ---------------------------------------------------------------------------
CREATE POLICY rs_select_own ON risk_scores
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY rs_insert_own ON risk_scores
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- investigation_recommendations — own data only
-- ---------------------------------------------------------------------------
CREATE POLICY rec_select_own ON investigation_recommendations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY rec_insert_own ON investigation_recommendations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY rec_update_own ON investigation_recommendations
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- lifestyle_plans — own data only
-- ---------------------------------------------------------------------------
CREATE POLICY lp_select_own ON lifestyle_plans
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY lp_insert_own ON lifestyle_plans
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY lp_update_own ON lifestyle_plans
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- weekly_checkins — own data only
-- ---------------------------------------------------------------------------
CREATE POLICY wc_select_own ON weekly_checkins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY wc_insert_own ON weekly_checkins
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY wc_update_own ON weekly_checkins
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY wc_delete_own ON weekly_checkins
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- user_supplements — own data only
-- ---------------------------------------------------------------------------
CREATE POLICY us_select_own ON user_supplements
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY us_insert_own ON user_supplements
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY us_update_own ON user_supplements
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY us_delete_own ON user_supplements
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ai_chat_messages — own data only
-- ---------------------------------------------------------------------------
CREATE POLICY chat_select_own ON ai_chat_messages
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY chat_insert_own ON ai_chat_messages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- No update/delete for chat messages (audit trail)

-- ---------------------------------------------------------------------------
-- generated_reports — own data only (read)
-- ---------------------------------------------------------------------------
CREATE POLICY gr_select_own ON generated_reports
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY gr_insert_own ON generated_reports
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Reference tables — public SELECT, no user modifications
-- ---------------------------------------------------------------------------
CREATE POLICY sr_select_all ON supplement_reference
  FOR SELECT USING (true);

CREATE POLICY mcm_select_all ON medication_condition_mappings
  FOR SELECT USING (true);

CREATE POLICY nhanes_select_all ON nhanes_reference_lipids
  FOR SELECT USING (true);

CREATE POLICY mesa_select_all ON mesa_cac_reference
  FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- FUTURE: Clinician access policies
-- ---------------------------------------------------------------------------
-- FUTURE: CREATE POLICY ha_clinician_read ON health_assessments
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM clinician_patient_links
--       WHERE clinician_id = auth.uid()
--         AND patient_id = health_assessments.user_id
--         AND revoked_at IS NULL
--     )
--   );

-- FUTURE: CREATE POLICY lr_clinician_read ON lab_results
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM clinician_patient_links
--       WHERE clinician_id = auth.uid()
--         AND patient_id = lab_results.user_id
--         AND revoked_at IS NULL
--     )
--   );

-- FUTURE: CREATE POLICY ir_clinician_read ON imaging_results
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM clinician_patient_links
--       WHERE clinician_id = auth.uid()
--         AND patient_id = imaging_results.user_id
--         AND revoked_at IS NULL
--     )
--   );

-- FUTURE: CREATE POLICY rs_clinician_read ON risk_scores
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM clinician_patient_links
--       WHERE clinician_id = auth.uid()
--         AND patient_id = risk_scores.user_id
--         AND revoked_at IS NULL
--     )
--   );

-- FUTURE: CREATE POLICY gr_clinician_read ON generated_reports
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM clinician_patient_links
--       WHERE clinician_id = auth.uid()
--         AND patient_id = generated_reports.user_id
--         AND revoked_at IS NULL
--     )
--   );
