import { z } from 'zod';

// ── Enum-like const unions ──────────────────────────────────────────

export const BiologicalSex = ['male', 'female'] as const;
export type BiologicalSex = (typeof BiologicalSex)[number];

export const SmokingStatus = ['never', 'former', 'current'] as const;
export type SmokingStatus = (typeof SmokingStatus)[number];

export const DiabetesStatus = ['none', 'prediabetes', 'type1', 'type2'] as const;
export type DiabetesStatus = (typeof DiabetesStatus)[number];

export const EthnicityCode = [
  'white',
  'black',
  'hispanic',
  'south_asian',
  'east_asian',
  'southeast_asian',
  'middle_eastern',
  'other',
] as const;
export type EthnicityCode = (typeof EthnicityCode)[number];

export const Score2Region = ['low', 'moderate', 'high', 'very_high'] as const;
export type Score2Region = (typeof Score2Region)[number];

export const ActivityLevel = ['sedentary', 'light', 'moderate', 'active', 'very_active'] as const;
export type ActivityLevel = (typeof ActivityLevel)[number];

export const SubscriptionTier = ['free', 'trial', 'premium'] as const;
export type SubscriptionTier = (typeof SubscriptionTier)[number];

export const EntryPath = ['A', 'B'] as const;
export type EntryPath = (typeof EntryPath)[number];

// ── Zod schema ──────────────────────────────────────────────────────

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['patient', 'admin']),
  displayName: z.string().min(1),
  email: z.string().email(),
  dateOfBirth: z.string().date(),
  biologicalSex: z.enum(BiologicalSex),
  ethnicity: z.enum(EthnicityCode),
  score2Region: z.enum(Score2Region).nullable(),
  smokingStatus: z.enum(SmokingStatus),
  diabetesStatus: z.enum(DiabetesStatus),
  onBpMeds: z.boolean(),
  onStatin: z.boolean(),
  onAspirin: z.boolean(),
  familyHistoryPrematureCvd: z.boolean(),
  historyOfPreeclampsia: z.boolean(),
  prematureMenopause: z.boolean(),
  chronicKidneyDisease: z.boolean(),
  chronicInflammatoryCondition: z.boolean(),
  cuisinePreferences: z.array(z.string()),
  activityLevel: z.enum(ActivityLevel),
  onboardingCompletedAt: z.string().datetime().nullable(),
  entryPath: z.enum(EntryPath),
  subscriptionTier: z.enum(SubscriptionTier),
  trialExpiresAt: z.string().datetime().nullable(),
  subscriptionExpiresAt: z.string().datetime().nullable(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
