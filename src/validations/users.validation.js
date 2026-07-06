import { z } from 'zod';

// Validate the ID parameter in the URL path
export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a numeric string')
    .transform(Number),
});

// Validate the request body for updates
export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(255).trim().optional(),
    email: z
      .string()
      .email('Invalid email address')
      .max(255)
      .trim()
      .toLowerCase()
      .optional(),
    password: z.string().min(6).max(126).optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .strict('Unknown fields are not allowed in the update request');
