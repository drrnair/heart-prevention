/**
 * Legal disclaimers used throughout the heart-prevention application.
 *
 * Every user-facing health insight, risk score, or AI-generated content
 * MUST include the appropriate disclaimer. This is a regulatory requirement
 * for wellness (non-SaMD) applications.
 */

export const DISCLAIMERS = {
  /** General app-wide disclaimer. */
  general:
    'This app is for educational and wellness purposes only. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult your healthcare provider for medical decisions.',

  /** Shown alongside any calculated risk score. */
  riskScore:
    'Risk estimates are based on population-level statistical models and may not reflect your individual risk. These scores are for educational purposes only and should be discussed with your healthcare provider.',

  /** Shown when risk is computed with imputed (NHANES median) values. */
  preliminary:
    'This is a preliminary estimate based on population-average values for your demographic group. Your actual risk depends on your personal lab values. Consider discussing the recommended tests with your healthcare provider.',

  /** Shown with lifestyle/diet/exercise suggestions. */
  lifestyle:
    'These wellness suggestions are for general educational purposes only. They do not constitute medical advice. Before starting any new exercise program or making significant dietary changes, consult your healthcare provider.',

  /** Shown with any supplement information. */
  supplements:
    'Supplement information is provided for educational purposes based on published research. Supplements are not substitutes for prescribed medications. Always discuss supplement use with your healthcare provider, especially if you are taking medications.',

  /** Shown with imaging result interpretations. */
  imaging:
    'Imaging interpretations provided here are for educational reference only. Always have imaging results reviewed by a qualified radiologist or cardiologist.',

  /** Shown when AI extracts values from uploaded lab reports. */
  aiExtraction:
    'Values extracted by AI from your reports should be verified for accuracy. Please review and confirm all extracted values before they are used in calculations.',

  /** Shown with advanced lab-based insights (e.g., ApoB, Lp(a) thresholds). */
  advancedInsights:
    'These insights reference clinical thresholds from published guidelines and are for educational purposes only. They do not constitute medical advice or a prescription. Always consult your healthcare provider before making any changes to your treatment plan.',

  /** Shown in the AI chat interface. */
  chat:
    'This AI assistant discusses supplements and wellness topics only, based on published research. It cannot provide medical advice, diagnose conditions, or recommend changes to prescribed medications. Always consult your healthcare provider for medical decisions.',

  /** Shown when pharmacotherapy guidelines are referenced. */
  pharmacotherapy:
    'Published guidelines suggest discussing these options with your healthcare provider. This information is for educational awareness only and does not constitute a recommendation to start, stop, or change any medication.',

  /** Shown prominently in the UI for emergency awareness. */
  emergencyDisclaimer:
    'This app is not designed for emergency use. If you are experiencing chest pain, shortness of breath, or other emergency symptoms, call emergency services immediately.',
} as const;

/** Type for any disclaimer key. */
export type DisclaimerKey = keyof typeof DISCLAIMERS;
