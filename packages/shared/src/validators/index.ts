/**
 * Re-export all Zod schemas from the type modules.
 *
 * Consumers that only need runtime validation can import from
 * `@heart/shared/validators` without pulling in every type.
 */
export {
  userProfileSchema,
} from '../types/profile';

export {
  healthAssessmentSchema,
} from '../types/assessment';

export {
  labResultSchema,
  rawAiExtractionSchema,
} from '../types/lab-result';

export {
  imagingResultSchema,
  vesselAgatstonSchema,
  highRiskPlaqueSchema,
  segmentFindingSchema,
} from '../types/imaging';

export {
  riskScoreSchema,
} from '../types/risk-score';

export {
  investigationRecommendationSchema,
} from '../types/recommendation';

export {
  completenessInfoSchema,
} from '../types/completeness';

export {
  lifestylePlanSchema,
} from '../types/lifestyle-plan';

export {
  weeklyCheckinSchema,
} from '../types/weekly-checkin';

export {
  supplementSchema,
} from '../types/supplement';

export {
  chatMessageSchema,
} from '../types/chat-message';

// ── Input validators (stricter, for API boundaries) ──────────────────
export {
  profileInputSchema,
  biometricsInputSchema,
  isBpReversed,
  isLikelyImperial,
  convertFeetInchesToCm,
  convertPackedFeetInchesToCm,
} from './profile';
export type { ProfileInput, BiometricsInput } from './profile';

export {
  labResultInputSchema,
  labResultCreateSchema,
  aiExtractionMetaSchema,
  isLipidPanelConsistent,
  isNonHdlConsistent,
} from './lab-result';
export type { LabResultInput, LabResultCreate } from './lab-result';

export {
  assessmentInputSchema,
  computeBmi,
  computeWaistToHip,
  computeWaistToHeight,
  classifyBmi,
  classifyBp,
} from './assessment';
export type { AssessmentInput, BmiCategory, BpCategory } from './assessment';

export {
  imagingInputSchema,
  segmentFindingInputSchema,
  vesselAgatstonInputSchema,
  highRiskPlaqueInputSchema,
  classifyCacScore,
  interpretCadRads,
  classifyLvef,
} from './imaging';
export type { ImagingInput } from './imaging';
