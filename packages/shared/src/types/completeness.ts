import { z } from 'zod';
import type { DataLevel } from './risk-score';

export const completenessInfoSchema = z.object({
  currentLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  percentComplete: z.number().min(0).max(100),
  availableAt: z.array(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])),
  missingForNextLevel: z.array(z.string()),
  nextLevelBenefits: z.array(z.string()),
});

export type CompletenessInfo = z.infer<typeof completenessInfoSchema>;

/** Re-export DataLevel so consumers can import from this module. */
export type { DataLevel };
