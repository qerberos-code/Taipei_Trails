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
    people: z.number().int().min(1).max(20).default(1),
    age: z.number().int().min(1).max(120).nullable().default(null),
    heightCm: z.number().min(50).max(250).nullable().default(null),
    weightKg: z.number().min(5).max(300).nullable().default(null),
    intensity: z.enum(['low', 'moderate', 'high']).default('moderate'),
    personalNotes: z.string().trim().max(1500).default(''),
    origin: z.object({ name: z.string().max(200), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable().default(null),
    maxDistanceKm: z.number().positive().max(100).nullable().default(null),
    maxMinutes: z.number().positive().max(1440).nullable().default(null),
  }).prefault({}),
});
