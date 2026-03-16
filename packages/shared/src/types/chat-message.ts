import { z } from 'zod';

export const ChatRole = ['user', 'assistant', 'system'] as const;
export type ChatRole = (typeof ChatRole)[number];

export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.enum(ChatRole),
  content: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  createdAt: z.string().datetime(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
