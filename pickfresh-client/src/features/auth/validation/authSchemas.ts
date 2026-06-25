import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "vendor", "admin", "delivery"]),
});

export const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Name is required"),
});

export const emailSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm your password"),
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
