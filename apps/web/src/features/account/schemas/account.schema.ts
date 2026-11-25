import { z } from "zod";

import { codeSchema } from "@/features/auth/schemas/auth.schema";
import type { ValidationTranslator } from "@/shared/lib/validation";

// Client-side minimum only; Clerk enforces the full server-side password policy.
const newPasswordSchema = (t: ValidationTranslator) =>
  z.string().min(8, { message: t("passwordMin") });

const confirmPasswordSchema = (t: ValidationTranslator) =>
  z.string().min(1, { message: t("passwordConfirm") });

export const buildProfileFormSchema = (t: ValidationTranslator) =>
  z.object({
    firstName: z
      .string()
      .min(1, { message: t("firstNameRequired") })
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(1, { message: t("lastNameRequired") })
      .transform((val) => val.trim()),
  });
export type ProfileFormValues = z.infer<
  ReturnType<typeof buildProfileFormSchema>
>;

export const buildPasswordFormSchema = (t: ValidationTranslator) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: t("currentPasswordRequired") }),
      newPassword: newPasswordSchema(t),
      confirmPassword: confirmPasswordSchema(t),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
export type PasswordFormValues = z.infer<
  ReturnType<typeof buildPasswordFormSchema>
>;

export const buildReverificationPasswordFormSchema = (
  t: ValidationTranslator,
) =>
  z.object({
    password: z.string().min(1, { message: t("passwordRequired") }),
  });
export type ReverificationPasswordFormValues = z.infer<
  ReturnType<typeof buildReverificationPasswordFormSchema>
>;

export const buildReverificationCodeFormSchema = (t: ValidationTranslator) =>
  z.object({
    code: codeSchema(t),
  });
export type ReverificationCodeFormValues = z.infer<
  ReturnType<typeof buildReverificationCodeFormSchema>
>;
