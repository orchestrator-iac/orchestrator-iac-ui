import { z } from "zod";

export const RegisterSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  company: z.string().optional().nullable(),
  role: z.string(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
