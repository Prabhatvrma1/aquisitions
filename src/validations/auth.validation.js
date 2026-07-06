import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2).max(255).trim(),

  email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .trim()
    .toLowerCase(),

  password: z.string().min(6).max(126),

  role: z.enum(['user', 'admin']).default('user'),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),

  password: z.string().min(6).max(126),
});
