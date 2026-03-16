/**
 * Claude AI wrapper with safety guardrails for the heart-prevention app.
 *
 * All functions include:
 * - Error handling and timeouts
 * - Safety checks (no medical advice, disclaimers)
 * - Structured output extraction
 */

import Anthropic from '@anthropic-ai/sdk';
import { DISCLAIMERS } from '@heart/shared';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const TIMEOUT_MS = 60_000;

/** Wrap a promise with a timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms),
    ),
  ]);
}

/** Extract text content from Claude response. */
function extractText(response: Anthropic.Message): string {
  const block = response.content.find((b) => b.type === 'text');
  return block?.type === 'text' ? block.text : '';
}

/** Safely parse JSON from Claude response text. */
function parseJsonResponse<T>(text: string): T {
  // Try to extract JSON from markdown code blocks or raw text
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text];
  const raw = jsonMatch[1]?.trim() ?? text.trim();
  return JSON.parse(raw) as T;
}

// ── Lab Value Extraction ──────────────────────────────────────────────────

export interface ExtractedLabValues {
  readonly values: Record<string, number | null>;
  readonly confidence: Record<string, number>;
  readonly disclaimer: string;
}

/**
 * Extract lab values from a report image using Claude Sonnet vision.
 *
 * @param imageBase64 - Base64-encoded image data
 * @param mimeType - Image MIME type (e.g., 'image/jpeg')
 * @returns Structured lab values with per-field confidence
 */
export async function extractLabValues(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
): Promise<ExtractedLabValues> {
  const systemPrompt = `You are a medical lab report data extraction assistant. Extract ALL lab values visible in the image.

Return a JSON object with exactly this structure:
{
  "values": {
    "totalCholesterol": <number or null>,
    "ldlCholesterol": <number or null>,
    "hdlCholesterol": <number or null>,
    "triglycerides": <number or null>,
    "vldlCholesterol": <number or null>,
    "nonHdlCholesterol": <number or null>,
    "apolipoproteinB": <number or null>,
    "lipoproteinA": <number or null>,
    "fastingGlucose": <number or null>,
    "hba1c": <number or null>,
    "fastingInsulin": <number or null>,
    "homaIr": <number or null>,
    "creatinine": <number or null>,
    "egfr": <number or null>,
    "bun": <number or null>,
    "uricAcid": <number or null>,
    "alt": <number or null>,
    "ast": <number or null>,
    "alkalinePhosphatase": <number or null>,
    "ggt": <number or null>,
    "totalBilirubin": <number or null>,
    "directBilirubin": <number or null>,
    "albumin": <number or null>,
    "totalProtein": <number or null>,
    "hsCrp": <number or null>,
    "esr": <number or null>,
    "homocysteine": <number or null>,
    "fibrinogen": <number or null>,
    "ntProBnp": <number or null>,
    "troponinI": <number or null>,
    "hemoglobin": <number or null>,
    "hematocrit": <number or null>,
    "wbc": <number or null>,
    "plateletCount": <number or null>,
    "rbc": <number or null>,
    "mcv": <number or null>,
    "mch": <number or null>,
    "mchc": <number or null>,
    "rdw": <number or null>,
    "tsh": <number or null>,
    "freeT3": <number or null>,
    "freeT4": <number or null>,
    "sodium": <number or null>,
    "potassium": <number or null>,
    "chloride": <number or null>,
    "calcium": <number or null>,
    "magnesium": <number or null>,
    "phosphorus": <number or null>,
    "vitaminD25Hydroxy": <number or null>
  },
  "confidence": {
    "<fieldName>": <0.0 to 1.0 confidence for each extracted value>
  }
}

Rules:
- Use null for any value not present in the image
- Include confidence only for fields that have a non-null value
- Convert all values to standard units (mg/dL for lipids, etc.)
- Only output valid JSON, no additional text`;

  const response = await withTimeout(
    anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            {
              type: 'text',
              text: 'Extract all lab values from this report image. Return JSON only.',
            },
          ],
        },
      ],
    }),
    TIMEOUT_MS,
  );

  const text = extractText(response);
  const parsed = parseJsonResponse<{ values: Record<string, number | null>; confidence: Record<string, number> }>(text);

  return {
    values: parsed.values,
    confidence: parsed.confidence,
    disclaimer: DISCLAIMERS.aiExtraction,
  };
}

// ── Imaging Report Extraction ─────────────────────────────────────────────

export interface ExtractedImagingReport {
  readonly cadRadsScore: string | null;
  readonly agatstonTotal: number | null;
  readonly agatstonLm: number | null;
  readonly agatstonLad: number | null;
  readonly agatstonLcx: number | null;
  readonly agatstonRca: number | null;
  readonly highRiskPlaque: {
    readonly lowAttenuationPlaque: boolean;
    readonly positiveRemodeling: boolean;
    readonly napkinRingSign: boolean;
    readonly spottyCalcification: boolean;
  } | null;
  readonly lvef: number | null;
  readonly perVesselStenosis: Record<string, string> | null;
  readonly confidence: number;
  readonly disclaimer: string;
}

/**
 * Extract CTCA/CAC data from an imaging report using Claude Sonnet vision.
 */
export async function extractImagingReport(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
): Promise<ExtractedImagingReport> {
  const systemPrompt = `You are a cardiac imaging report data extraction assistant. Extract CTCA and CAC score data.

Return a JSON object:
{
  "cadRadsScore": "<CAD-RADS score or null>",
  "agatstonTotal": <number or null>,
  "agatstonLm": <number or null>,
  "agatstonLad": <number or null>,
  "agatstonLcx": <number or null>,
  "agatstonRca": <number or null>,
  "highRiskPlaque": {
    "lowAttenuationPlaque": <boolean>,
    "positiveRemodeling": <boolean>,
    "napkinRingSign": <boolean>,
    "spottyCalcification": <boolean>
  },
  "lvef": <number or null>,
  "perVesselStenosis": { "<vessel>": "<stenosis grade>" },
  "confidence": <0.0 to 1.0>
}

Use null for absent values. Only output valid JSON.`;

  const response = await withTimeout(
    anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            {
              type: 'text',
              text: 'Extract all cardiac imaging findings from this report. Return JSON only.',
            },
          ],
        },
      ],
    }),
    TIMEOUT_MS,
  );

  const text = extractText(response);
  const parsed = parseJsonResponse<Omit<ExtractedImagingReport, 'disclaimer'>>(text);

  return { ...parsed, disclaimer: DISCLAIMERS.imaging };
}

// ── Risk Score Explanation ─────────────────────────────────────────────────

export interface RiskExplanation {
  readonly explanation: string;
  readonly modifiableFactors: readonly string[];
  readonly disclaimer: string;
}

/**
 * Generate a plain-language explanation of risk scores using Claude Haiku.
 *
 * @param scores - Calculated risk score results
 * @param profile - User profile summary
 * @param dataLevel - Current data completeness level (1-4)
 */
export async function explainRiskScore(
  scores: Record<string, unknown>,
  profile: Record<string, unknown>,
  dataLevel: number,
): Promise<RiskExplanation> {
  const systemPrompt = `You are a health educator explaining cardiovascular risk scores.

Rules:
- Write at an 8th grade reading level
- Explain what each number means in plain language
- Identify modifiable risk factors the user can discuss with their provider
- NEVER recommend medications or dosage changes
- End with: "${DISCLAIMERS.riskScore}"
- If data level is 1 or 2, note that estimates are preliminary

Return JSON:
{
  "explanation": "<plain language explanation>",
  "modifiableFactors": ["<factor1>", "<factor2>", ...]
}`;

  const response = await withTimeout(
    anthropic.messages.create({
      model: 'claude-haiku-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Explain these risk scores at data level ${dataLevel}:\n\nScores: ${JSON.stringify(scores)}\n\nProfile summary: ${JSON.stringify(profile)}`,
        },
      ],
    }),
    TIMEOUT_MS,
  );

  const text = extractText(response);
  const parsed = parseJsonResponse<{ explanation: string; modifiableFactors: string[] }>(text);

  return {
    explanation: parsed.explanation,
    modifiableFactors: parsed.modifiableFactors,
    disclaimer: DISCLAIMERS.riskScore,
  };
}

// ── Lifestyle Plan Generation ─────────────────────────────────────────────

export interface LifestylePlanResult {
  readonly clinicalSummary: string;
  readonly targets: Record<string, string>;
  readonly monitoring: readonly string[];
  readonly nutrition: {
    readonly principles: readonly string[];
    readonly weeklyPlan: readonly Record<string, unknown>[];
  };
  readonly supplements: readonly {
    readonly name: string;
    readonly dosage: string;
    readonly rationale: string;
    readonly evidence: string;
  }[];
  readonly exercise: {
    readonly weeklyTargets: Record<string, unknown>;
    readonly phases: readonly Record<string, unknown>[];
  };
  readonly decisionFramework: Record<string, unknown>;
  readonly disclaimer: string;
}

/**
 * Generate a structured 12-week cardiometabolic reset plan using Claude Sonnet.
 */
export async function generateLifestylePlan(
  profile: Record<string, unknown>,
  scores: Record<string, unknown>,
  labs: Record<string, unknown>,
  preferences: Record<string, unknown>,
): Promise<LifestylePlanResult> {
  const systemPrompt = `You are a wellness coach generating a 12-week cardiometabolic reset plan.

STRICT RULES:
- NEVER prescribe medications or suggest medication changes
- Frame all supplement suggestions as "research suggests" with citations
- Always say "discuss with your healthcare provider" for any clinical decision
- Include cuisine preferences in nutrition planning
- Tailor exercise to the stated activity level

Return a JSON object with these sections:
{
  "clinicalSummary": "<brief summary of relevant health metrics>",
  "targets": { "<metric>": "<target value and rationale>" },
  "monitoring": ["<what to track weekly>"],
  "nutrition": {
    "principles": ["<key dietary principles>"],
    "weeklyPlan": [{ "week": 1, "focus": "...", "meals": [...] }]
  },
  "supplements": [
    { "name": "...", "dosage": "...", "rationale": "...", "evidence": "..." }
  ],
  "exercise": {
    "weeklyTargets": { "aerobic_minutes": 150, "resistance_sessions": 2 },
    "phases": [{ "weeks": "1-4", "focus": "...", "activities": [...] }]
  },
  "decisionFramework": {
    "whenToEscalate": ["<triggers for provider consultation>"],
    "progressMarkers": ["<how to know it's working>"]
  }
}`;

  const response = await withTimeout(
    anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a personalized 12-week plan based on:\n\nProfile: ${JSON.stringify(profile)}\nRisk Scores: ${JSON.stringify(scores)}\nLab Values: ${JSON.stringify(labs)}\nPreferences: ${JSON.stringify(preferences)}`,
        },
      ],
    }),
    TIMEOUT_MS,
  );

  const text = extractText(response);
  const parsed = parseJsonResponse<Omit<LifestylePlanResult, 'disclaimer'>>(text);

  return { ...parsed, disclaimer: DISCLAIMERS.lifestyle };
}

// ── Wellness Chat ─────────────────────────────────────────────────────────

export interface ChatResponse {
  readonly content: string;
  readonly disclaimer: string;
}

/**
 * Handle a wellness chat message using Claude Sonnet.
 * Restricted to supplements and wellness topics only.
 */
export async function handleWellnessChat(
  messages: readonly { role: 'user' | 'assistant'; content: string }[],
  profile: Record<string, unknown>,
  supplements: readonly Record<string, unknown>[],
): Promise<ChatResponse> {
  const systemPrompt = `You are a wellness assistant for a heart health app. You discuss supplements and general wellness ONLY.

STRICT BOUNDARIES:
- NEVER provide medication advice, dosing, or treatment recommendations
- NEVER diagnose conditions
- If asked about medications, dosing, or treatment, respond: "I can only discuss supplements and general wellness. For medication-related questions, please consult your healthcare provider."
- Cite evidence when discussing supplements (e.g., "A 2023 meta-analysis in JAMA found...")
- Frame suggestions as educational, not prescriptive
- End EVERY response with: "${DISCLAIMERS.chat}"

User's current supplements: ${JSON.stringify(supplements)}
User profile summary: ${JSON.stringify({ activityLevel: profile.activityLevel, cuisinePreferences: profile.cuisinePreferences })}`;

  const response = await withTimeout(
    anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    }),
    TIMEOUT_MS,
  );

  return {
    content: extractText(response),
    disclaimer: DISCLAIMERS.chat,
  };
}
