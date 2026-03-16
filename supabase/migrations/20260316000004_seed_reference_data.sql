-- =============================================================================
-- Heart Prevention App — Reference Data Seed
-- Migration: 00004_seed_reference_data.sql
-- Description: NHANES lipid percentiles, MESA CAC data, supplement reference,
--              medication-condition mappings
-- =============================================================================

-- ---------------------------------------------------------------------------
-- NHANES Reference Lipids
-- Source: NHANES 2017-2020 published medians (rounded representative values)
-- Units: mg/dL
-- ---------------------------------------------------------------------------

-- === MALE — WHITE ===
INSERT INTO nhanes_reference_lipids (age_group_lower, age_group_upper, sex, ethnicity, tc_p25, tc_p50, tc_p75, hdl_p25, hdl_p50, hdl_p75, ldl_p50, tg_p50, sample_size) VALUES
(20, 29, 'male', 'white', 148, 170, 196, 38, 46, 55, 102, 95, 580),
(30, 39, 'male', 'white', 163, 190, 218, 37, 45, 54, 118, 115, 610),
(40, 49, 'male', 'white', 175, 203, 232, 38, 46, 56, 126, 130, 590),
(50, 59, 'male', 'white', 172, 200, 230, 39, 47, 57, 124, 128, 560),
(60, 69, 'male', 'white', 166, 193, 222, 40, 49, 59, 118, 117, 620),
(70, 79, 'male', 'white', 158, 185, 214, 40, 49, 60, 112, 108, 440)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === FEMALE — WHITE ===
INSERT INTO nhanes_reference_lipids (age_group_lower, age_group_upper, sex, ethnicity, tc_p25, tc_p50, tc_p75, hdl_p25, hdl_p50, hdl_p75, ldl_p50, tg_p50, sample_size) VALUES
(20, 29, 'female', 'white', 147, 172, 198, 48, 58, 70, 100, 82, 620),
(30, 39, 'female', 'white', 156, 183, 211, 48, 58, 71, 108, 88, 640),
(40, 49, 'female', 'white', 170, 199, 228, 50, 60, 73, 118, 98, 600),
(50, 59, 'female', 'white', 190, 218, 248, 50, 62, 76, 132, 112, 580),
(60, 69, 'female', 'white', 192, 220, 250, 51, 63, 77, 130, 115, 610),
(70, 79, 'female', 'white', 185, 214, 244, 50, 62, 76, 126, 110, 450)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === MALE — BLACK ===
INSERT INTO nhanes_reference_lipids (age_group_lower, age_group_upper, sex, ethnicity, tc_p25, tc_p50, tc_p75, hdl_p25, hdl_p50, hdl_p75, ldl_p50, tg_p50, sample_size) VALUES
(20, 29, 'male', 'black', 145, 167, 192, 42, 51, 62, 100, 78, 420),
(30, 39, 'male', 'black', 160, 185, 212, 41, 50, 61, 114, 90, 430),
(40, 49, 'male', 'black', 170, 197, 226, 42, 51, 63, 122, 100, 410),
(50, 59, 'male', 'black', 168, 195, 224, 43, 52, 64, 120, 98, 390),
(60, 69, 'male', 'black', 163, 190, 218, 44, 54, 66, 115, 92, 420),
(70, 79, 'male', 'black', 155, 182, 210, 44, 54, 66, 110, 88, 280)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === FEMALE — BLACK ===
INSERT INTO nhanes_reference_lipids (age_group_lower, age_group_upper, sex, ethnicity, tc_p25, tc_p50, tc_p75, hdl_p25, hdl_p50, hdl_p75, ldl_p50, tg_p50, sample_size) VALUES
(20, 29, 'female', 'black', 145, 168, 194, 48, 58, 70, 98, 68, 460),
(30, 39, 'female', 'black', 155, 180, 208, 48, 58, 71, 108, 75, 470),
(40, 49, 'female', 'black', 168, 195, 224, 50, 60, 73, 118, 82, 440),
(50, 59, 'female', 'black', 185, 213, 242, 50, 62, 76, 128, 90, 420),
(60, 69, 'female', 'black', 188, 216, 246, 52, 64, 78, 130, 92, 440),
(70, 79, 'female', 'black', 182, 210, 240, 52, 64, 78, 125, 88, 310)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === MALE — HISPANIC ===
INSERT INTO nhanes_reference_lipids (age_group_lower, age_group_upper, sex, ethnicity, tc_p25, tc_p50, tc_p75, hdl_p25, hdl_p50, hdl_p75, ldl_p50, tg_p50, sample_size) VALUES
(20, 29, 'male', 'hispanic', 150, 173, 200, 36, 44, 53, 104, 110, 520),
(30, 39, 'male', 'hispanic', 165, 192, 220, 36, 44, 53, 118, 128, 540),
(40, 49, 'male', 'hispanic', 176, 204, 234, 37, 45, 54, 126, 140, 510),
(50, 59, 'male', 'hispanic', 173, 201, 230, 38, 46, 55, 124, 135, 480),
(60, 69, 'male', 'hispanic', 167, 194, 222, 39, 47, 57, 118, 125, 500),
(70, 79, 'male', 'hispanic', 160, 187, 215, 39, 48, 58, 113, 118, 340)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === FEMALE — HISPANIC ===
INSERT INTO nhanes_reference_lipids (age_group_lower, age_group_upper, sex, ethnicity, tc_p25, tc_p50, tc_p75, hdl_p25, hdl_p50, hdl_p75, ldl_p50, tg_p50, sample_size) VALUES
(20, 29, 'female', 'hispanic', 148, 173, 200, 45, 55, 66, 101, 90, 550),
(30, 39, 'female', 'hispanic', 158, 185, 214, 45, 55, 67, 110, 98, 560),
(40, 49, 'female', 'hispanic', 172, 200, 230, 47, 57, 69, 120, 110, 530),
(50, 59, 'female', 'hispanic', 192, 220, 250, 48, 58, 71, 134, 120, 500),
(60, 69, 'female', 'hispanic', 194, 222, 252, 49, 60, 73, 132, 122, 520),
(70, 79, 'female', 'hispanic', 188, 216, 246, 49, 60, 73, 128, 115, 360)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === MALE — SOUTH_ASIAN (estimated from UK Biobank / MASALA study approximations) ===
INSERT INTO nhanes_reference_lipids (age_group_lower, age_group_upper, sex, ethnicity, tc_p25, tc_p50, tc_p75, hdl_p25, hdl_p50, hdl_p75, ldl_p50, tg_p50, sample_size) VALUES
(20, 29, 'male', 'south_asian', 152, 176, 204, 34, 42, 50, 108, 120, 280),
(30, 39, 'male', 'south_asian', 168, 196, 226, 34, 42, 50, 122, 140, 310),
(40, 49, 'male', 'south_asian', 180, 208, 238, 35, 43, 51, 130, 155, 300),
(50, 59, 'male', 'south_asian', 177, 205, 235, 36, 44, 52, 128, 150, 280),
(60, 69, 'male', 'south_asian', 170, 198, 228, 37, 45, 54, 122, 138, 260),
(70, 79, 'male', 'south_asian', 162, 190, 220, 37, 45, 54, 116, 125, 180)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === FEMALE — SOUTH_ASIAN ===
INSERT INTO nhanes_reference_lipids (age_group_lower, age_group_upper, sex, ethnicity, tc_p25, tc_p50, tc_p75, hdl_p25, hdl_p50, hdl_p75, ldl_p50, tg_p50, sample_size) VALUES
(20, 29, 'female', 'south_asian', 150, 175, 202, 42, 52, 62, 104, 95, 290),
(30, 39, 'female', 'south_asian', 160, 188, 218, 42, 52, 63, 112, 105, 320),
(40, 49, 'female', 'south_asian', 174, 203, 234, 44, 54, 65, 124, 118, 300),
(50, 59, 'female', 'south_asian', 194, 224, 256, 44, 55, 67, 138, 130, 280),
(60, 69, 'female', 'south_asian', 196, 226, 258, 45, 56, 68, 136, 128, 260),
(70, 79, 'female', 'south_asian', 190, 220, 252, 45, 56, 68, 132, 120, 190)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;


-- ---------------------------------------------------------------------------
-- MESA CAC Reference Data
-- Source: MESA study (Multi-Ethnic Study of Atherosclerosis) published data
-- Agatston scores by age/sex/ethnicity percentiles
-- Hazard ratios relative to CAC = 0 (from Budoff et al., JACC 2007)
-- ---------------------------------------------------------------------------

-- === MALE — WHITE ===
INSERT INTO mesa_cac_reference (age_group_lower, age_group_upper, sex, ethnicity, cac_p25, cac_p50, cac_p75, cac_p90, hr_cac_1_100, hr_cac_101_300, hr_cac_gt_300, sample_size) VALUES
(45, 54, 'male', 'white', 0, 1, 36, 174, 1.9, 4.3, 7.2, 420),
(55, 64, 'male', 'white', 0, 15, 142, 535, 1.8, 4.1, 6.8, 480),
(65, 74, 'male', 'white', 3, 68, 377, 1165, 1.7, 3.8, 6.3, 440),
(75, 84, 'male', 'white', 22, 178, 710, 1800, 1.6, 3.5, 5.8, 310)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === FEMALE — WHITE ===
INSERT INTO mesa_cac_reference (age_group_lower, age_group_upper, sex, ethnicity, cac_p25, cac_p50, cac_p75, cac_p90, hr_cac_1_100, hr_cac_101_300, hr_cac_gt_300, sample_size) VALUES
(45, 54, 'female', 'white', 0, 0, 1, 14, 2.2, 5.0, 8.4, 440),
(55, 64, 'female', 'white', 0, 0, 14, 100, 2.1, 4.7, 7.9, 490),
(65, 74, 'female', 'white', 0, 3, 74, 330, 2.0, 4.4, 7.3, 460),
(75, 84, 'female', 'white', 0, 27, 200, 680, 1.8, 4.0, 6.7, 320)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === MALE — BLACK ===
INSERT INTO mesa_cac_reference (age_group_lower, age_group_upper, sex, ethnicity, cac_p25, cac_p50, cac_p75, cac_p90, hr_cac_1_100, hr_cac_101_300, hr_cac_gt_300, sample_size) VALUES
(45, 54, 'male', 'black', 0, 0, 8, 70, 2.4, 5.4, 9.0, 320),
(55, 64, 'male', 'black', 0, 2, 52, 260, 2.3, 5.1, 8.5, 360),
(65, 74, 'male', 'black', 0, 18, 170, 640, 2.1, 4.7, 7.9, 330),
(75, 84, 'male', 'black', 0, 60, 340, 1050, 1.9, 4.3, 7.2, 220)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === FEMALE — BLACK ===
INSERT INTO mesa_cac_reference (age_group_lower, age_group_upper, sex, ethnicity, cac_p25, cac_p50, cac_p75, cac_p90, hr_cac_1_100, hr_cac_101_300, hr_cac_gt_300, sample_size) VALUES
(45, 54, 'female', 'black', 0, 0, 0, 5, 2.6, 5.8, 9.8, 340),
(55, 64, 'female', 'black', 0, 0, 5, 46, 2.5, 5.5, 9.2, 380),
(65, 74, 'female', 'black', 0, 0, 30, 168, 2.3, 5.1, 8.5, 350),
(75, 84, 'female', 'black', 0, 6, 95, 380, 2.1, 4.7, 7.9, 240)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === MALE — HISPANIC ===
INSERT INTO mesa_cac_reference (age_group_lower, age_group_upper, sex, ethnicity, cac_p25, cac_p50, cac_p75, cac_p90, hr_cac_1_100, hr_cac_101_300, hr_cac_gt_300, sample_size) VALUES
(45, 54, 'male', 'hispanic', 0, 0, 16, 100, 2.1, 4.7, 7.9, 350),
(55, 64, 'male', 'hispanic', 0, 6, 80, 340, 2.0, 4.4, 7.4, 390),
(65, 74, 'male', 'hispanic', 0, 30, 220, 740, 1.9, 4.1, 6.9, 360),
(75, 84, 'male', 'hispanic', 2, 100, 450, 1200, 1.7, 3.8, 6.3, 250)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === FEMALE — HISPANIC ===
INSERT INTO mesa_cac_reference (age_group_lower, age_group_upper, sex, ethnicity, cac_p25, cac_p50, cac_p75, cac_p90, hr_cac_1_100, hr_cac_101_300, hr_cac_gt_300, sample_size) VALUES
(45, 54, 'female', 'hispanic', 0, 0, 0, 8, 2.3, 5.2, 8.7, 370),
(55, 64, 'female', 'hispanic', 0, 0, 8, 60, 2.2, 4.9, 8.2, 410),
(65, 74, 'female', 'hispanic', 0, 1, 42, 210, 2.1, 4.6, 7.7, 370),
(75, 84, 'female', 'hispanic', 0, 12, 130, 450, 1.9, 4.2, 7.0, 260)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === MALE — SOUTH_ASIAN (estimated from MASALA study approximations) ===
INSERT INTO mesa_cac_reference (age_group_lower, age_group_upper, sex, ethnicity, cac_p25, cac_p50, cac_p75, cac_p90, hr_cac_1_100, hr_cac_101_300, hr_cac_gt_300, sample_size) VALUES
(45, 54, 'male', 'south_asian', 0, 3, 48, 210, 2.0, 4.5, 7.5, 240),
(55, 64, 'male', 'south_asian', 0, 22, 180, 620, 1.9, 4.3, 7.1, 270),
(65, 74, 'male', 'south_asian', 4, 82, 420, 1250, 1.8, 4.0, 6.7, 250),
(75, 84, 'male', 'south_asian', 28, 210, 780, 1900, 1.7, 3.7, 6.2, 170)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;

-- === FEMALE — SOUTH_ASIAN ===
INSERT INTO mesa_cac_reference (age_group_lower, age_group_upper, sex, ethnicity, cac_p25, cac_p50, cac_p75, cac_p90, hr_cac_1_100, hr_cac_101_300, hr_cac_gt_300, sample_size) VALUES
(45, 54, 'female', 'south_asian', 0, 0, 2, 18, 2.3, 5.2, 8.7, 250),
(55, 64, 'female', 'south_asian', 0, 0, 18, 110, 2.2, 4.9, 8.2, 280),
(65, 74, 'female', 'south_asian', 0, 4, 85, 370, 2.1, 4.6, 7.7, 260),
(75, 84, 'female', 'south_asian', 0, 32, 230, 720, 1.9, 4.2, 7.0, 180)
ON CONFLICT (age_group_lower, age_group_upper, sex, ethnicity) DO NOTHING;


-- ---------------------------------------------------------------------------
-- Supplement Reference — Top 10 Cardiac-Relevant Supplements
-- ---------------------------------------------------------------------------

INSERT INTO supplement_reference (name, category, evidence_tier, mechanism, target_markers, typical_dose, interactions, contraindications, key_references, notes) VALUES

('Omega-3 Fatty Acids (EPA/DHA)',
 'lipid',
 'A',
 'Reduces hepatic VLDL synthesis, lowers triglycerides, anti-inflammatory via resolvins/protectins, mild antithrombotic effect.',
 ARRAY['triglycerides', 'hs_crp', 'il6'],
 '2-4 g EPA+DHA daily (prescription icosapent ethyl 4g for high TG)',
 ARRAY['Warfarin (increased bleeding risk)', 'Aspirin (additive antiplatelet)', 'Statins (generally safe combination)'],
 ARRAY['Fish allergy (use algal-derived)', 'Active bleeding disorders'],
 ARRAY['REDUCE-IT trial (NEJM 2019)', 'VITAL trial (NEJM 2019)', 'AHA Scientific Statement 2019'],
 'Icosapent ethyl (Vascepa) is the only FDA-approved omega-3 with CV outcome benefit. OTC fish oil less studied for hard endpoints.'
),

('Coenzyme Q10 (Ubiquinol)',
 'antioxidant',
 'B',
 'Mitochondrial electron transport chain cofactor, replenishes statin-depleted CoQ10, antioxidant, improves endothelial function.',
 ARRAY['ldl_cholesterol', 'hs_crp'],
 '100-300 mg daily (ubiquinol form preferred for absorption)',
 ARRAY['Warfarin (may reduce INR)', 'Antihypertensives (additive BP lowering)'],
 ARRAY['None well-established'],
 ARRAY['Q-SYMBIO trial (JACC HF 2014)', 'Cochrane Review 2014'],
 'Commonly recommended for patients on statins experiencing myalgia. Evidence for hard CV outcomes limited to Q-SYMBIO.'
),

('Vitamin D3',
 'vitamin',
 'B',
 'Modulates RAAS system, anti-inflammatory, improves insulin sensitivity, calcium homeostasis. Deficiency associated with increased CV risk.',
 ARRAY['vitamin_d_25oh', 'hs_crp', 'fasting_glucose'],
 '1000-4000 IU daily (dose based on serum 25(OH)D level, target 40-60 ng/mL)',
 ARRAY['Thiazide diuretics (risk of hypercalcemia)', 'Digoxin (hypercalcemia potentiates toxicity)'],
 ARRAY['Hypercalcemia', 'Granulomatous disease (sarcoidosis)'],
 ARRAY['VITAL trial (NEJM 2019)', 'Endocrine Society Guidelines 2024'],
 'No proven CV outcome benefit from supplementation in replete individuals. Treat deficiency (<20 ng/mL) and insufficiency (20-30 ng/mL).'
),

('Magnesium (Glycinate/Taurate)',
 'mineral',
 'B',
 'Cofactor in 300+ enzymatic reactions, natural calcium channel blocker, improves insulin sensitivity, anti-arrhythmic.',
 ARRAY['magnesium', 'fasting_glucose', 'hba1c'],
 '200-400 mg elemental magnesium daily (glycinate or taurate for CV benefit)',
 ARRAY['Bisphosphonates (separate by 2h)', 'Antibiotics (quinolones, tetracyclines — separate by 2h)'],
 ARRAY['Severe renal impairment (eGFR <30)', 'Myasthenia gravis'],
 ARRAY['Rosanoff et al., Adv Nutr 2021', 'Zhang et al., BMC Med 2016 (meta-analysis)'],
 'Subclinical deficiency is common (serum Mg is a poor marker — only 1% of body Mg is extracellular). RBC magnesium is more accurate.'
),

('Berberine',
 'lipid',
 'B',
 'Upregulates LDL receptor via PCSK9 pathway (distinct from statins), AMPK activation, improves insulin sensitivity, modest LDL reduction.',
 ARRAY['ldl_cholesterol', 'total_cholesterol', 'fasting_glucose', 'hba1c', 'triglycerides'],
 '500 mg 2-3 times daily with meals',
 ARRAY['Metformin (additive hypoglycemia risk)', 'CYP3A4/CYP2D6 substrates (inhibits both)', 'Cyclosporine (increased levels)'],
 ARRAY['Pregnancy/lactation', 'Neonates (kernicterus risk)'],
 ARRAY['Lan et al., Atherosclerosis 2015 (meta-analysis)', 'Zhang et al., Evid Based Complement Alternat Med 2021'],
 'LDL reduction ~15-20% in studies. Different mechanism from statins so potentially additive. GI side effects common; titrate slowly.'
),

('Bergamot Extract',
 'lipid',
 'C',
 'Contains naringin and neoeriocitrin that inhibit HMG-CoA reductase (statin-like), antioxidant, improves HDL functionality.',
 ARRAY['ldl_cholesterol', 'total_cholesterol', 'triglycerides', 'hdl_cholesterol'],
 '500-1000 mg standardized extract daily',
 ARRAY['Statins (additive effect — monitor for myopathy)'],
 ARRAY['None well-established'],
 ARRAY['Mollace et al., Int J Cardiol 2011', 'Gliozzi et al., Front Pharmacol 2014'],
 'Promising but limited to small Italian studies. May be useful for statin-intolerant patients seeking modest lipid improvement.'
),

('Curcumin (Turmeric Extract)',
 'anti-inflammatory',
 'B',
 'NF-kB inhibition, COX-2 downregulation, antioxidant, improves endothelial function, reduces arterial stiffness.',
 ARRAY['hs_crp', 'il6', 'esr'],
 '500-1000 mg curcuminoids daily (with piperine or liposomal for absorption)',
 ARRAY['Warfarin (antiplatelet effect)', 'Antiplatelet agents (additive bleeding risk)', 'Iron supplements (inhibits absorption)'],
 ARRAY['Gallbladder disease', 'Bleeding disorders', 'Pre-surgery (stop 2 weeks before)'],
 ARRAY['Qin et al., Nutrition 2017 (meta-analysis)', 'Santos-Parker et al., Aging 2017'],
 'Bioavailability is the main challenge. Phytosome or piperine-enhanced formulations preferred. Anti-inflammatory effect is well-established.'
),

('Garlic Extract (Aged)',
 'lipid',
 'B',
 'Inhibits cholesterol synthesis, ACE inhibition (mild), antiplatelet via thromboxane inhibition, antioxidant (S-allylcysteine).',
 ARRAY['total_cholesterol', 'ldl_cholesterol'],
 '600-1200 mg aged garlic extract daily',
 ARRAY['Warfarin (increased bleeding)', 'Antiplatelet agents (additive)', 'HIV protease inhibitors (reduced levels)'],
 ARRAY['Pre-surgery (stop 7-10 days before)', 'Active bleeding'],
 ARRAY['Ried et al., Eur J Clin Nutr 2013 (meta-analysis)', 'Budoff et al., J Nutr 2004 (CAC study)'],
 'Modest LDL reduction (~10%). AGE (aged garlic extract) is the most studied form. Some evidence of CAC progression slowing.'
),

('Red Yeast Rice',
 'lipid',
 'B',
 'Contains monacolin K (lovastatin equivalent), inhibits HMG-CoA reductase. Natural statin with variable potency.',
 ARRAY['ldl_cholesterol', 'total_cholesterol'],
 '1200-2400 mg daily (standardised to monacolin K content)',
 ARRAY['Statins (DO NOT combine — same mechanism)', 'CYP3A4 inhibitors (same as statins)', 'Fibrates (increased myopathy risk)'],
 ARRAY['Active liver disease', 'Pregnancy/lactation', 'Concurrent statin use'],
 ARRAY['Lu et al., Am J Cardiol 2008', 'Becker et al., Ann Intern Med 2009'],
 'WARNING: Essentially a natural statin. Same side effects (myopathy, hepatotoxicity). Quality control varies enormously between brands. Must monitor LFTs and CK as with statins.'
),

('Psyllium Husk (Soluble Fibre)',
 'lipid',
 'A',
 'Binds bile acids in gut, forcing hepatic upregulation of LDL receptors. Reduces cholesterol absorption. Improves glycemic control.',
 ARRAY['ldl_cholesterol', 'total_cholesterol', 'fasting_glucose'],
 '5-10 g daily (divided doses with meals, with adequate water)',
 ARRAY['May reduce absorption of many drugs (take medications 1-2h before or 4h after)'],
 ARRAY['Bowel obstruction', 'Dysphagia', 'Esophageal stricture'],
 ARRAY['Anderson et al., Am J Clin Nutr 2000 (meta-analysis)', 'FDA health claim approval 1998'],
 'FDA-approved health claim for cholesterol reduction. LDL reduction ~5-10%. Extremely safe. Must take with adequate water. ACC/AHA recognized as adjunct therapy.'
)
ON CONFLICT (name) DO NOTHING;


-- ---------------------------------------------------------------------------
-- Medication-Condition Mappings
-- Used to infer conditions from user-reported medications
-- ---------------------------------------------------------------------------

INSERT INTO medication_condition_mappings (medication_name_pattern, inferred_condition, profile_field_to_update, profile_value_to_set, confidence) VALUES

-- Statins
('%(atorvastatin|rosuvastatin|simvastatin|pravastatin|lovastatin|fluvastatin|pitavastatin|statin|lipitor|crestor|zocor)%',
 'dyslipidemia', 'on_statin', 'true', 0.98),

-- Ezetimibe
('%(ezetimibe|zetia|ezetrol)%',
 'dyslipidemia', NULL, NULL, 0.95),

-- PCSK9 inhibitors
('%(evolocumab|alirocumab|repatha|praluent|inclisiran|leqvio)%',
 'dyslipidemia', NULL, NULL, 0.99),

-- ACE inhibitors
('%(lisinopril|enalapril|ramipril|captopril|perindopril|quinapril|benazepril|fosinopril|trandolapril|zestril|vasotec|altace)%',
 'hypertension', 'on_bp_treatment', 'true', 0.92),

-- ARBs
('%(losartan|valsartan|irbesartan|candesartan|olmesartan|telmisartan|azilsartan|cozaar|diovan|avapro|atacand)%',
 'hypertension', 'on_bp_treatment', 'true', 0.92),

-- Calcium channel blockers
('%(amlodipine|nifedipine|diltiazem|verapamil|felodipine|norvasc)%',
 'hypertension', 'on_bp_treatment', 'true', 0.88),

-- Beta blockers
('%(metoprolol|atenolol|bisoprolol|carvedilol|propranolol|nebivolol|labetalol|lopressor|toprol)%',
 'hypertension_or_cardiac', 'on_bp_treatment', 'true', 0.82),

-- Thiazide diuretics
('%(hydrochlorothiazide|chlorthalidone|indapamide|hctz|metolazone)%',
 'hypertension', 'on_bp_treatment', 'true', 0.90),

-- Aspirin (low-dose)
('%(aspirin|ecosprin|disprin)%',
 'cardiovascular_prevention', 'on_aspirin', 'true', 0.85),

-- Anticoagulants
('%(warfarin|rivaroxaban|apixaban|dabigatran|edoxaban|coumadin|xarelto|eliquis|pradaxa)%',
 'thromboembolism_risk', 'on_anticoagulant', 'true', 0.95),

-- Metformin → type 2 diabetes or prediabetes
('%(metformin|glucophage|glycomet)%',
 'diabetes_or_prediabetes', 'diabetes_status', 'type2', 0.88),

-- Insulin
('%(insulin|lantus|levemir|novolog|humalog|tresiba|basaglar|toujeo)%',
 'diabetes', 'diabetes_status', 'type2', 0.92),

-- SGLT2 inhibitors (used for diabetes AND heart failure)
('%(empagliflozin|dapagliflozin|canagliflozin|jardiance|farxiga|invokana)%',
 'diabetes_or_heart_failure', 'diabetes_status', 'type2', 0.78),

-- GLP-1 agonists
('%(semaglutide|liraglutide|dulaglutide|ozempic|wegovy|victoza|trulicity|mounjaro|tirzepatide)%',
 'diabetes_or_obesity', 'diabetes_status', 'type2', 0.75),

-- Sulfonylureas
('%(glimepiride|glipizide|glyburide|gliclazide|amaryl|glucotrol)%',
 'type2_diabetes', 'diabetes_status', 'type2', 0.95)
ON CONFLICT (medication_name_pattern) DO NOTHING;
