/**
 * Data Completeness Assessment
 *
 * Determines the data level available for risk assessment and identifies
 * missing items that would improve estimation accuracy.
 */

import type {
  CompletenessInfo,
  DataLevel,
  Imaging,
  Labs,
  Vitals,
} from './types';

interface ProfileForCompleteness {
  readonly age: number;
  readonly sex: string;
  readonly vitals: Vitals;
}

/**
 * Determine the data level based on available information.
 *
 * - Level 1: Demographics + vitals only
 * - Level 2: + basic lipid panel (TC, LDL, HDL, TG)
 * - Level 3: + any extended labs (Lp(a), ApoB, hs-CRP, HbA1c)
 * - Level 4: + imaging (CAC or CTCA)
 *
 * @param profile - Basic demographics and vitals
 * @param labs - Optional lab results
 * @param imaging - Optional imaging results
 * @returns DataLevel (1-4)
 */
export function determineDataLevel(
  _profile: ProfileForCompleteness,
  labs?: Labs,
  imaging?: Imaging,
): DataLevel {
  // Level 4: Has imaging
  const hasImaging =
    imaging !== undefined &&
    (imaging.cacScore !== undefined || imaging.ctcaPerformed === true);

  // Level 3: Has any extended labs
  const hasExtended =
    labs?.extendedLabs !== undefined &&
    (labs.extendedLabs.lpa !== undefined ||
      labs.extendedLabs.apoB !== undefined ||
      labs.extendedLabs.hsCrp !== undefined ||
      labs.extendedLabs.hba1c !== undefined ||
      labs.extendedLabs.fastingGlucose !== undefined);

  // Level 2: Has basic lipid panel
  const hasBasicLipids =
    labs?.basicLipids !== undefined &&
    labs.basicLipids.totalCholesterol !== undefined &&
    labs.basicLipids.ldl !== undefined &&
    labs.basicLipids.hdl !== undefined &&
    labs.basicLipids.triglycerides !== undefined;

  if (hasImaging) return 4;
  if (hasExtended) return 3;
  if (hasBasicLipids) return 2;
  return 1;
}

/**
 * Get detailed completeness information with missing items and next-level benefits.
 *
 * @param level - Current data level
 * @param profile - Basic demographics and vitals
 * @param labs - Optional lab results
 * @param imaging - Optional imaging results
 * @returns CompletenessInfo with actionable details
 */
export function getCompletenessInfo(
  level: DataLevel,
  _profile: ProfileForCompleteness,
  labs?: Labs,
  imaging?: Imaging,
): CompletenessInfo {
  const missingItems: string[] = [];
  const nextLevelBenefits: string[] = [];

  // Identify missing items for current level and above
  const hasBasicLipids =
    labs?.basicLipids !== undefined &&
    labs.basicLipids.totalCholesterol !== undefined &&
    labs.basicLipids.ldl !== undefined &&
    labs.basicLipids.hdl !== undefined &&
    labs.basicLipids.triglycerides !== undefined;

  if (!hasBasicLipids) {
    missingItems.push('Basic lipid panel (TC, LDL, HDL, TG)');
  }

  if (labs?.extendedLabs?.lpa === undefined) {
    missingItems.push('Lipoprotein(a)');
  }
  if (labs?.extendedLabs?.apoB === undefined) {
    missingItems.push('Apolipoprotein B');
  }
  if (labs?.extendedLabs?.hsCrp === undefined) {
    missingItems.push('hs-CRP');
  }
  if (labs?.extendedLabs?.hba1c === undefined) {
    missingItems.push('HbA1c');
  }
  if (imaging?.cacScore === undefined) {
    missingItems.push('Coronary artery calcium (CAC) score');
  }

  // Describe benefits of the next level
  const descriptions: Record<DataLevel, string> = {
    1: 'Preliminary assessment (demographics + vitals only)',
    2: 'Standard assessment (includes basic lipid panel)',
    3: 'Enhanced assessment (includes extended biomarkers)',
    4: 'Comprehensive assessment (includes imaging)',
  };

  switch (level) {
    case 1:
      nextLevelBenefits.push(
        'Lipid panel enables validated ASCVD risk calculation instead of imputed estimates',
        'Removes confidence band uncertainty from preliminary scores',
        'Required for guideline-concordant statin eligibility assessment',
      );
      break;
    case 2:
      nextLevelBenefits.push(
        'Lp(a) identifies inherited elevated risk (1 in 5 people affected)',
        'ApoB refines risk when triglycerides are elevated or BMI is high',
        'hs-CRP detects residual inflammatory risk not captured by lipids',
        'HbA1c screens for pre-diabetes and diabetes',
      );
      break;
    case 3:
      nextLevelBenefits.push(
        'CAC scan directly visualizes atherosclerosis burden',
        'CAC = 0 can reclassify intermediate-risk patients to lower risk',
        'CAC > 100 strengthens indication for statin therapy',
      );
      break;
    case 4:
      nextLevelBenefits.push(
        'Current assessment is comprehensive',
        'Repeat CAC may be considered in 5 years for ongoing monitoring',
      );
      break;
  }

  return {
    level,
    description: descriptions[level],
    missingItems,
    nextLevelBenefits,
  };
}
