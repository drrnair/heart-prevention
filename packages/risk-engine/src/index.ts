/**
 * @heart/risk-engine
 *
 * Pure TypeScript cardiovascular risk calculation engine.
 * Zero AI, zero network calls — deterministic math only.
 */

// Types
export type {
  AscvdResult,
  BasicLipids,
  BmiCategory,
  BodyMetricsResult,
  CacReferenceLookup,
  CompletenessInfo,
  CompletenessResult,
  DataLevel,
  Demographics,
  Ethnicity,
  ExtendedLabs,
  FraminghamResult,
  Imaging,
  Labs,
  MesaCacResult,
  NhanesLipidPercentiles,
  NhanesReferenceLookup,
  PreliminaryInput,
  PreliminaryResult,
  RecommendationPriority,
  RecommendationResult,
  RecommendationTier,
  RiskCategory,
  RiskInput,
  Score2Region,
  Score2Result,
  Sex,
  Vitals,
  WhrRiskLevel,
  WhtRiskLevel,
} from './types';

// ASCVD Pooled Cohort Equations
export {
  calculateAscvd,
  classifyRisk,
  AscvdValidationError,
} from './ascvd-pooled-cohort';

// Preliminary ASCVD (with NHANES imputation)
export {
  calculatePreliminaryAscvd,
  PreliminaryValidationError,
} from './ascvd-preliminary';

// Framingham General CVD
export {
  calculateFramingham,
  FraminghamValidationError,
} from './framingham';

// ESC SCORE2 / SCORE2-OP
export {
  calculateScore2,
  Score2ValidationError,
} from './score2';

// MESA CAC Adjustment
export {
  lookupCacPercentile,
  adjustRiskByCac,
  MesaCacValidationError,
} from './mesa-cac-adjustment';

// Body Metrics
export {
  calculateBmi,
  calculateWaistToHip,
  calculateWaistToHeight,
  calculateAbsi,
  interpretBmi,
  interpretWhr,
  interpretWhtR,
} from './body-metrics';

// Data Completeness
export {
  determineDataLevel,
  getCompletenessInfo,
} from './completeness';

// Recommendation Rules
export { generateRecommendations } from './recommendation-rules';
