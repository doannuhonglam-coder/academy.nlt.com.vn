import { z } from 'zod';

const contentType = z.enum(['community', 'internal']);
const proficiencyLevel = z.enum(['L1', 'L2', 'L3', 'L4']);

export const createCourseSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with dashes'),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().default(''),
  content_type: contentType,
  proficiency_level: proficiencyLevel,
  thumbnail_url: z.string().url().optional().nullable(),
  estimated_minutes: z.number().int().min(0).optional().default(0),
  is_offline_available: z.boolean().optional().default(false),
  offline_size_mb: z.number().positive().optional().nullable(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  estimated_minutes: z.number().int().min(0).optional(),
  proficiency_level: proficiencyLevel.optional(),
  is_offline_available: z.boolean().optional(),
  offline_size_mb: z.number().positive().optional().nullable(),
});
