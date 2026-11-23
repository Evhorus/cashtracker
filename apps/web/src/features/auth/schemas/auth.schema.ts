import { z } from "zod";

import type { ValidationTranslator } from "@/shared/lib/validation";

// z.email() rejects empty strings too, so no separate .min(1) is needed.
const emailSchema = (t: ValidationTranslator) =>
  z.email({ message: t("emailInvalid") });

// Client-side floor only; Clerk enforces the full password policy server-side.
const newPasswordSchema = (t: ValidationTranslator) =>
  z.string().min(8, { message: t("passwordMin") });

const confirmPasswordSchema = (t: ValidationTranslator) =>
  z.string().min(1, { message: t("passwordConfirm") });

// Shared with account reverification's 6-digit email_code step.
export const codeSchema = (t: ValidationTranslator) =>
  z
    .string()
    .min(1, { message: t("codeRequired") })
    .regex(/^\d{6}$/, { message: t("codeSixDigits") });

export const buildEmailFormSchema = (t: ValidationTranslator) =>
  z.object({
    email: emailSchema(t),
  });
export type EmailFormValues = z.infer<ReturnType<typeof buildEmailFormSchema>>;

export const buildSignInPasswordFormSchema = (t: ValidationTranslator) =>
  z.object({
    email: emailSchema(t),
    password: z.string().min(1, { message: t("passwordRequired") }),
  });
export type SignInPasswordFormValues = z.infer<
  ReturnType<typeof buildSignInPasswordFormSchema>
>;

export const buildCodeFormSchema = (t: ValidationTranslator) =>
  z.object({
    code: codeSchema(t),
  });
export type CodeFormValues = z.infer<ReturnType<typeof buildCodeFormSchema>>;

export const buildSignUpFormSchema = (t: ValidationTranslator) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, { message: t("firstNameRequired") })
        .transform((val) => val.trim()),
      lastName: z
        .string()
        .min(1, { message: t("lastNameRequired") })
        .transform((val) => val.trim()),
      email: emailSchema(t),
      password: newPasswordSchema(t),
      confirmPassword: confirmPasswordSchema(t),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
export type SignUpFormValues = z.infer<
  ReturnType<typeof buildSignUpFormSchema>
>;

export const buildNewPasswordFormSchema = (t: ValidationTranslator) =>
  z
    .object({
      password: newPasswordSchema(t),
      confirmPassword: confirmPasswordSchema(t),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
export type NewPasswordFormValues = z.infer<
  ReturnType<typeof buildNewPasswordFormSchema>
>;
