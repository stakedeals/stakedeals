import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores")
    .toLowerCase()
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password is too long"),
  referralCode: z
    .string()
    .max(32)
    .optional(),
});

export type RegisterInput = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  referralCode?: string;
};

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .max(255)
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const partnerApplicationSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(255).trim(),
  businessAddress: z.string().min(5, "Business address is required").max(500).trim(),
  businessPhone: z.string().min(8, "Valid phone number is required").max(32).trim(),
  taxRegistrationNumber: z.string().max(64).optional(),
});

export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>;
