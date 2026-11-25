import { z } from "zod";

import type { ValidationTranslator } from "@/shared/lib/validation";

const CategoryAPIResponseSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  icon: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CategoryApi = z.infer<typeof CategoryAPIResponseSchema>;

export const CategoriesAPIResponseSchema = z.array(CategoryAPIResponseSchema);
export type CategoriesResponseApi = z.infer<typeof CategoriesAPIResponseSchema>;

export const CategoryOptionsAPIResponseSchema = z.object({
  icons: z.array(z.string()),
  colors: z.array(z.string()),
});
export type CategoryOptionsApi = z.infer<
  typeof CategoryOptionsAPIResponseSchema
>;

export const buildCategoryFormSchema = (t: ValidationTranslator) =>
  z.object({
    label: z
      .string()
      .min(1, { message: t("categoryNameRequired") })
      .refine((val) => val.trim().length > 0, t("notOnlySpaces"))
      .refine((val) => val.trim().length <= 50, {
        message: t("categoryNameTooLong"),
      })
      .transform((val) => val.trim()),
    color: z.string().min(1, { message: t("colorRequired") }),
    icon: z.string().min(1, { message: t("iconRequired") }),
  });

export type CategoryFormValues = z.infer<
  ReturnType<typeof buildCategoryFormSchema>
>;

/** Envelope counts per category; zero-count categories are omitted by the backend. */
export const CategoryUsageAPIResponseSchema = z.array(
  z.object({
    categoryId: z.string(),
    envelopeCount: z.number(),
  }),
);
export type CategoryUsageApi = z.infer<typeof CategoryUsageAPIResponseSchema>;
