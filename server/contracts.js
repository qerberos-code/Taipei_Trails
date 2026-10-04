import { z } from 'zod';

export const chatRequestSchema = z.object({
  locale: z.enum(['zh-Hant', 'en']).default('zh-Hant'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(3000),
  })).min(1).max(20).refine(messages => messages.at(-1).role === 'user', 'Last message must be from the user'),
  context: z.object({
    selectedTrailId: z.string().max(80).nullable().default(null),
    experience: z.enum(['beginner', 'intermediate', 'expert']).default('beginner'),
    origin: z.object({ name: z.string().max(200), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable().default(null),
    maxDistanceKm: z.number().positive().max(100).nullable().default(null),
    maxMinutes: z.number().positive().max(1440).nullable().default(null),
  }).default({ selectedTrailId: null, experience: 'beginner', origin: null, maxDistanceKm: null, maxMinutes: null }),
});
