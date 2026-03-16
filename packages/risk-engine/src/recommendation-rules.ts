/**
 * Investigation Recommendation Engine
 *
 * Pure deterministic rules for recommending investigations based on
 * patient profile, risk scores, available labs, and imaging.
 * Zero AI, zero network calls.
 *
 * Tier system:
 *   Tier 1 (essential): Universal for patients entering risk assessment
 *   Tier 2 (recommended): When risk >= 5% OR >= 1 risk enhancer present
 *   Tier 3 (recommended): When risk >= 5% AND age >= 40 (imaging)
 *   Tier 4 (consider): Conditional on specific clinical scenarios
 */

import type {
  Demographics,
  Imaging,
  Labs,
  RecommendationResult,
  Vitals,
} from './types';

interface RecommendationInput {
  readonly demographics: Demographics;
  readonly vitals: Vitals;
  readonly riskScore?: number; // 10-year ASCVD risk percentage
  readonly labs?: Labs;
  readonly imaging?: Imaging;
  /** Whether Lp(a) has ever been measured */
  readonly lpaEverMeasured?: boolean;
  /** Family history of premature ASCVD */
  readonly familyHistory?: boolean;
  /** Date of most recent CAC scan (ISO string) */
  readonly lastCacDate?: string;
}

function hasRiskEnhancers(input: RecommendationInput): boolean {
  const { labs, familyHistory, demographics, vitals } = input;

  // Family history of premature ASCVD
  if (familyHistory) return true;

  // Metabolic syndrome indicators
  if (vitals.waistCm !== undefined && vitals.heightCm !== undefined) {
    if (vitals.waistCm / vitals.heightCm >= 0.5) return true;
  }

  // South Asian ethnicity
  if (demographics.ethnicity === 'south_asian') return true;

  // Elevated Lp(a)
  if (labs?.extendedLabs?.lpa !== undefined && labs.extendedLabs.lpa >= 125) {
    return true;
  }

  // Elevated hs-CRP
  if (
    labs?.extendedLabs?.hsCrp !== undefined &&
    labs.extendedLabs.hsCrp >= 2.0
  ) {
    return true;
  }

  // Elevated triglycerides
  if (
    labs?.basicLipids?.triglycerides !== undefined &&
    labs.basicLipids.triglycerides >= 175
  ) {
    return true;
  }

  return false;
}

function cacTooRecent(lastCacDate: string | undefined): boolean {
  if (!lastCacDate) return false;
  const lastDate = new Date(lastCacDate);
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  return lastDate > fiveYearsAgo;
}

function hasDiscordantLipids(labs?: Labs): boolean {
  if (!labs?.basicLipids) return false;
  const { ldl, triglycerides } = labs.basicLipids;
  // LDL appears low but ApoB or non-HDL suggest higher particle count
  // Simplified: discordance when TG elevated and LDL appears controlled
  return ldl < 130 && triglycerides >= 200;
}

/**
 * Generate investigation recommendations based on patient profile and risk.
 *
 * @param input - Patient demographics, vitals, risk score, labs, imaging
 * @returns Array of prioritized recommendations
 */
export function generateRecommendations(
  input: RecommendationInput,
): readonly RecommendationResult[] {
  const recommendations: RecommendationResult[] = [];
  const { demographics, riskScore, labs, imaging, vitals } = input;
  const risk = riskScore ?? 0;
  const enhancersPresent = hasRiskEnhancers(input);

  // ── Tier 1: Universal ──────────────────────────────────────────────────

  if (!labs?.basicLipids) {
    recommendations.push({
      tier: 1,
      priority: 'essential',
      investigation: 'Fasting lipid panel (TC, LDL, HDL, triglycerides)',
      rationale:
        'Required for validated ASCVD risk calculation. Currently using imputed values.',
      guidelineReference: '2018 ACC/AHA Cholesterol Guideline',
    });
  }

  if (
    labs?.extendedLabs?.hba1c === undefined &&
    labs?.extendedLabs?.fastingGlucose === undefined
  ) {
    recommendations.push({
      tier: 1,
      priority: 'essential',
      investigation: 'Fasting glucose and/or HbA1c',
      rationale:
        'Screens for diabetes and pre-diabetes, both major CV risk factors.',
      guidelineReference: 'ADA Standards of Medical Care 2023',
    });
  }

  // ── Tier 2: Risk >= 5% OR enhancers present ───────────────────────────

  if (risk >= 5 || enhancersPresent) {
    // Lp(a): always if never measured (genetic, doesn't change)
    if (!input.lpaEverMeasured && labs?.extendedLabs?.lpa === undefined) {
      recommendations.push({
        tier: 2,
        priority: 'recommended',
        investigation: 'Lipoprotein(a) [Lp(a)]',
        rationale:
          'Genetically determined; 1 in 5 people have elevated levels that increase ASCVD risk. Only needs to be measured once in a lifetime.',
        guidelineReference:
          '2018 ACC/AHA Cholesterol Guideline; EAS Consensus Statement on Lp(a)',
      });
    }

    // ApoB if BMI >= 25
    if (
      labs?.extendedLabs?.apoB === undefined &&
      vitals.weightKg !== undefined &&
      vitals.heightCm !== undefined
    ) {
      const heightM = vitals.heightCm / 100;
      const bmi = vitals.weightKg / (heightM * heightM);
      if (bmi >= 25) {
        recommendations.push({
          tier: 2,
          priority: 'recommended',
          investigation: 'Apolipoprotein B (ApoB)',
          rationale:
            'Better predictor of ASCVD than LDL-C when BMI >= 25, as LDL-C underestimates atherogenic particle count in metabolic syndrome.',
          guidelineReference: '2019 ESC/EAS Dyslipidaemia Guidelines',
        });
      }
    }

    // hs-CRP if risk 5-20%
    if (
      risk >= 5 &&
      risk < 20 &&
      labs?.extendedLabs?.hsCrp === undefined
    ) {
      recommendations.push({
        tier: 2,
        priority: 'recommended',
        investigation: 'High-sensitivity C-reactive protein (hs-CRP)',
        rationale:
          'Identifies residual inflammatory risk. Elevated hs-CRP >= 2 mg/L is a risk enhancer that can guide treatment intensity.',
        guidelineReference: '2018 ACC/AHA Cholesterol Guideline',
      });
    }
  }

  // ── Tier 3: Risk >= 5% AND age >= 40 (imaging) ────────────────────────

  if (risk >= 5 && demographics.age >= 40) {
    const isBorderlineWithEnhancers = risk >= 5 && risk < 7.5 && enhancersPresent;
    const isIntermediate = risk >= 7.5 && risk < 20;

    // CAC if intermediate or borderline with enhancers
    if (
      (isIntermediate || isBorderlineWithEnhancers) &&
      imaging?.cacScore === undefined &&
      !cacTooRecent(input.lastCacDate)
    ) {
      recommendations.push({
        tier: 3,
        priority: 'recommended',
        investigation: 'Coronary artery calcium (CAC) score',
        rationale:
          'CAC = 0 can reclassify intermediate-risk patients to lower risk, deferring statin therapy. CAC > 100 strengthens statin indication.',
        guidelineReference: '2018 ACC/AHA Cholesterol Guideline; MESA study',
      });
    }

    // CTCA only if CAC > 0
    if (
      imaging?.cacScore !== undefined &&
      imaging.cacScore > 0 &&
      !imaging.ctcaPerformed
    ) {
      recommendations.push({
        tier: 3,
        priority: 'consider',
        investigation: 'CT coronary angiography (CTCA)',
        rationale:
          'CAC > 0 indicates calcified plaque. CTCA can characterize plaque morphology and identify obstructive disease.',
        guidelineReference: '2021 ACC/AHA Chest Pain Guideline',
      });
    }
  }

  // ── Tier 4: Conditional ────────────────────────────────────────────────

  // ABI if age >= 65 or diabetes + age >= 50
  if (
    demographics.age >= 65 ||
    (vitals.hasDiabetes && demographics.age >= 50)
  ) {
    recommendations.push({
      tier: 4,
      priority: 'consider',
      investigation: 'Ankle-brachial index (ABI)',
      rationale:
        'Screens for peripheral artery disease, which is an ASCVD equivalent and changes risk category to high.',
      guidelineReference:
        '2016 AHA/ACC Lower Extremity PAD Guideline',
    });
  }

  // Advanced lipid panel if family history + discordant lipids
  if (input.familyHistory && hasDiscordantLipids(labs)) {
    recommendations.push({
      tier: 4,
      priority: 'consider',
      investigation:
        'Advanced lipid panel (NMR LipoProfile or ion mobility)',
      rationale:
        'Family history with discordant LDL-C and triglycerides suggests hidden atherogenic particle burden. Particle number/size testing can reveal true risk.',
      guidelineReference: 'NLA Scientific Statement on Advanced Lipid Testing',
    });
  }

  return recommendations;
}
